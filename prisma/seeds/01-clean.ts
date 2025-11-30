import { PrismaClient } from "@prisma/client";

export default async function clean(prisma: PrismaClient) {
  console.log("🗑 Clearing database...");

  await prisma.payment.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.analytics.deleteMany();
  await prisma.tokenBlacklist.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.item.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.type.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.planCatalog.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧼 Database cleaned.");
}
