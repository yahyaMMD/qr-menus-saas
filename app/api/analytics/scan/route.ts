import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { menuId } = body;

    if (!menuId) {
      return NextResponse.json({ error: "Menu ID is required" }, { status: 400 });
    }

    // Verify menu exists and is active
    const menu = await prisma.menu.findFirst({
      where: { 
        id: menuId,
        isActive: true 
      }
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found or inactive" }, { status: 404 });
    }

    // Check scan limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's total scans for this menu
    const todayScansResult = await prisma.analytics.aggregate({
      where: {
        menuId,
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      _sum: {
        scans: true
      }
    });

    const todayScans = todayScansResult._sum.scans || 0;

    // Get subscription to check limits
    const profile = await prisma.profile.findFirst({
      where: { id: menu.profileId },
      include: {
        owner: {
          include: {
            subscriptions: {
              where: { active: true },
              orderBy: { expiresAt: "desc" },
              take: 1
            }
          }
        }
      }
    });

    let maxScans = 5; // FREE plan default
    if (profile?.owner.subscriptions[0]?.plan === "STANDARD") maxScans = 100;
    if (profile?.owner.subscriptions[0]?.plan === "CUSTOM") maxScans = 1000;

    if (todayScans >= maxScans) {
      return NextResponse.json(
        { error: "Daily scan limit reached" },
        { status: 403 }
      );
    }

    // Find existing analytics record for today
    const existingAnalytics = await prisma.analytics.findFirst({
      where: {
        menuId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    let todayAnalytics;

    if (existingAnalytics) {
      // Update existing record
      todayAnalytics = await prisma.analytics.update({
        where: { id: existingAnalytics.id },
        data: {
          scans: { increment: 1 }
        }
      });
    } else {
      // Create new record
      todayAnalytics = await prisma.analytics.create({
        data: {
          menuId,
          date: today,
          scans: 1
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      scans: todayAnalytics.scans,
      dailyLimit: maxScans,
      remainingScans: Math.max(0, maxScans - (todayScans + 1))
    });
  } catch (error) {
    console.error("Scan recording error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}