import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth/route-guard';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const GET = withAdmin(async () => {
  try {
    const profiles = await prisma.profile.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        menus: {
          include: {
            _count: {
              select: {
                items: true,
              },
            },
          },
        },
        _count: {
          select: {
            menus: true,
            feedbacks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const menuProfileMap = new Map<string, string>();
    const menuIds: string[] = [];

    for (const profile of profiles) {
      for (const menu of profile.menus) {
        menuProfileMap.set(menu.id, profile.id);
        menuIds.push(menu.id);
      }
    }

    const analyticsByMenu = menuIds.length
      ? await prisma.analytics.groupBy({
          by: ['menuId'],
          where: { menuId: { in: menuIds } },
          _sum: { scans: true },
        })
      : [];

    const scansByProfile = new Map<string, number>();
    for (const entry of analyticsByMenu) {
      const profileId = menuProfileMap.get(entry.menuId);
      if (!profileId) continue;
      const existing = scansByProfile.get(profileId) ?? 0;
      scansByProfile.set(profileId, existing + (entry._sum.scans ?? 0));
    }

    const payload = profiles.map((profile) => {
      const totalItems = profile.menus.reduce((sum, menu) => sum + (menu._count?.items ?? 0), 0);
      const totalScanRecords = scansByProfile.get(profile.id) ?? 0;

      return {
        id: profile.id,
        name: profile.name,
        status: profile.status,
        owner: profile.owner
          ? {
              id: profile.owner.id,
              name: profile.owner.name,
              email: profile.owner.email,
              role: profile.owner.role,
            }
          : null,
        description: profile.description,
        menus: profile.menus.map((menu) => ({
          id: menu.id,
          name: menu.name,
          isActive: menu.isActive,
        })),
        location: profile.location,
        createdAt: profile.createdAt,
        stats: {
          menus: profile._count.menus,
          feedbacks: profile._count.feedbacks,
          items: totalItems,
          scanRecords: totalScanRecords,
        },
      };
    });

    return NextResponse.json({ profiles: payload }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin profiles:', error);
    return NextResponse.json(
      { error: 'Failed to load profiles' },
      { status: 500 }
    );
  }
});
