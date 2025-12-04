import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateRequest } from '@/lib/auth/middleware';
import { findUserById } from '@/lib/auth/db';
import { canTrackScan } from '@/lib/plan-limits';

const prisma = new PrismaClient();

async function getAuthenticatedUser(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (!authResult.success || !authResult.payload) {
    return {
      response: NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      ),
    };
  }
  const user = await findUserById(authResult.payload.userId);
  if (!user) {
    return {
      response: NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      ),
    };
  }

  return { user };
}

// POST - Track a menu scan/visit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { menuId, type } = body; // type: 'scan' or 'visit'

    if (!menuId) {
      return NextResponse.json(
        { error: 'Menu ID is required' },
        { status: 400 }
      );
    }

    // Verify menu exists
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    // Check plan limits for QR scans
    const scanCheck = await canTrackScan(menuId);
    if (!scanCheck.allowed) {
      return NextResponse.json(
        { 
          error: scanCheck.message,
          limitReached: true,
          current: scanCheck.current,
          max: scanCheck.max
        },
        { status: 429 } // Too Many Requests
      );
    }

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Try to find existing record
    const existing = await prisma.analytics.findFirst({
      where: {
        menuId: menuId,
        date: today,
      },
    });

    let analytics;
    if (existing) {
      // Update existing record
      analytics = await prisma.analytics.update({
        where: { id: existing.id },
        data: {
          scans: { increment: 1 },
        },
      });
    } else {
      // Create new record
      analytics = await prisma.analytics.create({
        data: {
          menuId: menuId,
          date: today,
          scans: 1,
        },
      });
    }

    return NextResponse.json(
      { message: 'Analytics tracked successfully', analytics },
      { status: 200 }
    );
  } catch (error) {
    console.error('Track analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
}

// GET - Get analytics for a menu or profile
export async function GET(request: NextRequest) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;
  const { searchParams } = new URL(request.url);
  const menuId = searchParams.get('menuId');
  const profileId = searchParams.get('profileId');
  const days = parseInt(searchParams.get('days') || '30');

  try {
    // Calculate date range
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    if (menuId) {
      // Get analytics for specific menu
      const menu = await prisma.menu.findUnique({
        where: { id: menuId },
        include: { profile: true },
      });

      if (!menu) {
        return NextResponse.json(
          { error: 'Menu not found' },
          { status: 404 }
        );
      }

      // Verify ownership
      if (menu.profile.ownerId !== user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      const analytics = await prisma.analytics.findMany({
        where: {
          menuId: menuId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'asc' },
      });

      // Calculate totals
      const totalScans = analytics.reduce((sum, a) => sum + a.scans, 0);
      const avgScansPerDay = analytics.length > 0 ? totalScans / analytics.length : 0;

      return NextResponse.json({
        analytics,
        summary: {
          totalScans,
          avgScansPerDay: Math.round(avgScansPerDay * 10) / 10,
          days: analytics.length,
        },
      });
    } else if (profileId) {
      // Get analytics for all menus in a profile
      const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        include: { menus: true },
      });

      if (!profile) {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        );
      }

      // Verify ownership
      if (profile.ownerId !== user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      const menuIds = profile.menus.map((m) => m.id);

      const analytics = await prisma.analytics.findMany({
        where: {
          menuId: { in: menuIds },
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          menu: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { date: 'asc' },
      });

      // Group by menu
      const byMenu = analytics.reduce((acc: any, a) => {
        if (!acc[a.menuId]) {
          acc[a.menuId] = {
            menuId: a.menuId,
            menuName: a.menu.name,
            totalScans: 0,
            analytics: [],
          };
        }
        acc[a.menuId].totalScans += a.scans;
        acc[a.menuId].analytics.push(a);
        return acc;
      }, {});

      const totalScans = analytics.reduce((sum, a) => sum + a.scans, 0);

      return NextResponse.json({
        byMenu: Object.values(byMenu),
        summary: {
          totalScans,
          totalMenus: profile.menus.length,
          activeMenus: profile.menus.filter((m) => m.isActive).length,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'menuId or profileId is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
