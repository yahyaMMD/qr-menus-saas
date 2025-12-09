import { Prisma } from '@prisma/client';
import { Role } from '@/lib/auth/types';
import { prisma } from '@/lib/prisma';

/**
 * User data structure matching Prisma User model
 */
export interface UserData {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  location?: string | null;
  avatar?: string | null;
  preferences?: Record<string, unknown> | null;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface RefreshTokenData {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export async function findUserByEmail(email: string): Promise<UserData | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    phone: user.phone,
    location: user.location,
    avatar: user.avatar,
    preferences: user.preferences as Record<string, unknown> | null,
    role: user.role as Role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function findUserById(id: string): Promise<UserData | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    phone: user.phone,
    location: user.location,
    avatar: user.avatar,
    preferences: user.preferences as Record<string, unknown> | null,
    role: user.role as Role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: Role;
}): Promise<UserData> {
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role ?? Role.USER,
      isActive: true,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    phone: user.phone,
    location: user.location,
    avatar: user.avatar,
    preferences: user.preferences as Record<string, unknown> | null,
    role: user.role as Role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function updateUser(
  id: string,
  data: Partial<Pick<UserData, 'name' | 'email' | 'password' | 'phone' | 'location' | 'avatar' | 'preferences' | 'isActive' | 'role'>>
): Promise<UserData> {
  const { preferences, ...rest } = data;
  const updateData: Prisma.UserUpdateInput = { ...rest };

  if (preferences !== undefined) {
    updateData.preferences = preferences as Prisma.InputJsonValue;
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    phone: user.phone,
    location: user.location,
    avatar: user.avatar,
    preferences: user.preferences as Record<string, unknown> | null,
    role: user.role as Role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function saveRefreshToken(
  userId: string,
  token: string,
  expiresAt: Date
): Promise<RefreshTokenData> {
  const refreshToken = await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return {
    id: refreshToken.id,
    userId: refreshToken.userId,
    token: refreshToken.token,
    expiresAt: refreshToken.expiresAt,
    createdAt: refreshToken.createdAt,
  };
}

export async function findRefreshToken(token: string): Promise<RefreshTokenData | null> {
  const refreshToken = await prisma.refreshToken.findUnique({ where: { token } });
  if (!refreshToken) return null;
  return {
    id: refreshToken.id,
    userId: refreshToken.userId,
    token: refreshToken.token,
    expiresAt: refreshToken.expiresAt,
    createdAt: refreshToken.createdAt,
  };
}

export async function deleteRefreshToken(token: string): Promise<boolean> {
  const result = await prisma.refreshToken.deleteMany({ where: { token } });
  return result.count > 0;
}

export async function deleteAllUserRefreshTokens(userId: string): Promise<number> {
  const result = await prisma.refreshToken.deleteMany({ where: { userId } });
  return result.count;
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const entry = await prisma.tokenBlacklist.findUnique({ where: { token } });
  return Boolean(entry);
}

export async function blacklistToken(token: string, expiresAt: Date): Promise<void> {
  await prisma.tokenBlacklist.create({
    data: {
      token,
      expiresAt,
    },
  });
}
