import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth/middleware';
import { findUserById } from '@/lib/auth/db';
import { z } from 'zod';

async function getAuthenticatedUser(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (!authResult.success || !authResult.payload) {
    return {
      response: NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      ),
    };
  }
  const user = await findUserById(authResult.payload.userId);
  if (!user) {
    return {
      response: NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      ),
    };
  }
  return { user };
}

const updateMemberSchema = z.object({
  role: z.enum(['MANAGER', 'STAFF']),
});

// PATCH - Update team member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;
  const { id: profileId, memberId } = await params;

  try {
    // Check profile exists and user is owner
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { ownerId: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Only owners can update roles
    if (profile.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Only the owner can update team member roles' },
        { status: 403 }
      );
    }

    // Check team member exists
    const existingMember = await prisma.teamMember.findFirst({
      where: { id: memberId, profileId },
    });

    if (!existingMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parseResult = updateMemberSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { role } = parseResult.data;

    // Update team member
    const teamMember = await prisma.teamMember.update({
      where: { id: memberId },
      data: { role },
    });

    return NextResponse.json({
      message: 'Team member updated successfully',
      teamMember,
    });
  } catch (error) {
    console.error('Update team member error:', error);
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}

// DELETE - Remove team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;
  const { id: profileId, memberId } = await params;

  try {
    // Check profile exists
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { ownerId: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check team member exists
    const existingMember = await prisma.teamMember.findFirst({
      where: { id: memberId, profileId },
    });

    if (!existingMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Check permissions: owner can remove anyone, managers can remove staff
    const isOwner = profile.ownerId === user.id;
    
    if (!isOwner) {
      // Check if user is a manager
      const currentUserMember = await prisma.teamMember.findFirst({
        where: { profileId, email: user.email, role: 'MANAGER' },
      });

      if (!currentUserMember) {
        return NextResponse.json(
          { error: 'Only owners and managers can remove team members' },
          { status: 403 }
        );
      }

      // Managers can only remove staff, not other managers
      if (existingMember.role === 'MANAGER') {
        return NextResponse.json(
          { error: 'Managers cannot remove other managers' },
          { status: 403 }
        );
      }
    }

    // Delete team member
    await prisma.teamMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ message: 'Team member removed successfully' });
  } catch (error) {
    console.error('Delete team member error:', error);
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}

