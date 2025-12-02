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
    strapi.log.info('   Enable "find" and "findOne" for: Show, Video Episode, Podcast Episode, Newsletter Issue, Tag, Partner');
  },
};
