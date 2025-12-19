# Troubleshooting Cloudinary - Immagini con URL Locali

## Problema

Le immagini caricate hanno ancora URL locali come:
```
https://capibara-1z0m.onrender.com/uploads/thumb_1_aeeb88be0b.jpg
```

Invece di URL Cloudinary come:
```
https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/thumb_1_aeeb88be0b.jpg
```

## Checklist di Verifica

### 1. Verifica le Variabili d'Ambiente su Render

1. Vai nel dashboard Render
2. Seleziona il servizio **capibara-cms**
3. Vai su **Environment**
4. Verifica che queste variabili siano presenti e corrette:
   - `CLOUDINARY_NAME` (es. `dxyz1234`)
   - `CLOUDINARY_KEY` (es. `123456789012345`)
   - `CLOUDINARY_SECRET` (es. `abcdefghijklmnopqrstuvwxyz`)

**⚠️ IMPORTANTE**: Se anche una sola variabile manca o è vuota, Strapi userà il provider "local" di default.

### 2. Verifica che Cloudinary sia Installato

Controlla che `cloudinary` sia nelle dipendenze:

```bash
cd apps/cms
npm list cloudinary
```

Se non è installato:
```bash
npm install cloudinary
```

### 3. Riavvia Strapi dopo le Modifiche

Dopo aver aggiunto/modificato le variabili d'ambiente su Render:

1. Vai su **Manual Deploy** nel dashboard Render
2. Clicca su **Deploy latest commit**
3. Attendi che il deploy completi

**⚠️ IMPORTANTE**: Strapi deve essere riavviato per caricare le nuove variabili d'ambiente.

### 4. Verifica i Log di Strapi

Controlla i log su Render per vedere se ci sono errori:

1. Vai su **Logs** nel dashboard Render
2. Cerca errori relativi a Cloudinary o upload provider
3. Se vedi errori come "Provider not found" o "Invalid credentials", verifica la configurazione

### 5. Testa l'Upload di una Nuova Immagine

1. Accedi all'admin panel: `https://capibara-1z0m.onrender.com/admin`
2. Vai su **Media Library**
3. Carica una **nuova** immagine di test
4. Verifica l'URL dell'immagine caricata

**✅ Se l'URL inizia con `https://res.cloudinary.com/`**: Cloudinary funziona correttamente!

**❌ Se l'URL inizia con `https://capibara-1z0m.onrender.com/uploads/`**: Cloudinary non è attivo.

### 6. Verifica la Configurazione del Provider

Il provider deve essere registrato in `apps/cms/src/index.ts`:

```typescript
import cloudinaryProvider from './extensions/upload/providers/cloudinary';

export default {
  register({ strapi }) {
    strapi.plugin('upload').provider.register('cloudinary', cloudinaryProvider);
  },
  // ...
};
```

E configurato in `apps/cms/config/plugins.ts`:

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
    },
  },
});
```

## Soluzioni Comuni

### Soluzione 1: Variabili d'Ambiente Mancanti

**Sintomo**: Le immagini hanno ancora URL locali.

**Causa**: Le variabili `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, o `CLOUDINARY_SECRET` non sono configurate su Render.

**Soluzione**:
1. Aggiungi le variabili nel dashboard Render
2. Fai un nuovo deploy
3. Testa caricando una nuova immagine

### Soluzione 2: Provider Non Registrato

**Sintomo**: Errore "Provider not found" nei log.

**Causa**: Il provider non è registrato correttamente.

**Soluzione**: Verifica che `apps/cms/src/index.ts` contenga:
```typescript
register({ strapi }) {
  strapi.plugin('upload').provider.register('cloudinary', cloudinaryProvider);
}
```

### Soluzione 3: Credenziali Cloudinary Errate

**Sintomo**: Errore "Invalid credentials" nei log.

**Causa**: Le credenziali Cloudinary sono errate.

**Soluzione**:
1. Vai su [Cloudinary Console](https://cloudinary.com/console)
2. Verifica le credenziali nel dashboard
3. Aggiorna le variabili d'ambiente su Render
4. Fai un nuovo deploy

### Soluzione 4: Immagini Vecchie con URL Locali

**Sintomo**: Le immagini caricate prima della configurazione Cloudinary hanno ancora URL locali.

**Causa**: Le immagini vecchie sono state caricate quando Cloudinary non era configurato.

**Soluzione**: 
- Le immagini vecchie rimarranno con URL locali
- Le **nuove** immagini caricate useranno Cloudinary automaticamente
- Per migrare le vecchie immagini, ricaricale manualmente dopo aver configurato Cloudinary

## Verifica Finale

Dopo aver seguito tutti i passaggi:

1. ✅ Variabili d'ambiente configurate su Render
2. ✅ Cloudinary installato (`npm list cloudinary`)
3. ✅ Deploy completato su Render
4. ✅ Nuova immagine caricata
5. ✅ URL inizia con `https://res.cloudinary.com/`

Se tutti questi passaggi sono completati e l'URL è ancora locale, controlla i log di Strapi per errori specifici.

## Supporto

Se il problema persiste:
1. Controlla i log completi su Render
2. Verifica che tutte le dipendenze siano installate
3. Assicurati che il build completi senza errori
4. Controlla la [documentazione Strapi](https://docs.strapi.io/dev-docs/plugins/upload) per aggiornamenti

