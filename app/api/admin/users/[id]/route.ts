import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/auth/route-guard';
import { Role } from '@/lib/auth/types';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
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

      const updates = parsed.data;
      if (updates.email) {
        const existing = await prisma.user.findUnique({ where: { email: updates.email } });
        if (existing && existing.id !== id) {
          return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: updates,
        include: { _count: { select: { profiles: true } } },
      });

      if (updates.isActive === false) {
        await prisma.refreshToken.deleteMany({ where: { userId: id } });
      }

      return NextResponse.json(
        {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            profileCount: user._count.profiles,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
  })(request);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return withAdmin(async () => {
    try {
      const profileCount = await prisma.profile.count({ where: { ownerId: id } });
      if (profileCount > 0) {
        return NextResponse.json(
          { error: 'Cannot delete user with existing profiles. Reassign or remove profiles first.' },
          { status: 409 }
        );
      }

      await prisma.refreshToken.deleteMany({ where: { userId: id } });
      await prisma.user.delete({ where: { id } });
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
  })(request);
}
