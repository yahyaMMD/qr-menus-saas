import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleError } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await requireAuth();
    
    const profiles = await prisma.profile.findMany({
      where: { ownerId: session.user.id },
      include: {
        menus: {
          select: {
            id: true,
            name: true,
            isActive: true,
            _count: {
              select: {
                items: true,
                analytics: true
              }
            }
          }
        },
        _count: {
          select: {
            feedbacks: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(profiles);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    const body = await request.json();
    const { name, description, logo, socialLinks, location } = body;

    // Check profile limit based on subscription
    const userSubscription = await prisma.subscription.findFirst({
      where: { 
        userId: session.user.id,
        active: true 
      },
      orderBy: { expiresAt: "desc" }
    });

    const profileCount = await prisma.profile.count({
      where: { ownerId: session.user.id }
    });

    let maxProfiles = 1; // FREE plan default
    if (userSubscription?.plan === "STANDARD") maxProfiles = 3;
    if (userSubscription?.plan === "CUSTOM") maxProfiles = 1000; // Essentially unlimited

    if (profileCount >= maxProfiles) {
      return NextResponse.json(
        { error: `Profile limit reached. Upgrade plan to create more profiles.` },
        { status: 403 }
      );
    }

    const profile = await prisma.profile.create({
      data: {
        ownerId: session.user.id,
        name,
        description,
        logo,
        socialLinks,
        location
      }
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}