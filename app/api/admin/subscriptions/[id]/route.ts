import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/auth/route-guard';
import { SubscriptionStatus, Plan } from '@prisma/client';

const updateSchema = z.object({
  status: z.nativeEnum(SubscriptionStatus).optional(),
  plan: z.nativeEnum(Plan).optional(),
  expiresAt: z.string().datetime().optional(),
  priceCents: z.number().int().nonnegative().optional(),
  currency: z.string().min(1).optional(),
});

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return withAdmin(async (req) => {
    try {
      const body = await req.json();
      const parsed = updateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
      }

      const data = parsed.data;

      const subscription = await prisma.subscription.update({
        where: { id },
        data: {
          ...data,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
          active: data.status ? data.status === SubscriptionStatus.ACTIVE : undefined,
        },
      });

      return NextResponse.json({ subscription }, { status: 200 });
    } catch (error) {
      console.error('Error updating subscription:', error);
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }
  })(request);
}
