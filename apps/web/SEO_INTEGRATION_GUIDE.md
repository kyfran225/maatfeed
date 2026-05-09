# Guide d'intégration SEO - MAATFEED

## 🚀 Intégration rapide dans les pages

### Étape 1: Importer le composant SEO

```tsx
import { SEO } from '../components/SEO';
```

### Étape 2: Ajouter le composant SEO dans chaque page

#### Page d'accueil (FeedPage.tsx)
```tsx
export function FeedPage() {
  return (
    <>
      <SEO pageKey="home" />
      {/* reste du contenu */}
    </>
  );
}
```

#### Page Explore (ExplorePage.tsx)
```tsx
export function ExplorePage() {
  return (
    <>
      <SEO pageKey="explore" />
      {/* reste du contenu */}
    </>
  );
}
```

#### Page Communauté (CommunityPage.tsx)
```tsx
export function CommunityPage() {
  return (
    <>
      <SEO pageKey="community" />
      {/* reste du contenu */}
    </>
  );
}
```

#### Page Audio (AudioPage.tsx)
```tsx
export function AudioPage() {
  return (
    <>
      <SEO pageKey="audio" />
      {/* reste du contenu */}
    </>
  );
}
```

### Pages privées (avec noindex)

#### Page Auth (AuthPage.tsx)
```tsx
export function AuthPage() {
  return (
    <>
      <SEO pageKey="auth" />
      {/* reste du contenu */}
    </>
  );
}
```

#### Page Profil (ProfilePage.tsx)
```tsx
export function ProfilePage() {
  return (
    <>
      <SEO pageKey="profile" />
      {/* reste du contenu */}
    </>
  );
}
```

#### Page Onboarding (OnboardingPage.tsx)
```tsx
export function OnboardingPage() {
  return (
    <>
      <SEO pageKey="onboarding" />
      {/* reste du contenu */}
    </>
  );
}
```

### Pages de contenu dynamique

#### Page Content Detail (ContentDetailPage.tsx)
```tsx
import { useParams } from 'react-router-dom';
import { SEO } from '../components/SEO';

export function ContentDetailPage() {
  const { contentId } = useParams();
  const { data: content } = useContent(contentId);
  
  return (
    <>
      <SEO 
        pageKey="content"
        title={content?.title}
        description={content?.description}
        image={content?.thumbnailUrl}
        url={`https://maatfeed.com/content/${contentId}`}
        type="article"
        keywords={content?.tags}
      />
      {/* reste du contenu */}
    </>
  );
}
```

#### Page Débat (DebateDetailPage.tsx)
```tsx
import { useParams } from 'react-router-dom';
import { SEO } from '../components/SEO';

export function DebateDetailPage() {
  const { contentId } = useParams();
  const { data: debate } = useDebate(contentId);
  
  return (
    <>
      <SEO 
        pageKey="debate"
        title={debate?.title}
        description={debate?.description}
        url={`https://maatfeed.com/debate/${contentId}`}
        type="article"
      />
      {/* reste du contenu */}
    </>
  );
}
```

### Pages d'administration

#### Admin Ops Page (AdminOpsPage.tsx)
```tsx
export function AdminOpsPage() {
  return (
    <>
      <SEO pageKey="admin" />
      {/* reste du contenu */}
    </>
  );
}
```

#### Admin Ingestion Page (AdminIngestionPage.tsx)
```tsx
export function AdminIngestionPage() {
  return (
    <>
      <SEO pageKey="admin" title="Ingestion - MAATFEED Admin" />
      {/* reste du contenu */}
    </>
  );
}
```

### Page 404 (NotFoundPage.tsx)
```tsx
export function NotFoundPage() {
  return (
    <>
      <SEO pageKey="notFound" />
      {/* reste du contenu */}
    </>
  );
}
```

## 📋 Checklist par page

| Page | Fichier | pageKey | Indexable |
|------|---------|---------|-----------|
| Accueil | FeedPage.tsx | home | ✅ Oui |
| Explorer | ExplorePage.tsx | explore | ✅ Oui |
| Communauté | CommunityPage.tsx | community | ✅ Oui |
| Audio | AudioPage.tsx | audio | ✅ Oui |
| Contenu | ContentDetailPage.tsx | content | ✅ Oui |
| Débat | DebateDetailPage.tsx | debate | ✅ Oui |
| Auth | AuthPage.tsx | auth | ❌ Non |
| Register | AuthPage.tsx | register | ❌ Non |
| Profil | ProfilePage.tsx | profile | ❌ Non |
| Onboarding | OnboardingPage.tsx | onboarding | ❌ Non |
| Notifications | NotificationsPage.tsx | (personnalisé) | ❌ Non |
| Admin | AdminOpsPage.tsx | admin | ❌ Non |
| Admin Ingestion | AdminIngestionPage.tsx | admin | ❌ Non |
| 404 | NotFoundPage.tsx | notFound | ❌ Non |

## 🔧 Personnalisation avancée

### Exemple: NotificationPage avec titre personnalisé
```tsx
export function NotificationsPage() {
  const unreadCount = useUnreadNotificationsCount();
  
  return (
    <>
      <SEO 
        title={`Notifications ${unreadCount > 0 ? `(${unreadCount})` : ''} - MAATFEED`}
        description="Gère tes notifications et reste informé des nouveaux débats et contenus."
        robots="noindex, nofollow"
      />
      {/* reste du contenu */}
    </>
  );
}
```

### Exemple: ForgotPasswordPage
```tsx
export function ForgotPasswordPage() {
  return (
    <>
      <SEO 
        title="Mot de passe oublié - MAATFEED"
        description="Réinitialise ton mot de passe MAATFEED pour retrouver l'accès à ton compte."
        robots="noindex, nofollow"
      />
      {/* reste du contenu */}
    </>
  );
}
```

### Exemple: VerifyEmailPage
```tsx
export function VerifyEmailPage() {
  return (
    <>
      <SEO 
        title="Vérification email - MAATFEED"
        description="Vérifie ton adresse email pour activer ton compte MAATFEED."
        robots="noindex, nofollow"
      />
      {/* reste du contenu */}
    </>
  );
}
```

## ⚠️ Important

1. **Toujours utiliser `<>` et `</>` (Fragment)** pour wrapper le composant SEO avec le contenu
2. **Le composant SEO doit être le premier enfant** de la page
3. **Les pages privées doivent avoir `robots="noindex, nofollow"`** ou utiliser les `pageKey` qui l'ont déjà défini
4. **Tester les partages** sur Facebook Debugger et Twitter Card Validator après déploiement

## 🧪 Test du SEO

### Outils de test
1. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
4. **Google Rich Results Test**: https://search.google.com/test/rich-results

### Vérification manuelle
Dans la console navigateur, tapez:
```javascript
// Vérifier le titre
document.title

// Vérifier les métas
Array.from(document.querySelectorAll('meta')).map(m => `${m.name || m.property}: ${m.content}`).join('\n')

// Vérifier le canonical
document.querySelector('link[rel="canonical"]')?.href
```
