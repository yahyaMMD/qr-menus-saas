#!/usr/bin/env npx tsx
/**
 * Run individual seed files without clearing the database
 * Usage: npx tsx prisma/run-seed.ts <seed-name>
 * Example: npx tsx prisma/run-seed.ts 07-subscriptions
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const seedName = process.argv[2];

  if (!seedName) {
    console.error("❌ Please provide a seed name");
    console.log("Usage: npx tsx prisma/run-seed.ts <seed-name>");
    console.log("Example: npx tsx prisma/run-seed.ts 07-subscriptions");
    process.exit(1);
  }

  try {
    console.log(`🌱 Running seed: ${seedName}...`);
    
    const seedModule = await import(`./seeds/${seedName}.ts`);
    const seedFn = seedModule.default;

    if (typeof seedFn !== "function") {
      throw new Error(`Seed ${seedName} does not export a default function`);
    }

    // Check function parameter count to determine what to pass
    const fnLength = seedFn.length;

    if (fnLength === 1) {
      // Simple seed that only needs prisma
      await seedFn(prisma);
    } else if (fnLength === 2) {
      // Seed that needs additional data - fetch required data first
      console.log("📦 Fetching required data...");
      
      if (seedName.includes("tags") || seedName.includes("categories") || seedName.includes("items")) {
        const menus = await prisma.menu.findMany();
        await seedFn(prisma, menus);
      } else if (seedName.includes("menus")) {
        const profiles = await prisma.profile.findMany();
        await seedFn(prisma, profiles);
      } else if (seedName.includes("profiles")) {
        const users = await prisma.user.findMany();
        await seedFn(prisma, users);
      } else if (seedName.includes("feedbacks")) {
        const profiles = await prisma.profile.findMany();
        await seedFn(prisma, profiles);
      } else if (seedName.includes("analytics")) {
        const menus = await prisma.menu.findMany();
        await seedFn(prisma, menus);
      } else {
        // Try with just prisma
        await seedFn(prisma);
      }
    } else if (fnLength >= 3) {
      // Seed that needs multiple dependencies
      if (seedName.includes("items")) {
        const menus = await prisma.menu.findMany();
        const categories = await prisma.category.findMany();
        const tags = await prisma.tag.findMany();
        await seedFn(prisma, menus, { categories, tags });
      } else {
        await seedFn(prisma);
      }
    }

    console.log(`✅ Seed ${seedName} completed successfully!`);
  } catch (error) {
    console.error(`❌ Error running seed ${seedName}:`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

