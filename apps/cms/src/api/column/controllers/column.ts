import { factories } from '@strapi/strapi';

const coreController = factories.createCoreController('api::column.column' as any);

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
  if (column.links && Array.isArray(column.links)) {
    column.links = sortLinksByPublishDate(column.links);
  }
  return column;
}

export default {
  ...coreController,
  
  async find(ctx: any) {
    const response = await coreController.find(ctx);
    
    // Ordina i link per ogni column nei risultati
    if (response.data) {
      if (Array.isArray(response.data)) {
        response.data = response.data.map(sortColumnLinks);
      } else {
        response.data = sortColumnLinks(response.data);
      }
    }
    
    return response;
  },

  async findOne(ctx: any) {
    const response = await coreController.findOne(ctx);
    
    // Ordina i link nel risultato
    if (response.data) {
      response.data = sortColumnLinks(response.data);
    }
    
    return response;
  },
};

