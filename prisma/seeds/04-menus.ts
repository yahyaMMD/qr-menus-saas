import { PrismaClient, Profile } from "@prisma/client";

export default async function menus(
  prisma: PrismaClient,
  profiles: Profile[]
) {
  console.log("📄 Creating menus with complete attributes...");

  // Clear existing menus to avoid duplicates
  await prisma.menu.deleteMany({});

  const menusData = [
    // La Trattoria Italiana Menus
    {
      profileId: profiles[0].id,
      name: "Main Menu",
      description: "Our signature Italian dishes - Pasta, Pizza, and Antipasti prepared with authentic Italian recipes",
      defaultLanguage: "en",
      supportedLanguages: ["en", "fr", "ar"],
      isActive: true,
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://qrmenus.test/menu/1",
      qrCodeSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="white" width="100" height="100"/><path d="M10,10 h30 v30 h-30 z M50,10 h30 v30 h-30 z M10,50 h30 v30 h-30 z" fill="black"/></svg>'
    },
    {
      profileId: profiles[0].id,
      name: "Wine & Drinks",
      description: "Premium wines and beverages - Italian wines, aperitivos, and non-alcoholic beverages",
      defaultLanguage: "en",
      supportedLanguages: ["en", "fr"],
      isActive: true,
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://qrmenus.test/menu/2",
      qrCodeSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="white" width="100" height="100"/><path d="M10,10 h30 v30 h-30 z M50,10 h30 v30 h-30 z M10,50 h30 v30 h-30 z" fill="black"/></svg>'
    },
    {
      profileId: profiles[0].id,
      name: "Desserts",
      description: "Sweet Italian delights - Tiramisu, Panna Cotta, and traditional Italian desserts",
      defaultLanguage: "en",
      supportedLanguages: ["en"],
      isActive: true,
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://qrmenus.test/menu/3",
      qrCodeSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="white" width="100" height="100"/><path d="M10,10 h30 v30 h-30 z M50,10 h30 v30 h-30 z M10,50 h30 v30 h-30 z" fill="black"/></svg>'
    },
    // Sushi Master Menus
    {
      profileId: profiles[1].id,
      name: "Sushi & Sashimi",
      description: "Fresh sushi and sashimi selection - Premium nigiri, maki rolls, and sashimi platters",
      defaultLanguage: "en",
      supportedLanguages: ["en", "ja", "fr"],
      isActive: true,
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://qrmenus.test/menu/4",
      qrCodeSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="white" width="100" height="100"/><path d="M10,10 h30 v30 h-30 z M50,10 h30 v30 h-30 z M10,50 h30 v30 h-30 z" fill="black"/></svg>'
    },
    {
      profileId: profiles[1].id,
      name: "Hot Dishes",
      description: "Traditional Japanese hot meals - Ramen, Udon, and Donburi rice bowls",
      defaultLanguage: "en",
      supportedLanguages: ["en", "ja"],
      isActive: true,
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://qrmenus.test/menu/5",
      qrCodeSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="white" width="100" height="100"/><path d="M10,10 h30 v30 h-30 z M50,10 h30 v30 h-30 z M10,50 h30 v30 h-30 z" fill="black"/></svg>'
    },
    {
      profileId: profiles[1].id,
      name: "Beverages",
      description: "Japanese teas and drinks - Premium green teas, sake, and traditional beverages",
      defaultLanguage: "en",
      supportedLanguages: ["en", "ja"],
      isActive: true,
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://qrmenus.test/menu/6",
      qrCodeSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="white" width="100" height="100"/><path d="M10,10 h30 v30 h-30 z M50,10 h30 v30 h-30 z M10,50 h30 v30 h-30 z" fill="black"/></svg>'
    },
    // Burger Paradise Menus
    {
      profileId: profiles[2].id,
      name: "Burgers & Sandwiches",
      description: "Gourmet burgers and sandwiches - Premium beef, chicken, and vegetarian options",
      defaultLanguage: "en",
      supportedLanguages: ["en", "ar", "fr"],
      isActive: true,
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://qrmenus.test/menu/7",
      qrCodeSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="white" width="100" height="100"/><path d="M10,10 h30 v30 h-30 z M50,10 h30 v30 h-30 z M10,50 h30 v30 h-30 z" fill="black"/></svg>'
    },
    {
      profileId: profiles[2].id,
      name: "Sides & Appetizers",
      description: "Delicious sides and starters - French fries, onion rings, wings, and more",
      defaultLanguage: "en",
      supportedLanguages: ["en"],
      isActive: true,
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://qrmenus.test/menu/8",
      qrCodeSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="white" width="100" height="100"/><path d="M10,10 h30 v30 h-30 z M50,10 h30 v30 h-30 z M10,50 h30 v30 h-30 z" fill="black"/></svg>'
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
