import { PrismaClient, Menu } from "@prisma/client";

export default async function tagsTypesCategories(
  prisma: PrismaClient,
  menus: Menu[]
) {
  console.log("🏷 Creating tags, types, and categories...");

  const types = [];
  const categories = [];
  const tags = [];

  // Create tags for each menu
  for (const menu of menus) {
    const menuTags = await prisma.tag.createMany({
      data: [
        { name: "Popular", color: "#f97316", menuId: menu.id },
        { name: "Spicy", color: "#ef4444", menuId: menu.id },
        { name: "Vegetarian", color: "#10b981", menuId: menu.id },
        { name: "Vegan", color: "#22c55e", menuId: menu.id },
        { name: "Gluten Free", color: "#8b5cf6", menuId: menu.id },
        { name: "Chef's Special", color: "#fbbf24", menuId: menu.id }
      ]
    });
  }

  const allTags = await prisma.tag.findMany();
  tags.push(...allTags);

  // Create categories for Italian Restaurant
  const italianMenus = menus.filter(m => m.name.includes("Main Menu") && m.profileId === menus[0].profileId);
  if (italianMenus.length > 0) {
    const italianCategories = await Promise.all([
      prisma.category.create({
        data: {
          name: "Antipasti",
          image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop",
          menuId: italianMenus[0].id
        }
      }),
      prisma.category.create({
        data: {
          name: "Pasta",
          image: "https://images.unsplash.com/photo-1621996346943-0c9ab0e2e0bb?w=800&h=600&fit=crop",
          menuId: italianMenus[0].id
        }
      }),
      prisma.category.create({
        data: {
          name: "Pizza",
          image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop",
          menuId: italianMenus[0].id
        }
      }),
      prisma.category.create({
        data: {
          name: "Main Courses",
          image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
          menuId: italianMenus[0].id
        }
      })
    ]);
    categories.push(...italianCategories);
  }

  // Create categories for Sushi Restaurant
  const sushiMenus = menus.filter(m => m.name.includes("Sushi") && m.profileId === menus[3]?.profileId);
  if (sushiMenus.length > 0) {
    const sushiCategories = await Promise.all([
      prisma.category.create({
        data: {
          name: "Nigiri",
          image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop",
          menuId: sushiMenus[0].id
        }
      }),
      prisma.category.create({
        data: {
          name: "Maki Rolls",
          image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&h=600&fit=crop",
          menuId: sushiMenus[0].id
        }
      }),
      prisma.category.create({
        data: {
          name: "Sashimi",
          image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&h=600&fit=crop",
          menuId: sushiMenus[0].id
        }
      })
    ]);
    categories.push(...sushiCategories);
  }

  // Create categories for Burger Restaurant
  const burgerMenus = menus.filter(m => m.name.includes("Burgers") && m.profileId === menus[6]?.profileId);
  if (burgerMenus.length > 0) {
    const burgerCategories = await Promise.all([
      prisma.category.create({
        data: {
          name: "Beef Burgers",
          image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
          menuId: burgerMenus[0].id
        }
      }),
      prisma.category.create({
        data: {
          name: "Chicken Burgers",
          image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&h=600&fit=crop",
          menuId: burgerMenus[0].id
        }
      }),
      prisma.category.create({
        data: {
          name: "Vegetarian Options",
          image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&h=600&fit=crop",
          menuId: burgerMenus[0].id
        }
      })
    ]);
    categories.push(...burgerCategories);
  }

  console.log(`🏷 Created ${tags.length} tags and ${categories.length} categories.`);
  return { types, categories, tags };
}
