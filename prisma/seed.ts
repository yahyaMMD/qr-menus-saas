/// <reference types="node" />
// /prisma/seed.ts
import { PrismaClient, Role, Plan, SubscriptionStatus, PaymentStatus, TicketStatus, ProfileStatus } from '@prisma/client';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { hashPassword } = require('../lib/auth/password');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean database (order matters because of relations)
  await prisma.payment.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.analytics.deleteMany();
  await prisma.tokenBlacklist.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.item.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.type.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.planCatalog.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // 2. Create users
  // Note: in production, you should hash passwords before storing them.
  const adminPassword = await hashPassword('admin123');
  const owner1Password = await hashPassword('password123');
  const owner2Password = await hashPassword('password123');

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@qrmenus.test',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const owner1 = await prisma.user.create({
    data: {
      name: 'Yahya Mahdi',
      email: 'yahya@qrmenus.test',
      password: owner1Password,
      role: Role.USER,
      isActive: true,
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Second Owner',
      email: 'owner2@qrmenus.test',
      password: owner2Password,
      role: Role.USER,
      isActive: true,
    },
  });

  console.log('✅ Created users');

  // 3. Plan catalog
  await prisma.planCatalog.createMany({
    data: [
      { plan: Plan.FREE, priceCents: 0, description: 'Basic access for testing' },
      { plan: Plan.STANDARD, priceCents: 4900, description: 'Standard monthly plan' },
      { plan: Plan.CUSTOM, priceCents: 12900, description: 'Custom tailored plan' },
    ],
  });
  console.log('✅ Created plan catalog');

  // 3. Create profiles (restaurants / businesses)
  const profile1 = await prisma.profile.create({
    data: {
      ownerId: owner1.id,
      name: 'Sunrise Bistro',
      description: 'Cozy neighborhood bistro serving breakfast, brunch and dinner.',
      logo: 'https://example.com/logos/sunrise-bistro.png',
      socialLinks: {
        instagram: 'https://instagram.com/sunrise_bistro',
        facebook: 'https://facebook.com/sunrise_bistro',
      },
      location: {
        address: '123 Main St',
        city: 'Algiers',
        country: 'Algeria',
      },
    },
  });

  const profile2 = await prisma.profile.create({
    data: {
      ownerId: owner2.id,
      name: 'Urban Vegan Kitchen',
      description: 'Modern vegan dining with creative plant-based dishes.',
      logo: 'https://example.com/logos/urban-vegan-kitchen.png',
      socialLinks: {
        instagram: 'https://instagram.com/urban_vegan_kitchen',
      },
      location: {
        address: '456 City Ave',
        city: 'Algiers',
        country: 'Algeria',
      },
    },
  });

  console.log('✅ Created profiles');

  // 4. Create menus for each profile
  const mainMenu1 = await prisma.menu.create({
    data: {
      profileId: profile1.id,
      name: 'Main Menu',
      description: 'All-day menu featuring our most popular dishes.',
      isActive: true,
    },
  });

  const drinksMenu1 = await prisma.menu.create({
    data: {
      profileId: profile1.id,
      name: 'Drinks Menu',
      description: 'Hot and cold beverages, soft drinks and fresh juices.',
      isActive: true,
    },
  });

  const mainMenu2 = await prisma.menu.create({
    data: {
      profileId: profile2.id,
      name: 'Vegan Main Menu',
      description: 'Signature plant-based dishes and seasonal specials.',
      isActive: true,
    },
  });

  console.log('✅ Created menus');

  // 5. Create shared tags per menu
  const tagsMain1 = await prisma.tag.createMany({
    data: [
      { name: 'Spicy', color: '#e11d48', menuId: mainMenu1.id },
      { name: 'Vegetarian', color: '#22c55e', menuId: mainMenu1.id },
      { name: 'Vegan', color: '#16a34a', menuId: mainMenu1.id },
      { name: 'Gluten Free', color: '#6366f1', menuId: mainMenu1.id },
      { name: "Chef's Special", color: '#f97316', menuId: mainMenu1.id },
    ],
  });

  const tagsDrinks1 = await prisma.tag.createMany({
    data: [
      { name: 'Hot', color: '#f97316', menuId: drinksMenu1.id },
      { name: 'Cold', color: '#0ea5e9', menuId: drinksMenu1.id },
      { name: 'Fresh', color: '#22c55e', menuId: drinksMenu1.id },
      { name: 'No Added Sugar', color: '#a855f7', menuId: drinksMenu1.id },
    ],
  });

  const tagsMain2 = await prisma.tag.createMany({
    data: [
      { name: 'High Protein', color: '#22c55e', menuId: mainMenu2.id },
      { name: 'Gluten Free', color: '#6366f1', menuId: mainMenu2.id },
      { name: 'Raw', color: '#14b8a6', menuId: mainMenu2.id },
      { name: 'Seasonal', color: '#facc15', menuId: mainMenu2.id },
    ],
  });

  console.log('✅ Created tags');

  // 6. Create types and categories for each menu

  // Sunrise Bistro - Main Menu
  const [mainFoodType1, mainDessertType1] = await Promise.all([
    prisma.type.create({
      data: {
        name: 'Main Course',
        image: 'https://example.com/images/types/main-course.png',
        menuId: mainMenu1.id,
      },
    }),
    prisma.type.create({
      data: {
        name: 'Dessert',
        image: 'https://example.com/images/types/dessert.png',
        menuId: mainMenu1.id,
      },
    }),
  ]);

  const [startersCat1, mainsCat1, dessertsCat1] = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Starters',
        image: 'https://example.com/images/categories/starters.png',
        menuId: mainMenu1.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Mains',
        image: 'https://example.com/images/categories/mains.png',
        menuId: mainMenu1.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Desserts',
        image: 'https://example.com/images/categories/desserts.png',
        menuId: mainMenu1.id,
      },
    }),
  ]);

  // Sunrise Bistro - Drinks Menu
  const drinksType1 = await prisma.type.create({
    data: {
      name: 'Beverage',
      image: 'https://example.com/images/types/beverage.png',
      menuId: drinksMenu1.id,
    },
  });

  const [hotDrinksCat1, coldDrinksCat1] = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Hot Drinks',
        image: 'https://example.com/images/categories/hot-drinks.png',
        menuId: drinksMenu1.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Cold Drinks',
        image: 'https://example.com/images/categories/cold-drinks.png',
        menuId: drinksMenu1.id,
      },
    }),
  ]);

  // Urban Vegan Kitchen - Main Menu
  const [veganFoodType, veganDessertType] = await Promise.all([
    prisma.type.create({
      data: {
        name: 'Vegan Main',
        image: 'https://example.com/images/types/vegan-main.png',
        menuId: mainMenu2.id,
      },
    }),
    prisma.type.create({
      data: {
        name: 'Vegan Dessert',
        image: 'https://example.com/images/types/vegan-dessert.png',
        menuId: mainMenu2.id,
      },
    }),
  ]);

  const [bowlsCat, burgersCat, veganDessertsCat] = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Bowls',
        image: 'https://example.com/images/categories/bowls.png',
        menuId: mainMenu2.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Burgers',
        image: 'https://example.com/images/categories/burgers.png',
        menuId: mainMenu2.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Desserts',
        image: 'https://example.com/images/categories/vegan-desserts.png',
        menuId: mainMenu2.id,
      },
    }),
  ]);

  console.log('✅ Created types and categories');

  // 7. Create items

  // Sunrise Bistro - Main Menu items
  const itemsMain1 = await prisma.item.createMany({
    data: [
      {
        name: 'Tomato Basil Soup',
        description: 'Slow-cooked tomato soup with fresh basil and a drizzle of cream.',
        image: 'https://example.com/images/items/tomato-basil-soup.png',
        categoryId: startersCat1.id,
        typeId: mainFoodType1.id,
        menuId: mainMenu1.id,
        tags: ['Vegetarian'],
        price: 5.5,
      },
      {
        name: 'Grilled Chicken Alfredo',
        description:
          'Grilled chicken breast served over fettuccine pasta with a creamy Alfredo sauce.',
        image: 'https://example.com/images/items/chicken-alfredo.png',
        categoryId: mainsCat1.id,
        typeId: mainFoodType1.id,
        menuId: mainMenu1.id,
        tags: ["Chef's Special"],
        price: 13.9,
      },
      {
        name: 'Spicy Shrimp Linguine',
        description:
          'Linguine pasta tossed with shrimp, chili flakes, garlic and cherry tomatoes.',
        image: 'https://example.com/images/items/spicy-shrimp-linguine.png',
        categoryId: mainsCat1.id,
        typeId: mainFoodType1.id,
        menuId: mainMenu1.id,
        tags: ['Spicy'],
        price: 14.5,
      },
      {
        name: 'Classic Crème Brûlée',
        description: 'Vanilla custard with a caramelized sugar crust.',
        image: 'https://example.com/images/items/creme-brulee.png',
        categoryId: dessertsCat1.id,
        typeId: mainDessertType1.id,
        menuId: mainMenu1.id,
        tags: ['Gluten Free'],
        price: 7.0,
      },
      {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with a molten center, served with vanilla ice cream.',
        image: 'https://example.com/images/items/chocolate-lava-cake.png',
        categoryId: dessertsCat1.id,
        typeId: mainDessertType1.id,
        menuId: mainMenu1.id,
        tags: ['Vegetarian'],
        price: 7.5,
      },
    ],
  });

  // Sunrise Bistro - Drinks Menu items
  const itemsDrinks1 = await prisma.item.createMany({
    data: [
      {
        name: 'Espresso',
        description: 'Single shot of rich, aromatic espresso.',
        image: 'https://example.com/images/items/espresso.png',
        categoryId: hotDrinksCat1.id,
        typeId: drinksType1.id,
        menuId: drinksMenu1.id,
        tags: ['Hot'],
        price: 2.5,
      },
      {
        name: 'Cappuccino',
        description: 'Espresso with steamed milk and milk foam.',
        image: 'https://example.com/images/items/cappuccino.png',
        categoryId: hotDrinksCat1.id,
        typeId: drinksType1.id,
        menuId: drinksMenu1.id,
        tags: ['Hot'],
        price: 3.5,
      },
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed oranges, served chilled.',
        image: 'https://example.com/images/items/fresh-orange-juice.png',
        categoryId: coldDrinksCat1.id,
        typeId: drinksType1.id,
        menuId: drinksMenu1.id,
        tags: ['Cold', 'Fresh', 'No Added Sugar'],
        price: 4.0,
      },
      {
        name: 'Iced Latte',
        description: 'Double espresso poured over ice with cold milk.',
        image: 'https://example.com/images/items/iced-latte.png',
        categoryId: coldDrinksCat1.id,
        typeId: drinksType1.id,
        menuId: drinksMenu1.id,
        tags: ['Cold'],
        price: 4.2,
      },
    ],
  });

  // Urban Vegan Kitchen - Main Menu items
  const itemsMain2 = await prisma.item.createMany({
    data: [
      {
        name: 'Protein Power Bowl',
        description:
          'Quinoa, roasted chickpeas, grilled tofu, avocado, mixed greens and tahini dressing.',
        image: 'https://example.com/images/items/protein-power-bowl.png',
        categoryId: bowlsCat.id,
        typeId: veganFoodType.id,
        menuId: mainMenu2.id,
        tags: ['Vegan', 'High Protein', 'Gluten Free'],
        price: 11.9,
      },
      {
        name: 'BBQ Jackfruit Burger',
        description:
          'Smoky BBQ jackfruit patty with slaw, pickles and vegan mayo in a brioche-style bun.',
        image: 'https://example.com/images/items/jackfruit-burger.png',
        categoryId: burgersCat.id,
        typeId: veganFoodType.id,
        menuId: mainMenu2.id,
        tags: ['Vegan', 'Seasonal'],
        price: 12.5,
      },
      {
        name: 'Green Goddess Bowl',
        description:
          'Kale, spinach, edamame, cucumber, broccoli and pumpkin seeds with herby dressing.',
        image: 'https://example.com/images/items/green-goddess-bowl.png',
        categoryId: bowlsCat.id,
        typeId: veganFoodType.id,
        menuId: mainMenu2.id,
        tags: ['Vegan', 'Gluten Free', 'Raw'],
        price: 10.9,
      },
      {
        name: 'Raw Chocolate Tart',
        description:
          'No-bake chocolate tart with nut crust, sweetened with dates and maple syrup.',
        image: 'https://example.com/images/items/raw-chocolate-tart.png',
        categoryId: veganDessertsCat.id,
        typeId: veganDessertType.id,
        menuId: mainMenu2.id,
        tags: ['Vegan', 'Raw', 'Gluten Free'],
        price: 6.9,
      },
    ],
  });

  console.log('✅ Created items');

  // 8. Create feedbacks for profiles
  await prisma.feedback.createMany({
    data: [
      {
        profileId: profile1.id,
        userName: 'Amine',
        rating: 5,
        comment: 'Amazing brunch and very friendly staff. Highly recommended!',
      },
      {
        profileId: profile1.id,
        userName: 'Sara',
        rating: 4,
        comment: 'Great food, but the place was a bit crowded on Sunday.',
      },
      {
        profileId: profile2.id,
        userName: 'Karim',
        rating: 5,
        comment: 'Best vegan burger in the city. Will definitely come back.',
      },
      {
        profileId: profile2.id,
        userName: 'Lina',
        rating: 4,
        comment: 'Lovely atmosphere and creative menu. Desserts are a must-try.',
      },
    ],
  });

  console.log('✅ Created feedbacks');

  // 9. Create subscriptions for users
  const today = new Date();
  const inSixMonths = new Date();
  inSixMonths.setMonth(inSixMonths.getMonth() + 6);

  const inOneMonth = new Date();
  inOneMonth.setMonth(inOneMonth.getMonth() + 1);

  const adminSub = await prisma.subscription.create({
    data: {
      userId: admin.id,
      plan: Plan.CUSTOM,
      status: SubscriptionStatus.ACTIVE,
      expiresAt: inSixMonths,
      active: true,
      paymentRef: 'ADMIN-CUSTOM-PLAN-001',
      priceCents: 12900,
      currency: 'USD',
    },
  });
  const owner1Sub = await prisma.subscription.create({
    data: {
      userId: owner1.id,
      plan: Plan.STANDARD,
      status: SubscriptionStatus.ACTIVE,
      expiresAt: inSixMonths,
      active: true,
      paymentRef: 'STD-OWNER1-2025-001',
      priceCents: 4900,
      currency: 'USD',
    },
  });
  const owner2Sub = await prisma.subscription.create({
    data: {
      userId: owner2.id,
      plan: Plan.FREE,
      status: SubscriptionStatus.ACTIVE,
      expiresAt: inOneMonth,
      active: true,
      paymentRef: 'FREE-TRIAL-OWNER2-2025-001',
      priceCents: 0,
      currency: 'USD',
    },
  });

  console.log('✅ Created subscriptions');

  // 10. Payments
  await prisma.payment.createMany({
    data: [
      {
        userId: admin.id,
        subscriptionId: adminSub.id,
        amountCents: 12900,
        currency: 'USD',
        status: PaymentStatus.PAID,
        reference: 'PAY-ADMIN-001',
      },
      {
        userId: owner1.id,
        subscriptionId: owner1Sub.id,
        amountCents: 4900,
        currency: 'USD',
        status: PaymentStatus.PAID,
        reference: 'PAY-OWNER1-001',
      },
    ],
  });

  console.log('✅ Created payments');

  // 11. Support tickets
  await prisma.supportTicket.createMany({
    data: [
      {
        userId: owner1.id,
        subject: 'QR code not scanning',
        message: 'Some customers cannot scan the QR on table 5.',
        status: TicketStatus.OPEN,
      },
      {
        userId: owner2.id,
        subject: 'Plan upgrade question',
        message: 'Can I switch to Standard plan mid-cycle?',
        status: TicketStatus.OPEN,
      },
    ],
  });

  console.log('✅ Created support tickets');

  // 10. Create analytics data (last 7 days of scans for each menu)
  const menus = [mainMenu1, drinksMenu1, mainMenu2];
  const analyticsData: { menuId: string; date: Date; scans: number }[] = [];

  for (const menu of menus) {
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // Simple random-ish scans count
      const base = menu.id === mainMenu2.id ? 40 : 25;
      const scans = base + Math.floor(Math.random() * 20) - 5;
      analyticsData.push({
        menuId: menu.id,
        date: d,
        scans: Math.max(scans, 0),
      });
    }
  }

  await prisma.analytics.createMany({ data: analyticsData });

  console.log('✅ Created analytics');
  console.log('🌱 Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
