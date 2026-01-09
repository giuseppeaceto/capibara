# 🔧 Fix Errore CORS

## Problema

```
XMLHttpRequest cannot load http://localhost:1337/api/auth/local due to access control checks.
```

Questo errore indica che:
1. Il backend su Render non permette richieste da `localhost:3001`
2. Il CORS non è configurato correttamente

## ✅ Soluzione

### Step 1: Aggiorna `.env` con URL Render

Modifica `apps/editor/.env`:

```env
# Cambia da localhost all'URL del tuo backend Render
VITE_STRAPI_URL=https://capibara-cms.onrender.com

# Mantieni il token
VITE_API_TOKEN=il-tuo-token
```

**⚠️ IMPORTANTE**: Sostituisci `capibara-cms.onrender.com` con l'URL reale del tuo backend Render!

### Step 2: Configura CORS nel Backend Render

1. Vai su [Render Dashboard](https://dashboard.render.com)
2. Seleziona il servizio Strapi (`capibara-cms`)
3. Vai su **Environment**
4. Aggiungi/modifica queste variabili:

```
EDITOR_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

5. Clicca **Save Changes**
6. Render farà un **redeploy automatico**

### Step 3: Riavvia il Server Dev

Dopo aver modificato `.env`, **riavvia il server dev**:

```bash
# Ferma il server (Ctrl+C) e riavvia
npm run dev
```

**⚠️ IMPORTANTE**: Vite carica le variabili d'ambiente solo all'avvio!

### Step 4: Verifica

1. Controlla che `.env` abbia l'URL corretto di Render
2. Verifica che Render abbia `EDITOR_URL=http://localhost:3001`
3. Riavvia `npm run dev`
4. Ricarica il browser (hard refresh: Cmd+Shift+R su Mac)

## 🔍 Verifica URL Backend Render

Per trovare l'URL del tuo backend:

1. Render Dashboard → Il tuo servizio
2. Il tuo URL sarà tipo: `https://capibara-cms-xxx.onrender.com`
3. Copia questo URL e usalo in `.env`

## 🐛 Se l'errore persiste

### Controlla che il backend sia raggiungibile:

```bash
curl https://tuo-backend.onrender.com/api/columns
```

Se risponde, il backend è online.

### Verifica CORS nel codice backend:

Il file `apps/cms/config/middlewares.ts` dovrebbe avere:

```typescript
origin: [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.EDITOR_URL || 'http://localhost:3001', // Questa riga
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:1337',
],
```

Se manca, aggiungila e fai commit + push.

### Verifica variabili ambiente Render:

Nella console del browser (F12), controlla:
- L'URL che viene chiamata (dovrebbe essere quella di Render, non localhost)
- Gli header CORS nella risposta

## ✅ Checklist

- [ ] `.env` ha `VITE_STRAPI_URL` con URL Render (non localhost)
- [ ] Render ha `EDITOR_URL=http://localhost:3001` in Environment
- [ ] Backend è stato redeployato dopo aver aggiunto `EDITOR_URL`
- [ ] Server dev riavviato (`npm run dev`)
- [ ] Browser ricaricato (hard refresh)
