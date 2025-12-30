import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetcher, mutationFetcher } from '../fetcher';

// Query keys
export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  preferences: () => [...userKeys.all, 'preferences'] as const,
  billing: () => [...userKeys.all, 'billing'] as const,
};

// Get user profile
export function useUserProfile(enabled = true) {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => fetcher<{ user: unknown }>('/api/user'),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

// Get user preferences
export function useUserPreferences(enabled = true) {
  return useQuery({
    queryKey: userKeys.preferences(),
    queryFn: () => fetcher<{ preferences: unknown }>('/api/user/preferences'),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get billing history
export function useBillingHistory(enabled = true) {
  return useQuery({
    queryKey: userKeys.billing(),
    queryFn: () => fetcher<{ payments: unknown[] }>('/api/user/payments'),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

// Update user profile mutation
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: unknown) =>
      mutationFetcher('/api/user', {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}

// Update user preferences mutation
export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: unknown) =>
      mutationFetcher('/api/user/preferences', {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.preferences() });
    },
  });
}

// Change password mutation
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      mutationFetcher('/api/user/password', {
        method: 'PATCH',
        body: data,
      }),
  });
}

