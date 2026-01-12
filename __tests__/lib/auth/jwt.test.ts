import {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
} from '@/lib/auth/jwt';
import { JWTPayload, Role } from '@/lib/auth/types';

describe('JWT utilities', () => {
  const mockPayload: Omit<JWTPayload, 'type'> = {
    userId: 'user123',
    email: 'test@example.com',
    role: Role.RESTAURANT_OWNER,
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(mockPayload);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(mockPayload);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('generateTokens', () => {
    it('should generate both access and refresh tokens', () => {
      const tokens = generateTokens(mockPayload);
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(tokens.accessToken).toBeTruthy();
      expect(tokens.refreshToken).toBeTruthy();
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = verifyAccessToken(token);
      
      expect(decoded).toBeTruthy();
      expect(decoded?.userId).toBe(mockPayload.userId);
      expect(decoded?.email).toBe(mockPayload.email);
      expect(decoded?.role).toBe(mockPayload.role);
      expect(decoded?.type).toBe('access');
    });

    it('should return null for invalid token', () => {
      const decoded = verifyAccessToken('invalid.token.here');
      expect(decoded).toBeNull();
    });

    it('should return null for refresh token used as access token', () => {
      const refreshToken = generateRefreshToken(mockPayload);
      const decoded = verifyAccessToken(refreshToken);
      expect(decoded).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(mockPayload);
      const decoded = verifyRefreshToken(token);
      
      expect(decoded).toBeTruthy();
      expect(decoded?.type).toBe('refresh');
    });

    it('should return null for invalid token', () => {
      const decoded = verifyRefreshToken('invalid.token.here');
      expect(decoded).toBeNull();
    });

    it('should return null for access token used as refresh token', () => {
      const accessToken = generateAccessToken(mockPayload);
      const decoded = verifyRefreshToken(accessToken);
      expect(decoded).toBeNull();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      const token = 'test-token-123';
      const header = `Bearer ${token}`;
      expect(extractTokenFromHeader(header)).toBe(token);
    });

    it('should handle case-insensitive Bearer', () => {
      const token = 'test-token-123';
      expect(extractTokenFromHeader(`bearer ${token}`)).toBe(token);
      expect(extractTokenFromHeader(`BEARER ${token}`)).toBe(token);
    });

    it('should handle double Bearer prefix', () => {
      const token = 'test-token-123';
      const header = `Bearer Bearer ${token}`;
      expect(extractTokenFromHeader(header)).toBe(token);
    });

    it('should extract raw token without Bearer', () => {
      const token = 'test-token-123';
      expect(extractTokenFromHeader(token)).toBe(token);
    });

    it('should return null for null header', () => {
      expect(extractTokenFromHeader(null)).toBeNull();
    });

    it('should return null for empty header', () => {
      expect(extractTokenFromHeader('')).toBeNull();
    });

    it('should handle extra spaces', () => {
      const token = 'test-token-123';
      expect(extractTokenFromHeader(`  Bearer   ${token}  `)).toBe(token);
    });
  });
});

