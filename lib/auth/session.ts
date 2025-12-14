type TokenPayload = { accessToken?: string };

function parseStoredTokens(value: string | null): string | null {
  if (!value) return null;
  try {
    const parsed: TokenPayload = JSON.parse(value);
    return parsed?.accessToken ?? null;
  } catch {
    return null;
  }
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const directToken = localStorage.getItem("accessToken");
  if (directToken) {
    return directToken;
  }

  const fromAuthTokens = parseStoredTokens(localStorage.getItem("authTokens"));
  if (fromAuthTokens) {
    return fromAuthTokens;
  }

  return parseStoredTokens(localStorage.getItem("auth"));
}

export function buildAuthHeaders(): Record<string, string> {
  const token = getStoredAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
