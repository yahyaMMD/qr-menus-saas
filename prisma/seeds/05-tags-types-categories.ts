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
    const existingTags = await prisma.tag.findMany({ where: { menuId: menu.id } });
    if (existingTags.length === 0) {
      await prisma.tag.createMany({
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
  }

  const allTags = await prisma.tag.findMany();
  tags.push(...allTags);

  // Create types for Italian Restaurant
  const italianMenus = menus.filter(m => m.name.includes("Main Menu") && m.profileId === menus[0]?.profileId);
  if (italianMenus.length > 0) {
    const italianTypes = await Promise.all([
      prisma.type.upsert({
        where: { id: `italian-lunch-${italianMenus[0].id}` },
        update: {},
        create: {
          name: "Lunch",
          image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
          menuId: italianMenus[0].id
        }
      }),
      prisma.type.upsert({
        where: { id: `italian-dinner-${italianMenus[0].id}` },
        update: {},
        create: {
          name: "Dinner",
          image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
          menuId: italianMenus[0].id
        }
      })
    ]).catch(async () => {
      // Fallback: create if upsert fails due to missing unique constraint
      const existing = await prisma.type.findMany({ where: { menuId: italianMenus[0].id } });
      if (existing.length === 0) {
        return Promise.all([
          prisma.type.create({
            data: {
              name: "Lunch",
              image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
              menuId: italianMenus[0].id
            }
          }),
          prisma.type.create({
            data: {
              name: "Dinner",
              image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
              menuId: italianMenus[0].id
            }
          })
        ]);
      }
      return existing;
    });
    types.push(...italianTypes);
  }

  // Create types for Sushi Restaurant
  const sushiMenus = menus.filter(m => m.name.includes("Sushi") && m.profileId === menus[3]?.profileId);
  if (sushiMenus.length > 0) {
    const existing = await prisma.type.findMany({ where: { menuId: sushiMenus[0].id } });
    if (existing.length === 0) {
      const sushiTypes = await Promise.all([
        prisma.type.create({
          data: {
            name: "All Day",
            image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop",
            menuId: sushiMenus[0].id
          }
        }),
        prisma.type.create({
          data: {
            name: "Happy Hour",
            image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600&fit=crop",
            menuId: sushiMenus[0].id
          }
        })
      ]);
      types.push(...sushiTypes);
    } else {
      types.push(...existing);
    }
  }

  // Create types for Burger Restaurant
  const burgerMenus = menus.filter(m => m.name.includes("Burgers") && m.profileId === menus[6]?.profileId);
  if (burgerMenus.length > 0) {
    const existing = await prisma.type.findMany({ where: { menuId: burgerMenus[0].id } });
    if (existing.length === 0) {
      const burgerTypes = await Promise.all([
        prisma.type.create({
          data: {
            name: "Dine-In",
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
            menuId: burgerMenus[0].id
          }
        }),
        prisma.type.create({
          data: {
            name: "Takeaway",
            image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&h=600&fit=crop",
            menuId: burgerMenus[0].id
          }
        })
      ]);
      types.push(...burgerTypes);
    } else {
      types.push(...existing);
    }
  }

  // Create categories for Italian Restaurant
  if (italianMenus.length > 0) {
    const existingCats = await prisma.category.findMany({ where: { menuId: italianMenus[0].id } });
    if (existingCats.length === 0) {
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
    } else {
      categories.push(...existingCats);
    }
  }

  // Create categories for Sushi Restaurant
  if (sushiMenus.length > 0) {
    const existingCats = await prisma.category.findMany({ where: { menuId: sushiMenus[0].id } });
    if (existingCats.length === 0) {
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
    } else {
      categories.push(...existingCats);
    }
  }

  // Create categories for Burger Restaurant
  if (burgerMenus.length > 0) {
    const existingCats = await prisma.category.findMany({ where: { menuId: burgerMenus[0].id } });
    if (existingCats.length === 0) {
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
    } else {
      categories.push(...existingCats);
    }
  }

  console.log(`🏷 Created ${tags.length} tags, ${types.length} types, and ${categories.length} categories.`);
  return { types, categories, tags };
}
