import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { findUserById, updateUser } from '@/lib/auth/db';
import { prisma } from '@/lib/prisma';

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

// GET /api/user - Get current user profile
export async function GET(request: NextRequest) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;

  // Get additional user data from database
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      location: true,
      avatar: true,
      preferences: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          profiles: true,
          subscriptions: true,
        },
      },
    },
  });

  return NextResponse.json({
    user: fullUser,
  });
}

// PATCH /api/user - Update user profile
export async function PATCH(request: NextRequest) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;

  try {
    const body = await request.json();
    const { name, email, phone, location, avatar } = body;

    // Build update data
    const updateData: any = {};

    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Name must be at least 2 characters' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email address' },
          { status: 400 }
        );
      }

      // Check if email is already taken by another user
      if (email !== user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });
        if (existingUser) {
          return NextResponse.json(
            { error: 'Email is already in use' },
            { status: 400 }
          );
        }
      }
      updateData.email = email.toLowerCase().trim();
    }

    if (phone !== undefined) {
      updateData.phone = phone || null;
    }

    if (location !== undefined) {
      updateData.location = location || null;
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar || null;
    }

    // Update user
    const updatedUser = await updateUser(user.id, updateData);

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        location: updatedUser.location,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

