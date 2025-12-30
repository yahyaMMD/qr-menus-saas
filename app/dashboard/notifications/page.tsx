'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  CreditCard,
  Users,
  Star,
  QrCode,
  Settings,
  Shield,
  Sparkles,
  Clock,
  AlertCircle,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

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
  SUBSCRIPTION_ACTIVATED: <Sparkles className="w-6 h-6 text-green-500" />,
  SUBSCRIPTION_EXPIRING: <Clock className="w-6 h-6 text-amber-500" />,
  SUBSCRIPTION_EXPIRED: <AlertCircle className="w-6 h-6 text-red-500" />,
  SUBSCRIPTION_PAUSED: <Clock className="w-6 h-6 text-blue-500" />,
  SUBSCRIPTION_RESUMED: <Sparkles className="w-6 h-6 text-green-500" />,
  SUBSCRIPTION_CANCELLED: <AlertCircle className="w-6 h-6 text-gray-500" />,
  PAYMENT_SUCCESS: <CreditCard className="w-6 h-6 text-green-500" />,
  PAYMENT_FAILED: <CreditCard className="w-6 h-6 text-red-500" />,
  TEAM_INVITATION: <Users className="w-6 h-6 text-blue-500" />,
  TEAM_MEMBER_JOINED: <Users className="w-6 h-6 text-green-500" />,
  TEAM_MEMBER_LEFT: <Users className="w-6 h-6 text-gray-500" />,
  TEAM_ROLE_CHANGED: <Users className="w-6 h-6 text-amber-500" />,
  NEW_FEEDBACK: <Star className="w-6 h-6 text-yellow-500" />,
  MENU_PUBLISHED: <QrCode className="w-6 h-6 text-green-500" />,
  QR_SCAN_MILESTONE: <QrCode className="w-6 h-6 text-purple-500" />,
  SYSTEM_UPDATE: <Settings className="w-6 h-6 text-blue-500" />,
  SECURITY_ALERT: <Shield className="w-6 h-6 text-red-500" />,
  WELCOME: <Sparkles className="w-6 h-6 text-orange-500" />,
};

const typeLabels: Record<string, string> = {
  SUBSCRIPTION_ACTIVATED: 'Subscription',
  SUBSCRIPTION_EXPIRING: 'Subscription',
  SUBSCRIPTION_EXPIRED: 'Subscription',
  SUBSCRIPTION_PAUSED: 'Subscription',
  SUBSCRIPTION_RESUMED: 'Subscription',
  SUBSCRIPTION_CANCELLED: 'Subscription',
  PAYMENT_SUCCESS: 'Payment',
  PAYMENT_FAILED: 'Payment',
  TEAM_INVITATION: 'Team',
  TEAM_MEMBER_JOINED: 'Team',
  TEAM_MEMBER_LEFT: 'Team',
  TEAM_ROLE_CHANGED: 'Team',
  NEW_FEEDBACK: 'Feedback',
  MENU_PUBLISHED: 'Menu',
  QR_SCAN_MILESTONE: 'Analytics',
  SYSTEM_UPDATE: 'System',
  SECURITY_ALERT: 'Security',
  WELCOME: 'Welcome',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchNotifications(true);
  }, [filter]);

  const fetchNotifications = async (reset = false) => {
    try {
      if (reset) setLoading(true);

      const offset = reset ? 0 : notifications.length;
      const unreadOnly = filter === 'unread';
      const response = await fetch(
        `/api/notifications?limit=20&offset=${offset}&unreadOnly=${unreadOnly}`,
        { credentials: 'include' }
      );

      if (!response.ok) return;

      const data = await response.json();

      if (reset) {
        setNotifications(data.notifications);
      } else {
        setNotifications(prev => [...prev, ...data.notifications]);
      }

      setUnreadCount(data.unreadCount);
      setTotal(data.total);
      setHasMore(data.notifications.length === 20);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        credentials: 'include',
      });

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(n => n.id !== id));
      setTotal(prev => prev - 1);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    const link = notification.data?.link;
    if (link) {
      window.location.href = link;
    }
  };

  // Get unique types for filter
  const types = Array.from(new Set(notifications.map(n => n.type)));

  // Filter by type
  const filteredNotifications = typeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === typeFilter);

  // Group by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = format(new Date(notification.createdAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Today';
    }
    if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Yesterday';
    }
    return format(date, 'MMMM d, yyyy');
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
            >
              <CheckCheck className="w-5 h-5" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              All ({total})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'unread'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {types.length > 0 && (
            <>
              <div className="w-px h-6 bg-gray-200" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>{typeLabels[type] || type}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-500">
            {filter === 'unread' ? "You're all caught up!" : "You haven't received any notifications yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([date, dayNotifications]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1">
                {formatDateHeader(date)}
              </h3>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                {dayNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group flex items-start gap-4 p-4 cursor-pointer transition-colors ${notification.read ? 'bg-white hover:bg-gray-50' : 'bg-orange-50/50 hover:bg-orange-50'
                      }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${notification.read ? 'bg-gray-100' : 'bg-white shadow-sm'
                      }`}>
                      {notificationIcons[notification.type] || <Bell className="w-6 h-6 text-gray-400" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-orange-500 rounded-full" />
                            )}
                          </div>
                          <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                              {typeLabels[notification.type] || notification.type}
                            </span>
                            {notification.data?.link && (
                              <span className="flex items-center gap-1 text-xs text-orange-600">
                                View <ChevronRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <button
                onClick={() => fetchNotifications(false)}
                className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Load more notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

