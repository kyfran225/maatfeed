# MAAT FEED - Roadmap Réaliste

## Recentrage 2026-05-03

Le produit ne doit plus être présenté comme une plateforme d'apprentissage visible. La roadmap priorise maintenant un feed simple, avec une intelligence cachée qui aide l'utilisateur à retenir, reprendre et répondre mieux.

### Priorités produit immédiates

1. Brancher la progression sur le ranking du feed.
2. Persister les marques audio côté API.
3. Ajouter des quiz courts et contextuels, sans écran scolaire.
4. Faire revenir les contenus au bon moment.
5. Mesurer la rétention réelle : retour J7, reprises, corrections, complétion audio.

## État Actuel Vérifié (Décembre 2024)

### ✅ Fonctionnalités Implémentées
- **Authentification complète** : inscription, login, vérification email
- **Feed simple** : cartes, actions rapides, progression discrète
- **Système de contenu** : ingestion YouTube/TikTok, classification IA
- **Communauté** : débats, commentaires, threads, correction IA ciblée
- **Audio** : playlists, tracks, interactions, reprises locales
- **Notifications** : in-app + email (modèles prêts)
- **SEO de base** : meta tags, sitemap dynamique
- **Admin** : ingestion keywords, analytics basiques
- **Learning API** : progression contenu et coach IA
- **Paiements** : architecture multi-providers, modèles Transaction/Subscription
- **RGPD** : consentement, export/delete données, logs de conformité
- **Legal pages** : Privacy Policy, Terms of Service, Legal Notice, Data Management

### 🏗️ Architecture Technique
- **Frontend** : React 19 + Vite + TailwindCSS
- **Backend** : Express + TypeScript + MongoDB + Redis
- **IA** : Groq + Gemini + OpenRouter + HuggingFace
- **Jobs** : BullMQ pour traitement async
- **Déploiement** : Render configuré

## 🎯 Objectifs 99,9% (3 mois)

### Phase 1 - Fondamentaux Business (4 semaines)
**Semaine 1-2 : Monétisation**
- Intégration Wave (Sénégal)
- Intégration MTN Mobile Money
- Abonnements Premium ($9.99/mois)
- Dashboard créateurs

**Semaine 3-4 : Acquisition**
- SEO complet (meta tags dynamiques)
- Sitemap auto-généré
- Schema.org pour contenu
- Fichiers robots.txt

### Phase 2 - Rétention & Scale (4 semaines)
**Semaine 5-6 : Intelligence cachée**
- Ranking influencé par progression, oublis et reprises
- Quiz courts générés depuis un contenu
- Révisions au bon moment
- Audio marqué et repris côté compte utilisateur

**Semaine 7-8 : Communauté utile**
- IA moderation (hate speech)
- Report system
- Admin dashboard
- Auto-cleanup
- Correction IA des réponses
- Détection des lacunes dans les échanges

### Phase 3 - Analytics & Optimisation (4 semaines)
**Semaine 9-10 : Analytics**
- Google Analytics 4
- Events tracking
- Dashboard utilisateur
- Metrics réelles

**Semaine 11-12 : Performance**
- Core Web Vitals
- Image optimization
- CDN Cloudflare
- PWA features

## 📊 KPIs Cibles

### Trafic
- **0-1 mois** : 1,000 utilisateurs/mois
- **1-3 mois** : 10,000 utilisateurs/mois
- **3-6 mois** : 50,000 utilisateurs/mois

### Monétisation
- **Conversion rate** : 2-5% (marché africain)
- **ARPU** : $5-10/mois
- **LTV** : $60-120

### Engagement
- **Session time** : 8+ minutes
- **Retention D7** : 40%+
- **Content interaction** : 15%+

## 🚀 Next Steps Immédiats

### Cette Semaine
1. **Brancher progression -> ranking** : le feed doit se souvenir intelligemment
2. **Persister audio marks** : remplacer le localStorage par l'API
3. **Tracker les bons events** : vu, repris, corrigé, terminé

### Prochaines 2 Semaines
1. **Ajouter quiz courts** : générés après certains contenus
2. **Améliorer onboarding** : moins de texte, signaux de niveau utiles
3. **Setup monitoring produit** : blocage, oubli, abandon

## ⚠️ Risques & Mitigations

### Technique
- **Risque** : Scalabilité MongoDB
- **Mitigation** : Indexing optimisé + Redis cache

### Marché
- **Risque** : Adoption faible
- **Mitigation** : Contenu seed de qualité

### Business
- **Risque** : Monétisation difficile
- **Mitigation** : Freemium + Mobile Money

## 📈 Success Metrics

### Milestone 1 (1 mois)
- [ ] SEO complet
- [ ] Wave intégré
- [ ] 1,000 utilisateurs

### Milestone 2 (3 mois)
- [ ] Notifications push
- [ ] Analytics avancé
- [ ] 10,000 utilisateurs
- [ ] 200 abonnés premium

### Milestone 3 (6 mois)
- [ ] PWA complet
- [ ] 50,000 utilisateurs
- [ ] 1,000 abonnés premium

---

**Principe : pas de pédagogie affichée inutile. Chaque feature doit aider l'utilisateur à mieux retenir ou mieux répondre.**
