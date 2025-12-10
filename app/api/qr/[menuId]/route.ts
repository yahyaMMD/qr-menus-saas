import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    const { menuId } = await params;

    if (!/^[a-fA-F0-9]{24}$/.test(menuId)) {
      return NextResponse.json(
        { error: "Invalid menu ID" },
        { status: 400 }
      );
    }

    const urlObj = new URL(request.url);
    const format = urlObj.searchParams.get("format") || "svg";
    const size = parseInt(urlObj.searchParams.get("size") || "300");

    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: { profile: true },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const menuUrl = `${baseUrl}/menu/${menuId}`;

    if (format === "png") {
      const buffer = await QRCode.toBuffer(menuUrl, {
        type: "png",
        margin: 4,
        width: size,
        errorCorrectionLevel: "H",
      });

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="menu-${menuId}.png"`,
        },
      });
    }

    // SVG
    const svg = await QRCode.toString(menuUrl, {
      type: "svg",
      margin: 4,
      width: size,
      errorCorrectionLevel: "H",
    });

    return new NextResponse(svg, {
      headers: { "Content-Type": "image/svg+xml" },
    });

  } catch (error) {
    console.error("QR Code generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 },
    );
  }
}
