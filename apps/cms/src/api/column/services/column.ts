import { factories } from '@strapi/strapi';

const coreService = factories.createCoreService('api::column.column' as any);

export default {
  ...coreService,
  
  async find(params: any) {
    const result = await coreService.find(params);
    
    // Ordina i link per publishDate (più recenti in alto)
    if (result.data && Array.isArray(result.data)) {
      result.data = result.data.map((column: any) => {
        if (column.links && Array.isArray(column.links)) {
          column.links = column.links.sort((a: any, b: any) => {
            // Se non hanno publishDate, mettili alla fine
            if (!a.publishDate && !b.publishDate) return 0;
            if (!a.publishDate) return 1;
            if (!b.publishDate) return -1;
            // Ordina per data decrescente (più recenti in alto)
            return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
          });
        }
        return column;
      });
    } else if (result.data && result.data.links && Array.isArray(result.data.links)) {
      result.data.links = result.data.links.sort((a: any, b: any) => {
        if (!a.publishDate && !b.publishDate) return 0;
        if (!a.publishDate) return 1;
        if (!b.publishDate) return -1;
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      });
    }
    
    return result;
  },

  async findOne(params: any) {
    const result = await coreService.findOne(params);
    
    // Ordina i link per publishDate (più recenti in alto)
    if (result.data && result.data.links && Array.isArray(result.data.links)) {
      result.data.links = result.data.links.sort((a: any, b: any) => {
        if (!a.publishDate && !b.publishDate) return 0;
        if (!a.publishDate) return 1;
        if (!b.publishDate) return -1;
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      });
    }
    
    return result;
  },
};

