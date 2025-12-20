# Guida al Deployment

Questa sezione contiene tutte le guide per il deployment del progetto.

## Documentazione Disponibile

- **[Guida Generale Deployment](./DEPLOYMENT.md)** - Panoramica completa delle opzioni di deployment
- **[Deploy su Render](./RENDER_DEPLOY.md)** - Guida passo-passo per il backend Strapi su Render
- **[Deploy su Vercel](./VERCEL_DEPLOY.md)** - Guida passo-passo per il frontend Next.js su Vercel

## Architettura

Il progetto è composto da:
- **Frontend**: Next.js 16 (App Router) in `apps/web`
- **Backend**: Strapi 5 (CMS) in `apps/cms`
- **Database**: PostgreSQL 16

## Setup Consigliato

### Frontend (Next.js)
- **Vercel** (consigliato) - Ottimizzato per Next.js, deployment automatico

### Backend (Strapi) + Database
- **Render** (attuale) - Free tier disponibile, PostgreSQL incluso
- **Railway** (alternativa) - Setup semplice, PostgreSQL incluso

## Checklist Post-Deployment

### Backend (Strapi)
- [ ] Verifica che Strapi sia accessibile all'URL pubblico
- [ ] Crea l'utente admin
- [ ] Configura i permessi pubblici (Settings → Users & Permissions → Roles → Public)
- [ ] Testa le API pubbliche
- [ ] Configura CORS per il frontend

### Frontend (Next.js)
- [ ] Configura `NEXT_PUBLIC_STRAPI_URL` con l'URL del backend
- [ ] Verifica che il frontend si connetta correttamente al backend
- [ ] Testa tutte le pagine principali
- [ ] Verifica che le immagini/media vengano caricate correttamente

### Database
- [ ] Esegui le migrazioni se necessario
- [ ] Configura backup automatici
- [ ] Verifica connessioni SSL


