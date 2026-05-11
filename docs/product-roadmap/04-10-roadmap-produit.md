# MAATFEED — ROADMAP TECHNIQUE ULTRA DÉTAILLÉE

## Objectif du document

Ce document transforme la vision produit MAATFEED en plan d'exécution technique concret.

Il sert à guider l'agent codeur pour construire l'application de façon progressive, propre, scalable et cohérente avec la vision :

> MAATFEED transforme le savoir africain en expérience sociale vivante, audio-visuelle, débattue, intelligente et monétisable.

Ce document ne demande pas de tout construire en une seule fois.

Il définit :

* l'architecture frontend exacte
* l'architecture backend exacte
* les dossiers
* les composants
* les APIs
* les schémas MongoDB
* les services
* les stores Zustand
* la stratégie React Query
* les sockets
* les jobs BullMQ
* Redis
* upload
* audio
* vidéo
* feed
* IA
* performance mobile Afrique
* sécurité
* SEO
* PWA
* CDN
* déploiement
* monitoring
* logs
* analytics
* tests
* roadmap progressive phase par phase

---

## 1. PHILOSOPHIE TECHNIQUE

### Règle principale

Ne pas construire MAATFEED comme une simple application CRUD.

MAATFEED doit être construit comme une plateforme modulaire autour de 7 moteurs :

```
MAATFEED Core Engines
├── Content Engine
├── Feed Engine
├── Debate Engine
├── Media Engine
├── Audio Engine
├── AI Engine
└── Monetization Engine
```

### Priorité absolue

Construire d'abord le noyau magnétique :

* feed vidéo/audio
* débats attachés aux contenus
* réponses multimédia
* audio player global
* upload simple
* profils
* notifications basiques

Le reste vient ensuite.

---

## 2. STACK TECHNIQUE RECOMMANDÉE

### Frontend

* React
* Vite
* TypeScript recommandé
* Tailwind CSS
* React Router
* TanStack React Query
* Zustand
* Framer Motion
* React Hook Form
* Zod
* Axios
* Socket.IO client

### Backend

* Node.js
* Express
* TypeScript recommandé
* MongoDB + Mongoose
* Redis
* BullMQ
* Socket.IO
* Zod ou Joi pour validation
* JWT auth
* Multer ou upload direct cloud

### Média

Phase MVP :
* stockage objet compatible S3 ou Cloudinary/Bunny selon budget

Phase scalable :
* Mux ou Cloudflare Stream pour vidéo
* Cloudflare R2 ou S3 pour fichiers/documents/images
* CDN devant les médias

### Paiements

* Paystack en priorité
* Flutterwave possible plus tard
* Mobile Money prioritaire

### Déploiement

* Frontend : Vercel
* Backend : Render
* MongoDB : MongoDB Atlas
* Redis : Upstash ou Redis Cloud
* Media CDN : Cloudflare / Mux / Bunny

---

## 3. ARCHITECTURE FRONTEND EXACTE

### Structure recommandée

```
apps/web/
├── public/
│   ├── icons/
│   ├── images/
│   ├── og-image.png
│   └── manifest.webmanifest
│
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   ├── providers.tsx
│   │   └── queryClient.ts
│   │
│   ├── assets/
│   │   ├── brand/
│   │   ├── patterns/
│   │   └── placeholders/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── feedback/
│   │   ├── media/
│   │   ├── feed/
│   │   ├── debate/
│   │   ├── audio/
│   │   ├── creator/
│   │   ├── monetization/
│   │   ├── sponsor/
│   │   ├── ai/
│   │   └── modals/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── feed/
│   │   ├── content/
│   │   ├── upload/
│   │   ├── debate/
│   │   ├── replies/
│   │   ├── audio/
│   │   ├── series/
│   │   ├── creator/
│   │   ├── live/
│   │   ├── ai/
│   │   ├── premium/
│   │   ├── sponsors/
│   │   ├── notifications/
│   │   ├── search/
│   │   ├── profile/
│   │   ├── moderation/
│   │   └── admin/
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDebouncedValue.ts
│   │   ├── useIntersectionObserver.ts
│   │   ├── useNetworkStatus.ts
│   │   ├── useMediaSession.ts
│   │   └── useInfiniteScroll.ts
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── socket.ts
│   │   ├── env.ts
│   │   ├── seo.ts
│   │   ├── storage.ts
│   │   ├── analytics.ts
│   │   ├── errors.ts
│   │   └── constants.ts
│   │
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── playerStore.ts
│   │   ├── uploadStore.ts
│   │   ├── composerStore.ts
│   │   ├── uiStore.ts
│   │   ├── notificationStore.ts
│   │   └── networkStore.ts
│   │
│   ├── styles/
│   │   ├── index.css
│   │   ├── tokens.css
│   │   └── animations.css
│   │
│   ├── types/
│   │   ├── content.types.ts
│   │   ├── debate.types.ts
│   │   ├── media.types.ts
│   │   ├── user.types.ts
│   │   ├── creator.types.ts
│   │   └── monetization.types.ts
│   │
│   └── main.tsx
```

---

## 4. ROUTES FRONTEND

```
/
├── /onboarding
├── /feed
├── /content/:contentId
├── /debates
├── /debates/:debateId
├── /listen
├── /series
├── /series/:seriesId
├── /create
├── /upload
├── /creator
├── /creator/:creatorId
├── /creator/dashboard
├── /live
├── /live/:liveId
├── /ai
├── /premium
├── /sponsors
├── /notifications
├── /search
├── /profile/:userId
├── /settings
└── /admin
```

### Règle UX

Sur mobile : navigation bottom bar.

Sur desktop : sidebar gauche + feed central + panneau contexte droit.

---

## 5. COMPOSANTS FRONTEND PRINCIPAUX

### UI base

```
components/ui/
├── Button.tsx
├── IconButton.tsx
├── Card.tsx
├── Badge.tsx
├── Avatar.tsx
├── Tabs.tsx
├── Modal.tsx
├── BottomSheet.tsx
├── Drawer.tsx
├── Toast.tsx
├── Skeleton.tsx
├── EmptyState.tsx
├── ErrorState.tsx
├── Progress.tsx
├── Spinner.tsx
└── Tooltip.tsx
```

### Feed

```
components/feed/
├── FeedPageShell.tsx
├── FeedTabs.tsx
├── FeedList.tsx
├── FeedCard.tsx
├── VideoFeedCard.tsx
├── AudioFeedCard.tsx
├── DebateFeedCard.tsx
├── SeriesFeedCard.tsx
├── SponsorFeedCard.tsx
├── FeedCardActions.tsx
├── FeedCardMeta.tsx
├── FeedSkeleton.tsx
└── FeedEmptyState.tsx
```

### Média

```
components/media/
├── VideoPlayer.tsx
├── ShortVideoPlayer.tsx
├── AudioWaveform.tsx
├── MediaThumbnail.tsx
├── MediaControls.tsx
├── MediaErrorFallback.tsx
├── AdaptiveImage.tsx
└── DocumentPreview.tsx
```

### Débat

```
components/debate/
├── DebatePage.tsx
├── DebateHeader.tsx
├── DebateSourceCard.tsx
├── DebateSummaryCard.tsx
├── DebateResponseList.tsx
├── DebateResponseCard.tsx
├── DebateResponseComposer.tsx
├── DebateReactionBar.tsx
├── DebateFilters.tsx
├── DebateAIAssistPanel.tsx
└── DebateModerationBanner.tsx
```

### Réponses

```
components/debate/replies/
├── TextReplyComposer.tsx
├── AudioReplyRecorder.tsx
├── VideoReplyRecorder.tsx
├── ImageReplyUploader.tsx
├── DocumentReplyUploader.tsx
├── ReplyPreview.tsx
└── ReplyPublishBar.tsx
```

### Audio

```
components/audio/
├── ListenPage.tsx
├── MiniAudioPlayer.tsx
├── FullAudioPlayer.tsx
├── AudioQueue.tsx
├── AudioPlaylistCard.tsx
├── ContinueListening.tsx
├── AudioTranscript.tsx
├── AudioSpeedControl.tsx
└── AudioPlayerProvider.tsx
```

### Créateur

```
components/creator/
├── CreatorProfile.tsx
├── CreatorDashboard.tsx
├── CreatorAnalyticsCards.tsx
├── CreatorContentTable.tsx
├── CreatorSeriesManager.tsx
├── CreatorRevenuePanel.tsx
├── CreatorSponsorPanel.tsx
└── CreatorOnboarding.tsx
```

### IA

```
components/ai/
├── AIAssistButton.tsx
├── AIBottomSheet.tsx
├── AISummaryCard.tsx
├── AIRewritePanel.tsx
├── AITagSuggestions.tsx
├── AIDebateAnalysis.tsx
└── AIPersonalitySelector.tsx
```

### Monétisation

```
components/monetization/
├── PremiumPage.tsx
├── PricingCards.tsx
├── DonationButtons.tsx
├── SupportCreatorButton.tsx
├── CheckoutModal.tsx
├── PaymentStatus.tsx
└── PremiumBenefits.tsx
```

### Sponsors

```
components/sponsor/
├── SponsorCard.tsx
├── SponsorBadge.tsx
├── SponsorCampaignForm.tsx
├── SponsorDashboard.tsx
└── SponsorAnalytics.tsx
```

---

## 6. ZUSTAND STORES

### authStore

Responsabilités :
* user courant
* token
* état auth
* rôle
* premium state

```
authStore
├── user
├── token
├── isAuthenticated
├── roles
├── premiumState
├── setAuth()
├── logout()
└── refreshUser()
```

### playerStore

Responsabilités : audio global.

```
playerStore
├── currentTrack
├── queue
├── isPlaying
├── progress
├── volume
├── playbackRate
├── setTrack()
├── play()
├── pause()
├── seek()
├── addToQueue()
└── clearQueue()
```

### uploadStore

Responsabilités : upload multi-média.

```
uploadStore
├── uploads
├── activeUploadId
├── progressById
├── failedUploads
├── addUpload()
├── updateProgress()
├── markFailed()
├── retryUpload()
└── removeUpload()
```

### composerStore

Responsabilités : brouillons de réponses et contenus.

```
composerStore
├── activeDraft
├── draftType
├── attachedMedia
├── aiSuggestions
├── setDraft()
├── attachMedia()
├── clearDraft()
└── saveLocalDraft()
```

### uiStore

Responsabilités : modales, bottom sheets, drawers.

```
uiStore
├── activeModal
├── activeBottomSheet
├── sidebarOpen
├── theme
├── openModal()
├── closeModal()
├── openSheet()
└── closeSheet()
```

### notificationStore

Responsabilités : notifications temps réel.

```
notificationStore
├── unreadCount
├── latestNotifications
├── pushNotification()
├── markRead()
└── setUnreadCount()
```

### networkStore

Responsabilités : connexion faible/offline.

```
networkStore
├── isOnline
├── connectionQuality
├── dataSaver
├── setOnlineState()
├── setConnectionQuality()
└── enableDataSaver()
```

---

## 7. STRATÉGIE REACT QUERY

### Principe

React Query gère toutes les données serveur.

Zustand gère les états UI/transversaux.

### Query keys

```
['me']
['feed', filters, cursor]
['content', contentId]
['debate', debateId]
['debateResponses', debateId, filters]
['audioProgress', contentId]
['series', seriesId]
['creator', creatorId]
['creatorDashboard']
['notifications']
['search', query, filters]
['premiumStatus']
['sponsorCampaigns']
```

### Mutations principales

```
useLikeContentMutation
useSaveContentMutation
useCreateContentMutation
useUploadMediaMutation
useCreateDebateMutation
useCreateReplyMutation
useReactToReplyMutation
useFollowCreatorMutation
useFollowSeriesMutation
useCreateDonationMutation
useStartCheckoutMutation
useMarkNotificationReadMutation
```

### Invalidation

Après création réponse :
* invalidate ['debate', debateId]
* invalidate ['debateResponses', debateId]
* update optimistic response count

Après like :
* optimistic update sur FeedCard
* rollback si erreur

Après upload :
* invalidate ['creatorDashboard']
* invalidate ['feed'] si publié

---

## 8. ARCHITECTURE BACKEND EXACTE

### Structure recommandée

```
apps/api/
├── src/
│   ├── server.ts
│   ├── app.ts
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── db.ts
│   │   ├── redis.ts
│   │   ├── cors.ts
│   │   ├── logger.ts
│   │   └── socket.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── onboarding/
│   │   ├── content/
│   │   ├── feed/
│   │   ├── media/
│   │   ├── upload/
│   │   ├── debates/
│   │   ├── replies/
│   │   ├── audio/
│   │   ├── series/
│   │   ├── creators/
│   │   ├── live/
│   │   ├── ai/
│   │   ├── monetization/
│   │   ├── sponsors/
│   │   ├── notifications/
│   │   ├── search/
│   │   ├── moderation/
│   │   ├── admin/
│   │   └── analytics/
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.ts
│   │   ├── roleMiddleware.ts
│   │   ├── validateRequest.ts
│   │   ├── rateLimit.ts
│   │   ├── errorHandler.ts
│   │   ├── uploadGuard.ts
│   │   └── requestLogger.ts
│   │
│   ├── jobs/
│   │   ├── queues.ts
│   │   ├── workers/
│   │   │   ├── mediaWorker.ts
│   │   │   ├── feedWorker.ts
│   │   │   ├── aiWorker.ts
│   │   │   ├── notificationWorker.ts
│   │   │   ├── analyticsWorker.ts
│   │   │   └── moderationWorker.ts
│   │   └── schedulers/
│   │       ├── feedRefreshScheduler.ts
│   │       ├── trendScheduler.ts
│   │       └── cleanupScheduler.ts
│   │
│   ├── sockets/
│   │   ├── socketServer.ts
│   │   ├── debateSocket.ts
│   │   ├── notificationSocket.ts
│   │   ├── liveSocket.ts
│   │   └── presenceSocket.ts
│   │
│   ├── shared/
│   │   ├── utils/
│   │   ├── constants/
│   │   ├── types/
│   │   ├── errors/
│   │   └── validators/
│   │
│   └── tests/
```

### Structure module type

```
modules/content/
├── content.model.ts
├── content.routes.ts
├── content.controller.ts
├── content.service.ts
├── content.validator.ts
├── content.policy.ts
└── content.types.ts
```

---

## 9. APIS REST PRINCIPALES

### Auth

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
PATCH  /api/auth/me
```

### Onboarding

```
GET    /api/onboarding/options
POST   /api/onboarding/complete
GET    /api/onboarding/recommendations
```

### Feed

```
GET    /api/feed
GET    /api/feed/guest
GET    /api/feed/trending
GET    /api/feed/audio
POST   /api/feed/events
```

### Content

```
POST   /api/content
GET    /api/content/:id
PATCH  /api/content/:id
DELETE /api/content/:id
POST   /api/content/:id/like
POST   /api/content/:id/save
POST   /api/content/:id/share
GET    /api/content/:id/related
```

### Upload / Media

```
POST   /api/uploads/init
POST   /api/uploads/:uploadId/chunk
POST   /api/uploads/:uploadId/complete
POST   /api/uploads/simple
GET    /api/media/:mediaId
DELETE /api/media/:mediaId
```

### Debates

```
POST   /api/debates
GET    /api/debates
GET    /api/debates/:id
GET    /api/debates/:id/responses
POST   /api/debates/:id/responses
POST   /api/debates/:id/follow
POST   /api/debates/:id/report
GET    /api/debates/:id/summary
```

### Replies

```
POST   /api/replies/:id/react
POST   /api/replies/:id/report
PATCH  /api/replies/:id
DELETE /api/replies/:id
```

### Audio

```
GET    /api/audio/home
GET    /api/audio/continue
POST   /api/audio/:contentId/progress
POST   /api/audio/:contentId/queue
GET    /api/audio/playlists
POST   /api/audio/playlists
```

### Series

```
POST   /api/series
GET    /api/series
GET    /api/series/:id
POST   /api/series/:id/follow
POST   /api/series/:id/progress
POST   /api/series/:id/episodes
PATCH  /api/series/:id/episodes/:episodeId
```

### Creators

```
POST   /api/creators/apply
GET    /api/creators/:id
PATCH  /api/creators/me
GET    /api/creators/me/dashboard
GET    /api/creators/me/analytics
GET    /api/creators/:id/content
POST   /api/creators/:id/follow
```

### AI

```
POST   /api/ai/summarize/content
POST   /api/ai/summarize/debate
POST   /api/ai/rewrite
POST   /api/ai/suggest-title
POST   /api/ai/suggest-tags
POST   /api/ai/generate-quiz
POST   /api/ai/moderate-preview
```

### Monetization

```
GET    /api/premium/plans
POST   /api/payments/checkout
POST   /api/payments/donate
POST   /api/payments/webhooks/paystack
GET    /api/payments/status/:reference
GET    /api/premium/me
```

### Sponsors

```
GET    /api/sponsors/feed
POST   /api/admin/sponsors
GET    /api/admin/sponsors
PATCH  /api/admin/sponsors/:id
GET    /api/admin/sponsors/:id/analytics
POST   /api/sponsors/:id/impression
POST   /api/sponsors/:id/click
```

### Notifications

```
GET    /api/notifications
POST   /api/notifications/:id/read
POST   /api/notifications/read-all
GET    /api/notifications/unread-count
```

### Search

```
GET    /api/search?q=&type=&topic=
GET    /api/search/topics
```

### Moderation

```
POST   /api/reports
GET    /api/admin/moderation/queue
POST   /api/admin/moderation/:id/action
```

### Admin

```
GET    /api/admin/dashboard
GET    /api/admin/users
GET    /api/admin/content
GET    /api/admin/debates
GET    /api/admin/analytics
GET    /api/admin/system-health
```

---

## 10. MONGO SCHEMAS PRINCIPAUX

### User

```
User
├── _id
├── name
├── email
├── passwordHash
├── avatarId
├── role: user|creator|moderator|admin
├── interests[]
├── preferredFormats[]
├── participationIntent
├── premiumState
├── creatorId
├── badges[]
├── trustScore
├── notificationSettings
├── createdAt
└── updatedAt
```

### Content

```
Content
├── _id
├── creatorId
├── authorId
├── type: video|audio|text|image|document|debate|series_episode|live_replay
├── title
├── hook
├── description
├── mediaIds[]
├── tags[]
├── categories[]
├── language
├── debateId
├── seriesId
├── visibility: public|private|unlisted|premium
├── sponsorMetadata
├── aiMetadata
├── moderationState
├── status: draft|processing|published|archived|removed
├── engagement
├── publishedAt
├── createdAt
└── updatedAt
```

### Media

```
Media
├── _id
├── ownerId
├── type: video|audio|image|document
├── originalUrl
├── playbackUrl
├── thumbnailUrl
├── waveformUrl
├── transcript
├── duration
├── size
├── mimeType
├── provider: local|s3|r2|mux|cloudflare|bunny
├── variants[]
├── processingState
├── moderationState
└── createdAt
```

### Debate

```
Debate
├── _id
├── sourceContentId
├── createdBy
├── topic
├── question
├── tags[]
├── responseCount
├── followerCount
├── controversyScore
├── qualityScore
├── trendScore
├── aiSummary
├── status: active|hot|sensitive|locked|archived
├── moderationState
├── createdAt
└── updatedAt
```

### DebateResponse

```
DebateResponse
├── _id
├── debateId
├── userId
├── parentId
├── type: text|audio|video|image|document
├── body
├── mediaIds[]
├── sourceAttachments[]
├── timestampRef
├── reactions
├── aiAssisted
├── score
├── moderationState
├── createdAt
└── updatedAt
```

### Series

```
Series
├── _id
├── creatorId
├── title
├── description
├── coverUrl
├── tags[]
├── categories[]
├── episodes[]
├── visibility
├── premiumState
├── sponsorMetadata
├── followerCount
├── createdAt
└── updatedAt
```

### AudioProgress

```
AudioProgress
├── userId
├── contentId
├── position
├── duration
├── completed
├── lastPlayedAt
└── updatedAt
```

### Creator

```
Creator
├── _id
├── userId
├── displayName
├── bio
├── expertise[]
├── badges[]
├── socialLinks
├── monetizationEnabled
├── analyticsSummary
├── followerCount
├── verificationState
├── createdAt
└── updatedAt
```

### Notification

```
Notification
├── _id
├── userId
├── type
├── title
├── body
├── entityType
├── entityId
├── read
├── priority
├── createdAt
└── expiresAt
```

### SponsorCampaign

```
SponsorCampaign
├── _id
├── sponsorName
├── sponsorLogo
├── title
├── description
├── targetTopics[]
├── targetFormats[]
├── placement: feed|series|audio|debate|live
├── budget
├── startDate
├── endDate
├── status
├── impressions
├── clicks
├── conversions
└── createdAt
```

### Payment

```
Payment
├── _id
├── userId
├── type: donation|premium|creator_support|series_purchase|live_ticket
├── amount
├── currency
├── provider
├── reference
├── status
├── metadata
├── createdAt
└── updatedAt
```

### ModerationReport

```
ModerationReport
├── _id
├── reporterId
├── entityType
├── entityId
├── reason
├── details
├── status
├── assignedTo
├── actionTaken
├── createdAt
└── updatedAt
```

### AnalyticsEvent

```
AnalyticsEvent
├── _id
├── userId
├── sessionId
├── eventName
├── entityType
├── entityId
├── metadata
├── device
├── network
├── createdAt
└── expiresAt
```

---

## 11. SERVICES BACKEND

### ContentService

Responsabilités :
* créer contenu
* publier
* mettre à jour
* lier débat
* gérer statut

### FeedService

Responsabilités :
* générer feed
* mélanger contenus
* appliquer ranking simple
* injecter sponsors
* tracker événements

### DebateService

Responsabilités :
* créer débat
* récupérer thread
* ajouter réponses
* scorer réponses
* suivre débat

### MediaService

Responsabilités :
* upload
* stockage
* transcription
* thumbnails
* waveform
* variants

### AudioService

Responsabilités :
* progression audio
* playlists
* queue
* continue listening

### AIService

Responsabilités :
* résumés
* reformulations
* tags
* titres
* modération assistée

### NotificationService

Responsabilités :
* notifications in-app
* push plus tard
* regroupement
* unread count

### MonetizationService

Responsabilités :
* checkout
* donation
* premium
* webhooks
* statut paiement

### SponsorService

Responsabilités :
* campagnes
* ciblage
* impressions
* clics
* analytics

### ModerationService

Responsabilités :
* reports
* queue
* actions admin
* auto flags

---

## 12. SOCKETS TEMPS RÉEL

### Connexion

Socket.IO avec auth JWT.

### Rooms

```
user:{userId}
debate:{debateId}
live:{liveId}
creator:{creatorId}
admin:moderation
```

### Events

#### Notifications

```
notification:new
notification:unread-count
```

#### Débats

```
debate:response:new
debate:reaction:new
debate:summary:updated
debate:status:changed
```

#### Audio

```
audio:progress:synced
```

#### Upload

```
upload:processing
upload:completed
upload:failed
```

#### Live plus tard

```
live:joined
live:left
live:question:new
live:reaction:new
live:moderation:action
```

#### Admin

```
moderation:report:new
system:alert
```

---

## 13. BULLMQ JOBS

### Queues

```
mediaQueue
feedQueue
aiQueue
notificationQueue
analyticsQueue
moderationQueue
emailQueue
cleanupQueue
```

### Media jobs
* transcode video
* generate thumbnail
* generate waveform
* extract duration
* transcribe audio/video
* scan media moderation

### Feed jobs
* refresh trending scores
* calculate debate heat
* update creator score
* update content ranking

### AI jobs
* summarize content
* summarize debate
* suggest tags
* generate quiz
* moderate text/audio transcript

### Notification jobs
* send in-app notification
* send push notification
* send email digest later

### Analytics jobs
* aggregate content stats
* aggregate creator stats
* aggregate sponsor stats
* retention cohorts

### Cleanup jobs
* delete expired drafts
* remove orphan media
* archive old notifications

---

## 14. REDIS USAGE

### Cache
* feed pages courantes
* trending topics
* hot debates
* user sessions
* unread notification counts

### Rate limiting
* login
* upload
* comment/reply
* AI requests
* payment attempts

### Queues
BullMQ utilise Redis.

### Presence
* utilisateurs connectés
* live participants
* débat actif

### Locks
* éviter double webhook paiement
* éviter double traitement upload
* éviter double notification

---

## 15. STRATÉGIE UPLOAD

### MVP

Upload simple via backend.

Limites :
* taille max stricte
* formats contrôlés
* documents scannés au minimum
* compression légère

### Phase scalable

Upload direct cloud :
1. frontend demande URL signée
2. upload direct vers storage/CDN
3. backend reçoit confirmation
4. worker traite média
5. contenu passe en published

### Vidéo

Ne pas servir les vidéos lourdes depuis Express en production.

Utiliser :
* Mux
* Cloudflare Stream
* Bunny Stream
* ou stockage objet + CDN pour MVP léger

### Documents
* PDF uniquement en MVP
* preview contrôlée
* limite taille stricte

---

## 16. STRATÉGIE AUDIO

### Objectif

L'audio est une arme de rétention.

### MVP
* MiniAudioPlayer global
* FullAudioPlayer
* sauvegarde progression
* queue simple
* page Écouter

### Backend
* AudioProgress
* playlists
* continue listening

### Plus tard
* transcription
* chapitres IA
* offline premium
* normalisation volume
* waveform générée

### Performance
* privilégier formats compressés
* charger metadata d'abord
* lazy load audio complet

---

## 17. STRATÉGIE VIDÉO

### MVP
* lecture verticale
* pause quand hors écran
* lazy loading
* poster image
* qualité basse par défaut en data saver

### Plus tard
* adaptive bitrate
* CDN vidéo
* sous-titres auto
* génération clips
* picture-in-picture desktop

### Règles mobile
* pas d'autoplay son activé par défaut
* précharger seulement contenu suivant
* réduire réseau si batterie faible ou data saver

---

## 18. STRATÉGIE FEED

### MVP ranking

Score simple :

```
score =
  recencyScore
+ engagementScore
+ debateScore
+ interestMatchScore
+ creatorQualityScore
- moderationPenalty
```

### Feed composition

```
40% intérêts utilisateur
25% tendances
20% débats actifs
10% découverte
5% sponsor
```

### Événements feed à tracker
* impression
* view start
* view duration
* completion
* skip
* like
* save
* share
* debate open
* reply start
* audio play

### Plus tard
* embeddings
* recommandation sémantique
* diversity layer
* anti-bulle algorithmique

---

## 19. STRATÉGIE IA

### MVP IA

Fonctions prioritaires :
* résumé contenu
* résumé débat
* reformulation réponse
* suggestion titre
* suggestion tags
* modération texte basique

### Architecture

```
AIService
├── providerRouter
├── promptTemplates
├── safetyLayer
├── usageLimiter
├── cache
└── auditLogs
```

### Providers possibles
* Gemini
* OpenRouter
* Groq
* HuggingFace

### Règles
* limiter coûts
* mettre cache sur résumés
* journaliser usages
* ne jamais exposer clés côté frontend
* indiquer contenu généré IA

### Premium IA
* quotas gratuits
* quotas premium
* analytics usage

---

## 20. PERFORMANCE MOBILE AFRIQUE

### Priorités
* chargement initial léger
* code splitting
* images optimisées
* vidéo lazy
* audio prioritaire
* offline partiel
* data saver
* skeletons

### Frontend
* lazy load routes
* virtualisation feed si nécessaire
* memoization FeedCard
* prefetch modéré
* éviter gros bundles IA/admin sur mobile

### Backend
* pagination cursor
* projections Mongo
* indexes propres
* cache Redis
* compression gzip/brotli

### UX connexion faible
* mode léger
* thumbnails au lieu autoplay
* audio recommandé
* upload en brouillon
* retry automatique

---

## 21. SÉCURITÉ

### Auth
* JWT access + refresh
* refresh token sécurisé
* rotation token
* logout serveur

### Validation
* Zod/Joi sur toutes les entrées
* sanitation HTML
* limites tailles

### Rate limiting
* login
* register
* upload
* replies
* AI
* payments

### Upload security
* whitelist mime types
* taille max
* scan fichier si possible
* ne jamais exécuter document
* URLs signées

### Paiement
* vérifier webhooks Paystack
* idempotence
* logs paiement
* jamais faire confiance au frontend

### Admin
* role-based access
* audit logs
* 2FA plus tard

### Secrets
* jamais dans repo
* variables par environnement
* clés IA uniquement backend

---

## 22. SEO

### Pages publiques MVP
* /content/:id
* /debates/:id
* /series/:id
* /creator/:id

### Meta
* title dynamique
* description
* OG image
* canonical
* structured data plus tard

### Sitemap
* sitemap contenus publics
* sitemap séries
* sitemap créateurs

### Robots
* autoriser pages publiques
* bloquer admin/api privées

### Social sharing

Chaque contenu doit générer :
* titre clair
* image 1200x630
* description courte

---

## 23. PWA

### MVP
* manifest
* icônes
* install prompt
* offline fallback
* cache assets

### Plus tard
* push notifications
* audio background amélioré
* sync brouillons
* offline playlists premium

### Service worker

Stratégies :
* cache-first pour assets
* network-first pour feed
* stale-while-revalidate pour profils/séries

---

## 24. CDN

### Assets
Vercel CDN pour frontend.

### Images/documents
Cloudflare R2/S3 + CDN.

### Vidéo
Mux/Cloudflare Stream/Bunny Stream.

### Audio
Stockage objet + CDN.

### Règle

Express ne doit pas devenir serveur de fichiers lourds en production.

---

## 25. DÉPLOIEMENT VERCEL / RENDER

### Frontend Vercel
* projet web séparé ou monorepo configuré
* build command : npm/pnpm build ciblé web
* output : dist
* env : VITE_API_URL, VITE_SOCKET_URL

### Backend Render
* Web Service Node
* build command : npm/pnpm install + build
* start command : node dist/server.js
* variables backend : Mongo, Redis, JWT, Paystack, IA, storage

### Workers Render

Créer un service worker séparé :

```
api-web-service
api-worker-service
```

Le worker lance BullMQ workers.

### Environnements
* local
* preview/staging
* production

### Variables importantes

Frontend :
```
VITE_API_URL
VITE_SOCKET_URL
VITE_PUBLIC_APP_URL
```

Backend :
```
NODE_ENV
PORT
MONGO_URI
REDIS_URL
JWT_SECRET
JWT_REFRESH_SECRET
PAYSTACK_SECRET_KEY
PAYSTACK_PUBLIC_KEY
PAYSTACK_WEBHOOK_SECRET
AI_PROVIDER_KEYS
STORAGE_ACCESS_KEY
STORAGE_SECRET_KEY
STORAGE_BUCKET
CDN_BASE_URL
CLIENT_URL
```

---

## 26. MONITORING

### Backend
* health endpoint
* uptime monitoring
* error tracking
* slow query logs
* queue monitoring

### Endpoints

```
GET /api/health
GET /api/health/db
GET /api/health/redis
GET /api/health/queues
```

### Outils possibles
* Sentry
* Better Stack
* Logtail
* Grafana plus tard
* Bull Board pour queues

---

## 27. LOGS

### Logger structuré

Utiliser pino ou winston.

### Logs importants
* auth failures
* upload failures
* payment webhooks
* moderation actions
* AI errors
* queue failures
* API latency

### Audit logs

Pour :
* admin actions
* payment changes
* moderation actions
* creator verification

---

## 28. ANALYTICS

### Produit

Events :
* app_open
* onboarding_completed
* feed_impression
* content_view
* content_complete
* content_like
* content_save
* debate_open
* reply_created
* audio_play
* audio_complete
* series_follow
* payment_started
* payment_completed

### Créateur
* views
* watch time
* audio completion
* debate participation
* follower growth

### Sponsor
* impressions
* clicks
* engagement
* topic performance

### Outils possibles
* PostHog
* Plausible
* analytics interne Mongo pour MVP

---

## 29. TESTS

### Backend tests
* unit tests services
* integration tests APIs
* webhook payment tests
* upload tests
* auth tests
* moderation tests

### Frontend tests
* component tests
* critical flow tests
* accessibility checks

### E2E

Playwright recommandé :

Scénarios :
* onboarding
* feed loads
* open debate
* create text reply
* play audio
* upload draft
* save content
* login/register
* premium checkout mock

### Load tests

k6 plus tard :
* feed endpoint
* debate responses
* upload init
* notifications

### CI

GitHub Actions :
* install
* lint
* typecheck
* unit tests
* build frontend
* build backend
* e2e staging plus tard

---

## 30. ROADMAP TECHNIQUE PAR PHASES

### Phase 1 — Core magique

Objectif : rendre MAATFEED vivant.

À construire :
* architecture frontend propre
* architecture backend modulaire
* auth
* onboarding simple
* feed vidéo/audio/débat
* content model
* media upload simple
* débat attaché au contenu
* réponses texte/audio/vidéo
* mini audio player
* profil simple
* notifications in-app
* admin modération basique
* tracking analytics minimal

### Phase 2 — Engagement profond

Objectif : faire revenir.

À construire :
* séries
* playlists
* page écouter avancée
* badges simples
* IA résumé/reformulation
* créateur profil/dashboard simple
* recherche
* recommandations améliorées
* push notifications
* PWA avancée

### Phase 3 — Monétisation élégante

Objectif : revenus sans casser expérience.

À construire :
* dons Paystack
* premium simple
* soutien créateur
* sponsors natifs
* sponsor tracking
* creator analytics
* séries premium
* webhooks robustes

### Phase 4 — Plateforme premium

Objectif : écosystème complet.

À construire :
* live audio
* live débat
* IA avancée
* modération IA avancée
* desktop premium
* dashboard sponsor
* marketplace savoir
* offline premium audio
* recommandation sémantique
* analytics avancées

---

## 31. ORDRE D'IMPLÉMENTATION CONSEILLÉ POUR L'AGENT CODEUR

### Sprint 1
* nettoyer architecture
* créer modules frontend/backend
* vérifier routes existantes
* stabiliser auth/me
* design tokens

### Sprint 2
* Content schema
* Media schema
* Feed API
* Feed UI
* Feed events tracking

### Sprint 3
* Debate schema
* Debate API
* Debate page
* Text replies
* Report basic

### Sprint 4
* Audio player global
* Audio progress
* Listen page
* Audio cards feed

### Sprint 5
* Upload média
* Video/audio/image/document support
* Drafts
* Processing state

### Sprint 6
* Réponses audio/vidéo/document
* Composer unifié
* Bottom sheets

### Sprint 7
* Séries
* Series page
* Follow/progress

### Sprint 8
* IA MVP
* résumé contenu
* résumé débat
* aide réponse
* tags/titres

### Sprint 9
* Créateur dashboard simple
* analytics basiques
* profil créateur

### Sprint 10
* Paiements dons/premium
* Paystack webhook
* premium state

### Sprint 11
* Sponsors natifs
* injection feed
* tracking sponsor

### Sprint 12
* PWA
* SEO public
* performance
* tests E2E
* monitoring/logs

---

## 32. RÈGLES NON NÉGOCIABLES

1. Toujours vérifier routes backend avant frontend.
2. Pas de mock data en production.
3. Pas de clés secrètes côté frontend.
4. Pas de vidéo lourde servie durablement par Express.
5. Pas de paywall agressif.
6. L'audio doit rester central.
7. Le débat doit être attaché au contenu.
8. L'IA doit aider, pas remplacer la communauté.
9. L'expérience mobile Afrique doit guider les décisions.

---

## CONCLUSION

Cette roadmap technique transforme MAATFEED en construction progressive :

```
Vision
→ Flows
→ Architecture
→ Core experience
→ Engagement
→ Monétisation
→ Plateforme premium
```

Le vrai objectif maintenant n'est pas d'ajouter beaucoup de fonctionnalités.

Le vrai objectif est de construire un noyau fluide, vivant, rapide et cohérent :

> feed + audio + débat + création + IA légère + rétention.

Une fois ce noyau fort, MAATFEED peut évoluer vers une plateforme culturelle complète, monétisable et durable.
