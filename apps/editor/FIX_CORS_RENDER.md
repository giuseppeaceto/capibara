# 🔧 Fix CORS per Render - Guida Rapida

## Problema
```
Origin http://localhost:3001 is not allowed by Access-Control-Allow-Origin
```

## ✅ Soluzione in 3 Passi

### Step 1: Aggiungi Variabile in Render Dashboard

1. Vai su: https://dashboard.render.com
2. Seleziona il servizio **capibara-cms** (o il nome del tuo backend Strapi)
3. Vai su **Environment** (menu laterale)
4. Clicca **Add Environment Variable**
5. Aggiungi:
   ```
   Key: EDITOR_URL
   Value: http://localhost:3001
   ```
6. Clicca **Save Changes**

### Step 2: Redeploy Backend

Render farà un **redeploy automatico** quando salvi. Puoi verificare nella tab **Events**.

Oppure vai su **Manual Deploy** → **Deploy latest commit**.

### Step 3: Riavvia PWA Locale

Non serve riavviare, ma se non funziona:
```bash
# Ferma il server (Ctrl+C)
# Riavvia
npm run dev
```

## ✅ Verifica

Dopo il redeploy (circa 2-3 minuti):
1. Ricarica il browser (hard refresh: Cmd+Shift+R)
2. Controlla la console: non dovrebbero più esserci errori CORS
3. La lista autori dovrebbe caricare

## 🔍 Verifica CORS Configurato

Se hai già fatto commit del file `apps/cms/config/middlewares.ts` aggiornato, il CORS supporterà `EDITOR_URL`.

Altrimenti, assicurati che il file contenga:
```typescript
origin: [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.EDITOR_URL || 'http://localhost:3001', // Questa riga
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:1337',
],
```

## ⚠️ Se Non Funziona

1. Verifica che il redeploy sia completato (Render Dashboard → Events)
2. Controlla i log del backend per errori
3. Assicurati che `middlewares.ts` sia aggiornato e deployato
4. Prova a fare un hard refresh del browser
