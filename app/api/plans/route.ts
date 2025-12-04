import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

// GET plans with user subscription info
export async function GET(request: NextRequest) {
  try {
    // Fetch all plans from catalog
    const plans = await prisma.planCatalog.findMany({
      orderBy: { priceCents: 'asc' },
    });

    // Check if user is authenticated to get their subscription
    const authResult = await authenticateRequest(request);
    let currentSubscription = null;

    if (authResult.success && authResult.payload?.userId) {
      currentSubscription = await prisma.subscription.findFirst({
        where: { 
          userId: authResult.payload.userId,
          active: true,
          status: 'ACTIVE'
        },
        orderBy: { id: 'desc' },
      });
    }

    // Plan features configuration, I think this is good as config
    const planFeatures: Record<string, { features: string[]; limitations: string[]; description: string }> = {
      FREE: {
        description: 'Perfect for small restaurants getting started',
        features: [
          '1 Restaurant Profile',
          '1 Digital Menu',
          'Basic QR Code',
          'Up to 10 menu items',
          '5 QR scans per day',
          'Community Support',
        ],
        limitations: [
          'No custom branding',
          'No analytics',
        ],
      },
      STANDARD: {
        description: 'Most popular for growing restaurants',
        features: [
          '3 Restaurant Profiles',
          '3 Digital Menus per profile',
          'Custom QR Codes',
          'Up to 50 menu items',
          '100 QR scans per day',
          'Advanced Analytics',
          'Priority Email Support',
          'Menu Customization',
          'Customer Feedback Collection',
        ],
        limitations: [],
      },
      CUSTOM: {
        description: 'For enterprises and restaurant chains',
        features: [
          'Unlimited Restaurant Profiles',
          'Unlimited Digital Menus',
          'Premium QR Codes with Analytics',
          'Unlimited menu items',
          'Unlimited QR scans',
          'Real-time Analytics & Reports',
          '24/7 Priority Support',
          'White-label Solution',
          'API Access',
          'Custom Integrations',
          'Dedicated Account Manager',
        ],
        limitations: [],
      },
    };

    // Merge plan data with features
    const enrichedPlans = plans.map((plan) => ({
      ...plan,
      ...planFeatures[plan.plan] || { features: [], limitations: [], description: '' },
    }));

    return NextResponse.json({
      plans: enrichedPlans,
      currentSubscription,
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

