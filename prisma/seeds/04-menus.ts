import { PrismaClient, Profile } from "@prisma/client";

export default async function menus(
  prisma: PrismaClient,
  profiles: Profile[]
) {
  console.log("📄 Creating menus...");

  const menusData = [
    // La Trattoria Italiana Menus
    {
      profileId: profiles[0].id,
      name: "Main Menu",
      description: "Our signature Italian dishes",
      isActive: true
    },
    {
      profileId: profiles[0].id,
      name: "Wine & Drinks",
      description: "Premium wines and beverages",
      isActive: true
    },
    {
      profileId: profiles[0].id,
      name: "Desserts",
      description: "Sweet Italian delights",
      isActive: true
    },
    // Sushi Master Menus
    {
      profileId: profiles[1].id,
      name: "Sushi & Sashimi",
      description: "Fresh sushi and sashimi selection",
      isActive: true
    },
    {
      profileId: profiles[1].id,
      name: "Hot Dishes",
      description: "Traditional Japanese hot meals",
      isActive: true
    },
    {
      profileId: profiles[1].id,
      name: "Beverages",
      description: "Japanese teas and drinks",
      isActive: false
    },
    // Burger Paradise Menus
    {
      profileId: profiles[2].id,
      name: "Burgers & Sandwiches",
      description: "Gourmet burgers and sandwiches",
      isActive: true
    },
    {
      profileId: profiles[2].id,
      name: "Sides & Appetizers",
      description: "Delicious sides and starters",
      isActive: true
    }
  ];

  const createdMenus = [];
  for (const menuData of menusData) {
    const menu = await prisma.menu.create({
      data: menuData
    });
    createdMenus.push(menu);
  }

  console.log(`📄 Created ${createdMenus.length} menus.`);
  return createdMenus;
}
