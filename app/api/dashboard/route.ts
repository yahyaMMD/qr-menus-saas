import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { Role } from '@/lib/auth/types';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);

    if (!authResult.success || !authResult.payload) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const user = authResult.payload;

    if (user.role !== Role.RESTAURANT_OWNER) {
      return NextResponse.json({ error: 'Access denied. Only restaurant owners can access this.' }, { status: 403 });
    }

    // just dummy data (will be replaced with real data later)
    const dashboardData = {
      message: `Welcome to your restaurant dashboard, ${user.email}!`,
      stats: {
        totalOrders: 234,
        pendingOrders: 12,
        menuItems: 15,
      },
    };

    return NextResponse.json(dashboardData, { status: 200 });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
