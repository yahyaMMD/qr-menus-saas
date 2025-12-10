const STATIC_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXTAUTH_URL;

const normalizeUrl = (url: string) => url.replace(/\/$/, "");

const getServerBaseUrl = () => {
  if (STATIC_BASE_URL) {
    return normalizeUrl(STATIC_BASE_URL);
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

const getClientBaseUrl = () => {
  if (STATIC_BASE_URL) {
    return normalizeUrl(STATIC_BASE_URL);
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getServerBaseUrl();
};

export type PublicMenuUrlOptions = {
  client?: boolean;
};

export function getPublicMenuUrl(
  menuId: string,
  options?: PublicMenuUrlOptions
) {
  const baseUrl = options?.client ? getClientBaseUrl() : getServerBaseUrl();
  return `${baseUrl}/menu/${menuId}`;
}
