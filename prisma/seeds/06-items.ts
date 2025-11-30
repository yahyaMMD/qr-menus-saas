import { PrismaClient, Item, Type, Category, Tag } from "@prisma/client";

interface ItemsParams {
  types: Type[];
  categories: Category[];
  tags: Tag[];
}

export default async function items(prisma: PrismaClient, { types, categories, tags }: ItemsParams) {
  console.log("🍽 Creating items...");

  const firstCat = categories[0];
  const firstType = types[0];

  const popularTag = tags.find(t => t.name === "Popular");
  const veganTag = tags.find(t => t.name === "Vegan");
  const healthyTag = tags.find(t => t.name === "Healthy");

  const itemsData = [
    {
      name: "Chicken Shawarma",
      description: "Marinated grilled chicken, garlic sauce, fries.",
      price: 650,
      categoryId: firstCat.id,
      typeId: firstType.id,
      menuId: firstCat.menuId,
      tagIds: popularTag ? [popularTag.id] : []
    },
    {
      name: "Vegan Bowl",
      description: "Quinoa, roasted veggies, tahini sauce.",
      price: 900,
      categoryId: firstCat.id,
      typeId: firstType.id,
      menuId: firstCat.menuId,
      tagIds: [veganTag?.id, healthyTag?.id].filter(Boolean) as string[]
    }
  ];

  // Create items and connect tags
  for (const itemData of itemsData) {
    const { tagIds, ...rest } = itemData;

    await prisma.item.create({
      data: {
        ...rest,
        itemTags: {
          create: tagIds.map(id => ({ tagId: id }))
        }
      }
    });
  }

  console.log("🍽 Items created.");
}
