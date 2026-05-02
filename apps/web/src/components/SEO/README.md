# MAATFEED - SEO Configuration

## Vue d'ensemble

Cette configuration SEO premium est conçue pour maximiser la visibilité de MAATFEED sur Google, Bing, les réseaux sociaux (Facebook, Twitter/X, LinkedIn, WhatsApp) et les moteurs IA.

## Fichiers créés

### 1. Configuration centralisée (`src/config/seo.ts`)
- `siteSEO` - Configuration globale du site
- `pageSEO` - Métadonnées par type de page
- `structuredData` - Données structurées Schema.org
- Fonctions utilitaires pour générer les métas

### 2. Composant SEO React (`src/components/SEO/SEO.tsx`)
Composant pour mettre à jour dynamiquement les métadonnées dans les pages React.

### 3. Fichiers statiques (`public/`)
- `robots.txt` - Instructions pour les crawlers
- `sitemap.xml` - Sitemap pour l'indexation
- `site.webmanifest` - Configuration PWA
- `browserconfig.xml` - Configuration Microsoft
- `humans.txt` - Crédits (human-readable)

### 4. Index.html
Méta-tags complets pour le SEO, Open Graph, Twitter Cards, et données structurées JSON-LD.

## Utilisation du composant SEO

### Méthode 1: Utilisation simple avec pageKey (recommandé)

```tsx
import { SEO } from '../components/SEO';

function ExplorePage() {
  return (
    <>
      <SEO pageKey="explore" />
      {/* contenu de la page */}
    </>
  );
}
```

Les clés disponibles:
- `home` - Page d'accueil
- `explore` - Page d'exploration
- `community` - Page communauté
- `audio` - Page audio
- `content` - Pages de contenu (utiliser avec params)
- `debate` - Pages de débat (utiliser avec params)
- `auth`, `register`, `profile`, `onboarding`, `admin` - Pages privées (noindex)
- `notFound` - Page 404

### Méthode 2: Utilisation avec paramètres personnalisés

```tsx
import { SEO } from '../components/SEO';

function ContentDetailPage({ content }) {
  return (
    <>
      <SEO 
        pageKey="content"
        title={content.title}
        description={content.description}
        image={content.thumbnailUrl}
        url={`https://maatfeed.com/content/${content.id}`}
        type="article"
        publishedTime={content.publishedAt}
        modifiedTime={content.updatedAt}
        author={content.authorName}
      />
      {/* contenu de la page */}
    </>
  );
}
```

### Méthode 3: SEO complètement personnalisé

```tsx
import { SEO } from '../components/SEO';

function CustomPage() {
  return (
    <>
      <SEO 
        title="Titre personnalisé"
        description="Description personnalisée"
        image="https://maatfeed.com/custom-image.png"
        url="https://maatfeed.com/page"
        type="article"
        keywords={["afrique", "histoire", "culture"]}
        robots="index, follow"
      />
      {/* contenu de la page */}
    </>
  );
}
```

## Checklist avant mise en production

### Images nécessaires
- [x] `/favicon_io/favicon.ico` - Favicon principal
- [x] `/favicon_io/favicon-16x16.png` - Petit favicon
- [x] `/favicon_io/favicon-32x32.png` - Favicon standard
- [x] `/favicon_io/apple-touch-icon.png` - Icône Apple (180x180)
- [x] `/favicon_io/android-chrome-192x192.png` - Icône Android
- [x] `/favicon_io/android-chrome-512x512.png` - Grande icône Android
- [ ] `/og-image.png` - **Image Open Graph (1200x630)** - À créer!

### Configuration Cloudflare
- [ ] Configurer le domaine `maatfeed.com` sur Cloudflare
- [ ] Activer HTTPS forcé
- [ ] Configurer les règles de cache pour les assets statiques
- [ ] Ajouter les en-têtes de sécurité:
  ```
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  ```

### Google Search Console
1. Aller sur https://search.google.com/search-console
2. Ajouter la propriété `maatfeed.com`
3. Vérifier via DNS (ajouter le TXT record sur Cloudflare)
4. Soumettre le sitemap: `https://maatfeed.com/sitemap.xml`

### Bing Webmaster Tools
1. Aller sur https://www.bing.com/webmasters
2. Ajouter le site
3. Soumettre le sitemap

### Pages à créer (optionnel mais recommandé)
- [ ] `/about` - Page "À propos"
- [ ] `/contact` - Page de contact
- [ ] `/privacy` - Politique de confidentialité
- [ ] `/terms` - Conditions d'utilisation

## Pages indexables vs non-indexables

### Pages INDEX (dans sitemap.xml)
- `/` - Accueil (priorité 1.0)
- `/explore` - Exploration (priorité 0.9)
- `/community` - Communauté (priorité 0.8)
- `/audio` - Audio (priorité 0.7)
- `/content/:id` - Contenus (à générer dynamiquement)
- `/debate/:id` - Débats (à générer dynamiquement)

### Pages NOINDEX (bloquées dans robots.txt)
- `/auth` - Connexion
- `/register` - Inscription
- `/verify-email` - Vérification email
- `/forgot-password` - Mot de passe oublié
- `/reset-password` - Réinitialisation
- `/onboarding` - Onboarding
- `/notifications` - Notifications
- `/profile` - Profil utilisateur
- `/admin/*` - Administration

## Sitemap dynamique

Pour les contenus dynamiques (posts, débats, profils IA), créer une API endpoint:

```typescript
// apps/api/src/routes/sitemap.ts
export async function generateContentSitemap() {
  const contents = await Content.find({ status: 'published' });
  
  return contents.map(content => ({
    loc: `https://maatfeed.com/content/${content.id}`,
    lastmod: content.updatedAt.toISOString(),
    changefreq: 'weekly',
    priority: 0.6,
    'video:video': content.videoUrl ? {
      'video:thumbnail_loc': content.thumbnailUrl,
      'video:title': content.title,
      'video:description': content.description,
    } : undefined,
  }));
}
```

## Améliorations futures

1. **Sitemap dynamique**: Générer automatiquement depuis la base de données
2. **Hreflang**: Support multi-langue complet (FR/EN)
3. **AMP**: Pages AMP pour les articles
4. **Breadcrumbs**: Fil d'Ariane structuré sur toutes les pages
5. **Rich Snippets**: Ajouter plus de données structurées (FAQ, HowTo, etc.)
6. **Core Web Vitals**: Optimiser LCP, FID, CLS pour le ranking Google

## Ressources

- [Google Search Central](https://developers.google.com/search)
- [Open Graph Protocol](https://ogp.me/)
- [Schema.org](https://schema.org/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
