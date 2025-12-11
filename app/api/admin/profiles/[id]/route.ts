import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/auth/route-guard';
import { ProfileStatus } from '@prisma/client';

const updateSchema = z.object({
  status: z.nativeEnum(ProfileStatus).optional(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
});

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return withAdmin(async (req) => {
    try {
      const body = await req.json();
      const parsed = updateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
      }

      const profile = await prisma.profile.update({
        where: { id },
        data: parsed.data,
        include: {
          owner: {
            select: { id: true, name: true, email: true, role: true },
          },
          menus: {
            include: {
              _count: {
                select: { items: true },
              },
            },
          },
          _count: {
            select: { menus: true, feedbacks: true },
          },
        },
      });

      const totalItems = profile.menus.reduce((sum, menu) => sum + (menu._count?.items ?? 0), 0);
      const menuIds = profile.menus.map((menu) => menu.id);
      const analyticsByMenu = menuIds.length
        ? await prisma.analytics.groupBy({
            by: ['menuId'],
            where: { menuId: { in: menuIds } },
            _sum: { scans: true },
          })
        : [];
      const totalScanRecords = analyticsByMenu.reduce(
        (sum, entry) => sum + (entry._sum.scans ?? 0),
        0
      );

      return NextResponse.json(
        {
          profile: {
            id: profile.id,
            name: profile.name,
            description: profile.description,
            location: profile.location,
            status: profile.status,
            createdAt: profile.createdAt,
            owner: profile.owner
              ? {
                  id: profile.owner.id,
                  name: profile.owner.name,
                  email: profile.owner.email,
                  role: profile.owner.role,
                }
              : null,
            stats: {
              menus: profile._count.menus,
              feedbacks: profile._count.feedbacks,
              items: totalItems,
              scanRecords: totalScanRecords,
            },
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
  })(request);
}
