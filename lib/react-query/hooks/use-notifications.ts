import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetcher, mutationFetcher } from '../fetcher';

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
};

// Get notifications
export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => fetcher<{ notifications: unknown[] }>('/api/notifications'),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Get unread count
export function useUnreadNotifications(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => fetcher<{ count: number }>('/api/notifications?unread=true'),
    enabled,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

// Mark notification as read mutation
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      mutationFetcher(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        body: { read: true },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

// Mark all as read mutation
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      mutationFetcher('/api/notifications', {
        method: 'PATCH',
        body: { read: true },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

