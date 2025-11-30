import { PrismaClient } from "@prisma/client";

export default async function profiles(prisma: PrismaClient) {
  console.log("🏪 Creating business profiles...");

  const profiles = await prisma.profile.createMany({
    data: [
      {
        ownerId: (await prisma.user.findFirst({ where: { email: "admin@qrmenus.test" } })).id,
        name: "Sunrise Bistro",
        description: "Cozy brunch spot with Mediterranean influence.",
        logo: "/logos/sunrise.png",
        socialLinks: { instagram: "https://instagram.com/sunrise" },
        location: { city: "Algiers", address: "Rue Didouche Mourad" }
      },
      {
        ownerId: (await prisma.user.findFirst({ where: { email: "owner@qrmenus.test" } })).id,
        name: "Taco Factory DZ",
        description: "Mexican street food with DZ twist.",
        logo: "/logos/taco.png",
        socialLinks: { instagram: "https://instagram.com/tacofactorydz" },
        location: { city: "Blida", address: "Centre Ville" }
      },
      {
        ownerId: (await prisma.user.findFirst({ where: { email: "user@qrmenus.test" } })).id,
        name: "Urban Vegan Kitchen",
        description: "Plant-based dining with modern minimalism.",
        logo: "/logos/uvk.png",
        socialLinks: { instagram: "https://instagram.com/urbanvegan" },
        location: { city: "Algiers", address: "Hydra" }
      }
    ]
  });

  const allProfiles = await prisma.profile.findMany();
  console.log("🏪 Profiles created.");

  return allProfiles;
}
