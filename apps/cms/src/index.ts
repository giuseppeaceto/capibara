import type { Core } from '@strapi/strapi';

/**
 * Configura automaticamente i permessi per il campo publishDate per tutti i ruoli
 * Questo permette agli utenti non super admin di pianificare la pubblicazione
 */
async function configurePublishDatePermissions(strapi: Core.Strapi) {
  const contentTypesWithPublishDate = [
    'api::article.article',
    'api::video-episode.video-episode',
    'api::podcast-episode.podcast-episode',
    'api::newsletter-issue.newsletter-issue',
  ];

  // Ottieni tutti i ruoli admin (escluso Super Admin che ha già tutti i permessi)
  const allRoles = await strapi.documents('admin::role').findMany();
  const rolesToConfigure = allRoles.filter(role => role.code !== 'strapi-super-admin');

  for (const role of rolesToConfigure) {
    try {
      strapi.log.info(`🔧 Configuring publishDate permissions for role: ${role.name} (ID: ${role.id})`);

      // Ottieni tutti i permessi e filtra per ruolo
      const allPermissions = await strapi.documents('admin::permission').findMany({
        populate: ['role'],
      });
      
      // Filtra manualmente per ruolo
      const existingPermissions = allPermissions.filter((p) => {
        if (!p.role) return false;
        const roleId = typeof p.role === 'object' && 'id' in p.role ? p.role.id : null;
        if (!roleId) return false;
        return String(roleId) === String(role.id);
      });

      // Per ogni content type con publishDate
      for (const contentType of contentTypesWithPublishDate) {
        const actions = ['find', 'findOne', 'update', 'create'];

        for (const action of actions) {
          const actionName = `${contentType}.${action}`;
          
          // Cerca se esiste già un permesso per questa azione
          let permission = existingPermissions.find(
            (p) => p.action === actionName && p.subject === contentType
          );

          if (permission) {
            // Aggiorna il permesso esistente per includere esplicitamente tutti i campi
            const properties = permission.properties;
            let propertiesObj: Record<string, any> = {};
            
            // Converti properties a oggetto se è JSONObject
            if (properties && typeof properties === 'object' && !Array.isArray(properties)) {
              propertiesObj = properties as Record<string, any>;
            }
            
            const fields = propertiesObj.fields;

            // Se fields è già ["*"], non serve modificare
            if (Array.isArray(fields) && fields.includes('*')) {
              continue;
            }

            // Imposta fields a ["*"] per dare accesso a tutti i campi, incluso publishDate
            const documentId = typeof permission.id === 'string' ? permission.id : String(permission.id);
            
            await strapi.documents('admin::permission').update({
              documentId,
              data: {
                properties: {
                  ...propertiesObj,
                  fields: ['*'],
                },
              },
            });

            strapi.log.info(`   ✅ Updated permission: ${actionName} - set fields to ["*"]`);
          } else {
            // Il permesso non esiste ancora - l'utente deve abilitarlo manualmente nell'interfaccia
            strapi.log.warn(`   ⚠️  Permission ${actionName} does not exist for role ${role.name}`);
            strapi.log.warn(`      → Go to Settings > Users & Permissions > Roles > ${role.name}`);
            strapi.log.warn(`      → Enable "${action}" for ${contentType.split('::')[1]}`);
          }
        }
      }
    } catch (error) {
      strapi.log.warn(`⚠️  Error configuring publishDate permissions for role ${role.name}:`, error);
    }
  }

  strapi.log.info('✅ publishDate permissions configuration completed');
}

/**
 * Configura automaticamente i permessi per il campo SEO per i ruoli Editor, Author e Authenticated
 * Questo risolve il problema "no permission to see this field" per il componente SEO
 */
async function configureSEOPermissions(strapi: Core.Strapi) {
  const contentTypesWithSEO = [
    'api::article.article',
    'api::video-episode.video-episode',
    'api::podcast-episode.podcast-episode',
  ];

  const rolesToConfigure = ['Editor', 'Author', 'Authenticated', 'editor', 'author', 'authenticated'];

  for (const roleName of rolesToConfigure) {
    try {
      // Trova il ruolo
      const roles = await strapi.documents('admin::role').findMany({
        filters: {
          $or: [
            { name: roleName },
            { code: roleName.toLowerCase() },
          ],
        },
      });

      if (roles.length === 0) {
        continue; // Ruolo non trovato, passa al successivo
      }

      const role = roles[0];
      strapi.log.info(`🔧 Configuring SEO permissions for role: ${role.name} (ID: ${role.id})`);

      // Ottieni tutti i permessi e filtra per ruolo (workaround per il filtro relazione)
      const allPermissions = await strapi.documents('admin::permission').findMany({
        populate: ['role'],
      });
      
      strapi.log.info(`   Found ${allPermissions.length} total permissions in system`);
      
      // Filtra manualmente per ruolo
      const existingPermissions = allPermissions.filter((p) => {
        if (!p.role) return false;
        const roleId = typeof p.role === 'object' && 'id' in p.role ? p.role.id : null;
        if (!roleId) return false;
        return String(roleId) === String(role.id);
      });
      
      strapi.log.info(`   Found ${existingPermissions.length} permissions for role ${role.name}`);

      // Per ogni content type con SEO
      for (const contentType of contentTypesWithSEO) {
        const actions = ['find', 'findOne', 'update', 'create'];

        for (const action of actions) {
          const actionName = `${contentType}.${action}`;
          
          // Cerca se esiste già un permesso per questa azione
          let permission = existingPermissions.find(
            (p) => p.action === actionName && p.subject === contentType
          );

          if (permission) {
            // Aggiorna il permesso esistente per includere esplicitamente tutti i campi
            // In Strapi 5, se fields è vuoto o mancante, potrebbe essere interpretato come "nessun campo"
            const properties = permission.properties;
            let propertiesObj: Record<string, any> = {};
            
            // Converti properties a oggetto se è JSONObject
            if (properties && typeof properties === 'object' && !Array.isArray(properties)) {
              propertiesObj = properties as Record<string, any>;
            }
            
            const fields = propertiesObj.fields;

            // Se fields è già ["*"], non serve modificare
            if (Array.isArray(fields) && fields.includes('*')) {
              continue;
            }

            // Imposta fields a ["*"] per dare accesso a tutti i campi, inclusi i componenti come SEO
            // Questo risolve il problema "no permission to see this field" per i componenti
            const documentId = typeof permission.id === 'string' ? permission.id : String(permission.id);
            
            await strapi.documents('admin::permission').update({
              documentId,
              data: {
                properties: {
                  ...propertiesObj,
                  fields: ['*'],
                },
              },
            });

            strapi.log.info(`   ✅ Updated permission: ${actionName} - set fields to ["*"]`);
          } else {
            // Il permesso non esiste ancora - l'utente deve abilitarlo manualmente nell'interfaccia
            strapi.log.warn(`   ⚠️  Permission ${actionName} does not exist for role ${role.name}`);
            strapi.log.warn(`      → Go to Settings > Users & Permissions > Roles > ${role.name}`);
            strapi.log.warn(`      → Enable "${action}" for ${contentType.split('::')[1]}`);
          }
        }
      }
    } catch (error) {
      strapi.log.warn(`⚠️  Error configuring permissions for role ${roleName}:`, error);
    }
  }

  strapi.log.info('✅ SEO permissions configuration completed');
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    // Log env vars for debugging
    const cloudinaryName = process.env.CLOUDINARY_NAME;
    const cloudinaryKey = process.env.CLOUDINARY_KEY;
    const cloudinarySecret = process.env.CLOUDINARY_SECRET;

    strapi.log.info('🔍 Checking Cloudinary configuration...');
    strapi.log.info(`   CLOUDINARY_NAME: ${cloudinaryName ? '✅ Set' : '❌ Missing'}`);
    strapi.log.info(`   CLOUDINARY_KEY: ${cloudinaryKey ? '✅ Set' : '❌ Missing'}`);
    strapi.log.info(`   CLOUDINARY_SECRET: ${cloudinarySecret ? '✅ Set' : '❌ Missing'}`);
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.log.info('🚀 Capibara CMS is starting...');
    strapi.log.info('💡 Remember to configure public API permissions:');
    strapi.log.info('   Settings > Users & Permissions > Roles > Public');
    strapi.log.info('   Enable "find" and "findOne" for: Show, Video Episode, Podcast Episode, Newsletter Issue, Tag, Partner, Author, Daily Link (including "image"), Column');
    
    // Configura automaticamente i permessi per il campo publishDate per tutti i ruoli
    try {
      await configurePublishDatePermissions(strapi);
    } catch (error) {
      strapi.log.warn('⚠️  Could not auto-configure publishDate permissions:', error);
      strapi.log.warn('   You may need to configure them manually in Settings > Users & Permissions > Roles');
    }

    // Configura automaticamente i permessi per il campo SEO per Editor, Author e Authenticated
    try {
      await configureSEOPermissions(strapi);
    } catch (error) {
      strapi.log.warn('⚠️  Could not auto-configure SEO permissions:', error);
      strapi.log.warn('   You may need to configure them manually in Settings > Users & Permissions > Roles');
    }

    // Test content generation
    try {
      // Check if we already have authors
      const authors = await (strapi as any).documents('api::author.author').findMany();
      
      if (authors.length === 0) {
        strapi.log.info('🌱 Seeding test content...');
        
        // Create an author
        const author = await (strapi as any).documents('api::author.author').create({
          data: {
            name: 'Giuseppe Aceto',
            bio: 'Fondatore di Capibara e appassionato di tech.',
            status: 'published',
          },
        });

        // Create a column
        await (strapi as any).documents('api::column.column').create({
          data: {
            title: 'Tech Insights',
            description: 'Riflessioni settimanali sul mondo della tecnologia.',
            author: author.id,
            links: [
              {
                label: 'The Verge',
                url: 'https://www.theverge.com',
                description: 'Ottima fonte per le news tech.',
              },
              {
                label: 'TechCrunch',
                url: 'https://techcrunch.com',
                description: 'Startup e venture capital.',
              },
            ],
            status: 'published',
          },
        });

        // Create some daily links
        const today = new Date().toISOString().split('T')[0];
        await (strapi as any).documents('api::daily-link.daily-link').create({
          data: {
            title: 'Cursor AI è incredibile',
            url: 'https://cursor.sh',
            description: 'Il miglior editor di codice basato su AI del 2025.',
            publishDate: today,
            status: 'published',
          },
        });

        await (strapi as any).documents('api::daily-link.daily-link').create({
          data: {
            title: 'Next.js 15 rilasciato',
            url: 'https://nextjs.org',
            description: 'Tutte le novità dell\'ultimo framework di Vercel.',
            publishDate: today,
            status: 'published',
          },
        });

        strapi.log.info('✅ Test content seeded successfully!');
      }
    } catch (error) {
      strapi.log.error('❌ Error seeding test content:');
      strapi.log.error(error);
    }
  },
};
