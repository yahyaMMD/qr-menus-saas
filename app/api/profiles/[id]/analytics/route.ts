import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request);

    if (!authResult.success || !authResult.payload) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: profileId } = await params;

    // Verify profile belongs to user
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        menus: {
          select: { id: true, name: true },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (profile.ownerId !== authResult.payload.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30'; // days
    const days = parseInt(range);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const menuIds = profile.menus.map(m => m.id);

    // Fetch analytics data
    const analytics = await prisma.analytics.findMany({
      where: {
        menuId: { in: menuIds },
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    // Calculate total scans
    const totalScans = analytics.reduce((sum, a) => sum + a.scans, 0);

    // Calculate average daily scans
    const avgDailyScans = days > 0 ? Math.round(totalScans / days) : 0;

    // Get daily scans array
    const dailyScans: number[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAnalytics = analytics.filter(a => 
        a.date.toISOString().split('T')[0] === dateStr
      );
      const dayTotal = dayAnalytics.reduce((sum, a) => sum + a.scans, 0);
      dailyScans.push(dayTotal);
    }

    // Get feedbacks
    const feedbacks = await prisma.feedback.findMany({
      where: {
        profileId: profileId,
        createdAt: { gte: startDate },
      },
    });

    const avgRating = feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : 0;

    // Get menu items for most viewed calculation
    const items = await prisma.item.findMany({
      where: { menuId: { in: menuIds } },
      select: {
        id: true,
        name: true,
      },
    });

    // Mock most viewed items (in real scenario, you'd track item views)
    const mostViewedItems = items.slice(0, 5).map((item, idx) => ({
      name: item.name,
      views: Math.max(50, 250 - idx * 40),
    }));

    // Calculate hourly distribution (simplified mock)
    const hourlyData = [
      { hour: '12am', value: Math.round(avgDailyScans * 0.05) },
      { hour: '3am', value: Math.round(avgDailyScans * 0.02) },
      { hour: '6am', value: Math.round(avgDailyScans * 0.08) },
      { hour: '9am', value: Math.round(avgDailyScans * 0.25) },
      { hour: '12pm', value: Math.round(avgDailyScans * 0.65) },
      { hour: '3pm', value: Math.round(avgDailyScans * 0.45) },
      { hour: '6pm', value: Math.round(avgDailyScans * 0.95) },
      { hour: '9pm', value: Math.round(avgDailyScans * 0.70) },
    ];

    // Calculate heatmap (day x hour) - simplified
    const heatmapData = [];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    for (let day = 0; day < 7; day++) {
      const dayData = [];
      for (let hour = 0; hour < 7; hour++) {
        // Weekends and dinner times are busier
        const isWeekend = day >= 5;
        const isDinner = hour >= 4 && hour <= 6;
        let baseValue = Math.round(avgDailyScans / 7);
        if (isWeekend) baseValue *= 1.3;
        if (isDinner) baseValue *= 1.5;
        dayData.push(Math.round(baseValue + Math.random() * 5));
      }
      heatmapData.push(dayData);
    }

    const analyticsData = {
      profile: {
        id: profile.id,
        name: profile.name,
      },
      stats: {
        totalScans,
        avgDailyScans,
        avgRating: parseFloat(avgRating.toFixed(1)),
        newReviews: feedbacks.length,
        peakHours: '6pm - 9pm',
      },
      dailyScans,
      hourlyData,
      heatmapData,
      mostViewedItems,
    };

    return NextResponse.json(analyticsData, { status: 200 });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

