import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { fetcher, mutationFetcher } from '../fetcher';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

// Get current user
export function useAuth() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => fetcher<{ user: User }>('/api/auth?action=me'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      mutationFetcher<AuthResponse>('/api/auth?action=login', {
        method: 'POST',
        body: credentials,
      }),
    onSuccess: (data) => {
      // Invalidate and refetch user data
      queryClient.setQueryData(authKeys.me(), { user: data.user });
      router.push('/');
    },
  });
}

// Register mutation
export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      mutationFetcher<AuthResponse>('/api/auth?action=register', {
        method: 'POST',
        body: data,
      }),
    onSuccess: (data) => {
      // Invalidate and refetch user data
      queryClient.setQueryData(authKeys.me(), { user: data.user });
      router.push('/');
    },
  });
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () =>
      mutationFetcher<{ message: string }>('/api/auth?action=logout', {
        method: 'POST',
      }),
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      router.push('/auth/login');
    },
  });
}

// Refresh token mutation
export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      mutationFetcher<{ message: string }>('/api/auth?action=refresh', {
        method: 'POST',
      }),
    onSuccess: () => {
      // Refetch user data after token refresh
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

