import { NextRequest } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader } from './jwt';
import { JWTPayload } from './types';
import { isTokenBlacklisted } from './db';
import { getAccessToken } from './cookies';

/*
Basically, this middleware does 3 things:
  - Extract the JWT token from httpOnly cookies (secure) or Authorization header (fallback)
  - Check if token is valid (signature + expiration) OR blacklisted.
  - Return the decoded payload OR an error
*/

export interface AuthResult {
  success: boolean;
  payload?: JWTPayload;
  error?: string;
}

/**
 * Authenticate a request by verifying the JWT token from httpOnly cookies
 * Falls back to Authorization header for backward compatibility
 * @param request - Next.js request object
 * @returns Authentication result with payload or error
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  // Prioritize httpOnly cookie (secure) over Authorization header
  let token = getAccessToken(request);
  
  // Fallback to Authorization header for backward compatibility
  if (!token) {
    const authHeader = request.headers.get('Authorization');
    token = extractTokenFromHeader(authHeader);
  }

  if (!token) {
    return {
      success: false,
      error: 'No authorization token provided',
    };
  }

  // Check blacklist with error handling
  try {
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return {
        success: false,
        error: 'Token has been revoked',
      };
    }
  } catch (err) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error checking token blacklist:', err);
    }
    return {
      success: false,
      error: 'Internal server error',
    };
  }

  // Verify token and validate payload shape
  try {
    const payload = verifyAccessToken(token);
    if (!payload) {
      return {
        success: false,
        error: 'Invalid or expired token',
      };
    }

    return {
      success: true,
      payload,
    };
  } catch (err) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Token verification error:', err);
    }
    return {
      success: false,
      error: 'Invalid or expired token',
    };
  }
}

export async function getAuthenticatedUser(request: NextRequest): Promise<JWTPayload | null> {
  const authResult = await authenticateRequest(request);
  return authResult.success ? authResult.payload || null : null;
}


