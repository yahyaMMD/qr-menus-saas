import { PrismaClient } from "@prisma/client";

export default async function analytics(prisma: PrismaClient) {
  console.log("📊 Creating analytics data...");

  // Clear existing analytics to avoid duplicates
  await prisma.analytics.deleteMany({});

  const menus = await prisma.menu.findMany({ where: { isActive: true } });
  
  const today = new Date();
  const daysToGenerate = 10; // Generate 90 days of analytics data

  let totalAnalytics = 0;

  for (const menu of menus) {
    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Generate realistic scan patterns
      // More scans on recent days and weekends
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const recencyFactor = 1 - (i / daysToGenerate); // More scans on recent days
      const weekendBonus = isWeekend ? 1.5 : 1;
      
      // Base scans between 5-20, with variations
      const baseScans = Math.floor(Math.random() * 15) + 5;
      const scans = Math.floor(baseScans * recencyFactor * weekendBonus);

      try {
        await prisma.analytics.create({
          data: {
            menuId: menu.id,
            date: date,
            scans: scans
          }
        });
        totalAnalytics++;
      } catch (error) {
        // Skip if duplicate (unique constraint on menuId + date)
        continue;
      }
    }
  }

  console.log(`📊 Created ${totalAnalytics} analytics records for ${menus.length} menus.`);
}

