import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface SocketEvents {
  // Room events
  'room:joined': { roomId: string; type: string; memberCount: number };
  'room:left': { roomId: string };
  'join-room': { roomId: string; type: 'debate' | 'user'; metadata?: any };
  'leave-room': { roomId: string };

  // Debate events
  'debate:join': (debateId: string) => void;
  'debate:leave': (debateId: string) => void;
  'debate:typing': { debateId: string; isTyping: boolean };
  'user:joined': { userId: string; username: string };
  'user:left': { userId: string; username: string };
  'user:typing': { userId: string; username: string; isTyping: boolean };

  // Presence events
  'update-presence': { status: 'online' | 'away' | 'busy'; lastSeen?: Date };
  'presence:updated': { userId: string; status: string; lastSeen: Date };

  // Notification events
  'notification:read': (notificationId: string) => void;
  'notification:acknowledged': { notificationId: string };
  'notification:new': {
    id: string;
    type: string;
    title: string;
    message: string;
    data: any;
    priority: string;
    createdAt: Date;
    unreadCount: number;
  };
  'notification:unread-count': { unreadCount: number };

  // Real-time updates
  'content:updated': any;
  'debate:new-response': any;
  'user:online': { userId: string; username: string };
  'user:offline': { userId: string; username: string };
}

export const useSocket = () => {
  const { token, isAuthenticated, user } = useAuthStore();
  const socketRef = useRef<Socket<SocketEvents> | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!isAuthenticated || !token) return;

    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket.IO connected');
      reconnectAttempts.current = 0;
      
      // Update presence to online
      socket.emit('update-presence', { status: 'online' });
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      
      // Attempt reconnection if it wasn't intentional
      if (reason !== 'io client disconnect' && reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        setTimeout(() => {
          console.log(`Attempting reconnection ${reconnectAttempts.current}/${maxReconnectAttempts}`);
          connect();
        }, Math.pow(2, reconnectAttempts.current) * 1000); // Exponential backoff
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      reconnectAttempts.current++;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    // Auto-join user personal room
    socket.on('room:joined', ({ roomId }) => {
      if (roomId === `user:${user?.id}`) {
        console.log('Joined personal room');
      }
    });

  }, [isAuthenticated, token, user]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, token, connect, disconnect]);

  // Presence management
  const updatePresence = useCallback((status: 'online' | 'away' | 'busy') => {
    (socketRef.current as any)?.emit('update-presence', { status });
  }, []);

  // Room management
  const joinRoom = useCallback((roomId: string, type: 'debate' | 'user', metadata?: any) => {
    (socketRef.current as any)?.emit('join-room', { roomId, type, metadata });
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    (socketRef.current as any)?.emit('leave-room', { roomId });
  }, []);

  // Debate management
  const joinDebate = useCallback((debateId: string) => {
    (socketRef.current as any)?.emit('debate:join', debateId);
  }, []);

  const leaveDebate = useCallback((debateId: string) => {
    (socketRef.current as any)?.emit('debate:leave', debateId);
  }, []);

  const setTyping = useCallback((debateId: string, isTyping: boolean) => {
    (socketRef.current as any)?.emit('debate:typing', { debateId, isTyping });
  }, []);

  // Notification management
  const markNotificationRead = useCallback((notificationId: string) => {
    (socketRef.current as any)?.emit('notification:read', notificationId);
  }, []);

  // Event listeners management
  const on = useCallback((event: keyof SocketEvents, callback: (data: any) => void) => {
    socketRef.current?.on(event, callback as any);
    return () => {
      socketRef.current?.off(event, callback as any);
    };
  }, []);

  const off = useCallback((event: keyof SocketEvents, callback?: (data: any) => void) => {
    if (callback) {
      socketRef.current?.off(event, callback as any);
    } else {
      socketRef.current?.off(event);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    updatePresence,
    joinRoom,
    leaveRoom,
    joinDebate,
    leaveDebate,
    setTyping,
    markNotificationRead,
    on,
    off,
    reconnect: connect,
    disconnect
  };
};
