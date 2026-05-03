import { useEffect, useState } from "react";
import { getContentMetaTags, getCommunityPostMetaTags, getDefaultMetaTags, type MetaTagsDTO } from "../services/seoMetaService";

interface UseSEOMetaResult {
  meta: MetaTagsDTO | null;
  loading: boolean;
  error: Error | null;
}

export function useContentSEOMeta(contentId: string | undefined): UseSEOMetaResult {
  const [meta, setMeta] = useState<MetaTagsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!contentId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadMeta() {
      if (!contentId) return;
      try {
        setLoading(true);
        const data = await getContentMetaTags(contentId);
        if (!cancelled) {
          setMeta(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to load meta tags"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMeta();

    return () => {
      cancelled = true;
    };
  }, [contentId]);

  return { meta, loading, error };
}

export function useCommunityPostSEOMeta(postId: string | undefined): UseSEOMetaResult {
  const [meta, setMeta] = useState<MetaTagsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!postId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadMeta() {
      if (!postId) return;
      try {
        setLoading(true);
        const data = await getCommunityPostMetaTags(postId);
        if (!cancelled) {
          setMeta(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to load meta tags"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMeta();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  return { meta, loading, error };
}

export function useDefaultSEOMeta(path: string = "/"): UseSEOMetaResult {
  const [meta, setMeta] = useState<MetaTagsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      try {
        setLoading(true);
        const data = await getDefaultMetaTags(path);
        if (!cancelled) {
          setMeta(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to load meta tags"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMeta();

    return () => {
      cancelled = true;
    };
  }, [path]);

  return { meta, loading, error };
}
