import { PrismaClient, Type, Category, Tag } from "@prisma/client";

interface ItemsParams {
  types: Type[];
  categories: Category[];
  tags: Tag[];
}

export default async function items(prisma: PrismaClient, { types, categories, tags }: ItemsParams) {
  console.log("🍽 Creating menu items...");

  const popularTag = tags.find(t => t.name === "Popular");
  const vegetarianTag = tags.find(t => t.name === "Vegetarian");
  const veganTag = tags.find(t => t.name === "Vegan");
  const spicyTag = tags.find(t => t.name === "Spicy");
  const chefSpecialTag = tags.find(t => t.name === "Chef's Special");

  // Italian Restaurant Items
  const pastaCategory = categories.find(c => c.name === "Pasta");
  const pizzaCategory = categories.find(c => c.name === "Pizza");
  const antipastiCategory = categories.find(c => c.name === "Antipasti");

  const italianItems = [
    // Antipasti
    {
      name: "Bruschetta al Pomodoro",
      description: "Toasted bread topped with fresh tomatoes, basil, garlic, and extra virgin olive oil",
      image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&h=600&fit=crop",
      price: 450,
      categoryId: antipastiCategory?.id,
      menuId: antipastiCategory?.menuId,
      tagIds: [vegetarianTag?.id, popularTag?.id].filter(Boolean) as string[]
    },
    {
      name: "Caprese Salad",
      description: "Fresh mozzarella, tomatoes, and basil with balsamic glaze",
      image: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=800&h=600&fit=crop",
      price: 550,
      categoryId: antipastiCategory?.id,
      menuId: antipastiCategory?.menuId,
      tagIds: [vegetarianTag?.id].filter(Boolean) as string[]
    },
    // Pasta
    {
      name: "Spaghetti Carbonara",
      description: "Classic Roman pasta with eggs, pecorino cheese, guanciale, and black pepper",
      image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&h=600&fit=crop",
      price: 950,
      categoryId: pastaCategory?.id,
      menuId: pastaCategory?.menuId,
      tagIds: [popularTag?.id, chefSpecialTag?.id].filter(Boolean) as string[]
    },
    {
      name: "Penne Arrabbiata",
      description: "Spicy tomato sauce with garlic and red chili peppers",
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop",
      price: 750,
      categoryId: pastaCategory?.id,
      menuId: pastaCategory?.menuId,
      tagIds: [spicyTag?.id, veganTag?.id].filter(Boolean) as string[]
    },
    {
      name: "Fettuccine Alfredo",
      description: "Creamy parmesan sauce with fresh fettuccine pasta",
      image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&h=600&fit=crop",
      price: 850,
      categoryId: pastaCategory?.id,
      menuId: pastaCategory?.menuId,
      tagIds: [vegetarianTag?.id].filter(Boolean) as string[]
    },
    // Pizza
    {
      name: "Margherita Pizza",
      description: "San Marzano tomato sauce, fresh mozzarella, basil, and extra virgin olive oil",
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop",
      price: 800,
      categoryId: pizzaCategory?.id,
      menuId: pizzaCategory?.menuId,
      tagIds: [popularTag?.id, vegetarianTag?.id].filter(Boolean) as string[]
    },
    {
      name: "Quattro Formaggi",
      description: "Four cheese pizza: mozzarella, gorgonzola, parmesan, and fontina",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop",
      price: 950,
      categoryId: pizzaCategory?.id,
      menuId: pizzaCategory?.menuId,
      tagIds: [vegetarianTag?.id, chefSpecialTag?.id].filter(Boolean) as string[]
    },
    {
      name: "Pepperoni Pizza",
      description: "Tomato sauce, mozzarella, and premium pepperoni",
      image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=600&fit=crop",
      price: 900,
      categoryId: pizzaCategory?.id,
      menuId: pizzaCategory?.menuId,
      tagIds: [popularTag?.id].filter(Boolean) as string[]
    }
  ];

  // Sushi Restaurant Items
  const nigiriCategory = categories.find(c => c.name === "Nigiri");
  const makiCategory = categories.find(c => c.name === "Maki Rolls");
  const sashimiCategory = categories.find(c => c.name === "Sashimi");

  const sushiItems = [
    // Nigiri
    {
      name: "Salmon Nigiri",
      description: "Fresh salmon over seasoned sushi rice (2 pieces)",
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop",
      price: 550,
      categoryId: nigiriCategory?.id,
      menuId: nigiriCategory?.menuId,
      tagIds: [popularTag?.id].filter(Boolean) as string[]
    },
    {
      name: "Tuna Nigiri",
      description: "Premium bluefin tuna over sushi rice (2 pieces)",
      image: "https://images.unsplash.com/photo-1563612116625-3012372fccce?w=800&h=600&fit=crop",
      price: 650,
      categoryId: nigiriCategory?.id,
      menuId: nigiriCategory?.menuId,
      tagIds: [chefSpecialTag?.id].filter(Boolean) as string[]
    },
    {
      name: "Eel Nigiri",
      description: "Grilled freshwater eel with sweet soy glaze (2 pieces)",
      image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&h=600&fit=crop",
      price: 700,
      categoryId: nigiriCategory?.id,
      menuId: nigiriCategory?.menuId,
      tagIds: [].filter(Boolean) as string[]
    },
    // Maki Rolls
    {
      name: "California Roll",
      description: "Crab, avocado, cucumber, and tobiko",
      image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&h=600&fit=crop",
      price: 850,
      categoryId: makiCategory?.id,
      menuId: makiCategory?.menuId,
      tagIds: [popularTag?.id].filter(Boolean) as string[]
    },
    {
      name: "Spicy Tuna Roll",
      description: "Fresh tuna with spicy mayo and cucumber",
      image: "https://images.unsplash.com/photo-1617196035491-79ac2e9eb9f3?w=800&h=600&fit=crop",
      price: 950,
      categoryId: makiCategory?.id,
      menuId: makiCategory?.menuId,
      tagIds: [spicyTag?.id, popularTag?.id].filter(Boolean) as string[]
    },
    {
      name: "Dragon Roll",
      description: "Shrimp tempura, cucumber, topped with avocado and eel sauce",
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop",
      price: 1200,
      categoryId: makiCategory?.id,
      menuId: makiCategory?.menuId,
      tagIds: [chefSpecialTag?.id].filter(Boolean) as string[]
    },
    // Sashimi
    {
      name: "Salmon Sashimi",
      description: "Fresh sliced salmon (5 pieces)",
      image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&h=600&fit=crop",
      price: 900,
      categoryId: sashimiCategory?.id,
      menuId: sashimiCategory?.menuId,
      tagIds: [popularTag?.id].filter(Boolean) as string[]
    },
    {
      name: "Tuna Sashimi",
      description: "Premium tuna, thinly sliced (5 pieces)",
      image: "https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=800&h=600&fit=crop",
      price: 1000,
      categoryId: sashimiCategory?.id,
      menuId: sashimiCategory?.menuId,
      tagIds: [chefSpecialTag?.id].filter(Boolean) as string[]
    }
  ];

  // Burger Restaurant Items
  const beefBurgerCategory = categories.find(c => c.name === "Beef Burgers");
  const chickenBurgerCategory = categories.find(c => c.name === "Chicken Burgers");
  const veggieCategory = categories.find(c => c.name === "Vegetarian Options");

  const burgerItems = [
    // Beef Burgers
    {
      name: "Classic Cheeseburger",
      description: "100% beef patty, cheddar cheese, lettuce, tomato, onion, and special sauce",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
      price: 750,
      categoryId: beefBurgerCategory?.id,
      menuId: beefBurgerCategory?.menuId,
      tagIds: [popularTag?.id].filter(Boolean) as string[]
    },
    {
      name: "Bacon BBQ Burger",
      description: "Double beef patties, crispy bacon, BBQ sauce, cheddar, and onion rings",
      image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800&h=600&fit=crop",
      price: 950,
      categoryId: beefBurgerCategory?.id,
      menuId: beefBurgerCategory?.menuId,
      tagIds: [chefSpecialTag?.id, popularTag?.id].filter(Boolean) as string[]
    },
    {
      name: "Mushroom Swiss Burger",
      description: "Beef patty topped with sautéed mushrooms and Swiss cheese",
      image: "https://images.unsplash.com/photo-1572448862527-d3c904757de6?w=800&h=600&fit=crop",
      price: 850,
      categoryId: beefBurgerCategory?.id,
      menuId: beefBurgerCategory?.menuId,
      tagIds: [].filter(Boolean) as string[]
    },
    // Chicken Burgers
    {
      name: "Crispy Chicken Burger",
      description: "Breaded chicken breast, lettuce, mayo, and pickles",
      image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&h=600&fit=crop",
      price: 700,
      categoryId: chickenBurgerCategory?.id,
      menuId: chickenBurgerCategory?.menuId,
      tagIds: [popularTag?.id].filter(Boolean) as string[]
    },
    {
      name: "Spicy Chicken Burger",
      description: "Grilled spicy chicken, jalapeños, pepper jack cheese, and chipotle mayo",
      image: "https://images.unsplash.com/photo-1619360082247-7938c57c43b5?w=800&h=600&fit=crop",
      price: 750,
      categoryId: chickenBurgerCategory?.id,
      menuId: chickenBurgerCategory?.menuId,
      tagIds: [spicyTag?.id].filter(Boolean) as string[]
    },
    // Vegetarian
    {
      name: "Veggie Burger",
      description: "Plant-based patty, avocado, lettuce, tomato, and special sauce",
      image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&h=600&fit=crop",
      price: 650,
      categoryId: veggieCategory?.id,
      menuId: veggieCategory?.menuId,
      tagIds: [vegetarianTag?.id, veganTag?.id].filter(Boolean) as string[]
    },
    {
      name: "Portobello Mushroom Burger",
      description: "Grilled portobello mushroom cap with roasted peppers and pesto",
      image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&h=600&fit=crop",
      price: 700,
      categoryId: veggieCategory?.id,
      menuId: veggieCategory?.menuId,
      tagIds: [vegetarianTag?.id, chefSpecialTag?.id].filter(Boolean) as string[]
    }
  ];

  // Create all items
  const allItems = [...italianItems, ...sushiItems, ...burgerItems];
  
  for (const itemData of allItems) {
    if (!itemData.menuId) continue;
    
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

  console.log(`🍽 Created ${allItems.length} menu items.`);
}
