/**
 * Base fetcher function for React Query
 * Handles authentication via httpOnly cookies automatically
 */

export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    const errorObj = new Error(error.error || `HTTP error! status: ${response.status}`);
    (errorObj as any).status = response.status;
    throw errorObj;
  }

  return response.json();
}

/**
 * Mutation fetcher for POST/PUT/PATCH/DELETE requests
 */
export async function mutationFetcher<T>(
  url: string,
  options: {
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
  }
): Promise<T> {
  const response = await fetch(url, {
    method: options.method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    const errorObj = new Error(error.error || `HTTP error! status: ${response.status}`);
    (errorObj as any).status = response.status;
    throw errorObj;
  }

  return response.json();
}

