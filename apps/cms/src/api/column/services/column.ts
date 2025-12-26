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
    // Usa entityService direttamente per ottenere i dati con le relazioni
    const results = await strapi.entityService.findMany('api::column.column', {
      ...params,
      populate: params?.populate || ['links', 'author'],
    });
    
    // Ordina i link per publishDate (più recenti in alto)
    if (results && Array.isArray(results)) {
      return results.map(sortColumnLinks);
    }
    
    return results;
  },

  async findOne(documentId: any, params: any) {
    // Usa entityService direttamente per ottenere i dati con le relazioni
    const result = await strapi.entityService.findOne('api::column.column', documentId, {
      ...params,
      populate: params?.populate || ['links', 'author'],
    });
    
    // Ordina i link per publishDate (più recenti in alto)
    if (result) {
      return sortColumnLinks(result);
    }
    
    return result;
  },
}));

