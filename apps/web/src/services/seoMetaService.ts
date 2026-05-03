import api from "./api";

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
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  ogUrl: string;
  twitterCard: "summary_large_image" | "summary";
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  schemaType: "Article" | "VideoObject" | "WebPage";
  schemaData: Record<string, unknown>;
}

export async function getContentMetaTags(contentId: string): Promise<MetaTagsDTO> {
  const response = await api.get<MetaTagsDTO>(`/meta/content/${contentId}`);
  return response.data;
}

export async function getCommunityPostMetaTags(postId: string): Promise<MetaTagsDTO> {
  const response = await api.get<MetaTagsDTO>(`/meta/community/${postId}`);
  return response.data;
}

export async function getDefaultMetaTags(path: string = "/"): Promise<MetaTagsDTO> {
  const response = await api.get<MetaTagsDTO>(`/meta/default?path=${encodeURIComponent(path)}`);
  return response.data;
}
