# Configurazione Permessi per il Campo SEO

## Problema

L'errore "no permission to see this field" per il campo SEO indica che i permessi non sono configurati correttamente per quel campo.

## Soluzione

### Scenario 1: Utente nell'Admin Panel (Editor/Author)

Se un utente con ruolo Editor o Author non può vedere il campo SEO nell'admin panel:

1. **Accedi come Super Admin** all'admin panel di Strapi
2. Vai su **Settings** → **Users & Permissions** → **Roles**
3. Seleziona il ruolo dell'utente (es. **Editor** o **Author**)
4. Nella sezione **Permissions**, trova il content type (es. **Article**)
5. Espandi le opzioni e verifica che:
   - ✅ **find** sia abilitato (per liste)
   - ✅ **findOne** sia abilitato (per dettagli)
   - ✅ **update** sia abilitato (se l'utente deve modificare)
   - ✅ **create** sia abilitato (se l'utente deve creare)
6. **IMPORTANTE - Configurazione Campi (Fields)**:
   - Clicca sulla sezione **Fields** (sotto le azioni find/findOne/update/create)
   - Seleziona **Select all fields** oppure seleziona manualmente:
     - ✅ **seo** (il componente SEO)
     - ✅ Tutti gli altri campi necessari
   - **NOTA**: Se non vedi la sezione "Fields", potrebbe essere un bug dell'interfaccia. Prova a:
     - Svuotare la cache del browser
     - Riavviare Strapi
     - Aggiornare Strapi all'ultima versione
7. Salva le modifiche
8. **Chiedi all'utente di disconnettersi e riconnettersi** per applicare le modifiche

### Scenario 2: API Pubblica (Frontend)

Per permettere al frontend di leggere il campo SEO via API pubblica:

1. **Accedi come Super Admin** all'admin panel
2. Vai su **Settings** → **Users & Permissions** → **Roles** → **Public**
3. Per ogni content type (Article, Video Episode, Podcast Episode):
   - ✅ Abilita **find** (per liste)
   - ✅ Abilita **findOne** (per dettagli)
4. **IMPORTANTE**: Verifica che il campo **seo** sia accessibile
   - In Strapi 5, i componenti vengono inclusi automaticamente se il content type ha i permessi
   - Se non funziona, potrebbe essere necessario abilitare esplicitamente i permessi per il componente `shared.seo`
5. Salva le modifiche

### Verifica che il Campo SEO sia Incluso nelle Query API

Il frontend è già configurato per includere il campo SEO nelle query:

```typescript
// apps/web/src/lib/api.ts
"populate[3]": "seo",
"populate[4]": "seo.metaImage",
```

Se i permessi sono configurati correttamente, il campo SEO dovrebbe essere restituito nelle risposte API.

## Troubleshooting

### Il campo SEO non appare nelle risposte API

1. Verifica i permessi pubblici (vedi Scenario 2 sopra)
2. Verifica che il campo sia popolato nelle query:
   - Controlla `apps/web/src/lib/api.ts` - le query includono già `seo` e `seo.metaImage`
3. Testa l'API direttamente:
   ```
   GET https://tuo-strapi-url.com/api/articles?populate[seo][populate]=*
   ```

### L'utente editor non può modificare il campo SEO

1. Verifica i permessi del ruolo Editor/Author (vedi Scenario 1 sopra)
2. Assicurati che **update** sia abilitato per il content type
3. Verifica che non ci siano restrizioni specifiche sul campo `seo`

### Il componente shared.seo non ha permessi

Se il problema persiste, potrebbe essere necessario configurare i permessi anche per il componente stesso:

1. Vai su **Settings** → **Users & Permissions** → **Roles** → **Public**
2. Cerca nella lista il componente **shared.seo**
3. Abilita i permessi necessari (solitamente non necessario, ma può essere richiesto in alcuni casi)

## Nota Importante

In Strapi 5, i permessi per i componenti sono generalmente ereditati dal content type che li contiene. Tuttavia, se vedi ancora errori di permessi:

1. Riavvia Strapi dopo aver modificato i permessi
2. Svuota la cache del browser
3. Verifica che il componente `shared.seo` esista e sia correttamente configurato

---

**Data**: Gennaio 2025

