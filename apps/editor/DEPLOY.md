# Deploy Capibara Editor con Backend Render

Guida completa per deployare la PWA Editor quando il backend Strapi è già su Render.

## 📋 Prerequisiti

- ✅ Backend Strapi deployato su Render
- ✅ Accesso al dashboard Render
- ✅ Accesso a Strapi Admin (tramite URL Render)

## 🔧 Step 1: Aggiornare CORS nel Backend

Il backend deve permettere richieste dalla PWA editor. Aggiorna il CORS:

### Opzione A: Variabile d'ambiente (Consigliata)

1. Vai su Render Dashboard → Il tuo servizio Strapi
2. Vai su **Environment**
3. Aggiungi/modifica la variabile:
   ```
   FRONTEND_URL=https://capibara-editor.vercel.app
   ```
   (Sostituisci con l'URL della tua PWA quando sarà deployata)

### Opzione B: Modifica CORS direttamente

Se preferisci, puoi modificare `apps/cms/config/middlewares.ts` per aggiungere l'URL dell'editor:

```typescript
origin: [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.EDITOR_URL || 'http://localhost:3001', // Aggiungi questa
  'http://localhost:3000',
  'http://localhost:1337',
],
```

E aggiungi in Render:
```
EDITOR_URL=https://capibara-editor.vercel.app
```

**⚠️ IMPORTANTE**: Dopo aver modificato CORS, fai un redeploy del backend.

---

## 🔑 Step 2: Creare API Token in Strapi

1. Accedi a Strapi Admin: `https://your-backend.onrender.com/admin`
2. Vai su **Settings → API Tokens**
3. Clicca **Create new API Token**
4. Configura:
   - **Name**: `Capibara Editor PWA`
   - **Token type**: `Full access` (o Custom con permessi specifici)
   - **Token duration**: `Unlimited` (o come preferisci)
5. Clicca **Save**
6. **⚠️ COPIA IL TOKEN SUBITO** - non sarà più visibile dopo!

### Permessi Custom (Opzionale)

Se non vuoi Full access, crea un token Custom con:

**Content Types - Columns:**
- ✅ Create
- ✅ Read
- ✅ Update

**Content Types - Articles:**
- ✅ Create
- ✅ Read
- ✅ Update

**Content Types - Authors, Tags, Partners:**
- ✅ Read (per i dropdown)

**Upload Plugin:**
- ✅ Upload

---

## 💻 Step 3: Configurare la PWA Localmente

1. Crea il file `.env` in `apps/editor/`:

```bash
cd apps/editor
cp env.example .env
```

2. Modifica `.env`:

```env
VITE_STRAPI_URL=https://your-backend.onrender.com
VITE_API_TOKEN=il-token-copiato-dallo-step-2
```

3. Testa localmente:

```bash
npm install
npm run dev
```

Verifica che funzioni su `http://localhost:3001`

---

## 🚀 Step 4: Deploy della PWA

### Opzione A: Vercel (Consigliata)

1. **Installa Vercel CLI** (se non l'hai già):
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy dalla cartella editor**:
   ```bash
   cd apps/editor
   vercel
   ```

4. **Configura variabili d'ambiente in Vercel**:
   - Vai su https://vercel.com/dashboard
   - Seleziona il progetto
   - **Settings → Environment Variables**
   - Aggiungi:
     ```
     VITE_STRAPI_URL=https://your-backend.onrender.com
     VITE_API_TOKEN=il-token-strapi
     ```
   - **⚠️ IMPORTANTE**: Seleziona tutti gli ambienti (Production, Preview, Development)

5. **Redeploy** dopo aver aggiunto le variabili:
   ```bash
   vercel --prod
   ```

### Opzione B: Netlify

1. **Installa Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Build e deploy**:
   ```bash
   cd apps/editor
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Configura variabili**:
   - Dashboard Netlify → Site settings → Environment variables
   - Aggiungi `VITE_STRAPI_URL` e `VITE_API_TOKEN`

### Opzione C: Render (come Static Site)

1. Vai su Render Dashboard → **New +** → **Static Site**
2. Configura:
   - **Name**: `capibara-editor`
   - **Repository**: il tuo repo GitHub
   - **Root Directory**: `apps/editor`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. Aggiungi variabili d'ambiente:
   - `VITE_STRAPI_URL`
   - `VITE_API_TOKEN`

---

## 🔄 Step 5: Aggiornare CORS con URL Produzione

Una volta deployata la PWA, torna al backend e aggiorna CORS:

1. Render Dashboard → Backend Strapi → **Environment**
2. Aggiorna/modifica `FRONTEND_URL` o aggiungi `EDITOR_URL`:
   ```
   FRONTEND_URL=https://capibara-editor.vercel.app
   # oppure
   EDITOR_URL=https://capibara-editor.vercel.app
   ```
3. **Redeploy il backend** (o attendi il redeploy automatico)

---

## ✅ Step 6: Verifica Finale

1. Accedi alla PWA deployata
2. Verifica che:
   - ✅ Login funzioni (se usi JWT) o accesso diretto (se usi API Token)
   - ✅ Dashboard mostri i contenuti esistenti
   - ✅ Creazione nuovo articolo funzioni
   - ✅ Upload immagini funzioni
   - ✅ Salvataggio funzioni

### Troubleshooting

#### Errore CORS
- Verifica che `FRONTEND_URL` o `EDITOR_URL` siano corretti in Render
- Controlla che l'URL della PWA sia nella lista CORS (senza trailing slash)
- Fai redeploy del backend

#### Errore 401 Unauthorized
- Verifica che `VITE_API_TOKEN` sia corretto
- Controlla che il token non sia scaduto
- Verifica i permessi del token in Strapi

#### Errore 403 Forbidden
- Controlla i permessi del token per Columns e Articles
- Verifica che il token abbia accesso all'upload

#### Upload immagini non funziona
- Verifica che Cloudinary sia configurato nel backend
- Controlla che il token abbia permessi Upload

---

## 📝 Checklist Completa

- [ ] Backend Strapi deployato su Render
- [ ] CORS configurato nel backend (variabile `FRONTEND_URL` o `EDITOR_URL`)
- [ ] API Token creato in Strapi Admin
- [ ] Token copiato e salvato
- [ ] PWA configurata localmente con `.env`
- [ ] PWA testata localmente
- [ ] PWA deployata (Vercel/Netlify/Render)
- [ ] Variabili d'ambiente configurate nella piattaforma di deploy
- [ ] CORS aggiornato con URL produzione
- [ ] Backend redeployato (se necessario)
- [ ] Verifica finale funzionamento

---

## 🔐 Sicurezza

### Best Practices

1. **Non committare `.env`** - è già in `.gitignore`
2. **Non esporre API Token** - usa variabili d'ambiente
3. **Limita permessi token** - usa Custom invece di Full access se possibile
4. **HTTPS obbligatorio** - per PWA in produzione
5. **Rotazione token** - cambia periodicamente

### Rotazione Token

1. Crea nuovo token in Strapi
2. Aggiorna `VITE_API_TOKEN` in Vercel/Netlify
3. Redeploy la PWA
4. Elimina vecchio token in Strapi

---

## 🎉 Fatto!

La tua PWA editor è ora connessa al backend Render e pronta all'uso!

Per domande o problemi, consulta:
- [README.md](./README.md) - Documentazione generale
- [SETUP.md](./SETUP.md) - Setup locale
- [Strapi Docs](https://docs.strapi.io) - Documentazione Strapi
