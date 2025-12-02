## Breaking Media CMS

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Monorepo di partenza per una media company moderna composta da:

- `apps/web`: frontend pubblico in Next.js 16 (App Router, Tailwind, alias `@/*`)
- `apps/cms`: backend editoriale Strapi 5 in TypeScript, pronto per Postgres
- `docker-compose.yml`: servizio Postgres 16 per sviluppo locale

L'obiettivo è offrire un CMS piacevole da usare, facile da gestire e completo di backend editoriale e frontend pubblico già pronti per contenuti pubblici e premium.

### Stack

- **Next.js 16 + Tailwind CSS** per il canale pubblico e l'area utente
- **Strapi 5 (TypeScript)** come headless CMS
- **PostgreSQL 16** come database primario (containerizzato)
- **Stripe/Auth0/Supabase** da integrare successivamente per pagamenti e autenticazione

### Prerequisiti

- Node.js 20+
- npm 10+
- Docker Desktop (o compatibile) per eseguire Postgres

### Avvio rapido

1. **Clona il repository**

   ```bash
   git clone <repository-url>
   cd capibara
   ```

2. **Avvia Postgres**

   ```bash
   docker compose up -d postgres
   ```

3. **Configura Strapi**

   ```bash
   cd apps/cms
   cp env.example .env # compila le chiavi (app, jwt, salts)
   npm run develop
   ```

   Le variabili nel file di esempio puntano al Postgres del compose (`localhost:5432`, database/utente/password `strapi`).

4. **Configura i permessi pubblici in Strapi**

   Dopo aver avviato Strapi e creato l'utente admin, vai su:
   - `http://localhost:1337/admin`
   - Settings → Users & Permissions → Roles → Public
   - Per ogni content-type (Show, Video Episode, Podcast Episode, Newsletter Issue, Tag, Partner):
     - Abilita **find** (per liste)
     - Abilita **findOne** (per dettagli)
   - Salva

   Questo permetterà al frontend di leggere i contenuti pubblici senza autenticazione.

5. **Avvia il frontend**

   ```bash
   cd apps/web
   npm run dev
   ```

   Il frontend ora si connette automaticamente a Strapi e mostra i contenuti pubblici.

### Prossimi passi suggeriti

- Content model già pronto in Strapi:
  - `show`: hub per brand/video/podcast/newsletter
  - `video-episode`, `podcast-episode`, `newsletter-issue`
  - `tag` e `partner` per tassonomie e sponsorizzazioni
  (tutti con Draft & Publish abilitato)
- Configurare l'autenticazione (Auth0/Supabase) e i ruoli Strapi per distinguere visitatori e abbonati
- Integrare Stripe Billing e webhook che aggiornano lo stato utente nel CMS
- Centralizzare le chiamate alle API nel frontend creando moduli `lib/api` per rispettare la preferenza di codice ordinato
- Agganciare componenti UI al Design System (palette dark, card modulari, stati locked)

Questo setup fornisce la base infrastrutturale per sviluppare velocemente sia l'area pubblica sia quella riservata agli abbonati.

### Documentazione

Per ulteriori informazioni su deployment e configurazione:

- 📖 [Guida Deployment](./DEPLOYMENT.md) - Opzioni di deployment per frontend e backend
- 🚀 [Deploy su Vercel](./VERCEL_DEPLOY.md) - Guida passo-passo per il frontend
- 🔧 [Deploy su Render](./RENDER_DEPLOY.md) - Guida passo-passo per il backend
- ☁️ [Setup Cloudinary](./CLOUDINARY_SETUP.md) - Configurazione storage immagini persistente

### Licenza

Questo progetto è rilasciato sotto licenza [MIT](LICENSE). Vedi il file `LICENSE` per i dettagli.
