import { PrismaClient, Menu, Tag, Type, Category } from "@prisma/client";

export default async function tagsTypesCategories(
  prisma: PrismaClient,
  menus: Menu[]
) {
  console.log("🏷 Creating tags, types, categories...");

  const types: Type[] = [];
  const categories: Category[] = [];
  const tags: Tag[] = [];

  for (const menu of menus) {
    // TYPES
    types.push(
      await prisma.type.create({
        data: { name: "Main Course", menuId: menu.id }
      }),
      await prisma.type.create({
        data: { name: "Dessert", menuId: menu.id }
      })
    );

    // CATEGORIES
    categories.push(
      await prisma.category.create({
        data: { name: "Starters", menuId: menu.id }
      }),
      await prisma.category.create({
        data: { name: "Sandwiches", menuId: menu.id }
      }),
      await prisma.category.create({
        data: { name: "Salads", menuId: menu.id }
      })
    );
    // TAGS
    tags.push(
      await prisma.tag.create({
        data: { name: "Spicy", color: "#e11d48", menuId: menu.id }
      }),
      await prisma.tag.create({
        data: { name: "Vegan", color: "#22c55e", menuId: menu.id }
      }),
      await prisma.tag.create({
        data: { name: "Popular", color: "#f97316", menuId: menu.id }
      })
    );
  }

  console.log("🏷 Tags, types, categories created.");

  return {
    types,
    categories,
    tags
  };
}
