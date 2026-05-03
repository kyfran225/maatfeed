# Web Push Notifications - Setup Guide

## Vue d'ensemble

Le système de Web Push Notifications de MAAT FEED utilise la bibliothèque `web-push` basée sur le standard W3C Push API. Cette solution fonctionne avec tous les navigateurs modernes (Chrome, Firefox, Edge, Safari) sans dépendance à des services tiers comme Firebase.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │     │   Backend API    │     │   Push Service  │
│                 │     │                  │     │  (FCM, Mozilla) │
├─────────────────┤     ├──────────────────┤     ├─────────────────┤
│ Service Worker  │◄────┤ webPushService.ts│◄────┤ web-push lib    │
│ useWebPush hook │────►│ Notification API │────►┤ VAPID keys      │
│ Push Toggle UI  │     │ MongoDB (tokens) │     └─────────────────┘
└─────────────────┘     └──────────────────┘
```

## Backend Setup

### 1. Configuration des clés VAPID

Générez une paire de clés VAPID :

```bash
npx web-push generate-vapid-keys
```

Ajoutez les clés dans `.env` :

```env
VAPID_PUBLIC_KEY=your-public-key-here
VAPID_PRIVATE_KEY=your-private-key-here
VAPID_SUBJECT=mailto:noreply@maatfeed.com
```

### 2. Endpoints API

Les endpoints suivants sont disponibles :

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/api/notifications/push/vapid-key` | GET | Non | Récupère la clé publique VAPID |
| `/api/notifications/push/subscribe` | POST | Oui | Enregistre une subscription |
| `/api/notifications/push/unsubscribe` | POST | Oui | Supprime une subscription |
| `/api/notifications/push/test` | POST | Oui | Envoie une notification test |

### 3. Envoi de notifications

Le service `notificationService.ts` envoie automatiquement les notifications push via web-push quand le canal `push` est activé dans les préférences utilisateur.

## Frontend Setup

### 1. Service Worker

Le fichier `public/service-worker.js` gère :
- Installation et mise en cache
- Réception des push events
- Affichage des notifications
- Gestion des clics sur notifications

**Pas d'action requise** - Le service worker est automatiquement servi depuis `/service-worker.js`.

### 2. Hook useWebPush

```typescript
import { useWebPush } from "../hooks/useWebPush";

function MyComponent() {
  const {
    isSupported,    // boolean - navigateur supporte les push
    permission,     // "granted" | "denied" | "default" | null
    isSubscribed,   // boolean - user a une subscription active
    isLoading,      // boolean - opération en cours
    error,          // string | null
    subscribe,      // () => Promise<boolean>
    unsubscribe,    // () => Promise<boolean>
  } = useWebPush();

  // Utilisation...
}
```

### 3. Composant UI

```tsx
import { PushNotificationToggle } from "../components/ui/PushNotificationToggle";

// Version complète avec explications
<PushNotificationToggle />

// Version bouton compact
import { PushNotificationButton } from "../components/ui/PushNotificationToggle";
<PushNotificationButton />
```

### 4. Intégration dans une page (ex: ProfilePage)

```tsx
import { PushNotificationToggle } from "../components/ui/PushNotificationToggle";

export function ProfilePage() {
  return (
    <div className="profile-page">
      <h2>Paramètres de notification</h2>
      <PushNotificationToggle className="mt-4" />
    </div>
  );
}
```

## Flux de fonctionnement

### Subscription

```
1. User clique "Activer"
2. requestNotificationPermission() → "granted"
3. registerServiceWorker() → registration
4. getVapidPublicKey() → publicKey
5. pushManager.subscribe() → subscription
6. subscribeToPush(subscription) → serveur
7. MongoDB: pushTokens.push({ token: subscription, platform: "web" })
```

### Envoi de notification

```
1. createNotification({ channels: ["push"], ... })
2. sendPushNotification()
3. Filter pushTokens where platform === "web"
4. webPushService.sendPushToMany(subscriptions, payload)
5. webpush.sendNotification() → Push Service
6. Push Service → Service Worker (navigateur)
7. Service Worker: showNotification()
```

### Unsubscription

```
1. User clique "Désactiver"
2. pushManager.getSubscription()
3. subscription.unsubscribe()
4. unsubscribeFromPush(endpoint) → serveur
5. MongoDB: pull from pushTokens where token.endpoint === endpoint
```

## Test du système

### 1. Vérifier la configuration backend

```bash
curl http://localhost:4000/api/health
# Doit montrer: webPush: true
```

### 2. Obtenir la clé VAPID

```bash
curl http://localhost:4000/api/notifications/push/vapid-key
```

### 3. Tester depuis l'interface

1. Connectez-vous à l'application
2. Allez sur la page Profile
3. Activez les notifications
4. Acceptez la permission du navigateur
5. Cliquez sur "Test" (endpoint dev uniquement)

### 4. Tester avec cURL

```bash
# Créer une notification (nécessite un token JWT)
curl -X POST http://localhost:4000/api/notifications/push/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Compatibilité navigateurs

| Navigateur | Support | Notes |
|------------|---------|-------|
| Chrome 50+ | ✅ | Service Worker requis |
| Firefox 44+ | ✅ | Service Worker requis |
| Edge 17+ | ✅ | Service Worker requis |
| Safari 16+ | ✅ | iOS 16.4+ requis |
| Chrome Android | ✅ | Service Worker requis |
| Firefox Android | ✅ | Service Worker requis |
| Safari iOS | ✅ | iOS 16.4+, PWA installée |

## Dépannage

### "Web push not configured"

- Vérifiez les variables VAPID dans `.env`
- Redémarrez le serveur API
- Vérifiez `/api/health` → webPush: true

### "Permission denied"

- User a bloqué les notifications
- Guidez l'utilisateur pour débloquer dans les paramètres navigateur

### "Failed to subscribe"

- Vérifiez que le Service Worker est bien enregistré
- Console DevTools → Application → Service Workers

### Notifications non reçues

1. Vérifiez que le user est bien subscribed (MongoDB)
2. Vérifiez que pushEnabled est true dans les préférences
3. Vérifiez que le canal "push" est activé pour le type de notification
4. Vérifiez les logs serveur pour les erreurs web-push

## Limitations connues

- **Quiet hours**: Les notifications urgentes seulement bypassent les heures de silence
- **iOS**: Nécessite iOS 16.4+ et que l'app soit installée comme PWA
- **Safari macOS**: Support complet depuis Safari 16

## Comparaison avec alternatives

| Solution | Avantage | Inconvénient |
|----------|----------|--------------|
| **web-push (choisi)** | Standard W3C, gratuit, pas de vendor lock-in | Nécessite serveur pour envoi |
| Firebase FCM | Facile à mettre en place, analytics | Vendor lock-in, dépendance Google |
| OneSignal | SDK simple, cross-platform | Service tiers payant |
| Pusher Beams | Simple API, fiable | Service tiers payant |

## Sécurité

- Les clés VAPID ne quittent jamais le serveur (private key)
- Seule la clé publique est exposée via API
- Les subscriptions sont liées au userId authentifié
- Les tokens expirés sont automatiquement nettoyés
