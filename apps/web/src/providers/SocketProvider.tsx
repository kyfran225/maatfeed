import React, { createContext, useContext, ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';

interface SocketContextType {
  socket: any;
  isConnected: boolean;
  updatePresence: (status: 'online' | 'away' | 'busy') => void;
  joinRoom: (roomId: string, type: 'debate' | 'user', metadata?: any) => void;
  leaveRoom: (roomId: string) => void;
  joinDebate: (debateId: string) => void;
  leaveDebate: (debateId: string) => void;
  setTyping: (debateId: string, isTyping: boolean) => void;
  markNotificationRead: (notificationId: string) => void;
  on: (event: string, callback: (data: any) => void) => () => void;
  off: (event: string, callback?: (data: any) => void) => void;
  reconnect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socketHooks = useSocket();

  const contextValue: SocketContextType = {
    ...socketHooks,
    on: socketHooks.on as any,
    off: socketHooks.off as any
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
