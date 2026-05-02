import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAccessToken } from "../lib/authStorage";
import { useAuth } from "./useAuth";

const PARTICIPANT_EXPIRY_MS = 5_000;
const RECONNECT_DELAY_MS = 2_000;
const RENEW_TYPING_INTERVAL_MS = 2_500;

type TypingParticipant = {
  userId: string;
  displayName: string;
  avatar: string | null;
  profileImageUrl: string | null;
};

type ClientMessage =
  | {
      type: "join";
      contentId: string;
    }
  | {
      type: "typing";
      contentId: string;
      isTyping: boolean;
    };

type ServerMessage =
  | {
      type: "connected";
    }
  | {
      type: "joined";
      contentId: string;
    }
  | {
      type: "typing";
      contentId: string;
      isTyping: boolean;
      participant: TypingParticipant;
    };

function buildTypingSocketUrl(token?: string | null) {
  const url = new URL("/ws/discussions/typing", window.location.origin);
  url.protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

  if (token) {
    url.searchParams.set("token", token);
  }

  return url.toString();
}

export function useDiscussionTyping(contentId: string, enabled = true) {
  const { profile, isAuthenticated } = useAuth();
  const [participants, setParticipants] = useState<TypingParticipant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const connectTimeoutRef = useRef<number | null>(null);
  const typingRenewalIntervalRef = useRef<number | null>(null);
  const participantExpiryRef = useRef<Map<string, number>>(new Map());
  const isTypingRef = useRef(false);

  const clearParticipantExpiry = useCallback((userId: string) => {
    const timeoutId = participantExpiryRef.current.get(userId);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      participantExpiryRef.current.delete(userId);
    }
  }, []);

  const removeParticipant = useCallback((userId: string) => {
    clearParticipantExpiry(userId);
    setParticipants((current) => current.filter((participant) => participant.userId !== userId));
  }, [clearParticipantExpiry]);

  const refreshParticipant = useCallback((participant: TypingParticipant) => {
    if (participant.userId === profile?.id) {
      return;
    }

    clearParticipantExpiry(participant.userId);
    const timeoutId = window.setTimeout(() => {
      removeParticipant(participant.userId);
    }, PARTICIPANT_EXPIRY_MS);
    participantExpiryRef.current.set(participant.userId, timeoutId);

    setParticipants((current) => {
      const next = current.filter((entry) => entry.userId !== participant.userId);
      return [...next, participant];
    });
  }, [clearParticipantExpiry, profile?.id, removeParticipant]);

  const sendMessage = useCallback((message: ClientMessage) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify(message));
    return true;
  }, []);

  const stopRenewal = useCallback(() => {
    if (typingRenewalIntervalRef.current) {
      window.clearInterval(typingRenewalIntervalRef.current);
      typingRenewalIntervalRef.current = null;
    }
  }, []);

  const stopTyping = useCallback(() => {
    stopRenewal();

    if (isTypingRef.current && enabled && contentId) {
      sendMessage({
        type: "typing",
        contentId,
        isTyping: false
      });
    }

    isTypingRef.current = false;
  }, [contentId, enabled, sendMessage, stopRenewal]);

  const startTyping = useCallback(() => {
    if (!enabled || !contentId || !isAuthenticated) {
      return;
    }

    if (sendMessage({ type: "typing", contentId, isTyping: true })) {
      isTypingRef.current = true;
    }

    if (!typingRenewalIntervalRef.current) {
      typingRenewalIntervalRef.current = window.setInterval(() => {
        if (!enabled || !contentId || !isAuthenticated) {
          stopTyping();
          return;
        }

        if (!sendMessage({ type: "typing", contentId, isTyping: true })) {
          stopRenewal();
        }
      }, RENEW_TYPING_INTERVAL_MS);
    }
  }, [contentId, enabled, isAuthenticated, sendMessage, stopRenewal, stopTyping]);

  const handleDraftChange = useCallback((draft: string) => {
    if (!draft.trim()) {
      stopTyping();
      return;
    }

    startTyping();
  }, [startTyping, stopTyping]);

  useEffect(() => {
    if (!enabled || !contentId) {
      stopTyping();
      setParticipants([]);
      setIsConnected(false);
      return;
    }

    let isDisposed = false;

    const connect = () => {
      if (isDisposed) {
        return;
      }

      const socket = new WebSocket(buildTypingSocketUrl(getAccessToken()));
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        sendMessage({
          type: "join",
          contentId
        });
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data as string) as ServerMessage;

          if (payload.type !== "typing" || payload.contentId !== contentId) {
            return;
          }

          if (payload.isTyping) {
            refreshParticipant(payload.participant);
            return;
          }

          removeParticipant(payload.participant.userId);
        } catch {
          // Ignore malformed transient events from the socket.
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        socketRef.current = null;
        stopRenewal();

        if (!isDisposed) {
          reconnectTimeoutRef.current = window.setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };
    };

    connectTimeoutRef.current = window.setTimeout(connect, 0);

    return () => {
      isDisposed = true;
      stopTyping();
      setParticipants([]);
      setIsConnected(false);

      if (connectTimeoutRef.current) {
        window.clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      for (const timeoutId of participantExpiryRef.current.values()) {
        window.clearTimeout(timeoutId);
      }
      participantExpiryRef.current.clear();

      const socket = socketRef.current;
      if (socket) {
        socket.close();
      }
      socketRef.current = null;
    };
  }, [contentId, enabled, refreshParticipant, removeParticipant, sendMessage, stopRenewal, stopTyping]);

  const typingSummary = useMemo(() => {
    if (participants.length === 0) {
      return null;
    }

    const names = participants.map((participant) => participant.displayName || "Quelqu'un");

    if (names.length === 1) {
      return `${names[0]} est en train d'ecrire...`;
    }

    if (names.length === 2) {
      return `${names[0]} et ${names[1]} sont en train d'ecrire...`;
    }

    return `${names[0]} et ${names.length - 1} autres sont en train d'ecrire...`;
  }, [participants]);

  return {
    participants,
    typingSummary,
    isConnected,
    handleDraftChange,
    stopTyping
  };
}
