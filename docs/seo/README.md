# Plugin SEO per Strapi

## Panoramica

Il progetto utilizza `@strapi/plugin-seo` per gestire i metadata SEO direttamente dal pannello admin di Strapi.

## Installazione e Configurazione

Il plugin è già installato e configurato nel progetto. Per verificare:

1. **Plugin installato**: Verifica in `apps/cms/package.json` che `@strapi/plugin-seo` sia presente
2. **Configurazione**: Il plugin è abilitato in `apps/cms/config/plugins.ts`
3. **Permessi automatici**: I permessi per il campo SEO sono configurati automaticamente all'avvio (vedi `apps/cms/src/index.ts`)

## Aggiungere il Componente SEO ai Content Types

Dopo che Strapi è stato avviato e il plugin è inizializzato:

1. Accedi all'admin panel di Strapi
2. Vai su **Content-Type Builder**
3. Seleziona il content type (es. **Article**, **Video Episode**, **Podcast Episode**)
4. Clicca su **Add another field**
5. Seleziona **Component** → **shared.seo**
6. Assegna il nome `seo` al campo
7. Salva

Il componente `shared.seo` include:
- `metaTitle` - Titolo per i motori di ricerca
- `metaDescription` - Descrizione per i motori di ricerca
- `keywords` - Parole chiave (separate da virgole)
- `metaImage` - Immagine per i social media
- `preventIndexing` - Checkbox per impedire l'indicizzazione

## Permessi

I permessi per il campo SEO sono configurati **automaticamente** all'avvio di Strapi per i ruoli:
- Editor
- Author
- Authenticated

Se un utente con questi ruoli non può vedere il campo SEO:

1. Verifica che i permessi base siano abilitati:
   - Settings → Users & Permissions → Roles → [Ruolo]
   - Per ogni content type, abilita: **find**, **findOne**, **update**
2. Riavvia Strapi completamente
3. Controlla i log all'avvio - dovresti vedere: `✅ SEO permissions configuration completed`
4. Disconnetti e riconnetti con l'utente

## Integrazione Frontend

Il frontend è già configurato per utilizzare i dati SEO quando disponibili. La priorità è:

1. **Dati dal plugin SEO** (se compilati in Strapi)
2. **Dati esistenti** (excerpt, synopsis, title, etc.)
3. **Valori di default** (logo, descrizioni generiche)

### Esempio per Article:

```typescript
const metaTitle = article.seo?.metaTitle || article.title;
const description = article.seo?.metaDescription || article.excerpt || article.body?.substring(0, 160);
const imageUrl = seoImageUrl || heroImageUrl || defaultLogo;
```

## Troubleshooting

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

### "No permission to see this field"

Se vedi questo errore anche dopo aver riavviato Strapi:

1. Verifica che i permessi base siano abilitati (find, findOne, update)
2. Controlla i log all'avvio per vedere se la configurazione automatica è stata eseguita
3. Se necessario, configura manualmente i permessi:
   - Settings → Users & Permissions → Roles → [Ruolo]
   - Per ogni content type, abilita le azioni e seleziona tutti i campi (incluso `seo`)

## Risorse

- [Documentazione Plugin SEO Strapi](https://github.com/strapi-community/strapi-plugin-seo)
- [Strapi Marketplace - SEO Plugin](https://strapi.io/marketplace/plugins/@strapi-plugin-seo)
- [Best Practices SEO](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)


