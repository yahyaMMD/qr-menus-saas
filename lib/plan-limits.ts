import { Plan } from '@prisma/client';
import prisma from '@/lib/prisma';

// Plan limits configuration
export const PLAN_LIMITS = {
  FREE: {
    maxProfiles: 1,
    maxMenusPerProfile: 1,
    maxItemsPerMenu: 10,
    maxScansPerDay: 5,
  },
  STANDARD: {
    maxProfiles: 3,
    maxMenusPerProfile: 3,
    maxItemsPerMenu: 50,
    maxScansPerDay: 100,
  },
  CUSTOM: {
    maxProfiles: Infinity,
    maxMenusPerProfile: Infinity,
    maxItemsPerMenu: Infinity,
    maxScansPerDay: Infinity,
  },
} as const;

export type PlanLimits = typeof PLAN_LIMITS[keyof typeof PLAN_LIMITS];

// Get user's current plan
export async function getUserPlan(userId: string): Promise<Plan> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      active: true,
      status: 'ACTIVE',
    },
    orderBy: { id: 'desc' },
  });

  return subscription?.plan || 'FREE';
}

// Get plan limits for a user
export async function getUserPlanLimits(userId: string): Promise<PlanLimits> {
  const plan = await getUserPlan(userId);
  return PLAN_LIMITS[plan];
}

// Check if user can create a new profile
export async function canCreateProfile(userId: string): Promise<{ allowed: boolean; message?: string; current: number; max: number }> {
  const limits = await getUserPlanLimits(userId);
  
  const profileCount = await prisma.profile.count({
    where: { ownerId: userId },
  });

  if (profileCount >= limits.maxProfiles) {
    const plan = await getUserPlan(userId);
    return {
      allowed: false,
      message: `You've reached the maximum of ${limits.maxProfiles} restaurant profile${limits.maxProfiles > 1 ? 's' : ''} for your ${plan} plan. Upgrade to add more.`,
      current: profileCount,
      max: limits.maxProfiles,
    };
  }

  return { allowed: true, current: profileCount, max: limits.maxProfiles };
}

// Check if user can create a new menu for a profile
export async function canCreateMenu(userId: string, profileId: string): Promise<{ allowed: boolean; message?: string; current: number; max: number }> {
  const limits = await getUserPlanLimits(userId);

  const menuCount = await prisma.menu.count({
    where: { profileId },
  });

  if (menuCount >= limits.maxMenusPerProfile) {
    const plan = await getUserPlan(userId);
    return {
      allowed: false,
      message: `You've reached the maximum of ${limits.maxMenusPerProfile} menu${limits.maxMenusPerProfile > 1 ? 's' : ''} per profile for your ${plan} plan. Upgrade to add more.`,
      current: menuCount,
      max: limits.maxMenusPerProfile,
    };
  }

  return { allowed: true, current: menuCount, max: limits.maxMenusPerProfile };
}

// Check if user can add a new item to a menu
export async function canAddItem(userId: string, menuId: string): Promise<{ allowed: boolean; message?: string; current: number; max: number }> {
  const limits = await getUserPlanLimits(userId);

  const itemCount = await prisma.item.count({
    where: { menuId },
  });

  if (itemCount >= limits.maxItemsPerMenu) {
    const plan = await getUserPlan(userId);
    return {
      allowed: false,
      message: `You've reached the maximum of ${limits.maxItemsPerMenu} items per menu for your ${plan} plan. Upgrade to add more.`,
      current: itemCount,
      max: limits.maxItemsPerMenu,
    };
  }

  return { allowed: true, current: itemCount, max: limits.maxItemsPerMenu };
}

// Check if menu scan is allowed (rate limiting by day)
export async function canTrackScan(menuId: string): Promise<{ allowed: boolean; message?: string; current: number; max: number }> {
  // Get the menu's owner
  const menu = await prisma.menu.findUnique({
    where: { id: menuId },
    include: { profile: true },
  });

  if (!menu) {
    return { allowed: false, message: 'Menu not found', current: 0, max: 0 };
  }

  const limits = await getUserPlanLimits(menu.profile.ownerId);

  // Get today's scan count for this menu
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAnalytics = await prisma.analytics.findFirst({
    where: {
      menuId,
      date: today,
    },
  });

  const currentScans = todayAnalytics?.scans || 0;

  if (currentScans >= limits.maxScansPerDay) {
    const plan = await getUserPlan(menu.profile.ownerId);
    return {
      allowed: false,
      message: `Daily scan limit of ${limits.maxScansPerDay} reached for ${plan} plan.`,
      current: currentScans,
      max: limits.maxScansPerDay,
    };
  }

  return { allowed: true, current: currentScans, max: limits.maxScansPerDay };
}

// Get usage summary for a user
export async function getUserUsageSummary(userId: string) {
  const limits = await getUserPlanLimits(userId);
  const plan = await getUserPlan(userId);

  const profiles = await prisma.profile.findMany({
    where: { ownerId: userId },
    include: {
      menus: {
        include: {
          _count: { select: { items: true } },
        },
      },
    },
  });

  const profileCount = profiles.length;
  const totalMenus = profiles.reduce((sum, p) => sum + p.menus.length, 0);
  const totalItems = profiles.reduce(
    (sum, p) => sum + p.menus.reduce((mSum, m) => mSum + m._count.items, 0),
    0
  );

  // Get today's scans
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const menuIds = profiles.flatMap((p) => p.menus.map((m) => m.id));
  const todayScans = await prisma.analytics.aggregate({
    where: {
      menuId: { in: menuIds },
      date: today,
    },
    _sum: { scans: true },
  });

  return {
    plan,
    limits,
    usage: {
      profiles: { current: profileCount, max: limits.maxProfiles },
      menus: { current: totalMenus, note: `Max ${limits.maxMenusPerProfile} per profile` },
      items: { current: totalItems, note: `Max ${limits.maxItemsPerMenu} per menu` },
      scansToday: { current: todayScans._sum.scans || 0, max: limits.maxScansPerDay },
    },
  };
}

