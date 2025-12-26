import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: ['it'],
  },
  bootstrap(app: StrapiApp) {
    // Personalizzazione per il campo links delle rubriche (column)
    // I link vengono ordinati automaticamente per publishDate (più recenti in alto)
    // tramite il controller e service personalizzati.
    
    // Nota: La paginazione virtuale per i componenti ripetibili nel pannello admin
    // richiede un plugin personalizzato più complesso. Per ora, l'ordinamento
    // automatico garantisce che i link più recenti siano sempre visibili in alto.
    
    console.log('✅ Admin panel initialized - Column links are automatically sorted by publishDate (newest first)');
  },
};

