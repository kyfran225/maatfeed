# MAAT FEED - Instructions de Déploiement en Production

## État Actuel
- **Configuration sécurité**: 91% production ready
- **Fichier `.env.production`**: Prêt et configuré
- **Services**: MongoDB Atlas, Redis Upstash, APIs externes configurées

## Étapes Suivantes pour le Déploiement

### 1. Préparation du Code (Immédiat)

#### Build de Production
```bash
# Build frontend
npm --workspace @maat/web run build

# Build backend
npm --workspace @maat/api run build
```

#### Vérification des Builds
```bash
# Vérifier que les builds sont réussis
npm --workspace @maat/web run preview
npm --workspace @maat/api run start
```

### 2. Déploiement sur Vercel (Recommandé)

#### Frontend (Vercel)
1. **Connecter votre repo GitHub à Vercel**
2. **Configurer les variables d'environnement dans Vercel**:
   - `VITE_API_URL=https://votre-api-backend.com`
   - `NODE_ENV=production`

3. **Déployer**:
   ```bash
   # Depuis la racine du projet
   npx vercel --prod
   ```

#### Backend Options

**Option A: Vercel Functions**
```bash
# Créer un dossier api à la racine
# Déplacer le code backend dans /api
# Configurer vercel.json pour les fonctions
```

**Option B: Render/Heroku**
1. **Créer un compte sur Render**
2. **Connecter le repo GitHub**
3. **Configurer les variables d'environnement** (copier depuis `.env.production`)
4. **Déployer le service web**

**Option C: AWS/GCP**
- Utiliser Docker container
- Configurer ECS/Cloud Run
- Déployer avec les variables d'environnement

### 3. Configuration des Variables d'Environnement

#### Dans votre plateforme de déploiement:
```bash
# Copier toutes les variables depuis .env.production
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://maat-feed-user:Pitchoun%40m1@maat-feed-cluster.rcsumjg.mongodb.net/maat-feed?retryWrites=true&w=majority&appName=maat-feed-cluster
REDIS_URL=https://advanced-monster-96108.upstash.io
UPSTASH_REST_TOKEN=<upstash_rest_token>
JWT_ACCESS_SECRET=<jwt_access_secret>
JWT_REFRESH_SECRET=<jwt_refresh_secret>
CORS_ORIGIN=https://maatfeed.vercel.app
CORS_CREDENTIALS=true
YOUTUBE_API_KEY=<youtube_api_key>
YOUTUBE_API_BASE_URL=https://www.googleapis.com/youtube/v3/search
TIKTOK_PROVIDER_BASE_URL=https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items
APIFY_API_TOKEN=<apify_token>
GROQ_API_KEY=<groq_key>
GROQ_MODEL=llama-3.1-8b-instant
GROQ_BASE_URL=https://api.groq.com/openai/v1
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-1.5-flash
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/models
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
SESSION_SECRET=maat_ss_secret_2024_k3m3t_cultur3_f33d_pl4tf0rm_s3cur3_k3y_d0nt_sh4re_th1s_1s_s3cr3t_v3ry_l0ng_str1ng_f0r_s3cur1ty_purpos3s_0nly!
HELMET_ENABLED=true
```

### 4. Démarrage des Services

#### Workers BullMQ
```bash
# Sur le serveur backend
npm --workspace @maat/api run worker
```

#### Seed Initial Data
```bash
# Initialiser la configuration de ranking
npm --workspace @maat/api run seed:ranking
```

### 5. Tests Post-Déploiement

#### Vérification de Santé
```bash
# Test des endpoints critiques
curl https://votre-api-domaine.com/api/health
curl https://votre-api-domaine.com/api/readiness
curl https://votre-api-domaine.com/api/admin/deployment-readiness
```

#### Tests Fonctionnels
```bash
# Test du feed
curl "https://votre-api-domaine.com/api/feed/global?limit=5"

# Test des interactions
curl -X POST https://votre-api-domaine.com/api/interactions/like \
  -H "Content-Type: application/json" \
  -d '{"contentId":"test-id"}'

# Test de l'authentification
curl -X POST https://votre-api-domaine.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Tests Frontend
- Accéder à `https://maatfeed.vercel.app`
- Vérifier que le feed charge
- Tester les interactions (like, save, share)
- Vérifier la navigation entre pages

### 6. Monitoring et Maintenance

#### Logs et Surveillance
```bash
# Vérifier les logs d'erreurs
# Configurer des alertes pour:
# - Taux d'erreur > 5%
# - Temps de réponse > 500ms
# - Queue jobs > 100
```

#### Backups
```bash
# MongoDB Atlas: Configurer backups automatiques
# Redis Upstash: Persistance activée par défaut
```

### 7. Optimisations Post-Déploiement

#### Performance
- Configurer CDN pour les assets statiques
- Optimiser les images et vidéos
- Activer la compression Gzip/Brotli

#### Sécurité
- Configurer rate limiting avancé
- Activer WAF si disponible
- Monitor les tentatives d'intrusion

## Checklist de Déploiement

- [ ] Builds frontend et backend réussis
- [ ] Variables d'environnement configurées
- [ ] Base de données MongoDB connectée
- [ ] Redis Upstash connecté
- [ ] Workers BullMQ démarrés
- [ ] Configuration de ranking initialisée
- [ ] Tests de santé passent
- [ ] Tests fonctionnels validés
- [ ] Frontend accessible et fonctionnel
- [ ] Monitoring configuré
- [ ] Backups activés

## Support et Dépannage

### Problèmes Communs
1. **CORS errors**: Vérifier `CORS_ORIGIN` dans les variables
2. **Database connection**: Valider les URIs MongoDB/Redis
3. **Workers not starting**: Vérifier les variables BullMQ
4. **API timeouts**: Augmenter les timeouts si nécessaire

### Logs Importants à Surveiller
- Erreurs de connexion aux bases de données
- Échecs des jobs BullMQ
- Taux d'erreur API élevé
- Memory usage spikes

## Contact Support
- Documentation technique: `/docs/`
- Monitoring: `/api/admin/deployment-readiness`
- Logs: Disponibles dans votre plateforme de déploiement

---

## Prochaines Étapes après Déploiement

1. **Monitoring 24/7** pendant les premières 48h
2. **Tests de charge** avec trafic réel
3. **Optimisations** basées sur les métriques
4. **Feedback utilisateurs** et itérations

Le système est prêt pour le déploiement en production !
