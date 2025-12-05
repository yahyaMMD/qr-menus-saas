import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth/middleware';
import { z } from 'zod';

// POST - Accept team invitation
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.payload) {
      return NextResponse.json(
        { error: 'Please log in to accept the invitation' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const schema = z.object({
      token: z.string().min(1, 'Token is required'),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const { token } = parsed.data;

    // Find invitation
    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation link' },
        { status: 404 }
      );
    }

    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: 'This invitation has already been accepted' },
        { status: 400 }
      );
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This invitation has expired. Please ask for a new invitation.' },
        { status: 410 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: authResult.payload.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if invitation email matches user email
    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'This invitation was sent to a different email address' },
        { status: 403 }
      );
    }

    // Get profile name for response
    const profile = await prisma.profile.findUnique({
      where: { id: invitation.profileId },
      select: { name: true },
    });

    // Update team member
    await prisma.teamMember.updateMany({
      where: {
        profileId: invitation.profileId,
        email: invitation.email,
      },
      data: {
        userId: user.id,
        acceptedAt: new Date(),
      },
    });

    // Mark invitation as accepted
    await prisma.teamInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    return NextResponse.json({
      message: 'Invitation accepted successfully',
      restaurantName: profile?.name || 'the restaurant',
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}

