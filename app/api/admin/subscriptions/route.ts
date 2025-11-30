import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/auth/route-guard';
import { Plan, Role, SubscriptionStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const upgradeSchema = z.object({
  userId: z.string().min(1),
  plan: z.nativeEnum(Plan),
  expiresAt: z.string().datetime().optional(),
  priceCents: z.number().int().nonnegative().optional(),
  currency: z.string().min(1).default('USD'),
  status: z.nativeEnum(SubscriptionStatus).optional(),
  role: z.nativeEnum(Role).optional(),
  paymentRef: z.string().optional(),
});

export const GET = withAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const statusFilter = statusParam && statusParam in SubscriptionStatus ? (statusParam as SubscriptionStatus) : undefined;

    const subscriptions = await prisma.subscription.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: {
        user: {
          select: { id: true, email: true, name: true, role: true, isActive: true },
        },
      },
      orderBy: { expiresAt: 'asc' },
    });

    return NextResponse.json({ subscriptions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Failed to load subscriptions' }, { status: 500 });
  }
});

export const POST = withAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = upgradeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const { userId, plan, expiresAt, priceCents, currency, status, role, paymentRef } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (role && role !== user.role) {
      await prisma.user.update({ where: { id: userId }, data: { role } });
    }

    const existing = await prisma.subscription.findFirst({ where: { userId }, orderBy: { expiresAt: 'desc' } });
    const expiresDate = expiresAt ? new Date(expiresAt) : existing?.expiresAt ?? new Date();
    const subStatus = status ?? SubscriptionStatus.ACTIVE;

    const subscription = existing
      ? await prisma.subscription.update({
          where: { id: existing.id },
          data: {
            plan,
            status: subStatus,
            expiresAt: expiresDate,
            active: subStatus === SubscriptionStatus.ACTIVE,
            priceCents: priceCents ?? existing.priceCents ?? 0,
            currency: currency ?? existing.currency ?? 'USD',
            paymentRef: paymentRef ?? existing.paymentRef,
          },
        })
      : await prisma.subscription.create({
          data: {
            userId,
            plan,
            status: subStatus,
            expiresAt: expiresDate,
            active: subStatus === SubscriptionStatus.ACTIVE,
            priceCents: priceCents ?? 0,
            currency: currency ?? 'USD',
            paymentRef,
          },
        });

    return NextResponse.json({ subscription }, { status: 200 });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
});
