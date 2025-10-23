import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleError } from "@/lib/api-utils";

interface Params {
  params: { profileId: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    
    // Verify profile ownership
    const profile = await prisma.profile.findFirst({
      where: { 
        id: params.profileId,
        ownerId: session.user.id 
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { profileId: params.profileId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    // Public endpoint - no auth required
    const body = await request.json();
    const { userName, rating, comment } = body;

    // Verify profile exists
    const profile = await prisma.profile.findFirst({
      where: { id: params.profileId }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        profileId: params.profileId,
        userName: userName || "Anonymous",
        rating,
        comment
      }
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}