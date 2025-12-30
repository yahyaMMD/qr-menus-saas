import { useQuery } from '@tanstack/react-query';
import { fetcher } from '../fetcher';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
};

// Get dashboard data
export function useDashboard(enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: () => fetcher('/api/dashboard'),
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

