import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { verifyJWT } from '../utils/auth.js';

interface AuthenticatedSocket extends Socket {
  userId: string;
  userData: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

interface RoomData {
  roomId: string;
  type: 'user' | 'debate' | 'admin';
  members: Set<string>;
  metadata?: Record<string, any>;
}

export class SocketIOManager {
  private io: SocketIOServer | null = null;
  private rooms = new Map<string, RoomData>();
  private userSockets = new Map<string, Set<string>>(); // userId -> socketIds
  private socketUsers = new Map<string, string>(); // socketId -> userId

  constructor() {}

  async initialize(server: HTTPServer) {
    // Create Redis clients for adapter
    const pubClient = createClient({ url: env.REDIS_URL });
    const subClient = pubClient.duplicate();

    await Promise.all([
      pubClient.connect(),
      subClient.connect()
    ]);

    // Create Socket.IO server with Redis adapter
    this.io = new SocketIOServer(server, {
      cors: {
        origin: env.APP_BASE_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
      adapter: createAdapter(pubClient, subClient)
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    logger.info('Socket.IO server initialized with Redis adapter');
  }

  private setupMiddleware() {
    if (!this.io) return;

    // Authentication middleware
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = verifyJWT(token);
        socket.userId = decoded.userId;
        socket.userData = decoded;
        
        next();
      } catch (error) {
        logger.warn({ error: (error as Error).message }, 'Socket authentication failed');
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket;
      const userId = authSocket.userId;
      const socketId = authSocket.id;

      logger.info({ userId, socketId }, 'User connected via Socket.IO');

      // Track user connections
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socketId);
      this.socketUsers.set(socketId, userId);

      // Join user to their personal room
      this.joinRoom(authSocket, `user:${userId}`, 'user', { userId });

      // Join admin users to admin room
      if (authSocket.userData.role === 'admin') {
        this.joinRoom(authSocket, 'admin', 'admin', { role: 'admin' });
      }

      // Handle room management
      authSocket.on('join-room', (data: { roomId: string; type: 'debate' | 'user'; metadata?: any }) => {
        this.joinRoom(authSocket, data.roomId, data.type, data.metadata);
      });

      authSocket.on('leave-room', (data: { roomId: string }) => {
        this.leaveRoom(authSocket, data.roomId);
      });

      // Handle presence tracking
      authSocket.on('update-presence', (data: { status: 'online' | 'away' | 'busy'; lastSeen?: Date }) => {
        this.updateUserPresence(userId, data.status, data.lastSeen);
      });

      // Handle debate-specific events
      authSocket.on('debate:join', (debateId: string) => {
        this.joinRoom(authSocket, `debate:${debateId}`, 'debate', { debateId, userId });
        authSocket.to(`debate:${debateId}`).emit('user:joined', { userId, username: authSocket.userData.username });
      });

      authSocket.on('debate:leave', (debateId: string) => {
        this.leaveRoom(authSocket, `debate:${debateId}`);
        authSocket.to(`debate:${debateId}`).emit('user:left', { userId, username: authSocket.userData.username });
      });

      authSocket.on('debate:typing', (data: { debateId: string; isTyping: boolean }) => {
        authSocket.to(`debate:${data.debateId}`).emit('user:typing', {
          userId,
          username: authSocket.userData.username,
          isTyping: data.isTyping
        });
      });

      // Handle real-time notifications
      authSocket.on('notification:read', (notificationId: string) => {
        this.broadcastToUser(userId, 'notification:acknowledged', { notificationId });
      });

      // Handle disconnection
      authSocket.on('disconnect', (reason: string) => {
        logger.info({ userId, socketId, reason }, 'User disconnected from Socket.IO');
        
        // Clean up user connections
        this.userSockets.get(userId)?.delete(socketId);
        this.socketUsers.delete(socketId);

        // Remove from all rooms
        this.rooms.forEach((roomData, roomId) => {
          if (roomData.members.has(socketId)) {
            roomData.members.delete(socketId);
            
            // Notify room members if user left a debate
            if (roomData.type === 'debate') {
              authSocket.to(roomId).emit('user:left', { userId, username: authSocket.userData.username });
            }

            // Clean up empty rooms
            if (roomData.members.size === 0) {
              this.rooms.delete(roomId);
            }
          }
        });

        // Update presence to offline
        this.updateUserPresence(userId, 'offline', new Date());
      });
    });
  }

  private joinRoom(socket: AuthenticatedSocket, roomId: string, type: 'user' | 'debate' | 'admin', metadata?: any) {
    socket.join(roomId);
    
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        roomId,
        type,
        members: new Set(),
        metadata
      });
    }
    
    this.rooms.get(roomId)!.members.add(socket.id);
    
    logger.debug({ userId: socket.userId, roomId, type }, 'User joined room');
    
    // Notify user they joined successfully
    socket.emit('room:joined', { roomId, type, memberCount: this.rooms.get(roomId)!.members.size });
  }

  private leaveRoom(socket: AuthenticatedSocket, roomId: string) {
    socket.leave(roomId);
    
    const roomData = this.rooms.get(roomId);
    if (roomData) {
      roomData.members.delete(socket.id);
      
      if (roomData.members.size === 0) {
        this.rooms.delete(roomId);
      }
    }
    
    logger.debug({ userId: socket.userId, roomId }, 'User left room');
    socket.emit('room:left', { roomId });
  }

  private updateUserPresence(userId: string, status: 'online' | 'away' | 'busy' | 'offline', lastSeen?: Date) {
    // Store presence in Redis for persistence across server instances
    // This would be implemented with Redis commands
    
    // Broadcast presence update to user's personal room
    this.broadcastToUser(userId, 'presence:updated', {
      userId,
      status,
      lastSeen: lastSeen || new Date()
    });
  }

  // Public methods for external use
  public broadcastToUser(userId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public broadcastToRoom(roomId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(roomId).emit(event, data);
  }

  public broadcastToAdmins(event: string, data: any) {
    if (!this.io) return;
    this.io.to('admin').emit(event, data);
  }

  public getRoomMembers(roomId: string): string[] {
    const roomData = this.rooms.get(roomId);
    return roomData ? Array.from(roomData.members).map(socketId => this.socketUsers.get(socketId)).filter(Boolean) as string[] : [];
  }

  public getUserSockets(userId: string): string[] {
    return this.userSockets.has(userId) ? Array.from(this.userSockets.get(userId)!) : [];
  }

  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  public getRoomStats() {
    return {
      totalRooms: this.rooms.size,
      totalConnections: this.socketUsers.size,
      onlineUsers: this.userSockets.size,
      roomsByType: Array.from(this.rooms.values()).reduce((acc, room) => {
        acc[room.type] = (acc[room.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  public close(callback?: () => void) {
    if (this.io) {
      this.io.close(callback);
    }
  }
}

// Singleton instance
export const socketIOManager = new SocketIOManager();
