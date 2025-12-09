import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/auth/route-guard';
import { Plan } from '@prisma/client';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  plan: z.nativeEnum(Plan),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().min(1).default('USD'),
  description: z.string().optional(),
});

export const GET = withAdmin(async () => {
  try {
    const plans = await prisma.planCatalog.findMany({
      orderBy: { priceCents: 'asc' },
    });
    return NextResponse.json({ plans }, { status: 200 });
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw new Error('Failed to load plans');
  }
});

export const PATCH = withAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const plan = await prisma.planCatalog.upsert({
      where: { plan: parsed.data.plan },
      create: { ...parsed.data },
      update: { ...parsed.data, updatedAt: new Date() },
    });

    return NextResponse.json({ plan }, { status: 200 });
  } catch (error) {
    console.error('Error updating plan:', error);
    throw new Error('Failed to update plan');
  }
});
