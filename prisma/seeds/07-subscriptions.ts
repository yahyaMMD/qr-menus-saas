import { Plan, PrismaClient, SubscriptionStatus } from "@prisma/client";

export default async function subscriptions(prisma: PrismaClient) {
  console.log("💳 Creating plan catalog & subscriptions...");

  // Create plan catalog with pricing
  const planCatalogData = [
    {
      plan: Plan.FREE,
      priceCents: 0,
      currency: "DZD",
      description: "Perfect for small restaurants getting started",
    },
    {
      plan: Plan.STANDARD,
      priceCents: 250000, // 2500 DZD
      currency: "DZD",
      description: "Most popular for growing restaurants",
    },
    {
      plan: Plan.CUSTOM,
      priceCents: 750000, // 7500 DZD - Contact for custom pricing
      currency: "DZD",
      description: "For enterprises and restaurant chains",
    },
  ];

  for (const planData of planCatalogData) {
    await prisma.planCatalog.upsert({
      where: { plan: planData.plan },
      update: {
        priceCents: planData.priceCents,
        currency: planData.currency,
        description: planData.description,
        updatedAt: new Date(),
      },
      create: planData,
    });
  }

  console.log("📋 Plan catalog created.");

  // Create subscription for test user (owner)
  const user = await prisma.user.findFirst({
    where: { email: "owner@qrmenus.test" }
  });

  if (!user) {
    console.log("⚠️ User not found, skipping subscription creation.");
    return;
  }

  // Check if user already has a subscription
  const existingSubscription = await prisma.subscription.findFirst({
    where: { userId: user.id }
  });

  if (!existingSubscription) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: Plan.STANDARD,
        status: SubscriptionStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 30 * 86400000), // 30 days
        active: true,
        priceCents: 250000,
        currency: "DZD"
      }
    });
  }

  console.log("💳 Subscriptions done.");
}
