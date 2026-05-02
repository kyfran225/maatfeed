import { useCallback, useEffect, useRef } from "react";
import { getJson, postJson } from "../services/httpClient";

interface FeedSessionState {
  sessionId: string;
  cursor?: string;
  activeIndex: number;
  watchedContent: string[];
  lastActivity: string;
}

interface SessionResponse {
  success: boolean;
  data: FeedSessionState;
}

export function useFeedSession() {
  const sessionRef = useRef<FeedSessionState | null>(null);
  const initializedRef = useRef(false);

  const initializeSession = useCallback(async (): Promise<FeedSessionState> => {
    if (sessionRef.current) {
      return sessionRef.current;
    }

    // Try to get existing session from server
    try {
      const response = await getJson<SessionResponse>("/api/feed/session");
      if (response.success && response.data) {
        sessionRef.current = response.data;
        return response.data;
      }
    } catch (error) {
      console.log("No existing session found, creating new one");
    }

    // Create new session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSession: FeedSessionState = {
      sessionId,
      activeIndex: 0,
      watchedContent: [],
      lastActivity: new Date().toISOString()
    };

    sessionRef.current = newSession;
    return newSession;
  }, []);

  const updateSession = useCallback(async (updates: Partial<FeedSessionState>) => {
    if (!sessionRef.current) return;

    const updatedSession = {
      ...sessionRef.current,
      ...updates,
      lastActivity: new Date().toISOString()
    };

    sessionRef.current = updatedSession;

    // Persist to server
    try {
      await postJson<SessionResponse>("/api/feed/session", updatedSession);
    } catch (error) {
      console.error("Failed to persist session state:", error);
    }
  }, []);

  const trackWatchedContent = useCallback((contentId: string) => {
    if (!sessionRef.current) return;

    const watchedContent = sessionRef.current.watchedContent || [];
    if (!watchedContent.includes(contentId)) {
      updateSession({
        watchedContent: [...watchedContent, contentId]
      });
    }
  }, [updateSession]);

  const updateActiveIndex = useCallback((index: number) => {
    updateSession({ activeIndex: index });
  }, [updateSession]);

  const updateCursor = useCallback((cursor: string) => {
    updateSession({ cursor });
  }, [updateSession]);

  const getSessionId = useCallback(() => {
    return sessionRef.current?.sessionId;
  }, []);

  // Auto-initialize on first use
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      initializeSession();
    }
  }, [initializeSession]);

  return {
    session: sessionRef.current,
    initializeSession,
    trackWatchedContent,
    updateActiveIndex,
    updateCursor,
    getSessionId
  };
}
