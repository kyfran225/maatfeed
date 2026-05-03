/**
 * MAATFEED - Configuration SEO Premium
 * Optimisé pour Google, Bing, réseaux sociaux et moteurs IA
 * Domaine: https://maatfeed.com
 */

export interface SEOConfig {
  // Identité du site
  siteName: string;
  siteTagline: string;
  defaultTitle: string;
  defaultDescription: string;
  
  // URLs
  siteUrl: string;
  canonicalUrl: string;
  
  // Langue et localisation
  defaultLocale: string;
  alternateLocales: string[];
  
  // Images
  ogImage: string;
  twitterImage: string;
  favicon: string;
  
  // Réseaux sociaux
  social: {
    twitterHandle?: string;
    facebookAppId?: string;
  };
  
  // Auteur et copyright
  author: string;
  publisher: string;
  
  // Thème
  themeColor: string;
  backgroundColor: string;
}

export const siteSEO: SEOConfig = {
  // Identité
  siteName: 'MAATFEED',
  siteTagline: 'Savoirs africains, débats et audio',
  defaultTitle: 'MAATFEED — Savoirs africains, débats et audio',
  defaultDescription: 'MAATFEED rassemble contenus, audio et discussions autour des savoirs africains.',
  
  // URLs - IMPORTANT: Adapter selon l'environnement
  siteUrl: 'https://maatfeed.com',
  canonicalUrl: 'https://maatfeed.com/',
  
  // Langue
  defaultLocale: 'fr_FR',
  alternateLocales: ['en_US', 'en_GB'],
  
  // Images - Toutes les images doivent être en 1200x630 pour OG
  ogImage: 'https://maatfeed.com/og-image.webp',
  twitterImage: 'https://maatfeed.com/og-image.webp',
  favicon: '/favicon.ico',
  
  // Réseaux sociaux (à remplir quand disponible)
  social: {
    twitterHandle: '@maatfeed', // À mettre à jour
    facebookAppId: '', // À configurer si besoin
  },
  
  // Méta-informations
  author: 'MAATFEED Team',
  publisher: 'MAATFEED',
  
  // Thème
  themeColor: '#0B0704',
  backgroundColor: '#0B0704',
};

// Configuration par type de page pour un SEO granulaire
export const pageSEO = {
  home: {
    title: 'MAATFEED — Savoirs africains, débats et audio',
    description: 'Contenus, audio et discussions autour des savoirs africains.',
    keywords: ['savoir africain', 'débat', 'spiritualité', 'histoire', 'kemet'],
    robots: 'index, follow',
    priority: '1.0',
    changefreq: 'daily',
  },
  explore: {
    title: 'Découvrir — MAATFEED',
    description: 'Explore les contenus MAATFEED.',
    keywords: ['contenu africain', 'vidéos', 'audio', 'histoire', 'spiritualité'],
    robots: 'index, follow',
    priority: '0.9',
    changefreq: 'hourly',
  },
  community: {
    title: 'Atelier — MAATFEED',
    description: 'Explique, confronte et améliore ta compréhension avec les débats et les retours de la communauté MAATFEED.',
    keywords: ['atelier', 'débats', 'explication', 'discussion', 'forum africain'],
    robots: 'index, follow',
    priority: '0.8',
    changefreq: 'hourly',
  },
  audio: {
    title: 'Audio — MAATFEED',
    description: 'Écoute les pistes audio MAATFEED.',
    keywords: ['audio', 'podcast', 'spiritualité', 'histoire africaine'],
    robots: 'index, follow',
    priority: '0.7',
    changefreq: 'daily',
  },
  content: {
    titleTemplate: (title: string) => `${title} — MAATFEED`,
    descriptionTemplate: (desc: string) => desc,
    robots: 'index, follow',
    priority: '0.8',
    changefreq: 'weekly',
  },
  debate: {
    titleTemplate: (title: string) => `Débat: ${title} — MAATFEED`,
    descriptionTemplate: (desc: string) => `Rejoins le débat sur MAATFEED: ${desc}`,
    robots: 'index, follow',
    priority: '0.7',
    changefreq: 'hourly',
  },
  // Pages privées - NOINDEX
  auth: {
    title: 'Connexion — MAATFEED',
    description: 'Connecte-toi à MAATFEED pour accéder à ton feed personnalisé et participer aux débats.',
    robots: 'noindex, nofollow',
  },
  register: {
    title: 'Inscription — MAATFEED',
    description: 'Crée ton compte MAATFEED et rejoins la communauté du savoir africain.',
    robots: 'noindex, nofollow',
  },
  profile: {
    title: 'Profil — MAATFEED',
    description: 'Gère ton profil MAATFEED et tes préférences.',
    robots: 'noindex, nofollow',
  },
  onboarding: {
    title: 'Bienvenue — MAATFEED',
    description: 'Personnalise ton expérience MAATFEED en choisissant tes centres d\'intérêt.',
    robots: 'noindex, nofollow',
  },
  admin: {
    title: 'Administration — MAATFEED',
    description: 'Interface d\'administration MAATFEED.',
    robots: 'noindex, nofollow',
  },
  notFound: {
    title: 'Page non trouvée — MAATFEED',
    description: 'La page que tu cherches n\'existe pas sur MAATFEED.',
    robots: 'noindex, nofollow',
  },
  notifications: {
    title: 'Notifications — MAATFEED',
    description: 'Centre de notifications MAATFEED.',
    robots: 'noindex, nofollow',
  },
  premium: {
    title: 'Premium — MAATFEED',
    description: 'Découvre les offres Premium MAATFEED.',
    robots: 'noindex, nofollow',
  },
};

// Données structurées Schema.org pour rich snippets
export const structuredData = {
  // Organization schema
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MAATFEED',
    url: 'https://maatfeed.com',
    logo: 'https://maatfeed.com/favicon_io/android-chrome-512x512.png',
    description: 'Plateforme de contenus, débats et audio autour du savoir africain.',
    sameAs: [
      // À ajouter quand les comptes sociaux seront créés
      // 'https://twitter.com/maatfeed',
      // 'https://facebook.com/maatfeed',
      // 'https://instagram.com/maatfeed',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'contact@maatfeed.com', // À configurer
    },
  },
  
  // Website schema
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MAATFEED',
    url: 'https://maatfeed.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://maatfeed.com/explore?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  },
  
  // WebApplication schema pour les SPAs
  webApp: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'MAATFEED',
    applicationCategory: 'SocialNetworkingApplication',
    operatingSystem: 'Any',
    browserRequirements: 'requires HTML5 support',
    description: 'Plateforme sociale de débats et de découverte du savoir africain.',
    url: 'https://maatfeed.com',
    screenshot: 'https://maatfeed.com/og-image.png',
    featureList: [
      'Feed personnalisé',
      'Débats communautaires',
      'Contenus audio',
      'Profils IA',
      'Exploration thématique',
    ],
  },
};

// Type guards pour différencier les configurations
function hasTemplates(config: (typeof pageSEO)[keyof typeof pageSEO]): config is { 
  titleTemplate: (title: string) => string; 
  descriptionTemplate: (desc: string) => string; 
  robots: string; 
  priority: string; 
  changefreq: string;
} {
  return 'titleTemplate' in config;
}

function hasStaticMeta(config: (typeof pageSEO)[keyof typeof pageSEO]): config is {
  title: string;
  description: string;
  robots: string;
} {
  return 'title' in config && 'description' in config;
}

// Génération des métas par page
export function generatePageMeta(
  pageKey: keyof typeof pageSEO,
  params?: { title?: string; description?: string; image?: string; url?: string }
) {
  const config = pageSEO[pageKey];
  
  let title: string;
  let description: string;
  
  if (hasTemplates(config) && params?.title && params?.description) {
    // Pages avec templates dynamiques (content, debate)
    title = config.titleTemplate(params.title);
    description = config.descriptionTemplate(params.description);
  } else if (hasStaticMeta(config)) {
    // Pages avec métas statiques
    title = config.title;
    description = config.description;
  } else {
    // Fallback sur les métas par défaut du site
    title = siteSEO.defaultTitle;
    description = siteSEO.defaultDescription;
  }
  
  return {
    title,
    description,
    image: params?.image || siteSEO.ogImage,
    url: params?.url || siteSEO.canonicalUrl,
    robots: config.robots,
  };
}

// Génération du JSON-LD structuré
export function generateStructuredData(type: keyof typeof structuredData) {
  return JSON.stringify(structuredData[type]);
}

export default siteSEO;
