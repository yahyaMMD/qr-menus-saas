import * as jwt from "jsonwebtoken";
import { JWTPayload, AuthTokens } from "./types";

// Require JWT secrets from environment variables for security
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Missing required environment variables: JWT_SECRET and JWT_REFRESH_SECRET must be set in production'
    );
  }
  // In development, warn but allow fallback
  console.warn(
    'WARNING: JWT_SECRET and JWT_REFRESH_SECRET not set. Using fallback values. This is insecure and should only be used in development.'
  );
}

// Fallback only for development (should never be used in production)
const FALLBACK_SECRET = 'dev-secret-change-in-production';
const FALLBACK_REFRESH_SECRET = 'dev-refresh-secret-change-in-production';

const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export function generateAccessToken(payload: Omit<JWTPayload, "type">): string {
  const secret = (JWT_SECRET || FALLBACK_SECRET) as jwt.Secret;
  return jwt.sign(
    { ...payload, type: "access" },
    secret,
    { expiresIn: JWT_ACCESS_EXPIRES_IN } as jwt.SignOptions
  );
}

export function generateRefreshToken(payload: Omit<JWTPayload, "type">): string {
  const secret = (JWT_REFRESH_SECRET || FALLBACK_REFRESH_SECRET) as jwt.Secret;
  return jwt.sign(
    { ...payload, type: "refresh" },
    secret,
    { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
  );
}

export function generateTokens(payload: Omit<JWTPayload, "type">): AuthTokens {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const secret = (JWT_SECRET || FALLBACK_SECRET) as jwt.Secret;
    const decoded = jwt.verify(token, secret) as unknown;

    if (!decoded || typeof decoded !== 'object') return null;

    const d = decoded as Partial<JWTPayload>;

    // basic runtime validation
    if (d.type !== 'access') return null;
    if (!d.userId || !d.email || !d.role) return null;

    return d as JWTPayload;
  } catch (err) {
    return null;
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const secret = (JWT_REFRESH_SECRET || FALLBACK_REFRESH_SECRET) as jwt.Secret;
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded.type === "refresh" ? decoded : null;
  } catch {
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;

  // Accept 'Bearer <token>' case-insensitive and tolerate extra spaces
  const parts = authHeader.trim().split(/\s+/);
  
  // Handle double "Bearer Bearer" case (malformed header)
  if (parts.length >= 2 && /^Bearer$/i.test(parts[0])) {
    // If second part is also "Bearer", skip it and get the actual token
    const startIdx = /^Bearer$/i.test(parts[1]) ? 2 : 1;
    if (startIdx < parts.length) {
      return parts[startIdx];
    }
  }

  // Sometimes token is provided as the raw token (no scheme)
  if (parts.length === 1) return parts[0] || null;

  return null;
}