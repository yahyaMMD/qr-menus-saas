import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (!authResult.success || !authResult.payload) {
    return NextResponse.json(
      { error: authResult.error || 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const payments = await prisma.payment.findMany({
      where: { userId: authResult.payload.userId },
      include: {
        subscription: {
          select: { plan: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });

    const formatted = payments.map((payment) => ({
      id: payment.id,
      createdAt: payment.createdAt,
      description: payment.subscription
        ? `${payment.subscription.plan} plan`
        : 'Subscription payment',
      amountCents: payment.amountCents,
      currency: payment.currency,
      status: payment.status,
      reference: payment.reference,
    }));

    return NextResponse.json({ payments: formatted }, { status: 200 });
  } catch (error) {
    console.error('Billing history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing history' },
      { status: 500 }
    );
  }
}
