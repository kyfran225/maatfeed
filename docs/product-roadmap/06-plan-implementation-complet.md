# MAATFEED — PLAN D'IMPLÉMENTATION COMPLET

## Objectif

Plan d'exécution détaillé pour transformer la vision MAATFEED en réalité technique, sprint par sprint, avec Socket.IO prioritaire pour mobile et fluidité.

---

## ARCHITECTURE SOCKET.IO PRIORITAIRE

### Pourquoi Socket.IO ?

**Mobile First :**
- Reconnexions automatiques
- Gestion offline/online native
- Fallback polling si WebSocket bloqué
- Optimisé pour connexions instables

**Événements complexes :**
- Rooms pour débats
- Presence tracking
- Notifications temps réel
- Live reactions
- Queue sync

**Scaling ready :**
- Redis adapter pour multi-instances
- Horizontal scaling natif
- Load balancing ready

---

## TIMELINE GLOBAL : 16 SEMAINES (OPTION 3)

```
Phase A — Foundation Core     (Semaines 1-4)
Phase B — Core Experience    (Semaines 5-8)  
Phase C — Engagement         (Semaines 9-12)
Phase D — Monétisation & Stabilisation (Semaines 13-16)

Voir document détaillé : 07-roadmap-16-semaines-option3.md
```

---

## SPRINT 0 — FONDATIONS SOCKET.IO + ARCHITECTURE (Semaines 1-2)

### Objectif
Mettre en place l'infrastructure temps réel et réorganiser le code.

### Tâches Semaine 1

**Socket.IO Infrastructure**
```bash
npm install socket.io @socket.io/redis-adapter ioredis
```

**Backend - Socket Server**
```typescript
// src/realtime/socketServer.ts
import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'

const pubClient = createClient({ url: process.env.REDIS_URL })
const subClient = pubClient.duplicate()

const io = new Server(server, {
  adapter: createAdapter(pubClient, subClient),
  cors: { origin: process.env.CLIENT_URL }
})
```

**Frontend - Socket Client**
```typescript
// src/lib/socket.ts
import { io, Socket } from 'socket.io-client'

export class SocketService {
  private socket: Socket
  
  connect(token: string) {
    this.socket = io(process.env.VITE_SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    })
  }
}
```

**Rooms System**
```typescript
// src/realtime/rooms.ts
export const ROOMS = {
  USER: (userId: string) => `user:${userId}`,
  DEBATE: (debateId: string) => `debate:${debateId}`,
  LIVE: (liveId: string) => `live:${liveId}`,
  ADMIN: 'admin:moderation'
}
```

**Presence Tracking**
```typescript
// src/realtime/presence.ts
socket.on('user:online', (userId) => {
  socket.join(ROOMS.USER(userId))
  socket.to(ROOMS.USER(userId)).emit('presence:online', userId)
})
```

### Tâches Semaine 2

**Architecture Refactor**
- Passer de `pages/` à `features/` dans frontend
- Passer de `controllers/` à `modules/` dans backend
- Créer `stores/` pour Zustand
- Configurer `policies/` pour autorisations

**Zustand Implementation**
```typescript
// src/stores/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false })
    }),
    { name: 'auth-storage' }
  )
)
```

**Forms Validation**
```bash
npm install react-hook-form @hookform/resolvers @hookform/error-message
```

**Rate Limiting**
```bash
npm install express-rate-limit rate-limit-redis
```

```typescript
// src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import redis from '../config/redis'

export const createRateLimit = (windowMs: number, max: number) => 
  rateLimit({
    store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
    windowMs,
    max,
    message: 'Too many requests'
  })
```

**Health Checks**
```typescript
// src/routes/health.ts
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkMongo(),
      redis: await checkRedis(),
      queues: await checkQueues()
    }
  }
  res.json(health)
})
```

**Livraison Sprint 0**
- ✅ Socket.IO fonctionnel avec rooms
- ✅ Presence tracking basique
- ✅ Architecture refactorisée
- ✅ Zustand stores créés
- ✅ Forms validation configurée
- ✅ Rate limiting actif
- ✅ Health checks disponibles

---

## SPRINT 1 — CORE FEED + AUDIO + DÉBATS (Semaines 3-4)

### Objectif
Construire le cœur de MAATFEED : feed multimédia, audio player, débats temps réel.

### Tâches Semaine 3

**Feed API Advanced**
```typescript
// src/modules/feed/feed.service.ts
export class FeedService {
  async generateFeed(userId: string, cursor?: string) {
    const composition = {
      interests: 40,
      trending: 25,
      activeDebates: 20,
      discovery: 10,
      sponsors: 5
    }
    
    // Algorithm scoring simple
    const feed = await this.fetchContent(userId, composition, cursor)
    return this.mixWithSponsors(feed)
  }
}
```

**Feed Components**
```typescript
// src/components/feed/FeedCard.tsx
interface FeedCardProps {
  content: Content
  onPlay: (content: Content) => void
  onOpenDebate: (debateId: string) => void
}
```

**Audio Player Global**
```typescript
// src/stores/playerStore.ts
interface PlayerState {
  currentTrack: Content | null
  queue: Content[]
  isPlaying: boolean
  progress: number
  volume: number
  playbackRate: number
  
  play: () => void
  pause: () => void
  seek: (position: number) => void
  addToQueue: (content: Content) => void
  next: () => void
  previous: () => void
}
```

**Mini Audio Player**
```typescript
// src/components/audio/MiniAudioPlayer.tsx
export const MiniAudioPlayer = () => {
  const { currentTrack, isPlaying, play, pause, progress } = usePlayerStore()
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4">
      {/* Audio controls */}
    </div>
  )
}
```

### Tâches Semaine 4

**Debats System**
```typescript
// src/modules/debates/debate.service.ts
export class DebateService {
  async createDebate(sourceContentId: string, question: string) {
    const debate = new Debate({
      sourceContentId,
      question,
      status: 'active'
    })
    return debate.save()
  }
  
  async addResponse(debateId: string, response: CreateResponseDto) {
    const newResponse = await DebateResponse.create(response)
    
    // Socket.IO real-time
    io.to(ROOMS.DEBATE(debateId)).emit('debate:response:new', newResponse)
    
    return newResponse
  }
}
```

**Debate Page**
```typescript
// src/components/debate/DebatePage.tsx
export const DebatePage = ({ debateId }: { debateId: string }) => {
  const { debate, responses } = useDebate(debateId)
  const socket = useSocket()
  
  useEffect(() => {
    socket.emit('debate:join', debateId)
    socket.on('debate:response:new', (response) => {
      // Optimistic update
    })
    
    return () => socket.emit('debate:leave', debateId)
  }, [debateId])
}
```

**Response Composer**
```typescript
// src/components/debate/ResponseComposer.tsx
interface ResponseComposerProps {
  debateId: string
  parentId?: string
}

export const ResponseComposer = ({ debateId, parentId }: ResponseComposerProps) => {
  const [type, setType] = useState<'text' | 'audio' | 'video'>('text')
  const [content, setContent] = useState('')
  
  const handleSubmit = async () => {
    await createResponse({
      debateId,
      parentId,
      type,
      body: content
    })
  }
}
```

**Real-time Notifications**
```typescript
// src/realtime/notificationSocket.ts
socket.on('notification:new', (notification) => {
  // Update Zustand store
  useNotificationStore.getState().pushNotification(notification)
  
  // Show toast
  toast(notification.title)
})
```

**Livraison Sprint 1**
- ✅ Feed multimédia fonctionnel
- ✅ Audio player global avec queue
- ✅ Débats avec réponses temps réel
- ✅ Response composer multimédia
- ✅ Notifications Socket.IO
- ✅ Optimistic updates
- ✅ Mobile-first responsive

---

## SPRINT 2 — UPLOAD + MEDIA PROCESSING (Semaines 5-6)

### Objectif
Système d'upload robuste avec traitement média et progression temps réel.

### Tâches Semaine 5

**Chunk Upload System**
```typescript
// src/services/uploadService.ts
export class UploadService {
  async initiateUpload(file: File, metadata: UploadMetadata) {
    const uploadId = generateId()
    const chunks = Math.ceil(file.size / CHUNK_SIZE)
    
    await redis.setex(`upload:${uploadId}`, 3600, {
      file,
      metadata,
      chunks,
      completed: 0
    })
    
    return { uploadId, chunks }
  }
  
  async uploadChunk(uploadId: string, chunkIndex: number, chunk: Blob) {
    const tempPath = `/tmp/${uploadId}_${chunkIndex}`
    await fs.writeFile(tempPath, chunk)
    
    // Socket.IO progress
    io.to(ROOMS.USER(userId)).emit('upload:progress', {
      uploadId,
      progress: (chunkIndex + 1) / totalChunks * 100
    })
  }
}
```

**Upload Component**
```typescript
// src/components/upload/UploadDropzone.tsx
export const UploadDropzone = () => {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const socket = useSocket()
  
  useEffect(() => {
    socket.on('upload:progress', ({ uploadId, progress }) => {
      setUploadProgress(prev => ({ ...prev, [uploadId]: progress }))
    })
  }, [])
  
  const handleDrop = async (files: File[]) => {
    for (const file of files) {
      const { uploadId } = await initiateUpload(file)
      await uploadFileInChunks(file, uploadId)
    }
  }
}
```

**Media Processing Jobs**
```typescript
// src/jobs/workers/mediaWorker.ts
export const mediaWorker = new Worker('media', async (job) => {
  const { mediaId, operations } = job.data
  
  if (operations.includes('thumbnail')) {
    await generateThumbnail(mediaId)
  }
  
  if (operations.includes('waveform')) {
    await generateWaveform(mediaId)
  }
  
  if (operations.includes('transcription')) {
    await transcribeAudio(mediaId)
  }
  
  // Socket.IO completion
  io.to(ROOMS.USER(media.ownerId)).emit('media:processed', { mediaId })
})
```

### Tâches Semaine 6

**Video Processing**
```typescript
// src/services/videoService.ts
export class VideoService {
  async processVideo(mediaId: string) {
    const media = await Media.findById(mediaId)
    
    // Generate multiple qualities
    const qualities = ['360p', '720p', '1080p']
    
    for (const quality of qualities) {
      await this.transcodeToQuality(media.originalUrl, quality)
    }
    
    // Generate thumbnail
    await this.extractThumbnail(media.originalUrl)
    
    media.processingState = 'completed'
    await media.save()
  }
}
```

**Audio Waveform**
```typescript
// src/services/audioService.ts
export class AudioService {
  async generateWaveform(mediaId: string) {
    const media = await Media.findById(mediaId)
    const waveform = await this.extractWaveformData(media.originalUrl)
    
    media.waveformUrl = waveform
    await media.save()
  }
}
```

**Draft System**
```typescript
// src/stores/composerStore.ts
interface ComposerState {
  activeDraft: Draft | null
  drafts: Draft[]
  
  saveDraft: (draft: CreateDraftDto) => void
  publishDraft: (draftId: string) => void
  deleteDraft: (draftId: string) => void
}
```

**File Validation**
```typescript
// src/middleware/uploadGuard.ts
export const uploadGuard = [
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['video/*', 'audio/*', 'image/*', 'application/pdf']
      cb(null, allowedTypes.some(type => mime.match(type)))
    }
  })
]
```

**Livraison Sprint 2**
- ✅ Upload chunk avec progression temps réel
- ✅ Video processing multi-qualités
- ✅ Audio waveform generation
- ✅ Transcription basique
- ✅ Draft system avec sauvegarde locale
- ✅ File validation sécurisée
- ✅ Queue processing stable

---

## SPRINT 3 — MONÉTISATION PAYSTACK (Semaines 7-8)

### Objectif
Implémenter le système de paiement complet avec Paystack et mobile money.

### Tâches Semaine 7

**Paystack Integration**
```bash
npm install paystack
```

```typescript
// src/services/paystackService.ts
import Paystack from 'paystack'

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY)

export class PaymentService {
  async initializePayment(data: InitializePaymentDto) {
    const response = await paystack.transaction.initialize({
      amount: data.amount * 100, // Convert to kobo
      email: data.email,
      metadata: data.metadata,
      callback_url: `${process.env.CLIENT_URL}/payment/verify`
    })
    
    return response.data
  }
  
  async verifyPayment(reference: string) {
    const response = await paystack.transaction.verify(reference)
    return response.data
  }
}
```

**Payment Endpoints**
```typescript
// src/modules/payments/payment.routes.ts
router.post('/checkout', async (req, res) => {
  const { amount, type, metadata } = req.body
  
  const payment = await paymentService.initializePayment({
    amount,
    type,
    metadata,
    userId: req.user.id,
    email: req.user.email
  })
  
  res.json(payment)
})

router.post('/webhooks/paystack', async (req, res) => {
  const event = req.body
  
  if (event.event === 'charge.success') {
    await handleSuccessfulPayment(event.data)
  }
  
  res.status(200).send()
})
```

**Premium Features**
```typescript
// src/services/premiumService.ts
export class PremiumService {
  async activatePremium(userId: string, planId: string) {
    const user = await User.findById(userId)
    user.premiumState = {
      active: true,
      planId,
      expiresAt: addMonths(new Date(), 1),
      features: getPlanFeatures(planId)
    }
    await user.save()
    
    // Socket.IO notification
    io.to(ROOMS.USER(userId)).emit('premium:activated', { planId })
  }
}
```

### Tâches Semaine 8

**Mobile Money Support**
```typescript
// src/services/mobileMoneyService.ts
export class MobileMoneyService {
  async initiateMobileMoneyPayment(data: MobileMoneyDto) {
    // Paystack supports mobile money
    const response = await paystack.transaction.initialize({
      amount: data.amount * 100,
      email: data.email,
      currency: data.currency,
      channel: 'mobile_money',
      phone: data.phone,
      provider: data.provider // mtn, orange, etc.
    })
    
    return response.data
  }
}
```

**Donation System**
```typescript
// src/services/donationService.ts
export class DonationService {
  async createDonation(donorId: string, creatorId: string, amount: number) {
    const donation = await Payment.create({
      userId: donorId,
      type: 'donation',
      amount,
      metadata: { creatorId },
      status: 'pending'
    })
    
    const payment = await paymentService.initializePayment({
      amount,
      type: 'donation',
      metadata: { donationId: donation.id }
    })
    
    return payment
  }
}
```

**Creator Monetization**
```typescript
// src/services/creatorMonetizationService.ts
export class CreatorMonetizationService {
  async enableMonetization(creatorId: string) {
    const creator = await Creator.findById(creatorId)
    creator.monetizationEnabled = true
    await creator.save()
  }
  
  async getCreatorRevenue(creatorId: string, period: 'month' | 'year') {
    return Payment.aggregate([
      { $match: { 'metadata.creatorId': creatorId, status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  }
}
```

**Sponsor System**
```typescript
// src/services/sponsorService.ts
export class SponsorService {
  async createCampaign(campaign: CreateCampaignDto) {
    const sponsorCampaign = new SponsorCampaign(campaign)
    await sponsorCampaign.save()
    
    // Start injecting into feed
    await this.updateFeedInjection(sponsorCampaign)
    
    return sponsorCampaign
  }
  
  async trackImpression(campaignId: string, userId: string) {
    await SponsorCampaign.findByIdAndUpdate(campaignId, {
      $inc: { impressions: 1 }
    })
    
    // Analytics event
    await analyticsService.track('sponsor:impression', {
      campaignId,
      userId
    })
  }
}
```

**Livraison Sprint 3**
- ✅ Paystack integration complète
- ✅ Mobile money support
- ✅ Premium features avec feature flags
- ✅ Donation system
- ✅ Creator monetization
- ✅ Sponsor campaigns avec tracking
- ✅ Webhooks sécurisés

---

## SPRINT 4 — SEARCH + ANALYTICS (Semaines 9-10)

### Objectif
Ajouter recherche avancée et analytics pour comprendre le comportement utilisateur.

### Tâches Semaine 9

**Search Engine Setup**
```bash
# Option 1: Meilisearch (recommended)
docker run -it --rm \
  -p 7700:7700 \
  -v $(pwd)/meili_data:/meili_data \
  getmeili/meilisearch:latest

npm install meilisearch
```

```typescript
// src/services/searchService.ts
import MeiliSearch from 'meilisearch'

const meiliSearch = new MeiliSearch({
  host: process.env.MEILISEARCH_URL,
  apiKey: process.env.MEILISEARCH_KEY
})

export class SearchService {
  async indexContent(content: Content) {
    await meiliSearch.index('content').addDocuments([{
      id: content._id,
      title: content.title,
      description: content.description,
      tags: content.tags,
      creator: content.creatorName,
      type: content.type
    }])
  }
  
  async search(query: string, filters?: SearchFilters) {
    return meiliSearch.index('content').search(query, {
      filters: this.buildFilters(filters),
      limit: 20
    })
  }
}
```

**Search API**
```typescript
// src/modules/search/search.routes.ts
router.get('/', async (req, res) => {
  const { q, type, topic, creator } = req.query
  
  const results = await searchService.search(q as string, {
    type: type as string,
    topic: topic as string,
    creator: creator as string
  })
  
  res.json(results)
})
```

**Search Component**
```typescript
// src/components/search/SearchPage.tsx
export const SearchPage = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  
  const handleSearch = async () => {
    setLoading(true)
    const response = await searchApi(query)
    setResults(response.hits)
    setLoading(false)
  }
  
  return (
    <div>
      <SearchInput value={query} onChange={setQuery} onSearch={handleSearch} />
      <SearchResults results={results} loading={loading} />
    </div>
  )
}
```

### Tâches Semaine 10

**Analytics Setup**
```typescript
// src/services/analyticsService.ts
export class AnalyticsService {
  async track(eventName: string, data: AnalyticsData) {
    const event = new AnalyticsEvent({
      userId: data.userId,
      sessionId: data.sessionId,
      eventName,
      entityType: data.entityType,
      entityId: data.entityId,
      metadata: data.metadata,
      device: this.getDeviceInfo(),
      network: this.getNetworkInfo()
    })
    
    await event.save()
    
    // Real-time dashboard
    io.to('admin:analytics').emit('analytics:event', event)
  }
  
  async getContentMetrics(contentId: string, period: 'day' | 'week' | 'month') {
    return AnalyticsEvent.aggregate([
      { $match: { entityId: contentId, eventName: { $in: ['view', 'like', 'share'] } } },
      { $group: {
        _id: '$eventName',
        count: { $sum: 1 }
      }}
    ])
  }
}
```

**Analytics Dashboard**
```typescript
// src/components/admin/AnalyticsDashboard.tsx
export const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>()
  const socket = useSocket()
  
  useEffect(() => {
    socket.emit('admin:join', 'analytics')
    socket.on('analytics:event', (event) => {
      // Update metrics in real-time
      updateMetrics(event)
    })
  }, [])
  
  return (
    <div>
      <MetricsCards metrics={metrics} />
      <ContentPerformanceChart />
      <UserActivityHeatmap />
    </div>
  )
}
```

**Event Tracking Frontend**
```typescript
// src/hooks/useAnalytics.ts
export const useAnalytics = () => {
  const track = useCallback((eventName: string, data?: any) => {
    analyticsService.track(eventName, {
      userId: getCurrentUserId(),
      sessionId: getSessionId(),
      ...data
    })
  }, [])
  
  return { track }
}

// Usage in components
const { track } = useAnalytics()

track('content:view', { contentId, type: 'video' })
track('debate:response:created', { debateId, responseType: 'audio' })
```

**Creator Analytics**
```typescript
// src/components/creator/CreatorAnalytics.tsx
export const CreatorAnalytics = ({ creatorId }: { creatorId: string }) => {
  const { data: analytics } = useQuery(['creator-analytics', creatorId], () =>
    creatorService.getAnalytics(creatorId)
  )
  
  return (
    <div>
      <ViewsChart data={analytics.views} />
      <EngagementMetrics data={analytics.engagement} />
      <RevenueBreakdown data={analytics.revenue} />
    </div>
  )
}
```

**Livraison Sprint 4**
- ✅ Meilisearch search engine
- ✅ Search API avec filtres
- ✅ Search UI responsive
- ✅ Analytics tracking system
- ✅ Real-time dashboard admin
- ✅ Creator analytics
- ✅ Event tracking frontend

---

## SPRINT 5 — PWA + PERFORMANCE + DÉPLOIEMENT (Semaines 11-12)

### Objectif
Optimiser pour mobile Afrique, transformer en PWA, déployer en production.

### Tâches Semaine 11

**PWA Configuration**
```typescript
// public/manifest.webmanifest
{
  "name": "MAATFEED",
  "short_name": "MAATFEED",
  "description": "Plateforme culturelle africaine",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#FF6B35",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Service Worker**
```typescript
// public/sw.js
const CACHE_NAME = 'maatfeed-v1'
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    // Network first for API
    event.respondWith(networkFirst(event.request))
  } else {
    // Cache first for static
    event.respondWith(cacheFirst(event.request))
  }
})
```

**Performance Optimizations**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          motion: ['framer-motion']
        }
      }
    }
  }
})
```

**Mobile Africa Optimizations**
```typescript
// src/hooks/useDataSaver.ts
export const useDataSaver = () => {
  const [dataSaver, setDataSaver] = useState(false)
  
  useEffect(() => {
    // Detect data saver mode
    const connection = (navigator as any).connection
    if (connection) {
      setDataSaver(connection.saveData || connection.effectiveType === 'slow-2g')
    }
  }, [])
  
  return dataSaver
}

// Usage in components
const dataSaver = useDataSaver()

{dataSaver ? (
  <img src={thumbnail} loading="lazy" />
) : (
  <video src={highQualitySrc} autoPlay muted />
)}
```

**Offline Support**
```typescript
// src/components/offline/OfflineIndicator.tsx
export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  if (isOnline) return null
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
      Mode hors ligne - Certaines fonctionnalités limitées
    </div>
  )
}
```

### Tâches Semaine 12

**Vercel Deployment**
```bash
# vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "env": {
    "VITE_API_URL": "@api-url",
    "VITE_SOCKET_URL": "@socket-url"
  }
}
```

**Render Deployment**
```yaml
# render.yaml
services:
  - type: web
    name: maatfeed-api
    env: node
    buildCommand: "npm run build"
    startCommand: "npm start"
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        sync: false
      - key: REDIS_URL
        sync: false
  
  - type: worker
    name: maatfeed-jobs
    env: node
    buildCommand: "npm run build"
    startCommand: "npm run worker:prod"
```

**Environment Setup**
```bash
# Production environment variables
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
PAYSTACK_SECRET_KEY=...
MEILISEARCH_URL=...
MEILISEARCH_KEY=...
VITE_API_URL=https://api.maatfeed.com
VITE_SOCKET_URL=https://api.maatfeed.com
```

**Monitoring Setup**
```typescript
// src/config/monitoring.ts
import Sentry from '@sentry/node'

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: 'production'
  })
}
```

**Health Monitoring**
```typescript
// src/routes/monitoring.ts
app.get('/api/health/detailed', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      database: await checkMongo(),
      redis: await checkRedis(),
      search: await checkMeiliSearch(),
      queues: await checkBullMQ()
    },
    metrics: {
      activeConnections: io.engine.clientsCount,
      queuedJobs: await getQueueStats()
    }
  }
  
  res.json(health)
})
```

**Final Testing**
```bash
# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance

# Load tests
npm run test:load
```

**Livraison Sprint 5**
- ✅ PWA installable
- ✅ Service worker avec cache
- ✅ Performance mobile Afrique
- ✅ Offline support
- ✅ Vercel frontend déployé
- ✅ Render backend déployé
- ✅ Monitoring en place
- ✅ Tests E2E validés

---

## RISQUES ET MITIGATIONS

### Risques Techniques

**Socket.IO Scaling**
- **Risque** : 10k+ connexions simultanées
- **Mitigation** : Redis adapter, horizontal scaling, connection pooling

**Media Processing Bottleneck**
- **Risque** : Uploads vidéo bloqués
- **Mitigation** : Queue processing, external services (Mux), CDN

**Mobile Performance**
- **Risque** : App trop lourde pour 2G/3G
- **Mitigation** : Data saver mode, lazy loading, compression

**Payment Failures**
- **Risque** : Paystack downtime
- **Mitigation** : Multiple providers, retry logic, manual fallback

### Risques Produit

**User Adoption**
- **Risque** : Complexité décourageante
- **Mitigation** : Onboarding fluide, tutoriels, support

**Content Quality**
- **Risque** : Spam/low quality
- **Mitigation** : IA moderation, community reporting, creator verification

**Monetization Balance**
- **Risque** : Trop agressif
- **Mitigation** : Premium value proposition, native sponsors, creator-first

---

## MÉTRIQUES DE SUCCÈS

### Techniques
- **Performance** : < 3s load time sur 3G
- **Disponibilité** : > 99.5% uptime
- **Socket.IO** : < 100ms latency
- **Mobile** : < 50MB app size

### Produit
- **Engagement** : > 10 min/session moyenne
- **Rétention** : > 40% day 7 retention
- **Audio** : > 60% completion rate
- **Débats** : > 2 réponses moyenne par débat

### Business
- **Monétisation** : > $0.50 ARPU
- **Créateurs** : > 100 créateurs actifs
- **Sponsors** : > 10 campagnes/mois
- **Premium** : > 5% conversion rate

---

## CONCLUSION

Ce plan d'implémentation de 12 semaines transforme MAATFEED en :

**Produit** : Feed multimédia + Audio + Débats + Monétisation
**Technique** : Socket.IO + PWA + Performance mobile Afrique
**Business** : Paystack + Premium + Sponsors + Creator economy

**Priorité absolue** : Fluidité mobile, stabilité Socket.IO, expérience utilisateur premium avant sophistication technique.

La roadmap est ambitieuse mais réaliste avec la stack technique existante et les compétences validées.
