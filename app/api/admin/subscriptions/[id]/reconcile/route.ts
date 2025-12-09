import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionStatus } from '@prisma/client'
import { withAdmin } from '@/lib/auth/route-guard'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const POST = withAdmin(async (request: NextRequest) => {
  const pathParts = new URL(request.url).pathname.split('/')
  const id = pathParts[pathParts.length - 2] // .../subscriptions/[id]/reconcile
  if (!id) {
    return NextResponse.json({ error: 'Subscription id not found in path' }, { status: 400 })
  }
  const { paymentRef } = (await request.json().catch(() => ({}))) as { paymentRef?: string }

  const subscription = await prisma.subscription.findUnique({
    where: { id },
  })

  if (!subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  }

  const payment = await prisma.payment.findFirst({
    where: {
      reference: paymentRef ?? subscription.paymentRef ?? undefined,
      userId: subscription.userId,
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!payment) {
    return NextResponse.json({ error: 'Matching payment not found for this subscription' }, { status: 404 })
  }

  // Mark payment paid and reactivate subscription
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'PAID' },
  })

  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: SubscriptionStatus.ACTIVE,
      active: true,
      paymentRef: payment.reference ?? subscription.paymentRef,
      expiresAt: subscription.expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    include: {
      user: { select: { id: true, email: true, name: true, role: true, isActive: true } },
    },
  })

  return NextResponse.json({ subscription: updated }, { status: 200 })
})
