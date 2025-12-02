# Verifica Configurazione Cloudinary

## Come Verificare se Cloudinary è Attivo

### 1. Controlla i Log su Render

Dopo un deploy, controlla i log su Render. Dovresti vedere uno di questi messaggi:

**✅ Se Cloudinary è configurato:**
```
🔍 Checking Cloudinary configuration...
   CLOUDINARY_NAME: ✅ Set
   CLOUDINARY_KEY: ✅ Set
   CLOUDINARY_SECRET: ✅ Set
✅ Cloudinary provider registered successfully
```

**❌ Se Cloudinary NON è configurato:**
```
🔍 Checking Cloudinary configuration...
   CLOUDINARY_NAME: ❌ Missing
   CLOUDINARY_KEY: ❌ Missing
   CLOUDINARY_SECRET: ❌ Missing
⚠️ Cloudinary not configured - missing environment variables
⚠️ Using local provider (images will be lost on deploy!)
```

### 2. Verifica le Variabili d'Ambiente su Render

1. Vai nel dashboard Render
2. Seleziona il servizio **capibara-cms**
3. Vai su **Environment**
4. Verifica che queste variabili siano presenti:
   - `CLOUDINARY_NAME` (es. `dxyz1234`)
   - `CLOUDINARY_KEY` (es. `123456789012345`)
   - `CLOUDINARY_SECRET` (es. `abcdefghijklmnopqrstuvwxyz`)

**⚠️ IMPORTANTE**: 
- Le variabili devono essere esattamente con questi nomi (case-sensitive)
- Non devono avere spazi extra
- Devono contenere valori validi da Cloudinary

### 3. Testa Caricando una Nuova Immagine

1. Accedi all'admin panel: `https://capibara-1z0m.onrender.com/admin`
2. Vai su **Media Library**
3. Carica una **nuova** immagine
4. Controlla l'URL dell'immagine caricata

**✅ Se Cloudinary funziona:**
L'URL dovrebbe essere:
```
https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/filename.jpg
```

**❌ Se Cloudinary NON funziona:**
L'URL sarà ancora:
```
https://capibara-1z0m.onrender.com/uploads/filename.jpg
```

## Risoluzione Problemi

### Problema: Le variabili d'ambiente non sono configurate

**Sintomo**: Nei log vedi "❌ Missing" per tutte le variabili.

**Soluzione**:
1. Vai su [Cloudinary Console](https://cloudinary.com/console)
2. Copia le credenziali (Cloud Name, API Key, API Secret)
3. Aggiungi le variabili d'ambiente su Render
4. Fai un nuovo deploy

### Problema: Il provider non viene registrato

**Sintomo**: Nei log vedi "❌ Failed to register Cloudinary provider".

**Soluzione**:
1. Verifica che `cloudinary` sia installato: `npm list cloudinary`
2. Controlla i log completi per vedere l'errore specifico
3. Verifica che il file `src/extensions/upload/providers/cloudinary.ts` esista
4. Fai un rebuild completo: `npm run build`

### Problema: Le immagini vecchie hanno ancora URL locali

**Sintomo**: Le immagini caricate prima della configurazione Cloudinary hanno ancora URL locali.

**Soluzione**: 
- Questo è normale! Le immagini vecchie rimarranno con URL locali
- Le **nuove** immagini caricate useranno Cloudinary automaticamente
- Per migrare le vecchie immagini, ricaricale manualmente dopo aver configurato Cloudinary

## Checklist Completa

- [ ] Variabili d'ambiente configurate su Render
- [ ] `cloudinary` installato nelle dipendenze
- [ ] Deploy completato su Render
- [ ] Log mostrano "✅ Cloudinary provider registered successfully"
- [ ] Nuova immagine caricata ha URL Cloudinary
- [ ] Immagine è accessibile e visibile

## Supporto

Se il problema persiste dopo aver seguito tutti i passaggi:
1. Controlla i log completi su Render
2. Verifica che tutte le dipendenze siano installate
3. Assicurati che il build completi senza errori
4. Controlla la [documentazione Strapi](https://docs.strapi.io/dev-docs/plugins/upload)

