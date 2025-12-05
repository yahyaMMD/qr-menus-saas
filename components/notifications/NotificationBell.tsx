'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  X, 
  CreditCard,
  Users,
  Star,
  QrCode,
  Settings,
  Shield,
  Sparkles,
  Clock,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationData {
  profileId?: string;
  profileName?: string;
  menuId?: string;
  menuName?: string;
  link?: string;
  [key: string]: any;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: NotificationData | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

const notificationIcons: Record<string, React.ReactNode> = {
  SUBSCRIPTION_ACTIVATED: <Sparkles className="w-5 h-5 text-green-500" />,
  SUBSCRIPTION_EXPIRING: <Clock className="w-5 h-5 text-amber-500" />,
  SUBSCRIPTION_EXPIRED: <AlertCircle className="w-5 h-5 text-red-500" />,
  SUBSCRIPTION_PAUSED: <Clock className="w-5 h-5 text-blue-500" />,
  SUBSCRIPTION_RESUMED: <Sparkles className="w-5 h-5 text-green-500" />,
  SUBSCRIPTION_CANCELLED: <AlertCircle className="w-5 h-5 text-gray-500" />,
  PAYMENT_SUCCESS: <CreditCard className="w-5 h-5 text-green-500" />,
  PAYMENT_FAILED: <CreditCard className="w-5 h-5 text-red-500" />,
  TEAM_INVITATION: <Users className="w-5 h-5 text-blue-500" />,
  TEAM_MEMBER_JOINED: <Users className="w-5 h-5 text-green-500" />,
  TEAM_MEMBER_LEFT: <Users className="w-5 h-5 text-gray-500" />,
  TEAM_ROLE_CHANGED: <Users className="w-5 h-5 text-amber-500" />,
  NEW_FEEDBACK: <Star className="w-5 h-5 text-yellow-500" />,
  MENU_PUBLISHED: <QrCode className="w-5 h-5 text-green-500" />,
  QR_SCAN_MILESTONE: <QrCode className="w-5 h-5 text-purple-500" />,
  SYSTEM_UPDATE: <Settings className="w-5 h-5 text-blue-500" />,
  SECURITY_ALERT: <Shield className="w-5 h-5 text-red-500" />,
  WELCOME: <Sparkles className="w-5 h-5 text-orange-500" />,
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      }

      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const offset = reset ? 0 : notifications.length;
      const response = await fetch(`/api/notifications?limit=10&offset=${offset}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;

      const data = await response.json();
      
      if (reset) {
        setNotifications(data.notifications);
      } else {
        setNotifications(prev => [...prev, ...data.notifications]);
      }
      
      setUnreadCount(data.unreadCount);
      setHasMore(data.notifications.length === 10);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [notifications.length]);

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications(true);

    // Poll for new notifications every 30 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchNotifications(true);
    }, 30000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark single notification as read
  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'mark-all-read' }),
      });

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    const link = notification.data?.link;
    if (link) {
      window.location.href = link;
    }
    setIsOpen(false);
  };

  // Load more
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No notifications yet</p>
                <p className="text-slate-400 text-sm">We'll notify you when something happens</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`group flex items-start gap-3 px-4 py-3 border-b border-slate-50 cursor-pointer transition-colors ${
                      notification.read
                        ? 'bg-white hover:bg-slate-50'
                        : 'bg-orange-50/50 hover:bg-orange-50'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      notification.read ? 'bg-slate-100' : 'bg-white shadow-sm'
                    }`}>
                      {notificationIcons[notification.type] || <Bell className="w-5 h-5 text-slate-400" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>
                          {notification.title}
                        </p>
                        <button
                          onClick={(e) => deleteNotification(notification.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className={`text-sm mt-0.5 line-clamp-2 ${notification.read ? 'text-slate-500' : 'text-slate-600'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        {!notification.read && (
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        )}
                        {notification.data?.link && (
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Load More */}
                {hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="w-full py-3 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load more'}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
              <a
                href="/dashboard/notifications"
                className="block text-center text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
              >
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

