import prisma from '@/lib/prisma';
import { NotificationType, Prisma } from '@prisma/client';

// Notification data types for different notification types
interface NotificationData {
  profileId?: string;
  profileName?: string;
  menuId?: string;
  menuName?: string;
  memberName?: string;
  memberEmail?: string;
  planName?: string;
  amount?: string;
  currency?: string;
  scanCount?: number;
  rating?: number;
  feedbackId?: string;
  link?: string;
}

// Create a notification
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: NotificationData
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: (data as Prisma.InputJsonValue) || null,
      },
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

// Get user's notifications
export async function getUserNotifications(
  userId: string,
  options?: {
    limit?: number;
    unreadOnly?: boolean;
    offset?: number;
  }
) {
  const { limit = 20, unreadOnly = false, offset = 0 } = options || {};

  const where: any = { userId };
  if (unreadOnly) {
    where.read = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  return { notifications, total, unreadCount };
}

// Mark notification as read
export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true, readAt: new Date() },
  });
}

// Mark all notifications as read
export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true, readAt: new Date() },
  });
}

// Delete a notification
export async function deleteNotification(notificationId: string, userId: string) {
  return prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });
}

// Delete all read notifications older than X days
export async function cleanupOldNotifications(userId: string, daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return prisma.notification.deleteMany({
    where: {
      userId,
      read: true,
      createdAt: { lt: cutoffDate },
    },
  });
}

// ============================================
// NOTIFICATION HELPERS FOR SPECIFIC EVENTS
// ============================================

// Welcome notification
export async function notifyWelcome(userId: string, userName: string) {
  return createNotification(
    userId,
    'WELCOME',
    'Welcome to QR Menus! 🎉',
    `Hi ${userName}, welcome aboard! Start by creating your first restaurant profile.`,
    { link: '/dashboard/profiles/new' }
  );
}

// Subscription notifications
export async function notifySubscriptionActivated(
  userId: string,
  planName: string,
  amount: string,
  currency: string
) {
  return createNotification(
    userId,
    'SUBSCRIPTION_ACTIVATED',
    'Subscription Activated! 🚀',
    `Your ${planName} plan is now active. Enjoy all the premium features!`,
    { planName, amount, currency, link: '/dashboard/settings/subscription' }
  );
}

export async function notifySubscriptionExpiring(userId: string, planName: string, daysLeft: number) {
  return createNotification(
    userId,
    'SUBSCRIPTION_EXPIRING',
    'Subscription Expiring Soon ⏰',
    `Your ${planName} plan expires in ${daysLeft} days. Renew now to avoid interruption.`,
    { planName, link: '/dashboard/settings/plans' }
  );
}

export async function notifySubscriptionExpired(userId: string, planName: string) {
  return createNotification(
    userId,
    'SUBSCRIPTION_EXPIRED',
    'Subscription Expired 😢',
    `Your ${planName} plan has expired. Your account is now on the Free plan.`,
    { planName, link: '/dashboard/settings/plans' }
  );
}

export async function notifySubscriptionPaused(userId: string, planName: string, resumeDate: string) {
  return createNotification(
    userId,
    'SUBSCRIPTION_PAUSED',
    'Subscription Paused ⏸️',
    `Your ${planName} plan has been paused. It will resume on ${resumeDate}.`,
    { planName, link: '/dashboard/settings/subscription' }
  );
}

export async function notifySubscriptionResumed(userId: string, planName: string) {
  return createNotification(
    userId,
    'SUBSCRIPTION_RESUMED',
    'Subscription Resumed ▶️',
    `Your ${planName} plan is now active again. Welcome back!`,
    { planName, link: '/dashboard/settings/subscription' }
  );
}

export async function notifySubscriptionCancelled(userId: string, planName: string, endDate: string) {
  return createNotification(
    userId,
    'SUBSCRIPTION_CANCELLED',
    'Subscription Cancelled',
    `Your ${planName} plan has been cancelled. You'll have access until ${endDate}.`,
    { planName, link: '/dashboard/settings/plans' }
  );
}

// Payment notifications
export async function notifyPaymentSuccess(
  userId: string,
  amount: string,
  currency: string,
  planName: string
) {
  return createNotification(
    userId,
    'PAYMENT_SUCCESS',
    'Payment Successful ✅',
    `Your payment of ${amount} ${currency} for ${planName} was successful.`,
    { amount, currency, planName, link: '/dashboard/settings' }
  );
}

export async function notifyPaymentFailed(userId: string, amount: string, currency: string) {
  return createNotification(
    userId,
    'PAYMENT_FAILED',
    'Payment Failed ❌',
    `Your payment of ${amount} ${currency} failed. Please update your payment method.`,
    { amount, currency, link: '/dashboard/settings' }
  );
}

// Team notifications
export async function notifyTeamInvitation(
  userId: string,
  profileName: string,
  inviterName: string
) {
  return createNotification(
    userId,
    'TEAM_INVITATION',
    'Team Invitation 👥',
    `${inviterName} has invited you to join ${profileName}.`,
    { profileName, link: '/dashboard' }
  );
}

export async function notifyTeamMemberJoined(
  userId: string,
  profileId: string,
  profileName: string,
  memberName: string
) {
  return createNotification(
    userId,
    'TEAM_MEMBER_JOINED',
    'New Team Member! 🎉',
    `${memberName} has joined ${profileName}.`,
    { profileId, profileName, memberName, link: `/dashboard/profiles/${profileId}/settings` }
  );
}

export async function notifyTeamMemberLeft(
  userId: string,
  profileId: string,
  profileName: string,
  memberName: string
) {
  return createNotification(
    userId,
    'TEAM_MEMBER_LEFT',
    'Team Member Left',
    `${memberName} has left ${profileName}.`,
    { profileId, profileName, memberName, link: `/dashboard/profiles/${profileId}/settings` }
  );
}

export async function notifyTeamRoleChanged(
  userId: string,
  profileName: string,
  newRole: string
) {
  return createNotification(
    userId,
    'TEAM_ROLE_CHANGED',
    'Role Updated',
    `Your role in ${profileName} has been changed to ${newRole}.`,
    { profileName }
  );
}

// Restaurant & Menu notifications
export async function notifyNewFeedback(
  userId: string,
  profileId: string,
  profileName: string,
  rating: number,
  feedbackId: string
) {
  const stars = '⭐'.repeat(rating);
  return createNotification(
    userId,
    'NEW_FEEDBACK',
    `New ${rating}-Star Review ${stars}`,
    `${profileName} received a new ${rating}-star review.`,
    { profileId, profileName, rating, feedbackId, link: `/dashboard/profiles/${profileId}/feedbacks` }
  );
}

export async function notifyMenuPublished(
  userId: string,
  profileId: string,
  menuId: string,
  menuName: string
) {
  return createNotification(
    userId,
    'MENU_PUBLISHED',
    'Menu Published! 📱',
    `Your menu "${menuName}" is now live and ready for customers.`,
    { profileId, menuId, menuName, link: `/dashboard/profiles/${profileId}/menus/${menuId}` }
  );
}

export async function notifyQrScanMilestone(
  userId: string,
  profileId: string,
  menuId: string,
  menuName: string,
  scanCount: number
) {
  return createNotification(
    userId,
    'QR_SCAN_MILESTONE',
    `${scanCount} QR Scans! 🎯`,
    `Congratulations! Your menu "${menuName}" has reached ${scanCount} scans.`,
    { profileId, menuId, menuName, scanCount, link: `/dashboard/profiles/${profileId}/menus/${menuId}/analytics` }
  );
}

// System notifications
export async function notifySystemUpdate(userId: string, title: string, message: string) {
  return createNotification(
    userId,
    'SYSTEM_UPDATE',
    title,
    message
  );
}

export async function notifySecurityAlert(userId: string, message: string) {
  return createNotification(
    userId,
    'SECURITY_ALERT',
    'Security Alert 🔒',
    message,
    { link: '/dashboard/settings' }
  );
}
