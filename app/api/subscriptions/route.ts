import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleError } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await requireAuth();
    
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: session.user.id },
      orderBy: { expiresAt: "desc" }
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    const body = await request.json();
    const { plan, paymentRef } = body;

    if (!plan || !paymentRef) {
      return NextResponse.json(
        { error: "Plan and payment reference are required" },
        { status: 400 }
      );
    }

    // Deactivate current subscriptions
    await prisma.subscription.updateMany({
      where: { 
        userId: session.user.id,
        active: true 
      },
      data: { active: false }
    });

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month from now

    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        plan,
        expiresAt,
        active: true,
        paymentRef
      }
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}