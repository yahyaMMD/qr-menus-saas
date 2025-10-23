import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleError } from "@/lib/api-utils";

interface Params {
  params: { profileId: string; menuId: string; itemId: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    
    // Verify ownership
    const profile = await prisma.profile.findFirst({
      where: { 
        id: params.profileId,
        ownerId: session.user.id 
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const item = await prisma.item.findFirst({
      where: { 
        id: params.itemId,
        menuId: params.menuId
      },
      include: {
        category: true,
        type: true
      }
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    
    // Verify ownership
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
    const { name, description, image, price, categoryId, typeId, tags } = body;

    const item = await prisma.item.update({
      where: { id: params.itemId },
      data: {
        name,
        description,
        image,
        price,
        categoryId,
        typeId,
        tags
      }
    });

    return NextResponse.json(item);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    
    // Verify ownership
    const profile = await prisma.profile.findFirst({
      where: { 
        id: params.profileId,
        ownerId: session.user.id 
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await prisma.item.delete({
      where: { id: params.itemId }
    });

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    return handleError(error);
  }
}