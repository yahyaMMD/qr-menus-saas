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

    // Fetch feedbacks for this profile
    const feedbacks = await prisma.feedback.findMany({
      where: { profileId: profileId },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const totalReviews = feedbacks.length;
    const avgRating = totalReviews > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalReviews
      : 0;

    const distribution = {
      5: feedbacks.filter(f => f.rating === 5).length,
      4: feedbacks.filter(f => f.rating === 4).length,
      3: feedbacks.filter(f => f.rating === 3).length,
      2: feedbacks.filter(f => f.rating === 2).length,
      1: feedbacks.filter(f => f.rating === 1).length,
    };

    // Format feedbacks with relative dates
    const formattedFeedbacks = feedbacks.map(f => {
      const now = new Date();
      const created = new Date(f.createdAt);
      const diffMs = now.getTime() - created.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      let dateStr = '';
      if (diffDays === 0) dateStr = 'Today';
      else if (diffDays === 1) dateStr = 'Yesterday';
      else if (diffDays < 7) dateStr = `${diffDays} days ago`;
      else if (diffDays < 30) dateStr = `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
      else dateStr = `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;

      return {
        id: f.id,
        userName: f.userName,
        rating: f.rating,
        comment: f.comment,
        date: dateStr,
        createdAt: f.createdAt,
      };
    });

    return NextResponse.json({
      profile: {
        id: profile.id,
        name: profile.name,
      },
      stats: {
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalReviews,
        distribution,
      },
      feedbacks: formattedFeedbacks,
    }, { status: 200 });
  } catch (error) {
    console.error('Feedbacks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

