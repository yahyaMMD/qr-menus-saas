/**
 * Integration tests for authentication flow
 * Tests the complete flow from registration to login to token refresh
 */

import { hashPassword, verifyPassword } from '@/lib/auth/password';
import {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
} from '@/lib/auth/jwt';
import { Role } from '@/lib/auth/types';

describe('Authentication Flow Integration', () => {
  describe('Complete Registration and Login Flow', () => {
    it('should complete full registration flow', async () => {
      // 1. Hash password
      const password = 'TestPassword123!';
      const hashedPassword = await hashPassword(password);
      expect(hashedPassword).toBeTruthy();
      expect(hashedPassword).not.toBe(password);

      // 2. Verify password
      const isValid = await verifyPassword(hashedPassword, password);
      expect(isValid).toBe(true);

      // 3. Generate tokens
      const mockUser = {
        userId: 'user123',
        email: 'test@example.com',
        role: Role.RESTAURANT_OWNER,
      };

      const tokens = generateTokens(mockUser);
      expect(tokens.accessToken).toBeTruthy();
      expect(tokens.refreshToken).toBeTruthy();

      // 4. Verify tokens
      const accessPayload = verifyAccessToken(tokens.accessToken);
      expect(accessPayload).toBeTruthy();
      expect(accessPayload?.userId).toBe(mockUser.userId);
      expect(accessPayload?.type).toBe('access');

      const refreshPayload = verifyRefreshToken(tokens.refreshToken);
      expect(refreshPayload).toBeTruthy();
      expect(refreshPayload?.type).toBe('refresh');
    });

    it('should handle token refresh flow', () => {
      const mockUser = {
        userId: 'user123',
        email: 'test@example.com',
        role: Role.RESTAURANT_OWNER,
      };

      // Generate initial tokens
      const initialTokens = generateTokens(mockUser);
      const refreshPayload = verifyRefreshToken(initialTokens.refreshToken);

      expect(refreshPayload).toBeTruthy();

      // Generate new access token using refresh token payload
      if (refreshPayload) {
        const newAccessToken = generateAccessToken({
          userId: refreshPayload.userId,
          email: refreshPayload.email,
          role: refreshPayload.role,
        });

        const newPayload = verifyAccessToken(newAccessToken);
        expect(newPayload).toBeTruthy();
        expect(newPayload?.userId).toBe(mockUser.userId);
      }
    });

    it('should reject invalid password after registration', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await hashPassword(password);

      // Wrong password
      const isValid = await verifyPassword(hashedPassword, 'WrongPassword123!');
      expect(isValid).toBe(false);
    });

    it('should reject expired or invalid tokens', () => {
      // Invalid token format
      const invalidToken = 'invalid.token.here';
      expect(verifyAccessToken(invalidToken)).toBeNull();
      expect(verifyRefreshToken(invalidToken)).toBeNull();

      // Wrong token type
      const mockUser = {
        userId: 'user123',
        email: 'test@example.com',
        role: Role.RESTAURANT_OWNER,
      };

      const accessToken = generateAccessToken(mockUser);
      const refreshToken = generateRefreshToken(mockUser);

      // Try to use refresh token as access token
      expect(verifyAccessToken(refreshToken)).toBeNull();

      // Try to use access token as refresh token
      expect(verifyRefreshToken(accessToken)).toBeNull();
    });
  });
});

