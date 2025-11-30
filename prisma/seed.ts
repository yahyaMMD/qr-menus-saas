import { PrismaClient } from '@prisma/client';
import clean from './seeds/01-clean';
import users from './seeds/02-users';
import profiles from './seeds/03-profiles';
import menus from './seeds/04-menus';
import tagsTypesCategories from './seeds/05-tags-types-categories';
import items from './seeds/06-items';
import subscriptions from './seeds/07-subscriptions';
import support from './seeds/08-support';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting full seed...");

  await clean(prisma);
  await users(prisma);
  const createdProfiles = await profiles(prisma);
  const createdMenus = await menus(prisma, createdProfiles);
  const createdTagsTypesCats = await tagsTypesCategories(prisma, createdMenus);
  await items(prisma, createdTagsTypesCats);
  await subscriptions(prisma);
  await support(prisma);

  console.log("🌱 Seed finished successfully.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
