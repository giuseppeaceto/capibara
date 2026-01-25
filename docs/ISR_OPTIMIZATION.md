# Ottimizzazione ISR Write su Vercel

## Analisi del Problema

L'ISR (Incremental Static Regeneration) write su Vercel era molto alto a causa di:

1. **Revalidate troppo frequenti**: Tutte le chiamate API avevano `revalidate: 60` (60 secondi), causando rigenerazioni continue
2. **Nessuna configurazione esplicita a livello di pagina**: Le pagine non avevano `export const revalidate`, usando il default di Next.js
3. **Sitemap pesante**: Il sitemap faceva chiamate con limit 1000 e veniva rigenerato ogni 60 secondi
4. **Homepage con molte chiamate**: La homepage faceva 7 chiamate API in parallelo, ognuna con cache di 60 secondi

## Soluzioni Implementate

### 1. Configurazione Revalidate a Livello Pagina

Aggiunto `export const revalidate` esplicito alle pagine principali:

- **Homepage** (`/app/page.tsx`): `revalidate = 300` (5 minuti)
- **Feed** (`/app/feed/page.tsx`): `revalidate = 300` (5 minuti)
- **Archivio** (`/app/archivio/page.tsx`): `revalidate = 600` (10 minuti)
- **Sitemap** (`/app/sitemap.ts`): `revalidate = 21600` (6 ore)

### 2. Strategia di Cache Differenziata

Implementata una strategia di cache basata sulla frequenza di aggiornamento dei contenuti:

#### Contenuti ad Alta Frequenza (5 minuti - 300s)
- `getLatestVideoEpisodes`: 300s
- `getLatestPodcastEpisodes`: 300s
- `getLatestArticles`: 300s
- `getArticles` (paginata): 300s
- `getVideoEpisodes` (paginata): 300s
- `getPodcastEpisodes` (paginata): 300s
- `getNewsletterIssues` (paginata): 300s
- `getDailyLinks`: 300s
- Funzioni di ricerca: 300s

#### Contenuti a Media Frequenza (10 minuti - 600s)
- `getFeaturedShows`: 600s
- `getPremiumNewsletterIssues`: 600s
- `getColumns`: 600s

#### Contenuti Statici (1 ora - 3600s)
- `getVideoEpisodeBySlug`: 3600s (singoli episodi cambiano raramente dopo pubblicazione)
- `getPodcastEpisodeBySlug`: 3600s
- `getNewsletterIssueBySlug`: 3600s
- `getArticleBySlug`: 3600s
- `getAuthors`: 3600s (autori cambiano molto raramente)

#### Default
- `strapiFetch` default: cambiato da 60s a 300s

## Impatto Atteso

### Riduzione ISR Writes

**Prima:**
- Ogni pagina veniva rigenerata ogni 60 secondi quando una cache scadeva
- Homepage: 7 chiamate × ogni 60s = potenzialmente 7 rigenerazioni/minuto
- Sitemap: 3 chiamate pesanti ogni 60s

**Dopo:**
- Homepage: rigenerata ogni 5 minuti (riduzione 83%)
- Sitemap: rigenerato ogni 6 ore (riduzione 99%)
- Singoli contenuti: rigenerati ogni ora invece di ogni minuto (riduzione 98%)
- Contenuti meno frequenti: cache più lunga (riduzione 50-83%)

### Benefici

1. **Riduzione significativa dei costi**: Meno ISR writes = meno operazioni su Vercel
2. **Migliori performance**: Meno rigenerazioni = meno carico sul server
3. **Esperienza utente invariata**: I contenuti vengono comunque aggiornati con frequenza adeguata
4. **Scalabilità migliorata**: Il sistema può gestire più traffico senza aumentare proporzionalmente gli ISR writes

## Monitoraggio

Monitorare su Vercel:
- ISR Write Operations nella dashboard
- Tempi di build/rigenerazione
- Hit rate della cache

Se necessario, è possibile:
- Aumentare ulteriormente i tempi di revalidate per contenuti molto statici
- Usare `revalidateTag` o `revalidatePath` per invalidazioni mirate quando necessario
- Implementare webhook da Strapi per triggerare rigenerazioni on-demand

## Note

- I tempi di revalidate sono stati scelti per bilanciare freschezza dei contenuti e riduzione degli ISR writes
- Per contenuti che cambiano molto raramente (come autori), è possibile aumentare ulteriormente la cache
- Il sitemap viene rigenerato ogni 6 ore perché i motori di ricerca non lo controllano così frequentemente
