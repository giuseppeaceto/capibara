# Capibara Web - Frontend Next.js

Frontend pubblico del progetto **Capibara**, costruito con Next.js 16 e Tailwind CSS.

## Stack Tecnologico

- **Next.js 16** - Framework React con App Router
- **React 19** - Libreria UI
- **Tailwind CSS 4** - Framework CSS utility-first
- **TypeScript** - Tipizzazione statica
- **NextAuth.js** - Autenticazione (in configurazione)

## Struttura del Progetto

```
apps/web/
├── src/
│   ├── app/              # App Router di Next.js
│   │   ├── articoli/     # Pagine articoli
│   │   ├── newsletter/   # Pagine newsletter
│   │   ├── podcast/      # Pagine podcast
│   │   ├── video/        # Pagine video
│   │   └── ...
│   ├── components/       # Componenti React riutilizzabili
│   └── lib/              # Utility e helper
│       ├── api.ts        # Client API per Strapi
│       ├── markdown.ts   # Parser Markdown
│       └── youtube.ts    # Utility YouTube
├── public/               # File statici
└── package.json
```

## Sviluppo Locale

### Prerequisiti

- Node.js 20+
- Backend Strapi in esecuzione su `http://localhost:1337`

### Setup

1. Installa le dipendenze:
   ```bash
   npm install
   ```

2. Configura le variabili d'ambiente (crea `.env.local`):
   ```env
   NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
   ```

3. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```

4. Apri [http://localhost:3000](http://localhost:3000) nel browser

### Script Disponibili

- `npm run dev` - Avvia il server di sviluppo
- `npm run build` - Build per produzione
- `npm run start` - Avvia il server di produzione
- `npm run lint` - Esegue ESLint

## Configurazione

### Variabili d'Ambiente

- `NEXT_PUBLIC_STRAPI_URL` - URL del backend Strapi (obbligatorio)
- `NEXTAUTH_URL` - URL dell'applicazione (per autenticazione)
- `NEXTAUTH_SECRET` - Secret per NextAuth (genera con `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` - Client ID Google OAuth (opzionale)
- `GOOGLE_CLIENT_SECRET` - Client Secret Google OAuth (opzionale)

### Connessione al Backend

Il frontend si connette automaticamente al backend Strapi configurato in `NEXT_PUBLIC_STRAPI_URL`. 

I contenuti vengono recuperati tramite:
- API pubbliche di Strapi (`/api/*`)
- Client API personalizzato in `src/lib/api.ts`

## Deployment

Il frontend è deployato su **Vercel**. Vedi la documentazione completa:

- 📖 [Guida Deployment Vercel](../../VERCEL_DEPLOY.md)
- 📖 [Guida Deployment Generale](../../DEPLOYMENT.md)

## Pagine Principali

- `/` - Homepage
- `/articoli` - Lista articoli
- `/articoli/[slug]` - Dettaglio articolo
- `/newsletter` - Lista newsletter
- `/newsletter/[slug]` - Dettaglio newsletter
- `/podcast` - Lista podcast
- `/podcast/[slug]` - Dettaglio episodio podcast
- `/video` - Lista video
- `/video/[slug]` - Dettaglio episodio video
- `/archivio` - Archivio contenuti
- `/chi-siamo` - Chi siamo
- `/partner` - Partner

## Componenti Principali

- `MainLayout` - Layout principale con header e footer
- `ContentCard` - Card per visualizzare contenuti
- `ContentListItem` - Item di lista per contenuti
- `PodcastPlatformButtons` - Pulsanti per piattaforme podcast

## Prossimi Sviluppi

- [ ] Integrazione completa NextAuth per autenticazione
- [ ] Area riservata per abbonati
- [ ] Integrazione pagamenti Stripe
- [ ] Ottimizzazioni SEO
- [ ] Design system completo

## Documentazione

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
