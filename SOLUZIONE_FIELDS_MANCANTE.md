# Soluzione: Sezione "Fields" Non Appare nei Permessi

## Problema

La sezione "Fields" non appare nell'interfaccia dei permessi di Strapi 5, rendendo impossibile configurare i permessi a livello di campo per i componenti come `seo`.

## Causa

Questo è un **bug noto** in Strapi 5 (segnalato dalla versione 5.18.0 in poi). L'interfaccia dei permessi non mostra correttamente la sezione "Fields" per configurare i permessi a livello di campo.

## Soluzioni

### Soluzione 1: Verifica che i Permessi Base siano Configurati

In Strapi 5, quando abiliti le azioni base (find, findOne, update, create) per un content type, **tutti i campi dovrebbero essere accessibili di default**, inclusi i componenti.

**Prova questo:**

1. Vai su **Settings** → **Users & Permissions** → **Roles**
2. Seleziona il ruolo (Editor, Author, Authenticated, ecc.)
3. Per ogni content type (Article, Video Episode, Podcast Episode):
   - ✅ Abilita **find**
   - ✅ Abilita **findOne**
   - ✅ Abilita **update**
   - ✅ Abilita **create**
4. **Salva le modifiche**
5. **Riavvia Strapi completamente**
6. Chiedi all'utente di **disconnettersi e riconnettersi**

### Soluzione 2: Usa l'API REST per Configurare i Permessi

Se la soluzione 1 non funziona, puoi configurare i permessi tramite l'API REST di Strapi.

**Nota**: Questa soluzione richiede competenze tecniche e accesso all'API di Strapi.

1. Ottieni un **API Token** da Strapi:
   - Vai su **Settings** → **API Tokens**
   - Crea un nuovo token con permessi **Full access**

2. Usa l'API per configurare i permessi:
   ```bash
   # Esempio: Abilita tutti i campi per Article nel ruolo Editor
   curl -X PUT https://tuo-strapi-url.com/api/users-permissions/roles/EDITOR_ROLE_ID \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "permissions": [
         {
           "action": "api::article.article.find",
           "subject": "api::article.article",
           "properties": {
             "fields": ["*"]  // Tutti i campi
           }
         }
       ]
     }'
   ```

### Soluzione 3: Workaround - Rendi il Campo SEO Opzionale

Se le soluzioni precedenti non funzionano, un workaround temporaneo è:

1. **Rimuovi temporaneamente il campo SEO** dal content type
2. **Aggiungi i campi SEO direttamente** nel content type (non come componente)
3. Oppure, **usa solo Super Admin** per modificare i campi SEO

**Nota**: Questo non è ideale, ma può funzionare come soluzione temporanea.

### Soluzione 4: Aggiorna Strapi

Verifica se c'è una versione più recente di Strapi che risolve questo bug:

```bash
cd apps/cms
npm install @strapi/strapi@latest
npm run build
```

## Verifica

Dopo aver applicato una delle soluzioni:

1. **Disconnetti e riconnetti** con un utente del ruolo configurato
2. Apri un articolo/video/podcast
3. Verifica che il campo SEO sia visibile e modificabile

## Nota Importante

In Strapi 5, il comportamento dei permessi per i componenti è cambiato rispetto a Strapi 4. Se abiliti le azioni base (find, findOne, update, create) per un content type, **tutti i campi, inclusi i componenti, dovrebbero essere accessibili di default**.

Se questo non funziona, potrebbe essere necessario:
- Verificare che non ci siano restrizioni a livello di plugin
- Contattare il supporto Strapi o la community
- Considerare di aggiornare a una versione più recente

---

**Data**: Gennaio 2025  
**Versione Strapi**: 5.31.2  
**Bug Segnalato**: Issue #23947 su GitHub Strapi

