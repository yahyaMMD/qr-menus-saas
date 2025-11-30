import { PrismaClient } from '@prisma/client';

import clean from './seeds/01-clean.js';
import users from './seeds/02-users.js';
import profiles from './seeds/03-profiles.js';
import menus from './seeds/04-menus.js';
import tagsTypesCategories from './seeds/05-tags-types-categories.js';
import items from './seeds/06-items.js';
import subscriptions from './seeds/07-subscriptions.js';
import support from './seeds/08-support.js';

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

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
