import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Secure cookie options for httpOnly cookies
 */
export const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict' as const,
  path: '/',
  // Max age for access token (15 minutes)
  accessTokenMaxAge: 15 * 60, // 15 minutes in seconds
  // Max age for refresh token (7 days)
  refreshTokenMaxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

/**
 * Get access token from cookies
 */
export function getAccessToken(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value || null;
}

/**
 * Get refresh token from cookies
 */
export function getRefreshToken(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value || null;
}

/**
 * Set access token in httpOnly cookie
 */
export function setAccessTokenCookie(
  response: NextResponse,
  token: string
): void {
  response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, token, {
    ...cookieOptions,
    maxAge: cookieOptions.accessTokenMaxAge,
  });
}

/**
 * Set refresh token in httpOnly cookie
 */
export function setRefreshTokenCookie(
  response: NextResponse,
  token: string
): void {
  response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, token, {
    ...cookieOptions,
    maxAge: cookieOptions.refreshTokenMaxAge,
  });
}

/**
 * Set both access and refresh tokens in httpOnly cookies
 */
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  setAccessTokenCookie(response, accessToken);
  setRefreshTokenCookie(response, refreshToken);
}

/**
 * Clear both auth cookies
 */
export function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete(COOKIE_NAMES.ACCESS_TOKEN);
  response.cookies.delete(COOKIE_NAMES.REFRESH_TOKEN);
}

/**
 * Clear access token cookie only
 */
export function clearAccessTokenCookie(response: NextResponse): void {
  response.cookies.delete(COOKIE_NAMES.ACCESS_TOKEN);
}


