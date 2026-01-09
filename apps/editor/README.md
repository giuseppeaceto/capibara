# Capibara Editor - PWA Content Editor

PWA semplificata e intuitiva per l'inserimento di contenuti nel CMS Strapi.

## 🚀 Features

- ✅ Mobile-first responsive design
- ✅ Offline support con auto-sync
- ✅ Form intuitivi per Article e Column
- ✅ Upload immagini con preview
- ✅ Rich text editor
- ✅ Draft & Publish workflow
- ✅ Autenticazione JWT/API Token

## 🛠️ Stack Tecnologico

- **Vite** - Build tool veloce
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **TanStack Query** - Data fetching & caching
- **Zustand** - State management
- **Tiptap** - Rich text editor
- **Workbox** - Service Worker & PWA

## 📦 Setup

### Prerequisiti

- Node.js 20+
- npm 10+

### Installazione

```bash
cd apps/editor
npm install
```

### Configurazione

Copia il file di esempio delle variabili d'ambiente:

```bash
cp env.example .env
```

Modifica `.env` con le tue configurazioni:

```env
VITE_STRAPI_URL=http://localhost:1337
VITE_API_TOKEN=your-api-token-here
```

### Sviluppo

```bash
npm run dev
```

L'app sarà disponibile su `http://localhost:3001`

### Build Produzione

```bash
npm run build
```

I file compilati saranno in `dist/`

## 🔐 Autenticazione

### Opzione 1: API Token (Consigliata)

1. Vai su Strapi Admin → Settings → API Tokens
2. Crea un nuovo token con permessi di scrittura
3. Aggiungi il token in `.env` come `VITE_API_TOKEN`

### Opzione 2: JWT User

1. Usa il form di login nell'app
2. Il token JWT verrà salvato in localStorage

## 📱 Content Types Supportati

### Column
- Titolo, slug, descrizione
- Cover image
- Autore
- Links (componente ripetibile)

### Article
- Titolo, slug, excerpt
- Rich text body
- Hero image
- Autore, tags, partners
- SEO component
- Publish date, premium flag, reading time

## 🏗️ Struttura Progetto

```
apps/editor/
├── src/
│   ├── components/      # Componenti React
│   │   ├── forms/      # Form per content types
│   │   ├── editors/    # Rich text editor
│   │   └── ui/         # Componenti UI base
│   ├── lib/            # Utilities
│   │   ├── api.ts      # Client API Strapi
│   │   ├── auth.ts     # Gestione autenticazione
│   │   └── storage.ts  # IndexedDB per draft offline
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Pagine dell'app
│   ├── store/          # Zustand stores
│   └── main.tsx        # Entry point
├── public/             # Asset statici
└── dist/              # Build output
```

## 📝 TODO

- [ ] Implementare tutti i content types
- [ ] Migliorare offline sync
- [ ] Aggiungere preview contenuti
- [ ] Gestione avanzata media library
- [ ] Export/Import contenuti
