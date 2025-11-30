import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET - Fetch public feedbacks (for testimonials)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const profileId = searchParams.get('profileId');
    const minRating = parseInt(searchParams.get('minRating') || '4');

    // Build query
    const where: any = {
      rating: { gte: minRating },
    };

    if (profileId) {
      where.profileId = profileId;
    }

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        profile: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Transform data for public display
    const publicFeedbacks = feedbacks.map(feedback => ({
      id: feedback.id,
      userName: feedback.userName,
      rating: feedback.rating,
      comment: feedback.comment,
      restaurantName: feedback.profile.name,
      createdAt: feedback.createdAt,
    }));

    return NextResponse.json({ feedbacks: publicFeedbacks }, { status: 200 });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedbacks' },
      { status: 500 }
    );
  }
}

// POST - Create new feedback
const createFeedbackSchema = z.object({
  profileId: z.string().min(1),
  userName: z.string().min(1, 'Name is required'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues },
        { status: 400 }
      );
    }

    const { profileId, userName, rating, comment } = parsed.data;

    // Verify profile exists
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Restaurant profile not found' },
        { status: 404 }
      );
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        profileId,
        userName,
        rating,
        comment: comment || null,
      },
    });

    return NextResponse.json(
      { message: 'Feedback submitted successfully', feedback },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

