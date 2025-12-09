import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/auth/route-guard';
import { PaymentStatus, SubscriptionStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export const GET = withAdmin(async (_request: NextRequest) => {
  try {
    const [usersCount, activeUsers, profilesCount, activeProfiles, subscriptions, payments, scans] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.profile.count(),
      prisma.profile.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.findMany({
        include: { user: { select: { id: true, email: true, name: true } } },
      }),
      prisma.payment.findMany({
        where: { status: PaymentStatus.PAID },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.analytics.groupBy({
        by: ['date'],
        _sum: { scans: true },
        orderBy: { date: 'asc' },
      }),
    ]);

    const activeSubscriptions = subscriptions.filter((s) => s.status === SubscriptionStatus.ACTIVE).length;
    const totalRevenueCents = payments.reduce((sum, p) => sum + p.amountCents, 0);

    return NextResponse.json(
      {
        totals: {
          users: usersCount,
          activeUsers,
          profiles: profilesCount,
          activeProfiles,
          activeSubscriptions,
          revenueCents: totalRevenueCents,
        },
        subscriptions,
        payments,
        scans: scans.map((s) => ({ date: s.date, scans: s._sum.scans || 0 })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw new Error('Failed to load analytics');
  }
});
