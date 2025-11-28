import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth/route-guard';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const GET = withAdmin(async () => {
  try {
    const [usersCount, profilesCount, menusCount, itemsCount, feedbackCount] = await Promise.all([
      prisma.user.count(),
      prisma.profile.count(),
      prisma.menu.count(),
      prisma.item.count(),
      prisma.feedback.count(),
    ]);

    const data = {
      exportedAt: new Date().toISOString(),
      totals: {
        users: usersCount,
        profiles: profilesCount,
        menus: menusCount,
        items: itemsCount,
        feedbacks: feedbackCount,
      },
    };

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="qr-menus-admin-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
});
