# 🚀 Quick Start: PWA con Backend Render

## Checklist Rapida

### 1. Backend CORS ✅
- [ ] Aggiungi in Render Dashboard → Environment Variables:
  ```
  EDITOR_URL=https://tuo-editor.vercel.app
  ```
- [ ] Redeploy backend (o attendi auto-deploy)

### 2. API Token Strapi 🔑
- [ ] Vai su: `https://tuo-backend.onrender.com/admin`
- [ ] Settings → API Tokens → Create new API Token
- [ ] Tipo: Full access (o Custom con permessi Columns/Articles)
- [ ] **COPIA IL TOKEN**

### 3. Configurazione Locale 💻
```bash
cd apps/editor
cp env.example .env
```

Modifica `.env`:
```env
VITE_STRAPI_URL=https://tuo-backend.onrender.com
VITE_API_TOKEN=il-token-copiato
```

### 4. Test Locale 🧪
```bash
npm install
npm run dev
```
Testa su `http://localhost:3001`

### 5. Deploy PWA 🌐

**Vercel (consigliato)**:
```bash
cd apps/editor
npm i -g vercel
vercel
```

Poi in Vercel Dashboard:
- Settings → Environment Variables
- Aggiungi `VITE_STRAPI_URL` e `VITE_API_TOKEN`
- Redeploy

**Netlify**:
```bash
npm run build
netlify deploy --prod --dir=dist
```

### 6. Aggiorna CORS 🔄
In Render, aggiorna `EDITOR_URL` con l'URL finale della PWA deployata.

---

## URL Esempi

- Backend Render: `https://capibara-cms.onrender.com`
- PWA Vercel: `https://capibara-editor.vercel.app`
- PWA Netlify: `https://capibara-editor.netlify.app`

---

## Problemi?

- **CORS error**: Verifica `EDITOR_URL` in Render, senza trailing slash
- **401 error**: Verifica `VITE_API_TOKEN` corretto
- **403 error**: Controlla permessi token in Strapi

Vedi [DEPLOY.md](./DEPLOY.md) per guida completa.
