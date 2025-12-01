# Guida Rapida: Deploy su Vercel

Questa è una guida passo-passo per pubblicare il frontend Next.js su Vercel.

## Prerequisiti

- Account GitHub (il repository deve essere su GitHub)
- Account Vercel (puoi crearlo con GitHub)

## Procedura Step-by-Step

### 1. Prepara il Repository

Assicurati che il codice sia committato e pushato su GitHub:

```bash
git add .
git commit -m "Preparazione per deployment Vercel"
git push origin main
```

### 2. Connetti Vercel al Repository

1. Vai su [vercel.com](https://vercel.com) e fai login con GitHub
2. Click su **Add New Project**
3. Seleziona il repository `capibara` dalla lista
4. Click su **Import**

### 3. Configura il Progetto

Vercel dovrebbe rilevare automaticamente che è un progetto Next.js. Verifica queste impostazioni:

#### Framework Preset
- **Framework Preset**: Next.js (dovrebbe essere già selezionato)

#### Root Directory
- **Root Directory**: `apps/web`
  - Click su **Edit** accanto a Root Directory
  - Seleziona `apps/web` dalla lista o digita `apps/web`
  - Click su **Continue**

#### Build Settings
Vercel dovrebbe precompilare automaticamente:
- **Build Command**: `npm run build` (o `cd apps/web && npm run build`)
- **Output Directory**: `.next` (o `apps/web/.next`)
- **Install Command**: `npm install` (o `cd apps/web && npm install`)

**Nota**: Se Vercel non rileva automaticamente, usa queste impostazioni manuali:
- Build Command: `cd apps/web && npm install && npm run build`
- Output Directory: `apps/web/.next`
- Install Command: `cd apps/web && npm install`

### 4. Configura le Variabili d'Ambiente

Nella sezione **Environment Variables**, aggiungi:

#### Variabili Obbligatorie

```env
NEXT_PUBLIC_STRAPI_URL=https://tuo-backend.railway.app
```

**Importante**: Sostituisci `https://tuo-backend.railway.app` con l'URL reale del tuo backend Strapi deployato.

#### Variabili per NextAuth (se usi l'autenticazione)

```env
NEXTAUTH_URL=https://tuo-progetto.vercel.app
NEXTAUTH_SECRET=genera-un-secret-sicuro-qui
GOOGLE_CLIENT_ID=tuo-google-client-id
GOOGLE_CLIENT_SECRET=tuo-google-client-secret
```

**Come generare NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

**Nota**: `NEXTAUTH_URL` sarà l'URL del tuo progetto Vercel. Puoi aggiornarlo dopo il primo deploy quando conoscerai l'URL esatto.

### 5. Deploy!

1. Click su **Deploy**
2. Vercel inizierà il build automaticamente
3. Attendi 2-5 minuti per il completamento
4. Una volta completato, otterrai un URL tipo: `https://capibara-xyz.vercel.app`

### 6. Aggiorna NEXTAUTH_URL (se necessario)

Dopo il primo deploy:

1. Vai su **Settings > Environment Variables**
2. Aggiorna `NEXTAUTH_URL` con l'URL reale del tuo progetto Vercel
3. Fai un nuovo deploy (Vercel lo farà automaticamente se hai abilitato il redeploy)

### 7. Configura il Dominio Personalizzato (Opzionale)

1. Vai su **Settings > Domains**
2. Aggiungi il tuo dominio
3. Segui le istruzioni per configurare i DNS

## Verifica Post-Deploy

Dopo il deploy, verifica:

- [ ] Il sito è accessibile all'URL Vercel
- [ ] Le pagine principali caricano correttamente
- [ ] I contenuti vengono caricati da Strapi (verifica la console del browser)
- [ ] Le immagini/media vengono visualizzate correttamente
- [ ] La ricerca funziona (`/api/search`)
- [ ] L'autenticazione funziona (se configurata)

## Troubleshooting

### Build Fallisce

**Errore: "Cannot find module"**
- Verifica che `Root Directory` sia impostato su `apps/web`
- Verifica che tutte le dipendenze siano in `apps/web/package.json`

**Errore: "Build command failed"**
- Controlla i log di build in Vercel
- Verifica che Node.js version sia compatibile (20+)
- Assicurati che il build funzioni localmente: `cd apps/web && npm run build`

### Il sito non si connette a Strapi

**Errore: "ECONNREFUSED" o "fetch failed"**
- Verifica che `NEXT_PUBLIC_STRAPI_URL` sia configurato correttamente
- Verifica che il backend Strapi sia accessibile pubblicamente
- Controlla i CORS nel backend (vedi `DEPLOYMENT.md`)

**Errore: 403 Forbidden**
- Configura i permessi pubblici in Strapi admin
- Vai su: Settings → Users & Permissions → Roles → Public
- Abilita `find` e `findOne` per tutti i content types

### NextAuth non funziona

**Errore: "NEXTAUTH_URL is not set"**
- Aggiungi `NEXTAUTH_URL` nelle Environment Variables
- Assicurati che corrisponda all'URL del tuo progetto Vercel

**Errore: "Invalid credentials"**
- Verifica `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`
- Assicurati che le credenziali Google OAuth siano configurate correttamente

## Deployment Automatico

Vercel deploya automaticamente ad ogni push su:
- **Production**: branch `main` o `master`
- **Preview**: tutti gli altri branch

Puoi disabilitare questa funzione in **Settings > Git**.

## Aggiornamenti Futuri

Ogni volta che fai push su GitHub:
1. Vercel rileva automaticamente le modifiche
2. Crea un nuovo deploy
3. Se è il branch `main`, aggiorna la produzione
4. Se è un altro branch, crea una preview URL

## Costi

**Free Tier Vercel** include:
- ✅ Deploy illimitati
- ✅ 100GB bandwidth/mese
- ✅ SSL gratuito
- ✅ CDN globale
- ✅ Serverless functions incluse

Per progetti più grandi, considera il **Pro Plan** ($20/mese).

## Prossimi Passi

1. ✅ Deploy del frontend su Vercel (questa guida)
2. ⏭️ Deploy del backend su Railway (vedi `DEPLOYMENT.md`)
3. ⏭️ Configura CORS nel backend
4. ⏭️ Testa l'integrazione completa
5. ⏭️ Configura dominio personalizzato

---

**Hai bisogno di aiuto?** Consulta:
- [Documentazione Vercel](https://vercel.com/docs)
- [Documentazione Next.js](https://nextjs.org/docs)
- Il file `DEPLOYMENT.md` per informazioni sul backend

