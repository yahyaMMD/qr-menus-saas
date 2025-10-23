import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleError } from "@/lib/api-utils";

interface Params {
  params: { profileId: string; menuId: string };
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

    const categories = await prisma.category.findMany({
      where: { menuId: params.menuId },
      orderBy: { name: "asc" }
    });

    return NextResponse.json(categories);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest, { params }: Params) {
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
    const { name, image } = body;

    const category = await prisma.category.create({
      data: {
        menuId: params.menuId,
        name,
        image
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}