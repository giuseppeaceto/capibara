import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  async register({ strapi }: { strapi: Core.Strapi }) {
    // Registra il provider Cloudinary solo se le variabili d'ambiente sono configurate
    const hasCloudinaryConfig = 
      process.env.CLOUDINARY_NAME && 
      process.env.CLOUDINARY_KEY && 
      process.env.CLOUDINARY_SECRET;

    if (hasCloudinaryConfig) {
      try {
        // Import dinamico per evitare errori se cloudinary non è installato
        const cloudinaryProvider = await import('./extensions/upload/providers/cloudinary');
        strapi.plugin('upload').provider.register('cloudinary', cloudinaryProvider.default);
        strapi.log.info('✅ Cloudinary provider registered successfully');
      } catch (error) {
        strapi.log.error('❌ Failed to register Cloudinary provider:', error);
        strapi.log.warn('⚠️ Falling back to local provider');
      }
    } else {
      strapi.log.warn('⚠️ Cloudinary not configured, using local provider');
    }
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
    strapi.log.info('   Enable "find" and "findOne" for: Show, Video Episode, Podcast Episode, Newsletter Issue, Tag, Partner');
  },
};
