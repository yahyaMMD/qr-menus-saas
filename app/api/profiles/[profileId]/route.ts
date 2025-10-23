import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleError } from "@/lib/api-utils";

interface Params {
  params: Promise<{ profileId: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    
    // Await the params first!
    const { profileId } = await params;
    
    const profile = await prisma.profile.findFirst({
      where: { 
        id: profileId, // Use awaited variable
        ownerId: session.user.id 
      },
      include: {
        menus: {
          include: {
            _count: {
              select: {
                items: true,
                analytics: true
              }
            }
          }
        },
        feedbacks: {
          orderBy: { createdAt: "desc" },
          take: 5
        }
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    
    // Await the params first!
    const { profileId } = await params;
    
    const body = await request.json();
    const { name, description, logo, socialLinks, location } = body;

    // Verify profile ownership
    const existingProfile = await prisma.profile.findFirst({
      where: { 
        id: profileId, // Use awaited variable
        ownerId: session.user.id 
      }
    });

    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const profile = await prisma.profile.update({
      where: { id: profileId }, // Use awaited variable
      data: {
        name,
        description,
        logo,
        socialLinks,
        location
      }
    });

    return NextResponse.json(profile);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    
    // Await the params first!
    const { profileId } = await params;
    
    // Verify profile ownership
    const existingProfile = await prisma.profile.findFirst({
      where: { 
        id: profileId, // Use awaited variable
        ownerId: session.user.id 
      }
    });

    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Delete all related records first using transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete analytics for all menus in this profile
      const menus = await tx.menu.findMany({
        where: { profileId },
        select: { id: true }
      });
      
      const menuIds = menus.map(menu => menu.id);
      
      if (menuIds.length > 0) {
        await tx.analytics.deleteMany({
          where: { menuId: { in: menuIds } }
        });
      }

      // 2. Delete items for all menus
      if (menuIds.length > 0) {
        await tx.item.deleteMany({
          where: { menuId: { in: menuIds } }
        });
      }

      // 3. Delete types for all menus
      if (menuIds.length > 0) {
        await tx.type.deleteMany({
          where: { menuId: { in: menuIds } }
        });
      }

      // 4. Delete categories for all menus
      if (menuIds.length > 0) {
        await tx.category.deleteMany({
          where: { menuId: { in: menuIds } }
        });
      }

      // 5. Delete tags for all menus
      if (menuIds.length > 0) {
        await tx.tag.deleteMany({
          where: { menuId: { in: menuIds } }
        });
      }

      // 6. Delete all menus
      await tx.menu.deleteMany({
        where: { profileId }
      });

      // 7. Delete feedbacks
      await tx.feedback.deleteMany({
        where: { profileId }
      });

      // 8. Finally delete the profile
      await tx.profile.delete({
        where: { id: profileId }
      });
    });

    return NextResponse.json({ message: "Profile and all associated data deleted successfully" });
  } catch (error) {
    console.error("Profile deletion error:", error);
    return handleError(error);
  }
}