# Déploiement sur Render

## 🚀 Méthode 1 : Blueprint (Recommandé)

### Étape 1 : Push le render.yaml
```bash
git add render.yaml
git commit -m "Add Render blueprint configuration"
git push origin main
```

### Étape 2 : Deploy via Blueprint
1. Allez sur : https://dashboard.render.com/blueprints
2. Cliquez **"New Blueprint Instance"**
3. Connectez votre repo GitHub : `kyfran225/maat-feed`
4. Sélectionnez la branche `main`
5. Cliquez **"Create Blueprint"**

### Étape 3 : Configuration manuelle des secrets
Après le déploiement initial, allez dans chaque service et ajoutez les variables sensibles :

**Pour `maat-api-production` et `maat-worker-production` :**
- `MONGODB_URI` : URI de production MongoDB
- `REDIS_URL` : URL Upstash Redis
- `UPSTASH_REST_TOKEN` : Token Upstash
- `YOUTUBE_API_KEY` : Clé API YouTube
- `APIFY_API_TOKEN` : Token Apify
- `HUGGINGFACE_API_KEY` : Clé HuggingFace
- `GROQ_API_KEY` : Clé Groq
- `GEMINI_API_KEY` : Clé Gemini
- `OPENROUTER_API_KEY` : Clé OpenRouter
- `RESEND_API_KEY` : Clé Resend
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`

**Pour `maat-api-staging` et `maat-worker-staging` :**
- Mêmes variables mais avec les valeurs de staging

### Étape 4 : Configurer les domaines personnalisés
1. Dans le service `maat-api-production` → Settings → Custom Domains
   - Ajoutez : `api.maatfeed.com`
2. Dans le service `maat-api-staging` → Settings → Custom Domains
   - Ajoutez : `api-staging.maatfeed.com`

### Étape 5 : DNS Cloudflare
Dans Cloudflare, créez des enregistrements CNAME :
- `api.maatfeed.com` → CNAME vers l'URL Render du service production
- `api-staging.maatfeed.com` → CNAME vers l'URL Render du service staging

---

## 🔧 Méthode 2 : Manuel (sans Blueprint)

### Créer un Web Service (Production)
1. Dashboard Render → **"New +"** → **"Web Service"**
2. Connectez le repo GitHub
3. Configuration :
   - **Name** : `maat-api-production`
   - **Branch** : `main`
   - **Root Directory** : `.`
   - **Build Command** : `npm install --legacy-peer-deps && npm run build:shared && npm --workspace @maat/api run build`
   - **Start Command** : `npm --workspace @maat/api run start`
   - **Plan** : Standard ($7/mois minimum)

### Variables d'environnement
Copiez toutes les variables de `.env.production` dans l'onglet **Environment** du service.

### Créer le Worker
1. **"New +"** → **"Background Worker"**
2. **Name** : `maat-worker-production`
3. **Start Command** : `npm --workspace @maat/api run worker`
4. Mêmes variables d'environnement

---

## 📋 Checklist post-déploiement

- [ ] API Production déployée et accessible
- [ ] API Staging déployée et accessible
- [ ] Worker Production démarré
- [ ] Worker Staging démarré
- [ ] Domaines personnalisés configurés
- [ ] DNS Cloudflare mis à jour
- [ ] Health check `/api/health` répond 200
- [ ] Test de connexion depuis le frontend Vercel

---

## 🔗 Liens utiles

- Dashboard Render : https://dashboard.render.com/
- Blueprint Docs : https://render.com/docs/blueprint-spec
- Environment Variables : https://render.com/docs/environment-variables
