# Guida al Deployment

Questa guida spiega come pubblicare il progetto **capibara** in produzione.

## Architettura

Il progetto è composto da:
- **Frontend**: Next.js 16 (App Router) in `apps/web`
- **Backend**: Strapi 5 (CMS) in `apps/cms`
- **Database**: PostgreSQL 16

## Opzioni di Deployment

### Frontend (Next.js)

#### ✅ Vercel (Scelta Attuale - Consigliato per Next.js)

Vercel è la piattaforma creata dai fondatori di Next.js e offre il supporto migliore.

**Vantaggi:**
- Deployment automatico da Git
- SSL gratuito
- CDN globale
- Ottimizzazioni Next.js integrate
- Serverless functions incluse

**📖 Guida Completa**: Vedi `VERCEL_DEPLOY.md` per istruzioni dettagliate passo-passo.

**Procedura Rapida:**
1. Vai su [vercel.com](https://vercel.com) e crea un account
2. Connetti il repository GitHub
3. Configura il progetto:
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build` (Vercel lo rileva automaticamente)
   - **Output Directory**: `.next` (automatico)
   - **Install Command**: `npm install` (automatico)
4. Aggiungi le variabili d'ambiente:
   ```
   NEXT_PUBLIC_STRAPI_URL=https://tuo-backend-url.com
   NEXTAUTH_URL=https://tuo-frontend-url.vercel.app
   NEXTAUTH_SECRET=genera-un-secret-sicuro
   GOOGLE_CLIENT_ID=tuo-google-client-id
   GOOGLE_CLIENT_SECRET=tuo-google-client-secret
   ```
5. Deploy!

#### ✅ Opzione 2: Netlify

Netlify funziona bene con Next.js, ma richiede il plugin ufficiale.

**Vantaggi:**
- Deployment automatico da Git
- SSL gratuito
- CDN globale
- Form handling integrato

**Procedura:**
1. Vai su [netlify.com](https://netlify.com) e crea un account
2. Connetti il repository GitHub
3. Installa il plugin Next.js:
   - Nel dashboard Netlify, vai su **Site settings > Build & deploy > Plugins**
   - Cerca e installa **@netlify/plugin-nextjs**
4. Configura il build:
   - **Base directory**: `apps/web`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Aggiungi le variabili d'ambiente (stesse di Vercel)
6. Deploy!

**Nota**: Il file `netlify.toml` nella root è già configurato, ma per Next.js 16 è meglio usare il plugin ufficiale.

#### Opzione 3: Altri provider

- **Cloudflare Pages**: Supporta Next.js con alcune limitazioni
- **AWS Amplify**: Buona integrazione con AWS
- **DigitalOcean App Platform**: Soluzione completa ma a pagamento

---

### Backend (Strapi) + Database (PostgreSQL)

Strapi richiede un hosting che supporti:
- Node.js 20+
- PostgreSQL
- Variabili d'ambiente
- Build process

#### ✅ Opzione 1: Railway (Consigliato - Facile e Veloce)

**Vantaggi:**
- Setup molto semplice
- PostgreSQL incluso
- Deployment automatico da Git
- Free tier generoso

**Procedura:**

1. **Crea account su Railway**
   - Vai su [railway.app](https://railway.app)
   - Login con GitHub

2. **Crea nuovo progetto**
   - Click su **New Project**
   - Seleziona **Deploy from GitHub repo**
   - Scegli il repository `capibara`

3. **Aggiungi PostgreSQL**
   - Nel progetto, click su **+ New**
   - Seleziona **Database > Add PostgreSQL**
   - Railway creerà automaticamente il database

4. **Deploy Strapi**
   - Nel progetto, click su **+ New**
   - Seleziona **GitHub Repo**
   - Scegli il repository
   - Railway rileverà automaticamente che è un progetto Node.js
   - Configura:
     - **Root Directory**: `apps/cms`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`

5. **Configura variabili d'ambiente**
   
   Nel servizio Strapi, vai su **Variables** e aggiungi:
   
   ```env
   # Database (usa le variabili di Railway PostgreSQL)
   DATABASE_CLIENT=postgres
   DATABASE_HOST=${{Postgres.PGHOST}}
   DATABASE_PORT=${{Postgres.PGPORT}}
   DATABASE_NAME=${{Postgres.PGDATABASE}}
   DATABASE_USERNAME=${{Postgres.PGUSER}}
   DATABASE_PASSWORD=${{Postgres.PGPASSWORD}}
   DATABASE_SSL=true
   DATABASE_SCHEMA=public
   
   # Strapi Configuration
   HOST=0.0.0.0
   PORT=${{PORT}}
   NODE_ENV=production
   
   # App Keys (genera con: openssl rand -base64 32)
   APP_KEYS=genera-chiave-1,genera-chiave-2,genera-chiave-3,genera-chiave-4
   API_TOKEN_SALT=genera-chiave-api-token
   ADMIN_JWT_SECRET=genera-chiave-admin-jwt
   TRANSFER_TOKEN_SALT=genera-chiave-transfer
   JWT_SECRET=genera-chiave-jwt
   ```
   
   **Importante**: Genera chiavi sicure per produzione:
   ```bash
   openssl rand -base64 32
   ```
   Esegui questo comando 4 volte per `APP_KEYS` e una volta per ogni altro secret.

6. **Deploy e ottieni l'URL**
   - Railway eseguirà automaticamente il build
   - Una volta completato, otterrai un URL tipo: `https://tuo-progetto.up.railway.app`
   - Questo è l'URL del tuo backend Strapi

7. **Configura CORS in Strapi** (se necessario)
   - Nel file `apps/cms/config/middlewares.ts`, aggiungi:
   ```typescript
   export default [
     'strapi::logger',
     'strapi::errors',
     {
       name: 'strapi::security',
       config: {
         contentSecurityPolicy: {
           useDefaults: true,
           directives: {
             'connect-src': ["'self'", 'https:'],
             'img-src': ["'self'", 'data:', 'blob:', 'https:'],
             'media-src': ["'self'", 'data:', 'blob:', 'https:'],
             upgradeInsecureRequests: null,
           },
         },
       },
     },
     {
       name: 'strapi::cors',
       config: {
         enabled: true,
         origin: ['https://tuo-frontend.vercel.app', 'http://localhost:3000'],
       },
     },
     'strapi::poweredBy',
     'strapi::query',
     'strapi::body',
     'strapi::session',
     'strapi::favicon',
     'strapi::public',
   ];
   ```

#### ✅ Opzione 2: Render (Scelta Attuale)

**Vantaggi:**
- Free tier disponibile (con limitazioni)
- PostgreSQL incluso
- Deployment automatico da Git
- File `render.yaml` già configurato

**📖 Procedura Completa:**

1. **Crea account su Render**
   - Vai su [render.com](https://render.com)
   - Login con GitHub

2. **Connetti il repository**
   - Nel dashboard, click su **New +** → **Blueprint**
   - Seleziona il repository `capibara`
   - Render rileverà automaticamente il file `render.yaml` nella root

3. **Render creerà automaticamente:**
   - Un database PostgreSQL (`capibara-database`)
   - Un servizio web per Strapi (`capibara-cms`)
   - Le variabili d'ambiente necessarie (alcune generate automaticamente)

4. **Configura le variabili d'ambiente mancanti**
   
   Nel servizio `capibara-cms`, vai su **Environment** e verifica che ci siano:
   
   ```env
   # Queste sono generate automaticamente da render.yaml:
   DATABASE_URL=<auto-generato>
   APP_KEYS=<auto-generato>
   API_TOKEN_SALT=<auto-generato>
   ADMIN_JWT_SECRET=<auto-generato>
   TRANSFER_TOKEN_SALT=<auto-generato>
   JWT_SECRET=<auto-generato>
   ENCRYPTION_KEY=<auto-generato>
   
   # Queste sono già configurate:
   NODE_ENV=production
   HOST=0.0.0.0
   PORT=1337
   DATABASE_CLIENT=postgres
   DATABASE_SSL=true
   ```
   
   **Nota**: Se alcune variabili non sono state generate, puoi generarle manualmente:
   ```bash
   openssl rand -base64 32
   ```
   Esegui questo comando e usa il risultato per ogni secret.

5. **Per APP_KEYS** (richiede 4 valori separati da virgola):
   - Genera 4 chiavi diverse con `openssl rand -base64 32`
   - Uniscile con virgole: `chiave1,chiave2,chiave3,chiave4`

6. **Deploy automatico**
   - Render eseguirà automaticamente il build
   - Il processo può richiedere 5-10 minuti la prima volta
   - Una volta completato, otterrai un URL tipo: `https://capibara-cms.onrender.com`

7. **Configura CORS in Strapi** (importante!)
   
   Nel file `apps/cms/config/middlewares.ts`, assicurati che CORS sia configurato:
   ```typescript
   export default [
     'strapi::logger',
     'strapi::errors',
     {
       name: 'strapi::security',
       config: {
         contentSecurityPolicy: {
           useDefaults: true,
           directives: {
             'connect-src': ["'self'", 'https:'],
             'img-src': ["'self'", 'data:', 'blob:', 'https:'],
             'media-src': ["'self'", 'data:', 'blob:', 'https:'],
             upgradeInsecureRequests: null,
           },
         },
       },
     },
     {
       name: 'strapi::cors',
       config: {
         enabled: true,
         origin: [
           'https://tuo-frontend.vercel.app',
           'http://localhost:3000',
           'http://localhost:1337',
         ],
       },
     },
     'strapi::poweredBy',
     'strapi::query',
     'strapi::body',
     'strapi::session',
     'strapi::favicon',
     'strapi::public',
   ];
   ```

8. **Dopo il primo deploy:**
   - Accedi a `https://tuo-cms.onrender.com/admin`
   - Crea l'utente admin
   - Configura i permessi pubblici (vedi checklist sotto)

**⚠️ Nota sul Free Tier:**
- Il servizio web può andare in "sleep" dopo 15 minuti di inattività
- Il primo avvio dopo il sleep può richiedere 30-60 secondi
- Per evitare il sleep, considera l'upgrade al piano Starter ($7/mese)

#### Opzione 3: DigitalOcean App Platform

**Vantaggi:**
- Soluzione enterprise
- Buona documentazione
- Scalabilità

**Procedura:**
1. Crea un **App** su DigitalOcean
2. Connetti il repository
3. Configura build e start commands
4. Aggiungi un **Database** PostgreSQL
5. Configura le variabili d'ambiente

#### Opzione 4: VPS (DigitalOcean Droplet, AWS EC2, etc.)

**Vantaggi:**
- Controllo completo
- Costi prevedibili

**Procedura:**
1. Crea un VPS (Ubuntu 22.04 consigliato)
2. Installa Node.js 20+, PostgreSQL, Nginx
3. Clona il repository
4. Configura PM2 per gestire il processo Node.js
5. Configura Nginx come reverse proxy
6. Configura SSL con Let's Encrypt

---

## Checklist Post-Deployment

### Backend (Strapi)

- [ ] Verifica che Strapi sia accessibile all'URL pubblico
- [ ] Accedi all'admin panel (`/admin`) e crea l'utente admin
- [ ] Configura i permessi pubblici:
  - Settings → Users & Permissions → Roles → Public
  - Abilita `find` e `findOne` per tutti i content types
- [ ] Testa le API pubbliche: `https://tuo-backend.com/api/shows`
- [ ] Configura CORS per permettere richieste dal frontend

### Frontend (Next.js)

- [ ] Configura `NEXT_PUBLIC_STRAPI_URL` con l'URL del backend
- [ ] Verifica che il frontend si connetta correttamente al backend
- [ ] Testa tutte le pagine principali
- [ ] Verifica che le immagini/media vengano caricate correttamente
- [ ] Configura il dominio personalizzato (opzionale)

### Database

- [ ] Esegui le migrazioni se necessario
- [ ] Crea un backup automatico (Railway/Render lo fanno automaticamente)
- [ ] Verifica che le connessioni SSL funzionino

---

## Variabili d'Ambiente

### Frontend (.env.local o nel dashboard del provider)

```env
NEXT_PUBLIC_STRAPI_URL=https://tuo-backend.railway.app
NEXTAUTH_URL=https://tuo-frontend.vercel.app
NEXTAUTH_SECRET=genera-un-secret-sicuro
GOOGLE_CLIENT_ID=tuo-google-client-id
GOOGLE_CLIENT_SECRET=tuo-google-client-secret
```

### Backend (nel dashboard del provider)

```env
# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=...
DATABASE_PORT=5432
DATABASE_NAME=...
DATABASE_USERNAME=...
DATABASE_PASSWORD=...
DATABASE_SSL=true
DATABASE_SCHEMA=public

# Strapi
HOST=0.0.0.0
PORT=$PORT
NODE_ENV=production
APP_KEYS=...
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
TRANSFER_TOKEN_SALT=...
JWT_SECRET=...
```

---

## Troubleshooting

### Frontend non si connette al backend

1. Verifica che `NEXT_PUBLIC_STRAPI_URL` sia configurato correttamente
2. Controlla i CORS nel backend
3. Verifica che il backend sia accessibile pubblicamente
4. Controlla i log del browser (Console) per errori

### Backend non si avvia

1. Verifica tutte le variabili d'ambiente
2. Controlla i log del provider (Railway/Render)
3. Verifica che il database sia accessibile
4. Assicurati che `NODE_ENV=production` sia impostato

### Errori 403 dal backend

1. Configura i permessi pubblici in Strapi admin
2. Verifica che i content types siano pubblicati (Draft & Publish)

### Problemi con le immagini

1. Configura l'upload provider in Strapi (AWS S3, Cloudinary, etc.)
2. Verifica che le URL delle immagini siano assolute e accessibili

---

## Costi Stimati

### Opzione Economica (Free Tier)
- **Frontend**: Vercel/Netlify (gratis)
- **Backend**: Railway (free tier, poi ~$5/mese)
- **Database**: Incluso in Railway
- **Totale**: ~$0-5/mese

### Opzione Professionale
- **Frontend**: Vercel Pro (~$20/mese) o Netlify Pro (~$19/mese)
- **Backend**: Railway (~$5-10/mese) o Render (~$7/mese)
- **Database**: Incluso o separato (~$5-15/mese)
- **Totale**: ~$30-50/mese

---

## Prossimi Passi

1. Configura un dominio personalizzato
2. Imposta backup automatici del database
3. Configura monitoring (Sentry, LogRocket, etc.)
4. Imposta CI/CD per deployment automatici
5. Configura CDN per media files (Cloudinary, AWS S3)

---

## Supporto

Per problemi o domande, consulta:
- [Documentazione Strapi](https://docs.strapi.io)
- [Documentazione Next.js](https://nextjs.org/docs)
- [Documentazione Railway](https://docs.railway.app)
- [Documentazione Vercel](https://vercel.com/docs)

