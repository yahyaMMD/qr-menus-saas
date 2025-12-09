import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { findUserById } from '@/lib/auth/db';
import { prisma } from '@/lib/prisma';
import { 
  sendEmail, 
  getSubscriptionPausedEmailTemplate, 
  getSubscriptionCancelledEmailTemplate 
} from '@/lib/email';
import {
  notifySubscriptionPaused,
  notifySubscriptionResumed,
  notifySubscriptionCancelled
} from '@/lib/notifications';

async function getAuthenticatedUser(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (!authResult.success || !authResult.payload) {
    return {
      response: NextResponse.json(
        { error: authResult.error || 'Unautt workshorized' },
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

// GET /api/subscription - Get current user's subscription
export async function GET(request: NextRequest) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;

  try {
    // Get the user's active subscription
    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id },
      orderBy: { expiresAt: 'desc' },
    });

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        message: 'No active subscription found',
      });
    }

    // Get plan details from PlanCatalog
    const planDetails = await prisma.planCatalog.findUnique({
      where: { plan: subscription.plan },
    });

    // Get usage statistics
    const profileCount = await prisma.profile.count({
      where: { ownerId: user.id },
    });

    const menuCount = await prisma.menu.count({
      where: { profile: { ownerId: user.id } },
    });

    // Calculate days until next billing
    const now = new Date();
    const daysRemaining = Math.ceil(
      (subscription.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        expiresAt: subscription.expiresAt,
        pausedAt: subscription.pausedAt,
        resumesAt: subscription.resumesAt,
        canceledAt: subscription.canceledAt,
        priceCents: subscription.priceCents,
        currency: subscription.currency || 'DZD',
      },
      planDetails: planDetails
        ? {
            plan: planDetails.plan,
            description: planDetails.description,
            priceCents: planDetails.priceCents,
            currency: planDetails.currency,
          }
        : null,
      usage: {
        profiles: profileCount,
        menus: menuCount,
      },
      daysRemaining,
    });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

// PATCH /api/subscription - Update subscription (pause, resume, cancel, reactivate)
export async function PATCH(request: NextRequest) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;

  try {
    const body = await request.json();
    const { action, pauseDuration, reason, feedback } = body;

    // Get current subscription
    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'pause':
        if (subscription.status !== 'ACTIVE') {
          return NextResponse.json(
            { error: 'Can only pause an active subscription' },
            { status: 400 }
          );
        }

        const pauseMonths = parseInt(pauseDuration) || 1;
        const resumesAt = new Date();
        resumesAt.setMonth(resumesAt.getMonth() + pauseMonths);

        updateData = {
          status: 'PAUSED',
          pausedAt: new Date(),
          resumesAt,
          active: false,
        };
        break;

      case 'resume':
        if (subscription.status !== 'PAUSED') {
          return NextResponse.json(
            { error: 'Can only resume a paused subscription' },
            { status: 400 }
          );
        }

        const newExpiresAt = new Date();
        newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);

        updateData = {
          status: 'ACTIVE',
          pausedAt: null,
          resumesAt: null,
          active: true,
          expiresAt: newExpiresAt,
        };
        break;

      case 'cancel':
        if (subscription.status === 'CANCELED') {
          return NextResponse.json(
            { error: 'Subscription is already canceled' },
            { status: 400 }
          );
        }

        updateData = {
          status: 'CANCELED',
          canceledAt: new Date(),
          cancelReason: reason || null,
          cancelFeedback: feedback || null,
          active: false,
          // Keep access until expiresAt
        };
        break;

      case 'reactivate':
        if (subscription.status !== 'CANCELED') {
          return NextResponse.json(
            { error: 'Can only reactivate a canceled subscription' },
            { status: 400 }
          );
        }

        // Reactivate and extend for 1 month
        const reactivateExpiresAt = new Date();
        reactivateExpiresAt.setMonth(reactivateExpiresAt.getMonth() + 1);

        updateData = {
          status: 'ACTIVE',
          canceledAt: null,
          cancelReason: null,
          cancelFeedback: null,
          active: true,
          expiresAt: reactivateExpiresAt,
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: pause, resume, cancel, or reactivate' },
          { status: 400 }
        );
    }

    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: updateData,
    });

    // Send notification emails and create in-app notifications
    if (action === 'pause' && updateData.resumesAt) {
      const resumeDate = updateData.resumesAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      const pausedEmail = getSubscriptionPausedEmailTemplate({
        name: user.name,
        plan: subscription.plan,
        resumeDate,
      });
      sendEmail({
        to: user.email,
        subject: pausedEmail.subject,
        html: pausedEmail.html,
      }).catch(err => console.error('Failed to send pause email:', err));

      // In-app notification
      notifySubscriptionPaused(user.id, subscription.plan, resumeDate)
        .catch(err => console.error('Failed to create pause notification:', err));
    }

    if (action === 'resume') {
      // In-app notification
      notifySubscriptionResumed(user.id, subscription.plan)
        .catch(err => console.error('Failed to create resume notification:', err));
    }

    if (action === 'cancel') {
      const endDate = subscription.expiresAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      const cancelledEmail = getSubscriptionCancelledEmailTemplate({
        name: user.name,
        plan: subscription.plan,
        endDate,
      });
      sendEmail({
        to: user.email,
        subject: cancelledEmail.subject,
        html: cancelledEmail.html,
      }).catch(err => console.error('Failed to send cancel email:', err));

      // In-app notification
      notifySubscriptionCancelled(user.id, subscription.plan, endDate)
        .catch(err => console.error('Failed to create cancel notification:', err));
    }

    return NextResponse.json({
      message: `Subscription ${action}d successfully`,
      subscription: {
        id: updatedSubscription.id,
        plan: updatedSubscription.plan,
        status: updatedSubscription.status,
        expiresAt: updatedSubscription.expiresAt,
        pausedAt: updatedSubscription.pausedAt,
        resumesAt: updatedSubscription.resumesAt,
        canceledAt: updatedSubscription.canceledAt,
      },
    });
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
