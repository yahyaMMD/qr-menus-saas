import { useQuery } from '@tanstack/react-query';
import { fetcher } from '../fetcher';

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  menu: (menuId: string, days: string) => [...analyticsKeys.all, 'menu', menuId, days] as const,
};

// Get menu analytics
export function useMenuAnalytics(menuId: string, days: string = '30', enabled = true) {
  return useQuery({
    queryKey: analyticsKeys.menu(menuId, days),
    queryFn: () => fetcher(`/api/analytics?menuId=${menuId}&days=${days}`),
    enabled: enabled && !!menuId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

