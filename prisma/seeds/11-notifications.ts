import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedNotifications() {
  console.log('🔔 Seeding notifications...');

  // Get the test user (restaurant owner)
  const user = await prisma.user.findFirst({
    where: { email: 'owner@qrmenus.test' },
  });

  if (!user) {
    console.log('⚠️ Test user not found. Please run user seeds first.');
    return;
  }

  // Get a profile for reference
  const profile = await prisma.profile.findFirst({
    where: { ownerId: user.id },
  });

  // Get a menu for reference
  const menu = profile ? await prisma.menu.findFirst({
    where: { profileId: profile.id },
  }) : null;

  // Clear existing notifications for this user
  await prisma.notification.deleteMany({
    where: { userId: user.id },
  });

  const now = new Date();

  // Create sample notifications
  const notifications = [
    // Welcome notification (oldest)
    {
      userId: user.id,
      type: 'WELCOME' as const,
      title: 'Welcome to QR Menus! 🎉',
      message: `Hi ${user.name}, welcome aboard! Start by creating your first restaurant profile.`,
      data: { link: '/dashboard/profiles/new' },
      read: true,
      readAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
    // Subscription activated
    {
      userId: user.id,
      type: 'SUBSCRIPTION_ACTIVATED' as const,
      title: 'Subscription Activated! 🚀',
      message: 'Your STANDARD plan is now active. Enjoy all the premium features!',
      data: { planName: 'STANDARD', amount: '2500', currency: 'DA', link: '/dashboard/settings/subscription' },
      read: true,
      readAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    },
    // Payment success
    {
      userId: user.id,
      type: 'PAYMENT_SUCCESS' as const,
      title: 'Payment Successful ✅',
      message: 'Your payment of 2,500 DA for STANDARD was successful.',
      data: { amount: '2500', currency: 'DA', planName: 'STANDARD', link: '/dashboard/settings' },
      read: true,
      readAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    },
    // Menu published
    {
      userId: user.id,
      type: 'MENU_PUBLISHED' as const,
      title: 'Menu Published! 📱',
      message: `Your menu "${menu?.name || 'Main Menu'}" is now live and ready for customers.`,
      data: { 
        profileId: profile?.id, 
        menuId: menu?.id, 
        menuName: menu?.name || 'Main Menu',
        link: menu && profile ? `/dashboard/profiles/${profile.id}/menus/${menu.id}` : '/dashboard/profiles'
      },
      read: true,
      readAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
    // New feedback (5 star)
    {
      userId: user.id,
      type: 'NEW_FEEDBACK' as const,
      title: 'New 5-Star Review ⭐⭐⭐⭐⭐',
      message: `${profile?.name || 'Your restaurant'} received a new 5-star review.`,
      data: { 
        profileId: profile?.id, 
        profileName: profile?.name || 'Your restaurant', 
        rating: 5,
        link: profile ? `/dashboard/profiles/${profile.id}/feedbacks` : '/dashboard/profiles'
      },
      read: true,
      readAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
    // QR Scan milestone
    {
      userId: user.id,
      type: 'QR_SCAN_MILESTONE' as const,
      title: '100 QR Scans! 🎯',
      message: `Congratulations! Your menu "${menu?.name || 'Main Menu'}" has reached 100 scans.`,
      data: { 
        profileId: profile?.id, 
        menuId: menu?.id, 
        menuName: menu?.name || 'Main Menu',
        scanCount: 100,
        link: menu && profile ? `/dashboard/profiles/${profile.id}/menus/${menu.id}/analytics` : '/dashboard/profiles'
      },
      read: false,
      readAt: null,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
    // New feedback (4 star)
    {
      userId: user.id,
      type: 'NEW_FEEDBACK' as const,
      title: 'New 4-Star Review ⭐⭐⭐⭐',
      message: `${profile?.name || 'Your restaurant'} received a new 4-star review.`,
      data: { 
        profileId: profile?.id, 
        profileName: profile?.name || 'Your restaurant', 
        rating: 4,
        link: profile ? `/dashboard/profiles/${profile.id}/feedbacks` : '/dashboard/profiles'
      },
      read: false,
      readAt: null,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
    // Team member joined
    {
      userId: user.id,
      type: 'TEAM_MEMBER_JOINED' as const,
      title: 'New Team Member! 🎉',
      message: `Ahmed has joined ${profile?.name || 'your restaurant'}.`,
      data: { 
        profileId: profile?.id, 
        profileName: profile?.name || 'your restaurant',
        memberName: 'Ahmed',
        link: profile ? `/dashboard/profiles/${profile.id}/settings` : '/dashboard/profiles'
      },
      read: false,
      readAt: null,
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
    // Subscription expiring soon
    {
      userId: user.id,
      type: 'SUBSCRIPTION_EXPIRING' as const,
      title: 'Subscription Expiring Soon ⏰',
      message: 'Your STANDARD plan expires in 7 days. Renew now to avoid interruption.',
      data: { planName: 'STANDARD', link: '/dashboard/settings/plans' },
      read: false,
      readAt: null,
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    // System update
    {
      userId: user.id,
      type: 'SYSTEM_UPDATE' as const,
      title: 'New Feature: Multilingual Menus 🌍',
      message: 'You can now create menus in multiple languages! Arabic, French, and English are supported.',
      data: { link: '/dashboard/profiles' },
      read: false,
      readAt: null,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    // New feedback (5 star - recent)
    {
      userId: user.id,
      type: 'NEW_FEEDBACK' as const,
      title: 'New 5-Star Review ⭐⭐⭐⭐⭐',
      message: `${profile?.name || 'Your restaurant'} received a new 5-star review: "Amazing food and great service!"`,
      data: { 
        profileId: profile?.id, 
        profileName: profile?.name || 'Your restaurant', 
        rating: 5,
        link: profile ? `/dashboard/profiles/${profile.id}/feedbacks` : '/dashboard/profiles'
      },
      read: false,
      readAt: null,
      createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
    },
  ];

  // Create all notifications
  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    });
  }

  const unreadCount = notifications.filter(n => !n.read).length;
  console.log(`✅ Created ${notifications.length} notifications (${unreadCount} unread)`);
}

// Run if called directly
if (require.main === module) {
  seedNotifications()
    .then(() => {
      console.log('✅ Notification seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error seeding notifications:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

