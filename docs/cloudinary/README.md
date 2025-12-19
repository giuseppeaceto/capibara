# Configurazione Cloudinary

Cloudinary è configurato per lo storage persistente delle immagini nel progetto.

## Documentazione Disponibile

- **[Setup Cloudinary](./CLOUDINARY_SETUP.md)** - Guida completa per configurare Cloudinary da zero
- **[Verifica Configurazione](./CLOUDINARY_CHECK.md)** - Come verificare se Cloudinary è attivo
- **[Troubleshooting](./CLOUDINARY_TROUBLESHOOTING.md)** - Risoluzione problemi comuni

## Quick Start

1. Crea un account su [cloudinary.com](https://cloudinary.com)
2. Ottieni le credenziali dal dashboard (Cloud Name, API Key, API Secret)
3. Aggiungi le variabili d'ambiente:
   - `CLOUDINARY_NAME`
   - `CLOUDINARY_KEY`
   - `CLOUDINARY_SECRET`
4. Riavvia Strapi

Le immagini caricate dopo la configurazione useranno automaticamente Cloudinary.

## Perché Cloudinary?

Su piattaforme come Render, Railway o Vercel, il filesystem è effimero. Le immagini caricate localmente vengono perse ad ogni deploy. Cloudinary offre:

- ✅ Storage persistente
- ✅ CDN globale
- ✅ Trasformazioni immagini on-the-fly
- ✅ Free tier generoso (25GB storage, 25GB bandwidth/mese)

