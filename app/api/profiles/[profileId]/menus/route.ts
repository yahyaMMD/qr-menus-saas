import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleError } from "@/lib/api-utils";

interface Params {
  params: { profileId: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    
    // Verify profile ownership
    const profile = await prisma.profile.findFirst({
      where: { 
        id: params.profileId,
        ownerId: session.user.id 
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const menus = await prisma.menu.findMany({
      where: { profileId: params.profileId },
      include: {
        _count: {
          select: {
            items: true,
            analytics: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(menus);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    
    // Verify profile ownership
    const profile = await prisma.profile.findFirst({
      where: { 
        id: params.profileId,
        ownerId: session.user.id 
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description } = body;

    // Check menu limit based on subscription
    const userSubscription = await prisma.subscription.findFirst({
      where: { 
        userId: session.user.id,
        active: true 
      },
      orderBy: { expiresAt: "desc" }
    });

    const menuCount = await prisma.menu.count({
      where: { profileId: params.profileId }
    });

    let maxMenus = 1; // FREE plan default
    if (userSubscription?.plan === "STANDARD") maxMenus = 3;
    if (userSubscription?.plan === "CUSTOM") maxMenus = 1000;

    if (menuCount >= maxMenus) {
      return NextResponse.json(
        { error: `Menu limit reached for this profile. Upgrade plan to create more menus.` },
        { status: 403 }
      );
    }

    const menu = await prisma.menu.create({
      data: {
        profileId: params.profileId,
        name,
        description
      }
    });

    return NextResponse.json(menu, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}