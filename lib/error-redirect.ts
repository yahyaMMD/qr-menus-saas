/**
 * Error redirect utilities for handling API errors on the client side
 */

export type ErrorCode = 401 | 403 | 408 | 429 | 500;

export const ERROR_PAGES: Record<ErrorCode, string> = {
  401: '/unauthorized',
  403: '/forbidden',
  408: '/timeout',
  429: '/too-many-requests',
  500: '/error',
};

/**
 * Get the error page path for a given HTTP status code
 */
export function getErrorPagePath(statusCode: number): string | null {
  if (statusCode in ERROR_PAGES) {
    return ERROR_PAGES[statusCode as ErrorCode];
  }
  return null;
}

/**
 * Handle API response errors by redirecting to appropriate error pages
 * Use this in client components after fetch calls
 */
export function handleApiError(response: Response, router: { push: (path: string) => void }): boolean {
  const errorPath = getErrorPagePath(response.status);
  
  if (errorPath) {
    router.push(errorPath);
    return true;
  }
  
  return false;
}

/**
 * Create a fetch wrapper that automatically handles error redirects
 */
export async function fetchWithErrorHandling(
  url: string,
  options: RequestInit,
  router: { push: (path: string) => void }
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    // Don't redirect for successful responses or client errors that should be handled inline
    if (response.ok || response.status === 400 || response.status === 404) {
      return response;
    }
    
    // Redirect to error pages for specific status codes
    const errorPath = getErrorPagePath(response.status);
    if (errorPath) {
      router.push(errorPath);
    }
    
    return response;
  } catch (error) {
    // Network errors - redirect to timeout page
    router.push('/timeout');
    throw error;
  }
}

