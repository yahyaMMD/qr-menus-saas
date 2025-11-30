import { PrismaClient, Profile } from "@prisma/client";

export default async function menus(
  prisma: PrismaClient,
  profiles: Profile[]
) {
  console.log("📄 Creating menus...");

  const result: Record<string, any> = {};

  for (const profile of profiles) {
    result[profile.id] = await prisma.menu.createMany({
      data: [
        {
          profileId: profile.id,
          name: "Main Menu",
          description: "Our core selection of dishes.",
          isActive: true
        },
        {
          profileId: profile.id,
          name: "Drinks",
          description: "Fresh juices, sodas, and hot drinks.",
          isActive: true
        }
      ]
    });
  }

  const allMenus = await prisma.menu.findMany();
  console.log("📄 Menus created.");
  return allMenus;
}
