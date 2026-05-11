import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { logger } from "../config/logger.js";
import { advancedAnalyticsService, RealTimeMetrics } from "./advancedAnalyticsService.js";

// Real-time analytics types
export interface RealTimeEvent {
  type: 'user_action' | 'content_view' | 'page_view' | 'conversion' | 'error';
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  data: Record<string, any>;
}

export interface AnalyticsRoom {
  roomType: 'global' | 'creator' | 'content' | 'admin';
  roomId: string;
  members: Set<string>;
  lastActivity: Date;
}

export interface RealTimeAnalyticsConfig {
  updateInterval: number; // milliseconds
  maxRoomMembers: number;
  roomCleanupInterval: number;
  eventBufferSize: number;
}

class RealTimeAnalyticsService {
  private io: SocketIOServer | null = null;
  private rooms = new Map<string, AnalyticsRoom>();
  private eventBuffer: RealTimeEvent[] = [];
  private metricsUpdateInterval: NodeJS.Timeout | null = null;
  private roomCleanupInterval: NodeJS.Timeout | null = null;
  
  private readonly config: RealTimeAnalyticsConfig = {
    updateInterval: 5000, // 5 seconds
    maxRoomMembers: 100,
    roomCleanupInterval: 60000, // 1 minute
    eventBufferSize: 1000
  };

  /**
   * Initialize Socket.IO server for real-time analytics
   */
  initialize(httpServer: HTTPServer): void {
    try {
      this.io = new SocketIOServer(httpServer, {
        cors: {
          origin: process.env.FRONTEND_URL || "http://localhost:3000",
          methods: ["GET", "POST"]
        },
        transports: ['websocket', 'polling']
      });

      this.setupEventHandlers();
      this.startMetricsUpdates();
      this.startRoomCleanup();

      logger.info("[RealTimeAnalytics] Socket.IO server initialized");
    } catch (error) {
      logger.error({
        msg: "Failed to initialize real-time analytics",
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      logger.info(`[RealTimeAnalytics] Client connected: ${socket.id}`);

      // Handle room subscriptions
      socket.on('join_analytics_room', (data) => {
        this.handleRoomJoin(socket, data);
      });

      socket.on('leave_analytics_room', (data) => {
        this.handleRoomLeave(socket, data);
      });

      // Handle real-time event tracking
      socket.on('track_event', (event: RealTimeEvent) => {
        this.handleEventTracking(socket, event);
      });

      // Handle metrics requests
      socket.on('get_real_time_metrics', async () => {
        try {
          const metrics = await advancedAnalyticsService.getRealTimeMetrics();
          socket.emit('real_time_metrics', metrics);
        } catch (error) {
          socket.emit('error', { message: 'Failed to get real-time metrics' });
        }
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
        logger.info(`[RealTimeAnalytics] Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Handle room join requests
   */
  private handleRoomJoin(socket: any, data: { roomType: string; roomId: string; userId?: string }): void {
    const { roomType, roomId, userId } = data;
    const roomKey = `${roomType}:${roomId}`;

    // Validate room type
    if (!['global', 'creator', 'content', 'admin'].includes(roomType)) {
      socket.emit('error', { message: 'Invalid room type' });
      return;
    }

    // Check room capacity
    const room = this.rooms.get(roomKey);
    if (room && room.members.size >= this.config.maxRoomMembers) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    // Join socket.io room
    socket.join(roomKey);

    // Create or update room
    if (!this.rooms.has(roomKey)) {
      this.rooms.set(roomKey, {
        roomType: roomType as any,
        roomId,
        members: new Set(),
        lastActivity: new Date()
      });
    }

    const roomData = this.rooms.get(roomKey)!;
    roomData.members.add(socket.id);
    roomData.lastActivity = new Date();

    // Send current metrics to the new member
    this.sendCurrentMetrics(socket, roomType, roomId);

    // Notify others
    socket.to(roomKey).emit('user_joined', {
      userId,
      memberCount: roomData.members.size
    });

    logger.info(`[RealTimeAnalytics] User ${userId} joined room ${roomKey}`);
  }

  /**
   * Handle room leave requests
   */
  private handleRoomLeave(socket: any, data: { roomType: string; roomId: string }): void {
    const { roomType, roomId } = data;
    const roomKey = `${roomType}:${roomId}`;

    socket.leave(roomKey);

    const room = this.rooms.get(roomKey);
    if (room) {
      room.members.delete(socket.id);
      room.lastActivity = new Date();

      // Notify others
      socket.to(roomKey).emit('user_left', {
        memberCount: room.members.size
      });
    }

    logger.info(`[RealTimeAnalytics] Client left room ${roomKey}`);
  }

  /**
   * Handle event tracking
   */
  private handleEventTracking(socket: any, event: RealTimeEvent): void {
    // Add timestamp if not provided
    if (!event.timestamp) {
      event.timestamp = new Date();
    }

    // Add to buffer
    this.eventBuffer.push(event);

    // Trim buffer if too large
    if (this.eventBuffer.length > this.config.eventBufferSize) {
      this.eventBuffer = this.eventBuffer.slice(-this.config.eventBufferSize);
    }

    // Broadcast to relevant rooms
    this.broadcastEvent(event);
  }

  /**
   * Handle client disconnect
   */
  private handleDisconnect(socket: any): void {
    // Remove from all rooms
    for (const [roomKey, room] of this.rooms.entries()) {
      if (room.members.has(socket.id)) {
        room.members.delete(socket.id);
        room.lastActivity = new Date();

        // Notify others
        socket.to(roomKey).emit('user_left', {
          memberCount: room.members.size
        });
      }
    }
  }

  /**
   * Send current metrics to a client
   */
  private async sendCurrentMetrics(socket: any, roomType: string, roomId: string): Promise<void> {
    try {
      const metrics = await advancedAnalyticsService.getRealTimeMetrics();
      
      // Filter metrics based on room type
      let filteredMetrics = metrics;
      
      if (roomType === 'creator') {
        // Filter for creator-specific metrics
        filteredMetrics = {
          ...metrics,
          topPages: metrics.topPages.filter(page => 
            page.url.includes(`/creator/${roomId}`) || 
            page.url.includes(`/content/${roomId}`)
          )
        };
      } else if (roomType === 'content') {
        // Filter for content-specific metrics
        filteredMetrics = {
          ...metrics,
          currentPageViews: metrics.currentPageViews, // Would be filtered by content ID
          topPages: metrics.topPages.filter(page => page.url === `/content/${roomId}`)
        };
      }

      socket.emit('real_time_metrics', filteredMetrics);
    } catch (error) {
      socket.emit('error', { message: 'Failed to get current metrics' });
    }
  }

  /**
   * Broadcast event to relevant rooms
   */
  private broadcastEvent(event: RealTimeEvent): void {
    if (!this.io) return;

    // Broadcast to global room
    this.io.to('global:analytics').emit('real_time_event', event);

    // Broadcast to creator room if userId is available
    if (event.userId) {
      this.io.to(`creator:${event.userId}`).emit('real_time_event', event);
    }

    // Broadcast to content room if content data is available
    if (event.data.contentId) {
      this.io.to(`content:${event.data.contentId}`).emit('real_time_event', event);
    }
  }

  /**
   * Start periodic metrics updates
   */
  private startMetricsUpdates(): void {
    this.metricsUpdateInterval = setInterval(async () => {
      try {
        const metrics = await advancedAnalyticsService.getRealTimeMetrics();
        
        // Broadcast to all rooms
        this.io?.to('global:analytics').emit('real_time_metrics', metrics);
        
        // Send room-specific updates
        for (const [roomKey, room] of this.rooms.entries()) {
          if (room.members.size > 0) {
            let filteredMetrics = metrics;
            
            if (room.roomType === 'creator') {
              // Filter for creator metrics
              filteredMetrics = {
                ...metrics,
                topPages: metrics.topPages.filter(page => 
                  page.url.includes(`/creator/${room.roomId}`)
                )
              };
            } else if (room.roomType === 'content') {
              // Filter for content metrics
              filteredMetrics = {
                ...metrics,
                currentPageViews: metrics.currentPageViews,
                topPages: metrics.topPages.filter(page => page.url === `/content/${room.roomId}`)
              };
            }

            this.io?.to(roomKey).emit('real_time_metrics', filteredMetrics);
          }
        }
      } catch (error) {
        logger.error({
          msg: "Failed to broadcast metrics update",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }, this.config.updateInterval);
  }

  /**
   * Start room cleanup process
   */
  private startRoomCleanup(): void {
    this.roomCleanupInterval = setInterval(() => {
      const now = new Date();
      const roomsToRemove: string[] = [];

      for (const [roomKey, room] of this.rooms.entries()) {
        // Remove empty rooms or rooms inactive for more than 5 minutes
        if (room.members.size === 0 || (now.getTime() - room.lastActivity.getTime()) > 5 * 60 * 1000) {
          roomsToRemove.push(roomKey);
        }
      }

      roomsToRemove.forEach(roomKey => {
        this.rooms.delete(roomKey);
        logger.info(`[RealTimeAnalytics] Cleaned up inactive room: ${roomKey}`);
      });
    }, this.config.roomCleanupInterval);
  }

  /**
   * Broadcast custom event to specific room
   */
  broadcastToRoom(roomType: string, roomId: string, event: string, data: any): void {
    const roomKey = `${roomType}:${roomId}`;
    this.io?.to(roomKey).emit(event, data);
  }

  /**
   * Get room statistics
   */
  getRoomStats(): Array<{ roomKey: string; memberCount: number; roomType: string; roomId: string }> {
    return Array.from(this.rooms.entries()).map(([roomKey, room]) => ({
      roomKey,
      memberCount: room.members.size,
      roomType: room.roomType,
      roomId: room.roomId
    }));
  }

  /**
   * Get event buffer statistics
   */
  getEventBufferStats(): { size: number; eventsByType: Record<string, number> } {
    const eventsByType: Record<string, number> = {};
    
    this.eventBuffer.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });

    return {
      size: this.eventBuffer.length,
      eventsByType
    };
  }

  /**
   * Graceful shutdown
   */
  shutdown(): void {
    if (this.metricsUpdateInterval) {
      clearInterval(this.metricsUpdateInterval);
      this.metricsUpdateInterval = null;
    }

    if (this.roomCleanupInterval) {
      clearInterval(this.roomCleanupInterval);
      this.roomCleanupInterval = null;
    }

    if (this.io) {
      this.io.close();
      this.io = null;
    }

    this.rooms.clear();
    this.eventBuffer = [];

    logger.info("[RealTimeAnalytics] Service shut down");
  }
}

export const realTimeAnalyticsService = new RealTimeAnalyticsService();
