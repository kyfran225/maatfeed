/**
 * MAATFEED - Composant SEO dynamique
 * 
 * Ce composant permet de mettre à jour les métadonnées de la page
 * de manière dynamique pour chaque route de l'application React.
 * 
 * Usage:
 * <SEO 
 *   title="Titre de la page"
 *   description="Description de la page"
 *   image="https://maatfeed.com/custom-image.png"
 *   url="https://maatfeed.com/page"
 *   type="article"
 * />
 */

import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { siteSEO, generateStructuredData, generatePageMeta } from '../../config/seo';

export interface SEOProps {
  /** Titre de la page (sans le suffixe site) */
  title?: string;
  /** Description de la page */
  description?: string;
  /** URL de l'image Open Graph */
  image?: string;
  /** URL canonique de la page */
  url?: string;
  /** Type Open Graph: 'website' | 'article' | 'video' | 'profile' */
  type?: 'website' | 'article' | 'video' | 'profile';
  /** Mots-clés spécifiques à la page */
  keywords?: string[];
  /** Instructions pour les robots */
  robots?: string;
  /** Date de publication (pour articles) */
  publishedTime?: string;
  /** Date de modification (pour articles) */
  modifiedTime?: string;
  /** Auteur du contenu */
  author?: string;
  /** Clé de page prédéfinie pour utiliser la config SEO */
  pageKey?: 'home' | 'explore' | 'community' | 'audio' | 'content' | 'debate' | 'auth' | 'register' | 'profile' | 'onboarding' | 'admin' | 'notFound' | 'notifications' | 'premium';
  /** Données structurées JSON-LD supplémentaires */
  structuredData?: object;
  /** Balise canonical personnalisée (sinon générée automatiquement) */
  canonical?: string;
  /** Langue de la page */
  lang?: string;
  /** Hreflang alternatifs */
  alternates?: { lang: string; url: string }[];
}

export function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  keywords,
  robots,
  publishedTime,
  modifiedTime,
  author,
  pageKey,
  structuredData: customStructuredData,
  canonical,
  lang = 'fr',
  alternates,
}: SEOProps) {
  // Si pageKey est fourni, utiliser la configuration prédéfinie
  const pageMeta = pageKey 
    ? generatePageMeta(pageKey, { title, description, image, url })
    : null;

  // Valeurs finales
  const finalTitle = pageMeta?.title || title || siteSEO.defaultTitle;
  const finalDescription = pageMeta?.description || description || siteSEO.defaultDescription;
  const finalImage = image || siteSEO.ogImage;
  const finalUrl = canonical || url || (typeof window !== 'undefined' ? window.location.href : siteSEO.canonicalUrl);
  const finalRobots = robots || pageMeta?.robots || 'index, follow';
  const finalKeywords = keywords?.join(', ') || '';

  // Mise à jour du titre du document (pour les SPA)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = finalTitle;
      
      // Mise à jour des métas pour les crawlers JS (Googlebot execute JS)
      updateMetaTag('description', finalDescription);
      updateMetaTag('keywords', finalKeywords);
      updateMetaTag('robots', finalRobots);
      updateMetaTag('og:title', finalTitle, 'property');
      updateMetaTag('og:description', finalDescription, 'property');
      updateMetaTag('og:image', finalImage, 'property');
      updateMetaTag('og:url', finalUrl, 'property');
      updateMetaTag('twitter:title', finalTitle);
      updateMetaTag('twitter:description', finalDescription);
      updateMetaTag('twitter:image', finalImage);
      updateCanonicalLink(finalUrl);
    }
  }, [finalTitle, finalDescription, finalImage, finalUrl, finalRobots, finalKeywords]);

  // Helper pour mettre à jour les balises meta
  function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
    if (!content) return;
    let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  // Helper pour mettre à jour le lien canonical
  function updateCanonicalLink(href: string) {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  // Générer les données structurées par défaut si c'est une page d'article
  const defaultStructuredData = type === 'article' && !customStructuredData
    ? generateArticleStructuredData(finalTitle, finalDescription, finalImage, finalUrl, publishedTime, modifiedTime, author)
    : customStructuredData
      ? JSON.stringify(customStructuredData)
      : null;

  return (
    <Helmet>
      {/* Titre de base */}
      <title>{finalTitle}</title>
      
      {/* Métadonnées de base */}
      <meta name="description" content={finalDescription} />
      {finalKeywords && <meta name="keywords" content={finalKeywords} />}
      <meta name="robots" content={finalRobots} />
      
      {/* Canonical */}
      <link rel="canonical" href={finalUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteSEO.siteName} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1254" />
      <meta property="og:image:height" content="1254" />
      <meta property="og:locale" content={lang === 'fr' ? 'fr_FR' : 'en_US'} />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={siteSEO.social.twitterHandle} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      
      {/* Article spécifique */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Hreflang alternatifs */}
      {alternates?.map((alt) => (
        <link 
          key={alt.lang}
          rel="alternate" 
          hrefLang={alt.lang} 
          href={alt.url} 
        />
      ))}
      
      {/* Données structurées JSON-LD */}
      {defaultStructuredData && (
        <script type="application/ld+json">
          {defaultStructuredData}
        </script>
      )}
    </Helmet>
  );
}

// Générer les données structurées pour un article
function generateArticleStructuredData(
  title: string,
  description: string,
  image: string,
  url: string,
  publishedTime?: string,
  modifiedTime?: string,
  author?: string
): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: {
      '@type': 'ImageObject',
      url: image,
      width: 1254,
      height: 1254,
    },
    url: url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(publishedTime && { datePublished: publishedTime }),
    ...(modifiedTime && { dateModified: modifiedTime }),
    ...(author && {
      author: {
        '@type': 'Person',
        name: author,
      },
    }),
    publisher: {
      '@type': 'Organization',
      name: 'MAATFEED',
      logo: {
        '@type': 'ImageObject',
        url: 'https://maatfeed.com/favicon_io/android-chrome-512x512.png?v=20260508-circle',
      },
    },
  };
  return JSON.stringify(data);
}

// Composant SEO simplifié pour les pages qui utilisent pageKey
export function PageSEO({ pageKey, ...props }: { pageKey: SEOProps['pageKey'] } & Omit<SEOProps, 'pageKey'>) {
  return <SEO pageKey={pageKey} {...props} />;
}

export default SEO;
