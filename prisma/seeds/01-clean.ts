import { PrismaClient } from "@prisma/client";

export default async function clean(prisma: PrismaClient) {
  console.log("🗑 Clearing database...");

  // Delete in correct order to respect foreign key constraints
  await prisma.payment.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.analytics.deleteMany();
  await prisma.tokenBlacklist.deleteMany();
  await prisma.refreshToken.deleteMany();
  
  // Delete ItemTag first (it references Item and Tag)
  await prisma.itemTag.deleteMany();
  
  // Now safe to delete Item, Tag, Category, Type
  await prisma.item.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.type.deleteMany();
  
  // Delete Menu (referenced by Item, Category, Tag, Type)
  await prisma.menu.deleteMany();
  
  // Delete Subscription and Profile
  await prisma.planCatalog.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.profile.deleteMany();
  
  await prisma.notification.deleteMany();
  
  // Finally delete User
  await prisma.user.deleteMany();

  console.log("🧼 Database cleaned.");
}
