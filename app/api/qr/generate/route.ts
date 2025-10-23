import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { requireAuth, handleError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    const body = await request.json();
    const { menuId, size = 300 } = body;

    if (!menuId) {
      return NextResponse.json({ error: "Menu ID is required" }, { status: 400 });
    }

    // Verify menu ownership
    const menu = await prisma.menu.findFirst({
      where: { 
        id: menuId,
        profile: {
          ownerId: session.user.id
        }
      }
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    const menuUrl = `${process.env.NEXTAUTH_URL}/menu/${menuId}`;
    
    const qrCode = await QRCode.toDataURL(menuUrl, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return NextResponse.json({ 
      qrCode, 
      menuUrl,
      menuName: menu.name 
    });
  } catch (error) {
    return handleError(error);
  }
}