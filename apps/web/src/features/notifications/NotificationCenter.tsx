import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, BellRing, X, Check, CheckCheck, Settings, Trash2, Filter } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { 
  getNotifications, 
  getUnreadNotificationCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getNotificationUrl,
  isNotificationUnread,
  type NotificationItem 
} from '../../services/notificationService';
import { useAuthStore } from '../../stores';

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();
  const { token } = useAuthStore();

  // Load initial notifications
  const loadNotifications = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await getNotifications({
        unreadOnly: filter === 'unread',
        limit: 50
      });
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    if (!token) return;
    
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }, [token]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId 
            ? { ...n, status: 'read' as const, readAt: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Notify via socket - emit read event
      socket?.emit?.('notification:read', notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!token || unreadCount === 0) return;
    
    try {
      await markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, status: 'read' as const, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      
      // Notify via socket - no action needed for mark all as read
      // Socket update will come from server broadcast
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: NotificationItem) => {
    if (isNotificationUnread(notification)) {
      handleMarkAsRead(notification._id);
    }
    
    const url = getNotificationUrl(notification);
    if (url && url !== '/notifications') {
      window.location.href = url;
    }
    setIsOpen(false);
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket || !token) return;

    // Listen for new notifications - using any to bypass TypeScript issues
    (socket as any).on('notification:new', (data: any) => {
      const notification: NotificationItem = {
        _id: data.id,
        userId: token ? 'current-user' : '',
        type: data.type,
        title: data.title,
        message: data.message,
        status: 'delivered',
        createdAt: data.createdAt,
        data: data.data
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Listen for unread count updates
    (socket as any).on('notification:unread-count', (data: any) => {
      setUnreadCount(data.unreadCount);
    });

    return () => {
      socket.off('notification:new');
      socket.off('notification:unread-count');
    };
  }, [socket, token]);

  // Load notifications on mount and filter change
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Load unread count periodically
  useEffect(() => {
    if (!token) return;
    
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [token, loadUnreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(isNotificationUnread)
    : notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like_received':
      case 'save_received':
        return '❤️';
      case 'comment_reply':
        return '💬';
      case 'mention_received':
        return '🔔';
      case 'new_follower':
        return '👥';
      case 'content_published':
        return '📝';
      case 'trending_content':
        return '🔥';
      case 'security_alert':
        return '🛡️';
      case 'trust_level_upgraded':
        return '🏆';
      case 'system_announcement':
        return '📢';
      default:
        return '📄';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-6 h-6 text-orange-500 animate-pulse" />
        ) : (
          <Bell className="w-6 h-6" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
                  title="Tout marquer comme lu"
                >
                  <CheckCheck className="w-4 h-4" />
                  Tout lire
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors relative ${
                filter === 'unread'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Non lues
              {unreadCount > 0 && (
                <span className="ml-1 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                      isNotificationUnread(notification) ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {notification.title}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {isNotificationUnread(notification) && (
                              <button
                                onClick={(e) => handleMarkAsRead(notification._id, e)}
                                className="text-gray-400 hover:text-orange-500 transition-colors"
                                title="Marquer comme lu"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                window.location.href = '/notifications';
                setIsOpen(false);
              }}
              className="w-full text-center text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              Voir toutes les notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
