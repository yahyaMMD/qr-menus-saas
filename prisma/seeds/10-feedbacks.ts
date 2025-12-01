import { PrismaClient } from "@prisma/client";

export default async function feedbacks(prisma: PrismaClient) {
  console.log("💬 Creating customer feedbacks...");

  const profiles = await prisma.profile.findMany();

  const feedbackTemplates = [
    // 5-star reviews
    {
      ratings: [5],
      comments: [
        "Absolutely amazing! The food was delicious and the service was impeccable. Will definitely come back!",
        "Best dining experience I've had in years. Every dish was perfect!",
        "Outstanding quality and fantastic atmosphere. Highly recommended!",
        "The food exceeded all expectations. Chef's kiss! 👨‍🍳",
        "Simply perfect in every way. My new favorite restaurant!",
        "Incredible flavors and beautiful presentation. A must-visit!",
        "Five stars isn't enough! The staff was wonderful and the food was divine.",
        "Everything was top-notch. Can't wait to return with friends!"
      ]
    },
    // 4-star reviews
    {
      ratings: [4],
      comments: [
        "Great food and nice ambiance. Just a bit pricey but worth it.",
        "Really enjoyed the meal. Service could be a tad faster but overall excellent.",
        "Delicious food with a good variety. Will come again!",
        "Very good experience. The dishes were tasty and well-prepared.",
        "Solid choice for dining out. Good portions and quality ingredients.",
        "Loved most of the dishes. One or two could use tweaking but still great!",
        "Friendly staff and yummy food. Would recommend!",
        "Pleasant experience overall. The atmosphere was cozy and inviting."
      ]
    },
    // 3-star reviews
    {
      ratings: [3],
      comments: [
        "Decent food but nothing extraordinary. Service was okay.",
        "Average experience. Some dishes were good, others not so much.",
        "It was fine. Nothing to complain about but nothing special either.",
        "Fair pricing but the food was just okay. Might try other places next time.",
        "Not bad, not great. The ambiance was nice though.",
        "Some hits and misses on the menu. Service needs improvement."
      ]
    },
    // 5-star reviews with specific dishes
    {
      ratings: [5],
      comments: [
        "The pasta was absolutely divine! Best I've ever had outside of Italy.",
        "That burger was incredible! Perfectly cooked and so juicy!",
        "The sushi was so fresh! You can taste the quality in every bite.",
        "Pizza perfection! The crust was crispy and toppings were generous.",
        "Best carbonara in town! Creamy and authentic.",
        "The salmon was melt-in-your-mouth delicious. Wow!",
        "Their signature dish is a masterpiece. Don't miss it!"
      ]
    }
  ];

  const customerNames = [
    "Sarah Johnson", "Michael Chen", "Emma Wilson", "Ahmed Hassan", 
    "Sofia Rodriguez", "James Brown", "Fatima Ali", "Lucas Silva",
    "Amina Benali", "David Martinez", "Leila Bouazza", "Ryan O'Connor",
    "Yasmine Khelifi", "Alex Thompson", "Nadia Mansouri", "Chris Anderson",
    "Samira Djouadi", "Tom Williams", "Karim Benali", "Julia Martinez"
  ];

  const feedbacksToCreate = [];

  for (const profile of profiles) {
    // Create 15-25 feedbacks per profile
    const feedbackCount = Math.floor(Math.random() * 11) + 15;

    for (let i = 0; i < feedbackCount; i++) {
      // Weight towards positive reviews (70% are 4-5 stars)
      const randomValue = Math.random();
      let templateIndex;
      
      if (randomValue < 0.5) {
        templateIndex = 0; // 50% 5-star
      } else if (randomValue < 0.85) {
        templateIndex = 1; // 35% 4-star
      } else if (randomValue < 0.95) {
        templateIndex = 2; // 10% 3-star
      } else {
        templateIndex = 3; // 5% 5-star with specific praise
      }

      const template = feedbackTemplates[templateIndex];
      const rating = template.ratings[Math.floor(Math.random() * template.ratings.length)];
      const comment = template.comments[Math.floor(Math.random() * template.comments.length)];
      const userName = customerNames[Math.floor(Math.random() * customerNames.length)];

      // Random date in the past 60 days
      const daysAgo = Math.floor(Math.random() * 60);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      feedbacksToCreate.push({
        profileId: profile.id,
        userName,
        rating,
        comment,
        createdAt
      });
    }
  }

  // Create all feedbacks
  await prisma.feedback.createMany({
    data: feedbacksToCreate
  });

  console.log(`💬 Created ${feedbacksToCreate.length} customer feedbacks for ${profiles.length} restaurants.`);
}

