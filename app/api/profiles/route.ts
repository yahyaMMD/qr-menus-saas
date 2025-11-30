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

// GET - List profiles or get user info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const listProfiles = searchParams.get('list');
  
  if (listProfiles === 'restaurants') {
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
            select: { id: true, name: true, isActive: true },
          },
          _count: {
            select: { menus: true, feedbacks: true },
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

  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

const createProfileSchema = z.object({
  name: z.string().min(1, { message: 'Restaurant name is required' }),
  description: z.string().optional(),
  logo: z.string().url().optional().nullable(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    wilaya: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
  socialLinks: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    tiktok: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
  }).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  wifiName: z.string().optional(),
  wifiPassword: z.string().optional(),
  mapUrl: z.string().url().optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parseResult = createProfileSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues },
      { status: 400 }
    );
  }

  const data = parseResult.data;

  try {
    const profile = await prisma.profile.create({
      data: {
        name: data.name,
        description: data.description || null,
        logo: data.logo || null,
        location: data.location as any,
        socialLinks: data.socialLinks as any,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        wifiName: data.wifiName || null,
        wifiPassword: data.wifiPassword || null,
        mapUrl: data.mapUrl || null,
        ownerId: user.id,
      },
      include: {
        menus: true,
        _count: { select: { menus: true, feedbacks: true } },
      },
    });

    return NextResponse.json(
      { message: 'Profile created successfully', profile },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create profile error:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}

const updateSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.email().optional(),
    currentPassword: z.string().min(1).optional(),
    newPassword: z
      .string()
      .min(8)
      .refine((val) => /[A-Z]/.test(val))
      .refine((val) => /[0-9]/.test(val))
      .refine((val) => /[!@#$%^&*()_\-+=\[{\]}:;"'<>,.?\/]/.test(val))
      .optional(),
  })
  .superRefine((data, ctx) => {
    if ((data.currentPassword && !data.newPassword) || (!data.currentPassword && data.newPassword)) {
      ctx.addIssue({
        path: ['currentPassword'],
        code: 'custom',
        message: 'Both current and new passwords are required to change your password',
      });
    }
    if (!data.name && !data.email && !data.newPassword) {
      ctx.addIssue({
        path: ['root'],
        code: 'custom',
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
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parseResult = updateSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues },
      { status: 400 }
    );
  }

  const data = parseResult.data;
  const updates: any = {};

  if (data.name && data.name !== user.name) updates.name = data.name;

  if (data.email && data.email !== user.email) {
    const existing = await findUserByEmail(data.email);
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: 'Email is already in use' }, { status: 409 });
    }
    updates.email = data.email;
  }

  if (data.newPassword) {
    const valid = await verifyPassword(user.password, data.currentPassword || '');
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }
    updates.password = await hashPassword(data.newPassword);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No changes detected' }, { status: 400 });
  }

  const updatedUser = await updateUser(user.id, updates);

  return NextResponse.json({
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    },
  });
}
