# Guida Installazione Plugin SEO Strapi

## ✅ Installazione Completata

Il plugin `@strapi/plugin-seo` è stato installato e configurato nel progetto.

### Cosa è stato fatto:

1. ✅ **Plugin installato**: `@strapi/plugin-seo` aggiunto alle dipendenze
2. ✅ **Configurazione**: Plugin abilitato in `apps/cms/config/plugins.ts`
3. ✅ **Frontend aggiornato**: 
   - Tipi TypeScript aggiornati per includere i campi SEO
   - Funzioni API aggiornate per popolare il componente SEO
   - Pagine aggiornate per utilizzare i dati SEO quando disponibili:
     - `/articoli/[slug]`
     - `/video/[slug]`
     - `/podcast/[slug]`

## 📋 Prossimi Passi Manuali

### 1. Build del Pannello Admin

Prima di poter utilizzare il plugin, devi ricostruire il pannello di amministrazione:

```bash
cd apps/cms
npm run build
```

Dopo il build, riavvia Strapi:

```bash
npm run develop
```

### 2. Aggiungere il Componente SEO ai Content Types

Una volta avviato Strapi, devi aggiungere il componente `shared.seo` a ciascun content type che vuoi ottimizzare per la SEO.

#### Content Types da aggiornare:

- ✅ **Article** (Articoli)
- ✅ **Video Episode** (Episodi video)
- ✅ **Podcast Episode** (Episodi podcast)
- ⚠️ **Newsletter Issue** (opzionale)
- ⚠️ **Show** (opzionale)

#### Procedura per aggiungere il componente SEO:

1. Accedi all'admin panel di Strapi: `http://localhost:1337/admin`
2. Vai su **Content-Type Builder** (menu laterale)
3. Seleziona il content type che vuoi modificare (es. **Article**)
4. Clicca su **Add another field**
5. Seleziona **Component** come tipo di campo
6. Scegli **shared.seo** dalla lista dei componenti disponibili
7. Assegna un nome al campo (es. `seo`)
8. Clicca su **Finish** e poi su **Save**

**Nota**: Il componente `shared.seo` viene creato automaticamente dal plugin SEO e include:
- `metaTitle` - Titolo per i motori di ricerca
- `metaDescription` - Descrizione per i motori di ricerca
- `keywords` - Parole chiave (separate da virgole)
- `metaImage` - Immagine per i social media e i risultati di ricerca
- `preventIndexing` - Checkbox per impedire l'indicizzazione
- `structuredData` - Dati strutturati JSON-LD (opzionale)

### 3. Verifica Funzionamento

Dopo aver aggiunto il componente SEO:

1. Vai su **Content Manager**
2. Apri un articolo/video/podcast esistente o creane uno nuovo
3. Dovresti vedere una sezione **SEO** con i campi sopra elencati
4. Compila i campi SEO:
   - **Meta Title**: Titolo ottimizzato per i motori di ricerca (max 60 caratteri consigliati)
   - **Meta Description**: Descrizione ottimizzata (max 160 caratteri consigliati)
   - **Keywords**: Parole chiave separate da virgole
   - **Meta Image**: Immagine per social media (1200x630px consigliato)
5. Salva e pubblica il contenuto

### 4. Test Frontend

Verifica che i metadata SEO vengano utilizzati correttamente:

1. Avvia il frontend Next.js: `cd apps/web && npm run dev`
2. Visita una pagina di contenuto (es. `/articoli/[slug]`)
3. Controlla il codice sorgente della pagina (View Source)
4. Verifica che i tag `<meta>` utilizzino i valori compilati in Strapi

**Come verificare**:
- Apri gli strumenti per sviluppatori (F12)
- Vai alla tab **Elements** o **Network**
- Cerca i tag `<meta property="og:title">`, `<meta name="description">`, etc.
- Oppure usa strumenti come [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) o [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## 🔄 Come Funziona

### Priorità dei Dati SEO

Il frontend utilizza i dati SEO in questo ordine di priorità:

1. **Dati dal plugin SEO** (se compilati in Strapi)
2. **Dati esistenti** (excerpt, synopsis, title, etc.)
3. **Valori di default** (logo, descrizioni generiche)

### Esempio per Article:

```typescript
// Meta Title: usa seo.metaTitle se disponibile, altrimenti article.title
const metaTitle = article.seo?.metaTitle || article.title;

// Meta Description: usa seo.metaDescription se disponibile, altrimenti excerpt, altrimenti body
const description = article.seo?.metaDescription || article.excerpt || article.body?.substring(0, 160);

// Meta Image: usa seo.metaImage se disponibile, altrimenti heroImage, altrimenti logo
const imageUrl = seoImageUrl || heroImageUrl || defaultLogo;
```

### Prevent Indexing

Se il campo `preventIndexing` è attivo, il frontend aggiunge automaticamente:

```html
<meta name="robots" content="noindex, nofollow">
```

Questo è utile per contenuti che non vuoi indicizzare nei motori di ricerca.

## 📝 Note Importanti

1. **Retrocompatibilità**: Il sistema funziona anche senza il componente SEO compilato. In quel caso, utilizza i dati esistenti (excerpt, title, etc.)

2. **Populate**: Le funzioni API già includono il componente SEO nel populate:
   - `getArticleBySlug()` - include `seo` e `seo.metaImage`
   - `getVideoEpisodeBySlug()` - usa `populate: "*"` che include tutto
   - `getPodcastEpisodeBySlug()` - usa `populate: "*"` che include tutto

3. **Cache**: I metadata vengono cachati insieme ai contenuti. Se modifichi i dati SEO, potrebbe essere necessario invalidare la cache o aspettare il tempo di revalidazione (60 secondi in sviluppo).

4. **Build Production**: Ricorda di fare il build del pannello admin anche in produzione dopo l'installazione del plugin.

## 🐛 Troubleshooting

### Il componente SEO non appare nel Content-Type Builder

- Assicurati di aver fatto il build: `npm run build` nella cartella `apps/cms`
- Riavvia Strapi completamente
- Verifica che il plugin sia abilitato in `config/plugins.ts`

### I metadata non si aggiornano nel frontend

- Verifica che il componente SEO sia stato aggiunto al content type
- Controlla che i dati siano stati salvati e pubblicati in Strapi
- Svuota la cache del browser o usa una finestra in incognito
- Verifica che il populate includa `seo` e `seo.metaImage` nelle query API

### L'anteprima SEO non funziona nel pannello admin

- Svuota la cache del browser
- Riavvia completamente Strapi (non solo refresh della pagina)
- Verifica la console del browser per eventuali errori JavaScript

## 📚 Risorse

- [Documentazione Plugin SEO Strapi](https://github.com/strapi-community/strapi-plugin-seo)
- [Strapi Marketplace - SEO Plugin](https://strapi.io/marketplace/plugins/@strapi-plugin-seo)
- [Best Practices SEO](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

---

**Data Installazione**: Gennaio 2025  
**Versione Plugin**: @strapi/plugin-seo@2.0.9  
**Versione Strapi**: 5.31.2

