import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateRequest } from '@/lib/auth/middleware';
import { findUserByEmail } from '@/lib/auth/db';
import prisma from '@/lib/prisma';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message || 'Invalid payload' },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    // Resolve userId: prefer auth header, fallback to existing user by email
    let userId: string | null = null;
    const authResult = await authenticateRequest(request);
    if (authResult.success && authResult.payload?.userId) {
      userId = authResult.payload.userId;
    } else {
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        userId = existingUser.id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Please log in to submit a ticket.' },
        { status: 401 }
      );
    }

    const ticketMessage = `${message}\n\n--\nName: ${name}\nEmail: ${email}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject,
        message: ticketMessage,
      },
    });

    return NextResponse.json(
      { ticketId: ticket.id, status: ticket.status },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact form ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to create support ticket.' },
      { status: 500 }
    );
  }
}
