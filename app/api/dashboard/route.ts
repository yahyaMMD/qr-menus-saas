import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { Role } from '@/lib/auth/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);

    if (!authResult.success || !authResult.payload) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const user = authResult.payload;

    // Fetch real user data
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch user's profiles with their menus
    const profiles = await prisma.profile.findMany({
      where: { ownerId: user.userId },
      include: {
        menus: {
          select: {
            id: true,
            name: true,
            isActive: true,
            _count: {
              select: { items: true },
            },
          },
        },
        _count: {
          select: { 
            menus: true, 
            feedbacks: true 
          },
        },
      },
    });

    // Calculate today's scans
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const menuIds = profiles.flatMap(p => p.menus.map(m => m.id));
    
    const todayScans = await prisma.analytics.aggregate({
      where: {
        menuId: { in: menuIds },
        date: { gte: today },
      },
      _sum: { scans: true },
    });

    // Calculate yesterday's scans for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayScans = await prisma.analytics.aggregate({
      where: {
        menuId: { in: menuIds },
        date: { gte: yesterday, lt: today },
      },
      _sum: { scans: true },
    });

    // Calculate this week's feedbacks
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const profileIds = profiles.map(p => p.id);
    
    const weekFeedbacks = await prisma.feedback.count({
      where: {
        profileId: { in: profileIds },
        createdAt: { gte: oneWeekAgo },
      },
    });

    // Calculate previous week's feedbacks for comparison
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const prevWeekFeedbacks = await prisma.feedback.count({
      where: {
        profileId: { in: profileIds },
        createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo },
      },
    });

    // Calculate total scans change
    const totalScansToday = todayScans._sum.scans || 0;
    const totalScansYesterday = yesterdayScans._sum.scans || 0;
    const scansChange = totalScansYesterday > 0 
      ? Math.round(((totalScansToday - totalScansYesterday) / totalScansYesterday) * 100)
      : 0;

    // Calculate feedbacks change
    const feedbacksChange = prevWeekFeedbacks > 0
      ? Math.round(((weekFeedbacks - prevWeekFeedbacks) / prevWeekFeedbacks) * 100)
      : 0;

    // Count active menus
    const activeMenusCount = profiles.reduce((sum, p) => 
      sum + p.menus.filter(m => m.isActive).length, 0
    );

    // Transform profiles for frontend
    const profilesData = profiles.map(profile => {
      const activeMenus = profile.menus.filter(m => m.isActive).length;
      
      return {
        id: profile.id,
        name: profile.name,
        description: profile.description,
        logo: profile.logo,
        location: profile.location,
        activeMenus,
        totalMenus: profile._count.menus,
        totalFeedbacks: profile._count.feedbacks,
      };
    });

    const dashboardData = {
      user: userData,
      stats: {
        totalScansToday: totalScansToday,
        scansChange: scansChange,
        weekFeedbacks: weekFeedbacks,
        feedbacksChange: feedbacksChange,
        activeMenus: activeMenusCount,
        totalRestaurants: profiles.length,
      },
      profiles: profilesData,
    };

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
