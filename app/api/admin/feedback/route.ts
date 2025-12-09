import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth/route-guard';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const GET = withAdmin(async (_request: NextRequest) => {
  try {
    const feedback = await prisma.feedback.findMany({
      include: {
        profile: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      {
        feedback: feedback.map((f) => ({
          id: f.id,
          userName: f.userName,
          rating: f.rating,
          comment: f.comment,
          createdAt: f.createdAt,
          profile: f.profile ? { id: f.profile.id, name: f.profile.name } : null,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw new Error('Failed to load feedback');
  }
});
