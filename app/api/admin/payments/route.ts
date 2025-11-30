import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/auth/route-guard';
import { PaymentStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export const GET = withAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const statusFilter = statusParam && statusParam in PaymentStatus ? (statusParam as PaymentStatus) : undefined;

    const payments = await prisma.payment.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: {
        user: { select: { id: true, email: true, name: true } },
        subscription: { select: { id: true, plan: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ payments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to load payments' }, { status: 500 });
  }
});
