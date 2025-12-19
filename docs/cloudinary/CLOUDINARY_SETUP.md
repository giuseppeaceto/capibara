# Configurazione Cloudinary per Storage Immagini Persistente

## Problema

Su piattaforme come Render, Railway o Vercel, il filesystem è **effimero** (ephemeral). Questo significa che ogni volta che fai un deploy o il servizio viene riavviato, tutti i file caricati localmente (incluse le immagini) vengono persi.

## Soluzione: Cloudinary

Cloudinary è un servizio di storage cloud che offre:
- ✅ Storage persistente per immagini e media
- ✅ CDN globale per performance ottimali
- ✅ Trasformazioni immagini on-the-fly (resize, crop, etc.)
- ✅ Free tier generoso (25GB storage, 25GB bandwidth/mese)

## Setup Passo-Passo

### 1. Crea Account Cloudinary

1. Vai su [cloudinary.com](https://cloudinary.com)
2. Clicca su **Sign Up for Free**
3. Completa la registrazione (puoi usare GitHub, Google, etc.)

### 2. Ottieni le Credenziali

1. Dopo il login, vai su **Dashboard**
2. Troverai le seguenti informazioni:
   - **Cloud name** (es. `dxyz1234`)
   - **API Key** (es. `123456789012345`)
   - **API Secret** (es. `abcdefghijklmnopqrstuvwxyz`)

### 3. Installa le Dipendenze

Nel progetto, le dipendenze sono già configurate in `apps/cms/package.json`. Installa le dipendenze:

```bash
cd apps/cms
npm install cloudinary
```

**Nota**: Stiamo usando un provider personalizzato per Cloudinary (in `src/extensions/upload/providers/cloudinary.ts`). Se preferisci usare un pacchetto npm ufficiale, puoi provare `@strapi/provider-upload-cloudinary`, ma potrebbe non essere disponibile per Strapi 5.

### 4. Configura le Variabili d'Ambiente

#### In Sviluppo Locale

Aggiungi al file `.env` in `apps/cms/`:

```env
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_KEY=your-api-key
CLOUDINARY_SECRET=your-api-secret
```

#### In Produzione (Render)

1. Vai nel dashboard Render
2. Seleziona il servizio **capibara-cms**
3. Vai su **Environment**
4. Aggiungi queste variabili:
   - **Key**: `CLOUDINARY_NAME`, **Value**: `your-cloud-name`
   - **Key**: `CLOUDINARY_KEY`, **Value**: `your-api-key`
   - **Key**: `CLOUDINARY_SECRET`, **Value**: `your-api-secret`

### 5. Verifica la Configurazione

La configurazione è già presente in `apps/cms/config/plugins.ts`. Verifica che sia corretta:

```typescript
export default ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
```

### 6. Riavvia Strapi

Dopo aver configurato le variabili d'ambiente:

1. **In sviluppo**: Riavvia Strapi (`npm run develop`)
2. **In produzione**: Render rileverà automaticamente le nuove variabili e farà un nuovo deploy

### 7. Testa l'Upload

1. Accedi all'admin panel di Strapi (`/admin`)
2. Vai su **Media Library**
3. Carica un'immagine di test
4. Verifica che l'URL dell'immagine punti a `res.cloudinary.com` invece di `localhost` o il tuo dominio Render

## Migrazione Immagini Esistenti

Se hai già immagini caricate localmente che vuoi migrare a Cloudinary:

### Opzione 1: Ricarica Manualmente

1. Esporta le immagini esistenti da Strapi
2. Dopo aver configurato Cloudinary, ricarica le immagini tramite l'admin panel

### Opzione 2: Script di Migrazione

Puoi creare uno script per migrare automaticamente le immagini esistenti. Contatta il team per assistenza se necessario.

## Verifica che Funzioni

Dopo la configurazione:

1. ✅ Carica una nuova immagine in Strapi
2. ✅ Verifica che l'URL sia `https://res.cloudinary.com/...`
3. ✅ Fai un deploy/riavvio del servizio
4. ✅ Verifica che l'immagine sia ancora accessibile (non dovrebbe essere persa!)

## Troubleshooting

### Errore: "Provider not found"

**Problema**: Il provider Cloudinary non è installato.

**Soluzione**:
```bash
cd apps/cms
npm install @strapi/provider-upload-cloudinary cloudinary
npm run build
```

### Errore: "Invalid credentials"

**Problema**: Le credenziali Cloudinary sono errate.

**Soluzione**:
1. Verifica che le variabili d'ambiente siano configurate correttamente
2. Controlla che non ci siano spazi extra nei valori
3. Ricopia le credenziali dal dashboard Cloudinary

### Le immagini non vengono caricate

**Problema**: La configurazione non è corretta.

**Soluzione**:
1. Verifica che `apps/cms/config/plugins.ts` contenga la configurazione corretta
2. Controlla i log di Strapi per errori
3. Assicurati che le variabili d'ambiente siano disponibili (riavvia Strapi dopo averle aggiunte)

### Le immagini vecchie sono ancora su localhost

**Problema**: Le immagini caricate prima della configurazione Cloudinary hanno ancora URL locali.

**Soluzione**: Le immagini vecchie rimarranno con URL locali. Le nuove immagini caricate useranno Cloudinary automaticamente. Per migrare le vecchie, ricaricale manualmente.

## Costi

### Free Tier Cloudinary
- ✅ 25GB storage
- ✅ 25GB bandwidth/mese
- ✅ Trasformazioni immagini incluse
- ✅ CDN globale

### Upgrade (se necessario)
- **Plus Plan**: $99/mese (100GB storage, 100GB bandwidth)
- **Advanced Plan**: $224/mese (250GB storage, 250GB bandwidth)

Per la maggior parte dei progetti, il free tier è più che sufficiente.

## Alternative

Se preferisci non usare Cloudinary, puoi usare:

- **AWS S3** (più complesso, ma più controllo)
- **DigitalOcean Spaces** (S3-compatible, più economico)
- **Backblaze B2** (molto economico)
- **Google Cloud Storage** (simile ad AWS S3)

Per configurare questi provider, consulta la [documentazione Strapi](https://docs.strapi.io/dev-docs/plugins/upload).

## Supporto

- [Documentazione Cloudinary](https://cloudinary.com/documentation)
- [Documentazione Strapi Upload Provider](https://docs.strapi.io/dev-docs/plugins/upload)
- [Forum Strapi](https://forum.strapi.io)

