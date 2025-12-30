import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetcher, mutationFetcher } from '../fetcher';

// Query keys
export const profileKeys = {
  all: ['profiles'] as const,
  lists: () => [...profileKeys.all, 'list'] as const,
  details: () => [...profileKeys.all, 'detail'] as const,
  detail: (profileId: string) => [...profileKeys.details(), profileId] as const,
  analytics: (profileId: string) => [...profileKeys.detail(profileId), 'analytics'] as const,
  feedbacks: (profileId: string) => [...profileKeys.detail(profileId), 'feedbacks'] as const,
};

// Get all profiles for current user
export function useProfiles(enabled = true) {
  return useQuery({
    queryKey: profileKeys.lists(),
    queryFn: () => fetcher<{ profiles: unknown[] }>('/api/profiles'),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get profile by ID
export function useProfile(profileId: string, enabled = true) {
  return useQuery({
    queryKey: profileKeys.detail(profileId),
    queryFn: () => fetcher(`/api/profiles/${profileId}`),
    enabled: enabled && !!profileId,
    staleTime: 2 * 60 * 1000,
  });
}

// Get profile analytics
export function useProfileAnalytics(profileId: string, range: string = '30', enabled = true) {
  return useQuery({
    queryKey: [...profileKeys.analytics(profileId), range],
    queryFn: () => fetcher(`/api/profiles/${profileId}/analytics?range=${range}`),
    enabled: enabled && !!profileId,
    staleTime: 1 * 60 * 1000, // 1 minute (analytics change frequently)
  });
}

// Get profile feedbacks
export function useProfileFeedbacks(profileId: string, enabled = true) {
  return useQuery({
    queryKey: profileKeys.feedbacks(profileId),
    queryFn: () => fetcher(`/api/profiles/${profileId}/feedbacks`),
    enabled: enabled && !!profileId,
    staleTime: 2 * 60 * 1000,
  });
}

// Create profile mutation
export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: unknown) =>
      mutationFetcher('/api/profiles', {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
    },
  });
}

// Update profile mutation
export function useUpdateProfile(profileId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: unknown) =>
      mutationFetcher(`/api/profiles/${profileId}`, {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(profileId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
    },
  });
}

// Delete profile mutation
export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: string) =>
      mutationFetcher(`/api/profiles/${profileId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

