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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    if (period === "7d") {
      startDate.setDate(now.getDate() - 7);
    } else if (period === "30d") {
      startDate.setDate(now.getDate() - 30);
    } else if (period === "90d") {
      startDate.setDate(now.getDate() - 90);
    }

    // Get scans analytics
    const scans = await prisma.analytics.findMany({
      where: {
        menu: {
          profileId: params.profileId
        },
        date: {
          gte: startDate
        }
      },
      orderBy: { date: "asc" }
    });

    // Get popular items
    const menus = await prisma.menu.findMany({
      where: { profileId: params.profileId },
      include: {
        items: true
      }
    });

    const allItems = menus.flatMap(menu => menu.items);
    const popularItems = allItems
      .sort((a, b) => (b.price || 0) - (a.price || 0))
      .slice(0, 10);

    // Get feedback stats
    const feedbackStats = await prisma.feedback.aggregate({
      where: { profileId: params.profileId },
      _avg: { rating: true },
      _count: { id: true }
    });

    const analytics = {
      scans,
      popularItems,
      feedbackStats: {
        averageRating: feedbackStats._avg.rating,
        totalFeedback: feedbackStats._count.id
      },
      totalMenus: menus.length,
      totalItems: allItems.length
    };

    return NextResponse.json(analytics);
  } catch (error) {
    return handleError(error);
  }
}