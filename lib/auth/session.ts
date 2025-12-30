/**
 * @deprecated Tokens are now stored in httpOnly cookies and cannot be accessed from client-side code.
 * Use credentials: 'include' in fetch requests instead of manually adding Authorization headers.
 * The server middleware will automatically read tokens from cookies.
 */
export function getStoredAccessToken(): string | null {
  // Tokens are now in httpOnly cookies, not accessible from JavaScript
  // This function returns null to indicate tokens should be read from cookies by the server
  return null;
}

/**
 * @deprecated Tokens are now stored in httpOnly cookies.
 * Use credentials: 'include' in fetch requests instead.
 * The server middleware will automatically read tokens from cookies.
 */
export function buildAuthHeaders(): Record<string, string> {
  // Tokens are in httpOnly cookies, automatically sent with requests
  // No need to manually add Authorization headers
  return {};
}
