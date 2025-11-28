import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/lib/auth/route-guard';
import { TicketStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const respondSchema = z.object({
  ticketId: z.string().min(1),
  response: z.string().min(1),
  status: z.nativeEnum(TicketStatus).default(TicketStatus.RESOLVED),
});

export const GET = withAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const statusFilter = status && status in TicketStatus ? (status as TicketStatus) : undefined;

    const tickets = await prisma.supportTicket.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tickets }, { status: 200 });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Failed to load tickets' }, { status: 500 });
  }
});

export const PATCH = withAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = respondSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const { ticketId, response, status } = parsed.data;

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { response, status, respondedAt: new Date() },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    return NextResponse.json({ ticket }, { status: 200 });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
});
