import { factories } from '@strapi/strapi';
import type { Core } from '@strapi/strapi';

// Funzione helper per ordinare i link per publishDate (più recenti in alto)
function sortLinksByPublishDate(links: any[]): any[] {
  if (!Array.isArray(links)) return links;
  
  return [...links].sort((a: any, b: any) => {
    // Se non hanno publishDate, mettili alla fine
    if (!a.publishDate && !b.publishDate) return 0;
    if (!a.publishDate) return 1;
    if (!b.publishDate) return -1;
    // Ordina per data decrescente (più recenti in alto)
    return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
  });
}

// Funzione helper per ordinare i link in un'entità column
function sortColumnLinks(column: any): any {
  if (column && column.links && Array.isArray(column.links)) {
    column.links = sortLinksByPublishDate(column.links);
  }
  return column;
}

export default factories.createCoreService('api::column.column' as any, ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(params: any) {
    // Chiama il servizio di base per gestire publicationState correttamente
    // Strapi gestisce automaticamente publicationState quando viene passato tramite API REST
    const results = await strapi.entityService.findMany('api::column.column' as any, params);
    
    // Ordina i link per publishDate (più recenti in alto)
    if (results && Array.isArray(results)) {
      return results.map(sortColumnLinks);
    }
    
    return results;
  },

  async findOne(documentId: any, params: any) {
    // Estrai publicationState dai params
    const { publicationState, ...restParams } = params || {};
    
    // Se publicationState è 'live', aggiungi filtro per publishedAt
    const filters = { ...restParams.filters };
    if (publicationState === 'live') {
      filters.publishedAt = { $notNull: true };
    }
    
    // Usa entityService con filtro esplicito per publishedAt quando publicationState è 'live'
    const result = await strapi.entityService.findOne('api::column.column' as any, documentId, {
      ...restParams,
      filters,
      populate: restParams?.populate || ['links', 'author'],
    });
    
    // Ordina i link per publishDate (più recenti in alto)
    if (result) {
      return sortColumnLinks(result);
    }
    
    return result;
  },
}));

