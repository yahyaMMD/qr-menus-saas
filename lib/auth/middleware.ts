import { NextRequest } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader } from './jwt';
import { JWTPayload } from './types';
import { isTokenBlacklisted } from './db';

/*
Basically, this middleware does 3 things:
  - Extract the JWT token from headers
  - Check if token is valid (signature + expiration) OR blacklisted.
  - Return the decoded payload OR an error
*/

export interface AuthResult {
  success: boolean;
  payload?: JWTPayload;
  error?: string;
}

/**
 * Authenticate a request by verifying the JWT token
 * @param request - Next.js request object
 * @returns Authentication result with payload or error
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return {
      success: false,
      error: 'No authorization token provided',
    };
  }

  const isBlacklisted = await isTokenBlacklisted(token);
  if (isBlacklisted) {
    return {
      success: false,
      error: 'Token has been revoked',
    };
  }

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
}

export async function getAuthenticatedUser(request: NextRequest): Promise<JWTPayload | null> {
  const authResult = await authenticateRequest(request);
  return authResult.success ? authResult.payload || null : null;
}


