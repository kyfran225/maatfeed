import { ContentModel, type IContent } from "../models/Content.js";
import { CommunityPostModel, type CommunityPostDocument } from "../models/CommunityPost.js";
import { ContentEnrichmentModel } from "../models/ContentEnrichment.js";
import type { Types } from "mongoose";

const BASE_URL = process.env.APP_BASE_URL || "https://maatfeed.com";
const ASSET_VERSION = "20260508-circle";
const DEFAULT_META = {
  title: "MAAT FEED - Culture & Apprentissage Africain",
  description: "Découvrez une culture africaine riche et diverse. MAAT FEED vous aide à apprendre et retenir ce qui compte vraiment.",
  image: `${BASE_URL}/og-image.webp?v=${ASSET_VERSION}`,
  type: "website" as const,
  keywords: ["culture africaine", "histoire", "apprentissage", "education", "kemet", "maat"]
};

export interface MetaTagsDTO {
  title: string;
  description: string;
  image?: string;
  type: "website" | "article" | "video";
  url: string;
  publishedAt?: string;
  modifiedAt?: string;
  author?: string;
  keywords: string[];
  // Open Graph
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  ogUrl: string;
  // Twitter Card
  twitterCard: "summary_large_image" | "summary";
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  // Schema.org
  schemaType: "Article" | "VideoObject" | "WebPage";
  schemaData: Record<string, unknown>;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export async function getContentMetaTags(contentId: string): Promise<MetaTagsDTO | null> {
  const contentDoc = await ContentModel.findById(contentId);
  if (!contentDoc || contentDoc.processingStatus !== "published") {
    return null;
  }
  const content = contentDoc.toObject() as IContent & { _id: Types.ObjectId };

  const enrichmentDoc = await ContentEnrichmentModel.findOne({ contentId });
  const enrichment = enrichmentDoc?.toObject() as { summary?: string } | undefined;
  
  const title = content.title || DEFAULT_META.title;
  const description = truncate(content.description || enrichment?.summary || DEFAULT_META.description, 160);
  const image = content.thumbnailUrl || DEFAULT_META.image;
  const url = `${BASE_URL}/content/${contentId}`;
  
  const keywords = [
    ...content.tags,
    "culture africaine",
    content.creatorName,
    content.mediaType === "video" ? "vidéo" : "audio"
  ].filter(Boolean);

  const isVideo = content.mediaType === "video";
  const schemaType = isVideo ? "VideoObject" : "Article";
  
  const schemaData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    headline: title,
    description: description,
    image: image,
    url: url,
    datePublished: content.publishedAt?.toISOString(),
    dateModified: content.updatedAt?.toISOString(),
    author: {
      "@type": "Person",
      name: content.creatorName || "MAAT FEED"
    },
    publisher: {
      "@type": "Organization",
      name: "MAAT FEED",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/favicon_io/android-chrome-192x192.png?v=${ASSET_VERSION}`
      }
    }
  };

  if (isVideo) {
    schemaData.duration = content.duration ? `PT${Math.floor(content.duration / 60)}M` : undefined;
    schemaData.contentUrl = content.mediaUrl;
    schemaData.thumbnailUrl = image;
  }

  return {
    title: `${title} | MAAT FEED`,
    description,
    image,
    type: isVideo ? "video" : "article",
    url,
    publishedAt: content.publishedAt?.toISOString(),
    modifiedAt: content.updatedAt?.toISOString(),
    author: content.creatorName,
    keywords,
    // Open Graph
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogType: isVideo ? "video.other" : "article",
    ogUrl: url,
    // Twitter
    twitterCard: "summary_large_image",
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    // Schema.org
    schemaType,
    schemaData
  };
}

export async function getCommunityPostMetaTags(postId: string): Promise<MetaTagsDTO | null> {
  const postDoc = await CommunityPostModel.findById(postId);
  if (!postDoc || postDoc.isHidden) {
    return null;
  }
  const post = postDoc.toObject() as CommunityPostDocument & { _id: Types.ObjectId };

  const title = post.title || "Discussion MAAT FEED";
  const description = truncate(post.content?.replace(/<[^>]*>/g, "").slice(0, 200) || DEFAULT_META.description, 160);
  const url = `${BASE_URL}/community/post/${postId}`;
  
  const keywords = [
    ...post.tags,
    "discussion",
    "communauté",
    "culture africaine"
  ].filter(Boolean);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: title,
    description: description,
    url: url,
    datePublished: post.createdAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: post.author ? {
      "@type": "Person",
      name: "Membre MAAT FEED"
    } : {
      "@type": "Organization",
      name: "MAAT FEED"
    },
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: { "@type": "CommentAction" },
      userInteractionCount: post.participantCount || 0
    }
  };

  return {
    title: `${title} | Échanges MAAT FEED`,
    description,
    type: "article",
    url,
    publishedAt: post.createdAt?.toISOString(),
    modifiedAt: post.updatedAt?.toISOString(),
    keywords,
    ogTitle: title,
    ogDescription: description,
    ogImage: DEFAULT_META.image,
    ogType: "article",
    ogUrl: url,
    twitterCard: "summary_large_image",
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: DEFAULT_META.image,
    schemaType: "Article",
    schemaData
  };
}

export function getDefaultMetaTags(path: string = "/"): MetaTagsDTO {
  const url = `${BASE_URL}${path}`;
  
  const pageSpecificTitles: Record<string, string> = {
    "/": "MAAT FEED - Culture & Apprentissage Africain",
    "/explore": "Explorer | MAAT FEED",
    "/community": "Échanges | MAAT FEED",
    "/audio": "Audio Kemet | MAAT FEED",
    "/sponsor": "Devenir Sponsor | MAAT FEED",
    "/premium": "Premium | MAAT FEED"
  };

  const title = pageSpecificTitles[path] || DEFAULT_META.title;

  return {
    title,
    description: DEFAULT_META.description,
    image: DEFAULT_META.image,
    type: "website",
    url,
    keywords: DEFAULT_META.keywords,
    ogTitle: title,
    ogDescription: DEFAULT_META.description,
    ogImage: DEFAULT_META.image,
    ogType: "website",
    ogUrl: url,
    twitterCard: "summary_large_image",
    twitterTitle: title,
    twitterDescription: DEFAULT_META.description,
    twitterImage: DEFAULT_META.image,
    schemaType: "WebPage",
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description: DEFAULT_META.description,
      url: url
    }
  };
}
