# 🔍 Troubleshooting: Lista Autori Vuota

## Problema
La lista degli autori è vuota anche se ci sono autori nel CMS.

## Possibili Cause

### 1. Permessi API Token ⚠️ (Più Probabile)

L'API Token potrebbe non avere permessi per leggere gli autori.

**Soluzione:**
1. Vai su Strapi Admin → Settings → API Tokens
2. Seleziona il tuo token
3. Assicurati che abbia permessi **Read** per **Author**
4. Se non vedi Author, controlla che il content type esista
5. Salva e riprova

### 2. Autori in Draft

Gli autori potrebbero essere in stato **Draft** e l'API di default non li include.

**Soluzione:** ✅ Già implementata!
- Ho aggiunto `publicationState: 'preview'` alle query
- Questo include anche i contenuti in draft

### 3. Formato Risposta API

La risposta potrebbe avere un formato diverso.

**Verifica:**
Apri la console del browser (F12) e controlla:
- Se vedi `Error loading authors:` → problema permessi/API
- Se vedi `Authors data:` → controlla la struttura dei dati

### 4. Nome Campo Diverso

Potrebbe essere che il campo si chiami diversamente da `name`.

**Verifica in Strapi:**
- Vai su Content-Type Builder → Author
- Controlla il nome esatto del campo nome

## Debug Steps

1. **Apri Console Browser (F12)**
   - Cerca log `Authors data:` o `Error loading authors:`
   
2. **Verifica Risposta API Direttamente:**
   ```bash
   curl -H "Authorization: Bearer TUO_TOKEN" \
        https://tuo-backend.onrender.com/api/authors?publicationState=preview
   ```

3. **Controlla Permessi Token:**
   - Strapi Admin → Settings → API Tokens
   - Verifica che Author abbia ✅ Read

4. **Verifica che gli Autori Esistano:**
   - Strapi Admin → Content Manager → Authors
   - Assicurati che ci siano autori

## Fix Rapido

Se gli autori esistono ma non appaiono:

1. **Controlla Console Browser:**
   - Cosa dice `Authors data:`?
   - Se è `undefined` o vuoto, è un problema API
   - Se ha dati, è un problema di rendering

2. **Aggiungi Log Temporaneo:**
   Guarda in `ColumnForm.tsx` o `ArticleForm.tsx`:
   ```typescript
   console.log('authorOptions:', authorOptions);
   console.log('authorsData:', authorsData);
   ```

3. **Verifica Permessi:**
   - API Token deve avere READ per Authors
   - Se non hai READ, aggiungi il permesso

## Soluzione Completa

Se tutto fallisce, puoi modificare temporaneamente la query per vedere cosa arriva:

```typescript
const { data: authorsData } = useQuery({
  queryKey: ['authors'],
  queryFn: async () => {
    const result = await apiClient.find('authors', {
      pagination: { limit: 100 },
      publicationState: 'preview',
      sort: ['name:asc'],
    });
    console.log('Raw API response:', result);
    return result;
  },
});
```

Questo ti dirà esattamente cosa restituisce l'API.
