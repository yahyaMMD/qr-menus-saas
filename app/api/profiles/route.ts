import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateRequest } from '@/lib/auth/middleware';
import { findUserByEmail, findUserById, updateUser } from '@/lib/auth/db';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getAuthenticatedUser(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (!authResult.success || !authResult.payload) {
    return {
      response: NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      ),
    };
  }
  const user = await findUserById(authResult.payload.userId);
  if (!user) {
    return {
      response: NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      ),
    };
  }

  return { user };
}

export async function GET(request: NextRequest) {
  // Check if this is a restaurant profile request (has query param)
  const { searchParams } = new URL(request.url);
  const listProfiles = searchParams.get('list');
  
  if (listProfiles === 'restaurants') {
    // List restaurant profiles for authenticated user
    const result = await getAuthenticatedUser(request);
    if ('response' in result) {
      return result.response;
    }

    const { user } = result;

    try {
      const profiles = await prisma.profile.findMany({
        where: { ownerId: user.id },
        include: {
          menus: {
            select: {
              id: true,
              name: true,
              isActive: true,
            },
          },
          _count: {
            select: {
              menus: true,
              feedbacks: true,
            },
          },
        },
      });

      return NextResponse.json({ profiles }, { status: 200 });
    } catch (error) {
      console.error('Get profiles error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      );
    }
  }

  // Otherwise, we return user profile (default behavior)
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;

  return NextResponse.json(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    { status: 200 }
  );
}

const updateSchema = z
  .object({
    name: z.string().min(1, { message: 'Name is required' }).optional(),
    email: z.email({ message: 'Invalid email format' }).optional(),
    currentPassword: z.string().min(1, { message: 'Current password is required' }).optional(),
    newPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .refine((val) => /[A-Z]/.test(val), { message: 'Password must contain at least one uppercase letter' })
      .refine((val) => /[0-9]/.test(val), { message: 'Password must contain at least one number' })
      .refine((val) => /[!@#$%^&*()_\-+=\[{\]}:;"'<>,.?\/]/.test(val), {
        message: 'Password must contain at least one special character',
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if ((data.currentPassword && !data.newPassword) || (!data.currentPassword && data.newPassword)) {
      ctx.addIssue({
        path: ['currentPassword'],
        code: "custom",
        message: 'Both current and new passwords are required to change your password',
      });
    }
    if (!data.name && !data.email && !data.newPassword) {
      ctx.addIssue({
        path: ['root'],
        code:"custom",
        message: 'At least one field must be provided for update',
      });
    }
  });

export async function PATCH(request: NextRequest) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const parseResult = updateSchema.safeParse(body);
  if (!parseResult.success) {
    const formatted = z.treeifyError(parseResult.error);
    return NextResponse.json(
      { error: formatted },
      { status: 400 }
    );
  }

  const data = parseResult.data;
  const updates: Partial<Pick<typeof user, 'name' | 'email' | 'password'>> = {};

  if (data.name && data.name !== user.name) {
    updates.name = data.name;
  }

  if (data.email && data.email !== user.email) {
    const existing = await findUserByEmail(data.email);
    if (existing && existing.id !== user.id) {
      return NextResponse.json(
        { error: 'Email is already in use' },
        { status: 409 }
      );
    }
    updates.email = data.email;
  }

  if (data.newPassword) {
    const isCurrentValid = await verifyPassword(user.password, data.currentPassword || '');
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }
    updates.password = await hashPassword(data.newPassword);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: 'No changes detected' },
      { status: 400 }
    );
  }

  const updatedUser = await updateUser(user.id, updates);

  return NextResponse.json(
    {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    },
    { status: 200 }
  );
}
