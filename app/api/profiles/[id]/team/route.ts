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

// GET - List all team members for a profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;
  const { id: profileId } = await params;

  try {
    // Check profile exists and user has access
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { ownerId: true, name: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if user is owner or team member
    const isOwner = profile.ownerId === user.id;
    const teamMember = await prisma.teamMember.findFirst({
      where: { profileId, email: user.email },
    });

    if (!isOwner && !teamMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch team members
    const teamMembers = await prisma.teamMember.findMany({
      where: { profileId },
      orderBy: { invitedAt: 'desc' },
    });

    return NextResponse.json({
      teamMembers,
      isOwner,
      currentUserRole: teamMember?.role || (isOwner ? 'OWNER' : null),
    });
  } catch (error) {
    console.error('Get team error:', error);
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}

const addMemberSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  name: z.string().min(1, { message: 'Name is required' }),
  role: z.enum(['MANAGER', 'STAFF']).default('STAFF'),
});

// POST - Add a new team member
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;
  const { id: profileId } = await params;

  try {
    // Check profile exists and user is owner
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { ownerId: true, name: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.ownerId !== user.id) {
      // Check if user is a manager
      const teamMember = await prisma.teamMember.findFirst({
        where: { profileId, email: user.email, role: 'MANAGER' },
      });

      if (!teamMember) {
        return NextResponse.json(
          { error: 'Only owners and managers can add team members' },
          { status: 403 }
        );
      }
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parseResult = addMemberSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { email, name, role } = parseResult.data;

    // Check if email is not the owner's email
    const owner = await prisma.user.findUnique({
      where: { id: profile.ownerId },
      select: { email: true },
    });

    if (owner?.email === email) {
      return NextResponse.json(
        { error: 'Cannot add the owner as a team member' },
        { status: 400 }
      );
    }

    // Check if already a team member
    const existing = await prisma.teamMember.findFirst({
      where: { profileId, email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already a team member' },
        { status: 400 }
      );
    }

    // Check if this email is a registered user
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    // Create team member
    const teamMember = await prisma.teamMember.create({
      data: {
        profileId,
        email,
        name,
        role,
        userId: existingUser?.id || null,
        acceptedAt: existingUser ? new Date() : null, // Auto-accept if user exists
      },
    });

    return NextResponse.json(
      { message: 'Team member added successfully', teamMember },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add team member error:', error);
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    );
  }
}

