# Setup Capibara Editor - Guida Rapida

## 🚀 Quick Start

### 1. Installazione Dipendenze

```bash
cd apps/editor
npm install
```

### 2. Configurazione Ambiente

Copia e modifica il file `.env`:

```bash
cp env.example .env
```

Modifica `.env` con le tue credenziali:

```env
VITE_STRAPI_URL=http://localhost:1337
VITE_API_TOKEN=your-api-token-here
```

### 3. Configurazione Strapi

#### Opzione A: Usa API Token (Consigliata)

1. Accedi a Strapi Admin: `http://localhost:1337/admin`
2. Vai su **Settings → API Tokens**
3. Crea un nuovo token:
   - **Name**: Editor PWA
   - **Token type**: Full access (o custom con permessi di scrittura)
   - **Token duration**: Unlimited
4. Copia il token e aggiungilo in `.env` come `VITE_API_TOKEN`

#### Opzione B: Usa Autenticazione JWT

1. Lascia `VITE_API_TOKEN` vuoto
2. Usa il form di login nell'app con le credenziali Strapi

### 4. Permessi Strapi

Assicurati che l'API Token o l'utente abbia i permessi per:

**Columns:**
- ✅ Create
- ✅ Read
- ✅ Update
- ✅ Delete (opzionale)

**Articles:**
- ✅ Create
- ✅ Read
- ✅ Update
- ✅ Delete (opzionale)

**Authors, Tags, Partners:**
- ✅ Read (per i dropdown)

**Upload:**
- ✅ Upload files

### 5. Avvio

```bash
npm run dev
```

L'app sarà disponibile su `http://localhost:3001`

## 📱 Test PWA

1. Apri l'app nel browser
2. Chrome: Menu → "Installa Capibara Editor"
3. Oppure vai su DevTools → Application → Manifest → "Add to homescreen"

## 🔧 Troubleshooting

### Errore "401 Unauthorized"
- Verifica che `VITE_API_TOKEN` sia corretto
- Oppure verifica le credenziali JWT

### Errore "403 Forbidden"
- Controlla i permessi dell'API Token in Strapi
- Verifica che il token abbia accesso ai content types necessari

### Upload immagini non funziona
- Verifica che Cloudinary sia configurato in Strapi
- Controlla i permessi di upload

### CORS errors
- Verifica che `VITE_STRAPI_URL` sia corretta
- Controlla la configurazione CORS in Strapi (`config/middlewares.ts`)

## 🏗️ Build Produzione

```bash
npm run build
```

I file saranno in `dist/`. Puoi deployare su:
- Vercel (consigliato)
- Netlify
- Render
- GitHub Pages

### Deploy Vercel

```bash
# Installa Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Assicurati di aggiungere le variabili d'ambiente in Vercel:
- `VITE_STRAPI_URL`
- `VITE_API_TOKEN`

## 📝 Note

- La PWA funziona meglio con HTTPS
- In produzione, usa HTTPS per abilitare tutte le funzionalità PWA
- Il service worker si aggiorna automaticamente
