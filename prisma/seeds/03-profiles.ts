import { PrismaClient } from "@prisma/client";

export default async function profiles(prisma: PrismaClient) {
  console.log("🏪 Creating restaurant profiles...");

  const users = await prisma.user.findMany();
  const owner = users.find(u => u.role === 'RESTAURANT_OWNER') || users[0];

  const profilesData = [
    {
      name: "La Trattoria Italiana",
      description: "Authentic Italian cuisine in the heart of the city. Experience the taste of Italy with our handmade pasta and wood-fired pizzas.",
      logo: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=400&fit=crop",
      location: {
        address: "123 Main Street",
        city: "Algiers",
        country: "Algeria",
        latitude: 36.7538,
        longitude: 3.0588
      },
      phone: "+213 555 123 456",
      email: "contact@latrattoria.dz",
      website: "https://latrattoria.dz",
      businessHours: {
        monday: "11:00 AM - 10:00 PM",
        tuesday: "11:00 AM - 10:00 PM",
        wednesday: "11:00 AM - 10:00 PM",
        thursday: "11:00 AM - 10:00 PM",
        friday: "11:00 AM - 11:00 PM",
        saturday: "11:00 AM - 11:00 PM",
        sunday: "12:00 PM - 9:00 PM"
      },
      socialLinks: {
        facebook: "https://facebook.com/latrattoria",
        instagram: "https://instagram.com/latrattoria"
      }
    },
    {
      name: "Sushi Master",
      description: "Premium Japanese restaurant offering fresh sushi, sashimi, and traditional Japanese dishes prepared by master chefs.",
      logo: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop",
      location: {
        address: "456 Ocean Boulevard",
        city: "Oran",
        country: "Algeria",
        latitude: 35.6969,
        longitude: -0.6331
      },
      phone: "+213 555 789 012",
      email: "hello@sushimaster.dz",
      website: "https://sushimaster.dz",
      businessHours: {
        monday: "12:00 PM - 10:00 PM",
        tuesday: "12:00 PM - 10:00 PM",
        wednesday: "12:00 PM - 10:00 PM",
        thursday: "12:00 PM - 10:00 PM",
        friday: "12:00 PM - 11:00 PM",
        saturday: "12:00 PM - 11:00 PM",
        sunday: "Closed"
      },
      socialLinks: {
        instagram: "https://instagram.com/sushimaster"
      }
    },
    {
      name: "Burger Paradise",
      description: "Gourmet burgers made with premium beef, fresh ingredients, and our secret sauces. The best burger experience in town!",
      logo: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
      location: {
        address: "789 Food Street",
        city: "Constantine",
        country: "Algeria",
        latitude: 36.365,
        longitude: 6.6147
      },
      phone: "+213 555 345 678",
      email: "info@burgerparadise.dz",
      website: "https://burgerparadise.dz",
      businessHours: {
        monday: "11:00 AM - 11:00 PM",
        tuesday: "11:00 AM - 11:00 PM",
        wednesday: "11:00 AM - 11:00 PM",
        thursday: "11:00 AM - 11:00 PM",
        friday: "11:00 AM - 12:00 AM",
        saturday: "11:00 AM - 12:00 AM",
        sunday: "11:00 AM - 11:00 PM"
      },
      socialLinks: {
        facebook: "https://facebook.com/burgerparadise",
        instagram: "https://instagram.com/burgerparadise",
        twitter: "https://twitter.com/burgerparadise"
      }
    }
  ];

  const createdProfiles = [];
  for (const profileData of profilesData) {
    const profile = await prisma.profile.create({
      data: {
        ...profileData,
        ownerId: owner.id,
        status: 'ACTIVE'
      }
    });
    createdProfiles.push(profile);
  }

  console.log(`🏪 Created ${createdProfiles.length} restaurant profiles.`);
  return createdProfiles;
}
