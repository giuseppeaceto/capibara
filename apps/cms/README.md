# Capibara CMS - Backend Strapi

Backend CMS del progetto **Capibara**, costruito con Strapi 5 e PostgreSQL.

## Stack Tecnologico

- **Strapi 5** - Headless CMS TypeScript
- **PostgreSQL 16** - Database relazionale
- **Cloudinary** - Storage immagini cloud
- **TypeScript** - Tipizzazione statica

## Struttura del Progetto

```
apps/cms/
├── config/               # Configurazioni Strapi
│   ├── admin.ts         # Configurazione admin panel
│   ├── api.ts           # Configurazione API
│   ├── database.ts      # Configurazione database
│   ├── middlewares.ts   # Middleware (CORS, security, etc.)
│   ├── plugins.ts       # Configurazione plugin (upload, etc.)
│   └── server.ts        # Configurazione server
├── src/
│   ├── api/             # Content Types e API
│   │   ├── article/     # Content Type Articolo
│   │   ├── newsletter-issue/  # Content Type Newsletter
│   │   ├── podcast-episode/   # Content Type Podcast
│   │   ├── video-episode/     # Content Type Video
│   │   ├── show/        # Content Type Show
│   │   ├── tag/         # Content Type Tag
│   │   └── partner/     # Content Type Partner
│   └── extensions/      # Estensioni personalizzate
│       └── upload/      # Provider upload Cloudinary
├── database/            # Migrazioni database
└── package.json
```

## Content Types Disponibili

- **Show** - Hub per brand/video/podcast/newsletter
- **Article** - Articoli editoriali
- **Video Episode** - Episodi video
- **Podcast Episode** - Episodi podcast
- **Newsletter Issue** - Numeri newsletter
- **Tag** - Tassonomia per categorizzare contenuti
- **Partner** - Partner e sponsorizzazioni

Tutti i content types supportano **Draft & Publish** per gestire contenuti in bozza.

## Sviluppo Locale

### Prerequisiti

- Node.js 20+
- Docker Desktop (per PostgreSQL locale)
- PostgreSQL 16 (via Docker Compose)

### Setup

1. Avvia PostgreSQL:
   ```bash
   # Dalla root del progetto
   docker compose up -d postgres
   ```

2. Configura le variabili d'ambiente:
   ```bash
   cp env.example .env
   ```
   
   Compila il file `.env` con le credenziali necessarie:
   - `APP_KEYS` - Genera con: `openssl rand -base64 32` (4 volte, separati da virgola)
   - `API_TOKEN_SALT` - Genera con: `openssl rand -base64 32`
   - `ADMIN_JWT_SECRET` - Genera con: `openssl rand -base64 32`
   - `TRANSFER_TOKEN_SALT` - Genera con: `openssl rand -base64 32`
   - `JWT_SECRET` - Genera con: `openssl rand -base64 32`

3. Installa le dipendenze:
   ```bash
   npm install
   ```

4. Avvia Strapi in modalità sviluppo:
   ```bash
   npm run develop
   ```

5. Accedi all'admin panel: [http://localhost:1337/admin](http://localhost:1337/admin)

### Configurazione Permessi Pubblici

Dopo aver creato l'utente admin:

1. Vai su: **Settings → Users & Permissions → Roles → Public**
2. Per ogni content type, abilita:
   - ✅ **find** (per liste)
   - ✅ **findOne** (per dettagli)
3. Salva

Questo permetterà al frontend di leggere i contenuti pubblici senza autenticazione.

### Script Disponibili

- `npm run develop` - Avvia Strapi in modalità sviluppo (auto-reload)
- `npm run build` - Build per produzione
- `npm start` - Avvia Strapi in modalità produzione
- `npm run strapi` - CLI Strapi

## Configurazione Produzione

### Variabili d'Ambiente

#### Database
- `DATABASE_CLIENT=postgres`
- `DATABASE_HOST` - Host PostgreSQL
- `DATABASE_PORT` - Porta PostgreSQL (default: 5432)
- `DATABASE_NAME` - Nome database
- `DATABASE_USERNAME` - Username database
- `DATABASE_PASSWORD` - Password database
- `DATABASE_SSL=true` - Abilita SSL per connessioni remote

#### Strapi
- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `PORT=1337`
- `APP_KEYS` - 4 chiavi separate da virgola
- `API_TOKEN_SALT` - Salt per API token
- `ADMIN_JWT_SECRET` - Secret JWT admin
- `TRANSFER_TOKEN_SALT` - Salt transfer token
- `JWT_SECRET` - Secret JWT

#### Cloudinary (Storage Immagini)
- `CLOUDINARY_NAME` - Nome cloud Cloudinary
- `CLOUDINARY_KEY` - API Key Cloudinary
- `CLOUDINARY_SECRET` - API Secret Cloudinary

**⚠️ IMPORTANTE**: Senza Cloudinary configurato, le immagini verranno perse ad ogni deploy!

## Storage Immagini

Il progetto usa **Cloudinary** come provider di storage per garantire persistenza delle immagini su piattaforme con filesystem effimero (Render, Vercel, etc.).

### Setup Cloudinary

Vedi la documentazione completa:
- 📖 [Setup Cloudinary](../../CLOUDINARY_SETUP.md)
- 🔍 [Verifica Cloudinary](../../CLOUDINARY_CHECK.md)
- 🐛 [Troubleshooting Cloudinary](../../CLOUDINARY_TROUBLESHOOTING.md)

## Deployment

Il backend è deployato su **Render**. Vedi la documentazione completa:

- 📖 [Guida Deployment Render](../../RENDER_DEPLOY.md)
- 📖 [Guida Deployment Generale](../../DEPLOYMENT.md)

## API Endpoints

L'API Strapi è disponibile su `/api/*`:

- `GET /api/articles` - Lista articoli
- `GET /api/articles/:id` - Dettaglio articolo
- `GET /api/shows` - Lista show
- `GET /api/video-episodes` - Lista episodi video
- `GET /api/podcast-episodes` - Lista episodi podcast
- `GET /api/newsletter-issues` - Lista newsletter
- `GET /api/tags` - Lista tag
- `GET /api/partners` - Lista partner

Tutti gli endpoint pubblici supportano:
- Filtri e query parameters
- Popolamento relazioni
- Paginazione

## Prossimi Sviluppi

- [ ] Autenticazione utenti e ruoli
- [ ] Integrazione Stripe per gestione abbonamenti
- [ ] Webhook per sincronizzazione stato utenti
- [ ] Backup automatico database
- [ ] Monitoring e logging avanzati

## Documentazione

- [Strapi Documentation](https://docs.strapi.io)
- [Strapi CLI](https://docs.strapi.io/dev-docs/cli)
- [Strapi Deployment](https://docs.strapi.io/dev-docs/deployment)

## Supporto

Per problemi o domande:
- Consulta la [documentazione Strapi](https://docs.strapi.io)
- Vedi i file di troubleshooting nella root del progetto
- Controlla i log del servizio di deployment
