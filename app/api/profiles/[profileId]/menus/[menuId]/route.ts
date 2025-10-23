import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleError } from "@/lib/api-utils";

interface Params {
  params: Promise<{ profileId: string; menuId: string }>; // Changed to Promise
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    
    // Await the params first!
    const { profileId, menuId } = await params;
    
    // Verify profile ownership
    const profile = await prisma.profile.findFirst({
      where: { 
        id: profileId, // Use the awaited variable
        ownerId: session.user.id 
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const menu = await prisma.menu.findFirst({
      where: { 
        id: menuId, // Use the awaited variable
        profileId: profileId // Use the awaited variable
      },
      include: {
        types: true,
        categories: true,
        tags: true,
        items: {
          include: {
            // Remove the invalid 'category' and 'type' includes
            // These relations don't exist in your Item model
            // Instead, use the actual relations from your schema
          }
        }
      }
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json(menu);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    
    // Await the params first!
    const { profileId, menuId } = await params;
    
    // Verify profile ownership
    const profile = await prisma.profile.findFirst({
      where: { 
        id: profileId, // Use the awaited variable
        ownerId: session.user.id 
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, isActive } = body;

    const menu = await prisma.menu.update({
      where: { id: menuId }, // Use the awaited variable
      data: {
        name,
        description,
        isActive
      }
    });

    return NextResponse.json(menu);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    
    // Await the params first!
    const { profileId, menuId } = await params;
    
    // Verify profile ownership
    const profile = await prisma.profile.findFirst({
      where: { 
        id: profileId,
        ownerId: session.user.id 
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Delete all related records first (in correct order)
    await prisma.$transaction(async (tx) => {
      // 1. Delete analytics records
      await tx.analytics.deleteMany({
        where: { menuId }
      });

      // 2. Delete items
      await tx.item.deleteMany({
        where: { menuId }
      });

      // 3. Delete types
      await tx.type.deleteMany({
        where: { menuId }
      });

      // 4. Delete categories
      await tx.category.deleteMany({
        where: { menuId }
      });

      // 5. Delete tags
      await tx.tag.deleteMany({
        where: { menuId }
      });

      // 6. Finally delete the menu
      await tx.menu.delete({
        where: { id: menuId }
      });
    });

    return NextResponse.json({ message: "Menu deleted successfully" });
  } catch (error) {
    return handleError(error);
  }
}