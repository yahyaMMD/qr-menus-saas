import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth/middleware';
import { findUserById } from '@/lib/auth/db';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';

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

async function verifyMenuOwnership(menuId: string, userId: string) {
  const menu = await prisma.menu.findUnique({
    where: { id: menuId },
    include: {
      profile: {
        select: { ownerId: true },
      },
    },
  });

  if (!menu) {
    return { error: 'Menu not found', status: 404 };
  }

  if (menu.profile.ownerId !== userId) {
    return { error: 'You do not have permission to modify this menu', status: 403 };
  }

  return { menu };
}

// GET - Get menu language settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;
  const { menuId } = await params;

  try {
    const verification = await verifyMenuOwnership(menuId, user.id);
    if ('error' in verification) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status }
      );
    }

    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      select: {
        defaultLanguage: true,
        supportedLanguages: true,
      },
    });

    // Get translation counts per language
    const translationCounts = await prisma.translation.groupBy({
      by: ['languageCode'],
      where: { menuId },
      _count: true,
    });

    const countsMap = translationCounts.reduce((acc, item) => {
      acc[item.languageCode] = item._count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      defaultLanguage: menu?.defaultLanguage || 'en',
      supportedLanguages: menu?.supportedLanguages || ['en'],
      availableLanguages: SUPPORTED_LANGUAGES,
      translationCounts: countsMap,
    }, { status: 200 });
  } catch (error) {
    console.error('Get languages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch language settings' },
      { status: 500 }
    );
  }
}

const updateLanguagesSchema = z.object({
  defaultLanguage: z.string().min(2).max(5).optional(),
  supportedLanguages: z.array(z.string().min(2).max(5)).min(1).optional(),
});

// PATCH - Update menu language settings
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;
  const { menuId } = await params;

  try {
    const verification = await verifyMenuOwnership(menuId, user.id);
    if ('error' in verification) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const parseResult = updateLanguagesSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { defaultLanguage, supportedLanguages } = parseResult.data;

    // Validate language codes
    if (defaultLanguage && !SUPPORTED_LANGUAGES.find(l => l.code === defaultLanguage)) {
      return NextResponse.json(
        { error: `Unsupported default language: ${defaultLanguage}` },
        { status: 400 }
      );
    }

    if (supportedLanguages) {
      for (const code of supportedLanguages) {
        if (!SUPPORTED_LANGUAGES.find(l => l.code === code)) {
          return NextResponse.json(
            { error: `Unsupported language: ${code}` },
            { status: 400 }
          );
        }
      }

      // Ensure default language is in supported languages
      const effectiveDefault = defaultLanguage || verification.menu.defaultLanguage;
      if (!supportedLanguages.includes(effectiveDefault)) {
        return NextResponse.json(
          { error: 'Default language must be in supported languages' },
          { status: 400 }
        );
      }
    }

    const updatedMenu = await prisma.menu.update({
      where: { id: menuId },
      data: {
        ...(defaultLanguage && { defaultLanguage }),
        ...(supportedLanguages && { supportedLanguages }),
      },
      select: {
        defaultLanguage: true,
        supportedLanguages: true,
      },
    });

    return NextResponse.json({
      message: 'Language settings updated',
      ...updatedMenu,
    }, { status: 200 });
  } catch (error) {
    console.error('Update languages error:', error);
    return NextResponse.json(
      { error: 'Failed to update language settings' },
      { status: 500 }
    );
  }
}

