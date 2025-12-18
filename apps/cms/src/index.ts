import type { Core } from '@strapi/strapi';

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
