import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetcher, mutationFetcher } from '../fetcher';

// Query keys
export const menuKeys = {
  all: ['menus'] as const,
  lists: () => [...menuKeys.all, 'list'] as const,
  list: (profileId: string) => [...menuKeys.lists(), profileId] as const,
  details: () => [...menuKeys.all, 'detail'] as const,
  detail: (menuId: string) => [...menuKeys.details(), menuId] as const,
  categories: (menuId: string) => [...menuKeys.detail(menuId), 'categories'] as const,
  items: (menuId: string) => [...menuKeys.detail(menuId), 'items'] as const,
  tags: (menuId: string) => [...menuKeys.detail(menuId), 'tags'] as const,
  types: (menuId: string) => [...menuKeys.detail(menuId), 'types'] as const,
  translations: (menuId: string) => [...menuKeys.detail(menuId), 'translations'] as const,
};

// Get menu by ID
export function useMenu(menuId: string, enabled = true) {
  return useQuery({
    queryKey: menuKeys.detail(menuId),
    queryFn: () => fetcher(`/api/menus/${menuId}`),
    enabled: enabled && !!menuId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get menus for a profile
export function useMenus(profileId: string, enabled = true) {
  return useQuery({
    queryKey: menuKeys.list(profileId),
    queryFn: () => fetcher<{ menus: unknown[] }>(`/api/profiles/${profileId}/menus`),
    enabled: enabled && !!profileId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get menu categories
export function useMenuCategories(menuId: string, enabled = true) {
  return useQuery({
    queryKey: menuKeys.categories(menuId),
    queryFn: () => fetcher<{ categories: unknown[] }>(`/api/menus/${menuId}/categories`),
    enabled: enabled && !!menuId,
    staleTime: 2 * 60 * 1000,
  });
}

// Get menu items
export function useMenuItems(menuId: string, enabled = true) {
  return useQuery({
    queryKey: menuKeys.items(menuId),
    queryFn: () => fetcher<{ items: unknown[] }>(`/api/menus/${menuId}/items`),
    enabled: enabled && !!menuId,
    staleTime: 2 * 60 * 1000,
  });
}

// Get menu tags
export function useMenuTags(menuId: string, enabled = true) {
  return useQuery({
    queryKey: menuKeys.tags(menuId),
    queryFn: () => fetcher<{ tags: unknown[] }>(`/api/menus/${menuId}/tags`),
    enabled: enabled && !!menuId,
    staleTime: 2 * 60 * 1000,
  });
}

// Get menu types
export function useMenuTypes(menuId: string, enabled = true) {
  return useQuery({
    queryKey: menuKeys.types(menuId),
    queryFn: () => fetcher<{ types: unknown[] }>(`/api/menus/${menuId}/types`),
    enabled: enabled && !!menuId,
    staleTime: 2 * 60 * 1000,
  });
}

// Get menu translations
export function useMenuTranslations(menuId: string, enabled = true) {
  return useQuery({
    queryKey: menuKeys.translations(menuId),
    queryFn: () => fetcher<{ translations: unknown[] }>(`/api/menus/${menuId}/translations`),
    enabled: enabled && !!menuId,
    staleTime: 2 * 60 * 1000,
  });
}

// Create menu mutation
export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { profileId: string; name: string; description?: string; isActive?: boolean }) =>
      mutationFetcher(`/api/profiles/${data.profileId}/menus`, {
        method: 'POST',
        body: data,
      }),
    onSuccess: (_, variables) => {
      // Invalidate menus list for the profile
      queryClient.invalidateQueries({ queryKey: menuKeys.list(variables.profileId) });
    },
  });
}

// Update menu mutation
export function useUpdateMenu(menuId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { isActive?: boolean; name?: string; description?: string }) =>
      mutationFetcher(`/api/menus/${menuId}`, {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      // Invalidate menu detail and related queries
      queryClient.invalidateQueries({ queryKey: menuKeys.detail(menuId) });
    },
  });
}

// Delete menu mutation
export function useDeleteMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (menuId: string) =>
      mutationFetcher(`/api/menus/${menuId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      // Invalidate all menu queries
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
  });
}

// Create category mutation
export function useCreateCategory(menuId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; image?: string }) =>
      mutationFetcher(`/api/menus/${menuId}/categories`, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.categories(menuId) });
    },
  });
}

// Update category mutation
export function useUpdateCategory(menuId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, ...data }: { categoryId: string; name: string; image?: string }) =>
      mutationFetcher(`/api/menus/${menuId}/categories/${categoryId}`, {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.categories(menuId) });
    },
  });
}

// Delete category mutation
export function useDeleteCategory(menuId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) =>
      mutationFetcher(`/api/menus/${menuId}/categories/${categoryId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.categories(menuId) });
      queryClient.invalidateQueries({ queryKey: menuKeys.items(menuId) });
    },
  });
}

// Create item mutation
export function useCreateItem(menuId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: unknown) =>
      mutationFetcher(`/api/menus/${menuId}/items`, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.items(menuId) });
    },
  });
}

// Update item mutation
export function useUpdateItem(menuId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, ...data }: { itemId: string; [key: string]: unknown }) =>
      mutationFetcher(`/api/menus/${menuId}/items/${itemId}`, {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.items(menuId) });
    },
  });
}

// Delete item mutation
export function useDeleteItem(menuId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) =>
      mutationFetcher(`/api/menus/${menuId}/items/${itemId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.items(menuId) });
    },
  });
}

// Create tag mutation
export function useCreateTag(menuId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; color: string }) =>
      mutationFetcher(`/api/menus/${menuId}/tags`, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.tags(menuId) });
    },
  });
}

// Delete tag mutation
export function useDeleteTag(menuId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) =>
      mutationFetcher(`/api/menus/${menuId}/tags/${tagId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.tags(menuId) });
      queryClient.invalidateQueries({ queryKey: menuKeys.items(menuId) });
    },
  });
}

// Create type mutation
export function useCreateType(menuId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; image?: string }) =>
      mutationFetcher(`/api/menus/${menuId}/types`, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.types(menuId) });
    },
  });
}

// Delete type mutation
export function useDeleteType(menuId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (typeId: string) =>
      mutationFetcher(`/api/menus/${menuId}/types/${typeId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.types(menuId) });
      queryClient.invalidateQueries({ queryKey: menuKeys.items(menuId) });
    },
  });
}

// Update languages mutation
export function useUpdateLanguages(menuId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { defaultLanguage: string; supportedLanguages: string[] }) =>
      mutationFetcher(`/api/menus/${menuId}/languages`, {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.detail(menuId) });
    },
  });
}

// Save translation mutation
export function useSaveTranslation(menuId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { entityType: string; entityId: string; languageCode: string; field: string; value: string }) =>
      mutationFetcher(`/api/menus/${menuId}/translations`, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.translations(menuId) });
    },
  });
}

