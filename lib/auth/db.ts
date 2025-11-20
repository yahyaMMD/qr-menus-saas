import { Role } from './types';

/**
 * User data structure matching Prisma User model
 */
export interface UserData {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
}

export interface RefreshTokenData {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export async function findUserByEmail(email: string): Promise<UserData | null> {
  // for later: implement DB query
  return null;
}

export async function findUserById(id: string): Promise<UserData | null> {
  // for later:  implement DB query
  return null;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: Role;
}): Promise<UserData> {
  // for later:  implement DB query
  throw new Error('Database operation not implemented');
}

export async function saveRefreshToken(
  userId: string,
  token: string,
  expiresAt: Date
): Promise<RefreshTokenData> {
  // for later:  implement DB query
  throw new Error('Database operation not implemented');
}

export async function findRefreshToken(token: string): Promise<RefreshTokenData | null> {
  // for later:  implement DB query
  return null;
}

export async function deleteRefreshToken(token: string): Promise<boolean> {
  // for later:  implement DB query
  return false;
}

export async function deleteAllUserRefreshTokens(userId: string): Promise<number> {
  // for later:  implement DB query
  return 0;
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  // for later:  implement DB query
  return false;
}

export async function blacklistToken(token: string, expiresAt: Date): Promise<void> {
  // for later:  implement DB query
}


