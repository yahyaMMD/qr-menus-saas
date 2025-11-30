import { Plan, PrismaClient, SubscriptionStatus } from "@prisma/client";

export default async function subscriptions(prisma: PrismaClient) {
  console.log("💳 Creating subscriptions & payments...");

  const user = await prisma.user.findFirst({
    where: { email: "yahya@qrmenus.test" }
  });

  if (!user) {
    console.log("⚠️ User not found, skipping subscription creation.");
    return;
  }

  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: Plan.STANDARD,
      status: SubscriptionStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 30 * 86400000),
      active: true,
      priceCents: 4900,
      currency: "DZD"
    }
  });

  console.log("💳 Subscriptions done.");
}
