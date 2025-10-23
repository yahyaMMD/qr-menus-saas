import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ menuId: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    // Await the params first!
    const { menuId } = await params;
    
    // Clean the menuId - remove any whitespace or newline characters
    const cleanMenuId = menuId.trim();
    
    // Validate MongoDB ObjectID format (24 hex characters)
    if (!/^[0-9a-fA-F]{24}$/.test(cleanMenuId)) {
      return NextResponse.json(
        { error: "Invalid menu ID format" },
        { status: 400 }
      );
    }

    const menu = await prisma.menu.findFirst({
      where: { 
        id: cleanMenuId,
        isActive: true 
      },
      include: {
        profile: {
          select: {
            name: true,
            description: true,
            logo: true,
            socialLinks: true,
            location: true
          }
        },
        types: true,
        categories: true,
        tags: true,
        items: {
          where: {
            OR: [
              { price: { not: null } },
              { price: { gt: 0 } }
            ]
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
          },
          orderBy: { name: "asc" }
        }
      }
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Public menu API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}