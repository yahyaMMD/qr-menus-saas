import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { findUserById } from '@/lib/auth/db';
import { prisma } from '@/lib/prisma';

// GET /api/user/preferences - Get user preferences
export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (!authResult.success || !authResult.payload) {
    return NextResponse.json(
      { error: authResult.error || 'Unauthorized' },
      { status: 401 }
    );
  }

  const user = await findUserById(authResult.payload.userId);
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  // Default preferences
  const defaultPreferences = {
    language: 'en',
    timezone: 'Africa/Algiers',
    currency: 'DZD',
    dateFormat: 'DD/MM/YYYY',
    notifications: {
      email: {
        feedback: true,
        menuScans: true,
        subscription: true,
        marketing: false,
      },
      push: {
        feedback: true,
        system: true,
      },
    },
  };

  // Merge with user preferences
  const preferences = {
    ...defaultPreferences,
    ...(user.preferences || {}),
  };

  return NextResponse.json({ preferences });
}

// PATCH /api/user/preferences - Update user preferences
export async function PATCH(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (!authResult.success || !authResult.payload) {
    return NextResponse.json(
      { error: authResult.error || 'Unauthorized' },
      { status: 401 }
    );
  }

  const user = await findUserById(authResult.payload.userId);
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();

    // Get current preferences
    const currentPreferences = (user.preferences as Record<string, unknown>) || {};

    // Merge new preferences with existing ones
    const updatedPreferences = {
      ...currentPreferences,
      ...body,
    };

    // Validate some preference values
    const validLanguages = ['en', 'fr', 'ar'];
    const validTimezones = ['Africa/Algiers', 'Europe/Paris', 'UTC'];
    const validCurrencies = ['DZD', 'EUR', 'USD'];
    const validDateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];

    if (body.language && !validLanguages.includes(body.language)) {
      return NextResponse.json(
        { error: 'Invalid language' },
        { status: 400 }
      );
    }

    if (body.timezone && !validTimezones.includes(body.timezone)) {
      return NextResponse.json(
        { error: 'Invalid timezone' },
        { status: 400 }
      );
    }

    if (body.currency && !validCurrencies.includes(body.currency)) {
      return NextResponse.json(
        { error: 'Invalid currency' },
        { status: 400 }
      );
    }

    if (body.dateFormat && !validDateFormats.includes(body.dateFormat)) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Update user preferences
    await prisma.user.update({
      where: { id: user.id },
      data: { preferences: updatedPreferences },
    });

    return NextResponse.json({
      message: 'Preferences updated successfully',
      preferences: updatedPreferences,
    });
  } catch (error: any) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

