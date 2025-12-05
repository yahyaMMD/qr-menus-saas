import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth/middleware';
import { findUserById } from '@/lib/auth/db';
import { SUPPORTED_LANGUAGES, TRANSLATABLE_FIELDS, TranslatableEntity } from '@/lib/languages';

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

// GET - Get all translations for a menu (optionally filtered by language)
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
  const { searchParams } = new URL(request.url);
  const languageCode = searchParams.get('language');
  const entityType = searchParams.get('entityType');
  const entityId = searchParams.get('entityId');

  try {
    const verification = await verifyMenuOwnership(menuId, user.id);
    if ('error' in verification) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status }
      );
    }

    const where: any = { menuId };
    if (languageCode) where.languageCode = languageCode;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const translations = await prisma.translation.findMany({
      where,
      orderBy: [{ entityType: 'asc' }, { entityId: 'asc' }, { languageCode: 'asc' }],
    });

    // Also return menu language settings
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      select: {
        defaultLanguage: true,
        supportedLanguages: true,
      },
    });

    return NextResponse.json({
      translations,
      defaultLanguage: menu?.defaultLanguage || 'en',
      supportedLanguages: menu?.supportedLanguages || ['en'],
    }, { status: 200 });
  } catch (error) {
    console.error('Get translations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}

const upsertTranslationSchema = z.object({
  entityType: z.enum(['item', 'category', 'tag', 'type', 'menu']),
  entityId: z.string(),
  languageCode: z.string().min(2).max(5),
  field: z.string(),
  value: z.string(),
});

const bulkTranslationsSchema = z.object({
  translations: z.array(upsertTranslationSchema),
});

// POST - Create or update translations (supports bulk)
export async function POST(
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

    // Check if it's a single translation or bulk
    const isBulk = 'translations' in (body as any);
    
    if (isBulk) {
      const parseResult = bulkTranslationsSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          { error: parseResult.error.format() },
          { status: 400 }
        );
      }

      const { translations } = parseResult.data;

      // Validate language codes and fields
      for (const t of translations) {
        if (!SUPPORTED_LANGUAGES.find(l => l.code === t.languageCode)) {
          return NextResponse.json(
            { error: `Unsupported language code: ${t.languageCode}` },
            { status: 400 }
          );
        }

        const validFields = TRANSLATABLE_FIELDS[t.entityType as TranslatableEntity];
        if (!validFields?.includes(t.field)) {
          return NextResponse.json(
            { error: `Invalid field '${t.field}' for entity type '${t.entityType}'` },
            { status: 400 }
          );
        }
      }

      // Upsert all translations
      const results = await Promise.all(
        translations.map(t =>
          prisma.translation.upsert({
            where: {
              menuId_entityType_entityId_languageCode_field: {
                menuId,
                entityType: t.entityType,
                entityId: t.entityId,
                languageCode: t.languageCode,
                field: t.field,
              },
            },
            update: { value: t.value },
            create: {
              menuId,
              entityType: t.entityType,
              entityId: t.entityId,
              languageCode: t.languageCode,
              field: t.field,
              value: t.value,
            },
          })
        )
      );

      return NextResponse.json(
        { message: `${results.length} translations saved`, translations: results },
        { status: 200 }
      );
    } else {
      // Single translation
      const parseResult = upsertTranslationSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          { error: parseResult.error.format() },
          { status: 400 }
        );
      }

      const { entityType, entityId, languageCode, field, value } = parseResult.data;

      // Validate language code
      if (!SUPPORTED_LANGUAGES.find(l => l.code === languageCode)) {
        return NextResponse.json(
          { error: `Unsupported language code: ${languageCode}` },
          { status: 400 }
        );
      }

      // Validate field for entity type
      const validFields = TRANSLATABLE_FIELDS[entityType as TranslatableEntity];
      if (!validFields?.includes(field)) {
        return NextResponse.json(
          { error: `Invalid field '${field}' for entity type '${entityType}'` },
          { status: 400 }
        );
      }

      const translation = await prisma.translation.upsert({
        where: {
          menuId_entityType_entityId_languageCode_field: {
            menuId,
            entityType,
            entityId,
            languageCode,
            field,
          },
        },
        update: { value },
        create: {
          menuId,
          entityType,
          entityId,
          languageCode,
          field,
          value,
        },
      });

      return NextResponse.json(
        { message: 'Translation saved', translation },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Save translation error:', error);
    return NextResponse.json(
      { error: 'Failed to save translation' },
      { status: 500 }
    );
  }
}

// DELETE - Delete translations
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;
  const { menuId } = await params;
  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get('entityType');
  const entityId = searchParams.get('entityId');
  const languageCode = searchParams.get('language');

  try {
    const verification = await verifyMenuOwnership(menuId, user.id);
    if ('error' in verification) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status }
      );
    }

    const where: any = { menuId };
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (languageCode) where.languageCode = languageCode;

    const deleted = await prisma.translation.deleteMany({ where });

    return NextResponse.json(
      { message: `${deleted.count} translations deleted` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete translations error:', error);
    return NextResponse.json(
      { error: 'Failed to delete translations' },
      { status: 500 }
    );
  }
}

