# MAATFEED — CONTEXTE GLOBAL DU PROJET

## 🎯 OBJECTIF PRINCIPAL

Transformer MAATFEED en plateforme culturelle africaine vivante, audio-visuelle, débattue, intelligente et monétisable.

---

## 📋 ÉTAT ACTUEL DU PROJET

### Phase en cours
**Phase A — Foundation Core** (Semaines 1-4) - **Prêt à démarrer**

### Architecture Technique
- **Frontend** : React 19.1.1 + Vite + TypeScript + Tailwind + Zustand (à implémenter)
- **Backend** : Node.js + Express + MongoDB + Redis + BullMQ + Socket.IO
- **Infrastructure** : Monorepo configuré, workspaces npm, scripts build/test

### Fonctionnalités existantes
- ✅ Base React avec routing
- ✅ Auth basique avec JWT
- ✅ Services backend (54 services)
- ✅ Models (34 modèles)
- ✅ OpenAI integration
- ✅ Cloudinary pour media

### Gaps identifiés
- ⚠️ Socket.IO rooms system
- ⚠️ Zustand state management
- ⚠️ Feed algorithm scoring
- ⚠️ Audio player global
- ⚠️ Débats avec réponses multimédia
- ⚠️ Monétisation Paystack

---

## 📁 DOCUMENTATION COMPLÈTE

### Dossier `docs/product-roadmap/`

#### Stratégie produit
1. `01-diagnostic-clair.md` - État initial
2. `02-reorganisation-complete.md` - Vision réorganisée
3. `03-flows-produit-complets.md` - 20 flows détaillés
4. `04-01-design-system-complet.md` - Système design complet
5. `04-02-architecture-produit-reelle.md` - Architecture 7 moteurs
6. `04-03-algorithme-feed.md` - Feed algorithm
7. `04-04-strategie-contenu.md` - 5 piliers contenu
8. `04-05-systeme-createurs.md` - Écosystème créateurs
9. `04-06-monetisation-reelle.md` - 6 couches économiques
10. `04-07-retention.md` - 7 piliers rétention
11. `04-08-version-desktop-premium.md` - Desktop multi-panneaux
12. `04-09-admin-moderation.md` - Gouvernance plateforme
13. `04-10-roadmap-produit.md` - Roadmap technique détaillée

#### Implémentation
14. `05-plan-evaluation-competences.md` - Évaluation compétences
15. `06-plan-implementation-complet.md` - Plan 12 semaines (remplacé)
16. `07-roadmap-16-semaines-option3.md` - **Roadmap active 16 semaines**
17. `08-changements-perimetre-option3.md` - Changements périmètre

#### Maquettes et Design
18. `00-systeme-maquettes.md` - Système référence maquettes
19. `01-index-maquettes.md` - **Index des 5 maquettes analysées**

#### Autres docs techniques
- `DEPLOYMENT_INSTRUCTIONS.md`
- `EMAIL_VERIFICATION_IMPLEMENTATION.md`
- `PAYMENT_STRATEGY.md`
- `PWA_STATUS.md`
- `ROADMAP.md`
- `SPONSORS_SETUP_GUIDE.md`
- `STATUS.md`
- `WEB_PUSH_SETUP.md`

---

## 🎨 MAQUETTES DISPONIBLES

### 5 maquettes analysées et organisées

#### Pages principales
1. **Feed Mobile** (`pages/feed-mobile.png`)
   - Grille contenus vidéo/audio
   - Navigation bottom bar
   - Orange accent #FF6B35

2. **Content Detail** (`pages/content-detail.png`)
   - Video player + méta
   - Section débats
   - Réponses multimédia

3. **Debate Page** (`pages/debate-page.png`)
   - Source content + fil réponses
   - Composer multimédia
   - Thread hiérarchisé

4. **Audio Player** (`pages/audio-player.png`)
   - Waveform visuel
   - Playlist latérale
   - Mini player persistant

5. **Creator Profile** (`pages/creator-profile.png`)
   - Hero section avatar
   - Stats clés
   - Grid contenus

### Système design extrait
- **Colors** : #FF6B35 (primary), #000000 (background), #FFFFFF (text)
- **Typography** : System UI, bold headings, regular body
- **Spacing** : 4px/8px/16px/24px/32px scale
- **Border radius** : 6px/12px/16px

---

## 🚀 ROADMAP ACTIVE (OPTION 3)

### Timeline 16 semaines
```
Phase A — Foundation Core     (Semaines 1-4) ← ACTUEL
Phase B — Core Experience    (Semaines 5-8)
Phase C — Engagement         (Semaines 9-12)
Phase D — Monétisation & Stabilisation (Semaines 13-16)
```

### Prochaines étapes immédiates
1. **Démarrer Phase A - Semaine 1**
   - Refactor architecture (pages → features)
   - Implémenter Socket.IO avec rooms
   - Mettre en place Zustand stores
   - Configurer rate limiting

2. **Créer composants Feed**
   - FeedCard avec maquette feed-mobile.png
   - Video/Audio players
   - Navigation components

3. **Implémenter Audio Player**
   - Mini player global
   - Queue management
   - Waveform component

---

## 🛠 COMPÉTENCES VALIDÉES

### Ce que je peux faire excellemment
- ✅ React/TypeScript avancé
- ✅ Node.js/Express APIs
- ✅ MongoDB/Mongoose schemas
- ✅ Socket.IO real-time
- ✅ Tailwind CSS responsive
- ✅ Reproduction et amélioration des maquettes

### Ce qui est réalisable
- ⚠️ Video processing (Cloudinary)
- ⚠️ Audio waveform generation
- ⚠️ Paystack integration
- ⚠️ PWA development
- ⚠️ Mobile Africa optimisations

---

## 📊 MÉTRIQUES DE SUCCÈS

### Phase A (Foundation)
- Architecture modulaire propre
- Socket.IO stable < 100ms latency
- Feed fonctionnel mobile 3G < 4s
- Audio player global

### Globales
- Performance mobile < 3s sur 3G
- Uptime > 99.5%
- User retention > 30% D7
- Monétisation active semaine 13

---

## 🎯 DÉCISIONS STRATÉGIQUES

### Option 3 choisie (16 semaines)
- **Qualité > Vitesse**
- **Mobile-first absolu**
- **Monétisation simple mais fonctionnelle**
- **Fondations solides > Features complexes**

### Fonctionnalités retirées/reports
- Search avancé (Meilisearch) → Phase 2
- Desktop multi-panel → Phase 2
- Live streaming → Phase 2
- IA moderation avancée → Phase 2

---

## 🔄 PROCESSUS DE TRAVAIL

### Pour chaque développement
1. **Référencer maquette** dans `01-index-maquettes.md`
2. **Extraire spécifications de base** (couleurs, tailles, layout)
3. **Implémenter avec l'esprit** de la maquette
4. **Améliorer l'UX si nécessaire** (performance, accessibilité, innovation)
5. **Valider responsive behavior**
6. **Documenter les améliorations apportées** si nécessaire

### Pour nouvelle conversation
1. **Lire ce fichier** `99-contexte-global-projet.md`
2. **Consulter** `07-roadmap-16-semaines-option3.md`
3. **Vérifier** `01-index-maquettes.md`
4. **Identifier phase actuelle** et prochaines tâches
5. **Continuer développement** sans interruption

---

## 📝 STATUT ACTUEL

### Dernière action
- **Maquettes analysées et organisées**
- **Index des maquettes créé**
- **Système design extrait**
- **Contexte global documenté**

### Prochaine action
- **Démarrer Phase A - Semaine 1**
- **Refactor architecture frontend**
- **Implémenter Socket.IO rooms**
- **Créer premier composant Feed**

### État du projet
**PRÊT À DÉMARRER** avec toutes les références et contexte nécessaires.

---

## 🚨 POINTS D'ATTENTION

1. **Toujours référencer les maquettes** avant développement
2. **Suivre la roadmap 16 semaines** (Option 3)
3. **Prioriser mobile-first** et performance Afrique
4. **Documenter les décisions** pour future handover
5. **Valider chaque phase** avant de passer à la suivante

---

## 📞 CONTACT ET HANDOVER

### Si nouveau développeur IA
1. Lire ce fichier `99-contexte-global-projet.md`
2. Consulter la roadmap active `07-roadmap-16-semaines-option3.md`
3. Référencer les maquettes `01-index-maquettes.md`
4. Vérifier le système design dans `00-systeme-maquettes.md`
5. Identifier la phase actuelle et continuer

### Pour continuation
- **Phase actuelle** : Phase A - Foundation Core
- **Semaine** : 1 (sur 4)
- **Prochaine tâche** : Refactor architecture + Socket.IO
- **Référence maquette** : feed-mobile.png pour FeedCard

---

**Ce fichier est LA SEULE VÉRITÉ pour continuer le travail sans perte de contexte.**
