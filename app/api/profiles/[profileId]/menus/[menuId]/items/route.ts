import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleError } from "@/lib/api-utils";

interface Params {
  params: Promise<{ profileId: string; menuId: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { profileId, menuId } = await params;
    
    // Verify ownership
    const profile = await prisma.profile.findFirst({
      where: { 
        id: profileId,
        ownerId: session.user.id 
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const items = await prisma.item.findMany({
      where: { menuId: menuId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        type: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json(items);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { profileId, menuId } = await params;
    
    // Verify ownership
    const profile = await prisma.profile.findFirst({
      where: { 
        id: profileId,
        ownerId: session.user.id 
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, image, price, categoryId, typeId, tags } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Check item limit based on subscription
    const userSubscription = await prisma.subscription.findFirst({
      where: { 
        userId: session.user.id,
        active: true 
      },
      orderBy: { expiresAt: "desc" }
    });

    const itemCount = await prisma.item.count({
      where: { menuId: menuId }
    });

    let maxItems = 10; // FREE plan default
    if (userSubscription?.plan === "STANDARD") maxItems = 50;
    if (userSubscription?.plan === "CUSTOM") maxItems = 1000;

    if (itemCount >= maxItems) {
      return NextResponse.json(
        { error: `Item limit reached for this menu. Upgrade plan to add more items.` },
        { status: 403 }
      );
    }

    // Verify category and type belong to the same menu if provided
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { 
          id: categoryId,
          menuId: menuId
        }
      });
      if (!category) {
        return NextResponse.json(
          { error: "Category not found in this menu" },
          { status: 400 }
        );
      }
    }

    if (typeId) {
      const type = await prisma.type.findFirst({
        where: { 
          id: typeId,
          menuId: menuId
        }
      });
      if (!type) {
        return NextResponse.json(
          { error: "Type not found in this menu" },
          { status: 400 }
        );
      }
    }

    const item = await prisma.item.create({
      data: {
        menuId: menuId,
        name,
        description,
        image,
        price: price ? parseFloat(price) : null,
        categoryId: categoryId || null,
        typeId: typeId || null,
        tags: tags || []
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        type: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}