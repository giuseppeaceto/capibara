# Analisi Plugin SEO per Strapi

## Panoramica

Questo documento analizza i plugin SEO disponibili per Strapi, con particolare attenzione alla compatibilità con **Strapi 5.31.2** (versione utilizzata nel progetto).

## Situazione Attuale del Progetto

- **Strapi Version**: 5.31.2
- **Frontend**: Next.js 16 con gestione manuale dei metadata SEO
- **Plugin Installati**: 
  - `@strapi/plugin-cloud`
  - `@strapi/plugin-users-permissions`
  - `@strapi/provider-upload-cloudinary`

Il frontend Next.js gestisce già i metadata SEO manualmente tramite:
- `generateMetadata()` per ogni pagina dinamica
- Open Graph tags
- Twitter Card tags
- Structured Data (JSON-LD)
- Sitemap e robots.txt

## Plugin SEO Disponibili

### 1. @strapi/plugin-seo (Plugin Ufficiale) ⭐ **CONSIGLIATO**

**Stato**: Plugin ufficiale sviluppato da Strapi

**Caratteristiche principali**:
- ✅ Gestione meta title e meta description per ogni contenuto
- ✅ Anteprima SERP (Search Engine Results Page) in tempo reale
- ✅ Meta tag per social media (Facebook, Twitter)
- ✅ Analisi SEO integrata con suggerimenti
- ✅ Componente riutilizzabile `shared.seo` per tutti i content types
- ✅ Interfaccia utente intuitiva nel pannello admin

**Compatibilità Strapi 5**:
- ✅ Supportato ufficialmente per Strapi 5
- ✅ Aggiornamenti regolari dal team Strapi
- ✅ Documentazione completa

**Installazione**:
```bash
npm install @strapi/plugin-seo
```

**Configurazione** (`config/plugins.ts`):
```typescript
export default ({ env }) => ({
  // ... altre configurazioni
  seo: {
    enabled: true,
  },
});
```

**Vantaggi**:
- Plugin ufficiale, quindi ben mantenuto e supportato
- Integrazione nativa con Strapi
- Facile da usare per gli editori
- Anteprima visiva dei risultati di ricerca
- Compatibile con Strapi 5

**Svantaggi**:
- Alcuni utenti hanno riportato problemi con l'anteprima SEO (risolvibili svuotando la cache)
- Funzionalità base, non include analisi avanzate

**Link**:
- NPM: https://www.npmjs.com/package/@strapi/plugin-seo
- Marketplace: https://strapi.io/marketplace/plugins/@strapi-plugin-seo
- GitHub: https://github.com/strapi/strapi-plugin-seo

---

### 2. @exfabrica/strapi-plugin-awesome-seo

**Stato**: Plugin di terze parti, ancora in beta

**Caratteristiche principali**:
- ✅ Analisi SEO completa del sito web
- ✅ Visualizzazione errori SEO per ogni pagina
- ✅ Accesso diretto ai contenuti per correggere errori
- ✅ Report dettagliati

**Compatibilità Strapi 5**:
- ⚠️ Da verificare (potrebbe non essere ancora compatibile con Strapi 5)
- ⚠️ Plugin in fase beta, potrebbe avere bug

**Requisiti**:
- Chrome installato sul server (per l'analisi)

**Vantaggi**:
- Analisi SEO più approfondita rispetto al plugin ufficiale
- Identificazione automatica di problemi SEO

**Svantaggi**:
- Plugin in beta, meno stabile
- Richiede Chrome sul server
- Compatibilità con Strapi 5 non garantita
- Meno supporto rispetto al plugin ufficiale

**Link**:
- NPM: https://www.npmjs.com/package/@exfabrica/strapi-plugin-awesome-seo

---

### 3. Plugin Sitemap (Varie implementazioni)

**Stato**: Plugin per generare sitemap XML

**Caratteristiche principali**:
- ✅ Generazione automatica di sitemap.xml
- ✅ Personalizzazione URL inclusi
- ✅ Impostazione frequenze di aggiornamento
- ✅ Priorità per diverse pagine

**Nota**: Il progetto Next.js genera già una sitemap dinamica (`apps/web/src/app/sitemap.ts`), quindi questo plugin potrebbe essere ridondante se si vuole mantenere la sitemap lato frontend.

**Plugin disponibili**:
- `strapi-plugin-sitemap` (varie versioni community)
- Plugin personalizzati

**Compatibilità Strapi 5**:
- ⚠️ Da verificare per ogni implementazione specifica

---

## Raccomandazione per il Progetto Capibara CMS

### Opzione 1: Installare @strapi/plugin-seo (Consigliata) ✅

**Perché**:
1. **Plugin ufficiale**: Supporto garantito e aggiornamenti regolari
2. **Compatibilità Strapi 5**: Testato e supportato
3. **Facilità d'uso**: Interfaccia intuitiva per gli editori
4. **Integrazione**: Si integra perfettamente con l'ecosistema Strapi
5. **Componente riutilizzabile**: Può essere aggiunto a tutti i content types

**Come integrarlo**:
- Il plugin aggiunge un componente `shared.seo` che può essere incluso in:
  - Article
  - Video Episode
  - Podcast Episode
  - Newsletter Issue
  - Show
  - Altri content types

**Workflow suggerito**:
1. Gli editori compilano i campi SEO direttamente in Strapi
2. Il frontend Next.js legge i dati SEO da Strapi
3. I metadata vengono generati dinamicamente usando i dati di Strapi invece di logica manuale

**Vantaggi per il progetto**:
- Centralizzazione della gestione SEO nel CMS
- Meno codice da mantenere nel frontend
- Editori possono gestire SEO senza interventi tecnici
- Consistenza tra contenuti

### Opzione 2: Mantenere l'approccio attuale

**Perché**:
- Il frontend Next.js gestisce già bene i metadata
- Controllo completo sul codice
- Nessuna dipendenza aggiuntiva

**Svantaggi**:
- Gli editori non possono modificare SEO senza interventi tecnici
- Logica SEO duplicata/sparsa nel codice
- Meno flessibilità per modifiche rapide

---

## Piano di Implementazione (se si sceglie @strapi/plugin-seo)

### Step 1: Installazione
```bash
cd apps/cms
npm install @strapi/plugin-seo
```

### Step 2: Configurazione
Modificare `apps/cms/config/plugins.ts`:
```typescript
export default ({ env }) => {
  const useCloudinary = 
    env('CLOUDINARY_NAME') && 
    env('CLOUDINARY_KEY') && 
    env('CLOUDINARY_SECRET');

  return {
    upload: {
      config: {
        provider: useCloudinary ? 'cloudinary' : 'local',
        providerOptions: useCloudinary ? {
          cloud_name: env('CLOUDINARY_NAME'),
          api_key: env('CLOUDINARY_KEY'),
          api_secret: env('CLOUDINARY_SECRET'),
        } : {},
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    },
    seo: {
      enabled: true,
    },
  };
};
```

### Step 3: Build Admin Panel
```bash
npm run build
```

### Step 4: Aggiungere componente SEO ai Content Types
1. Accedere all'admin panel Strapi
2. Content-Type Builder
3. Per ogni content type (Article, Video Episode, etc.):
   - Aggiungere componente `shared.seo`
   - Salvare

### Step 5: Aggiornare Frontend
Modificare le funzioni `generateMetadata()` nel frontend Next.js per leggere i dati SEO da Strapi invece di generarli manualmente.

Esempio per `apps/web/src/app/articoli/[slug]/page.tsx`:
```typescript
// Invece di generare description manualmente:
const description = article.excerpt || article.body?.substring(0, 160);

// Leggere da Strapi SEO plugin:
const description = article.seo?.metaDescription || article.excerpt || article.body?.substring(0, 160);
const metaTitle = article.seo?.metaTitle || article.title;
```

---

## Conclusioni

**Plugin Consigliato**: `@strapi/plugin-seo` (plugin ufficiale)

**Motivazione**:
- ✅ Plugin ufficiale, ben mantenuto
- ✅ Compatibile con Strapi 5
- ✅ Facile da usare per gli editori
- ✅ Si integra perfettamente con il workflow esistente
- ✅ Riduce la complessità del codice frontend

**Prossimi Passi**:
1. Valutare se installare il plugin ufficiale
2. Se sì, seguire il piano di implementazione sopra
3. Testare l'integrazione in ambiente di sviluppo
4. Formare gli editori sull'uso del componente SEO

---

## Note Aggiuntive

- Il plugin SEO ufficiale è gratuito e open source
- Non richiede configurazioni complesse
- Può essere disabilitato in qualsiasi momento se necessario
- I dati SEO vengono salvati come parte del content type, quindi sono versionati insieme ai contenuti

---

**Data Analisi**: Gennaio 2025  
**Versione Strapi Analizzata**: 5.31.2

