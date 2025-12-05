import { PrismaClient } from "@prisma/client";

export default async function translations(prisma: PrismaClient) {
  console.log("🌐 Creating sample translations...");

  // Get all menus
  const menus = await prisma.menu.findMany({
    include: {
      items: true,
      categories: true,
    },
  });

  if (menus.length === 0) {
    console.log("   No menus found, skipping translations.");
    return;
  }

  // Update menus to support multiple languages
  for (const menu of menus) {
    await prisma.menu.update({
      where: { id: menu.id },
      data: {
        defaultLanguage: "en",
        supportedLanguages: ["en", "fr", "ar"],
      },
    });

    // Sample translations for items (French)
    const frenchTranslations: { entityType: string; entityId: string; field: string; value: string }[] = [];
    const arabicTranslations: { entityType: string; entityId: string; field: string; value: string }[] = [];

    // Translate some common items
    const itemTranslations: Record<string, { fr: { name: string; description?: string }; ar: { name: string; description?: string } }> = {
      "Bruschetta al Pomodoro": {
        fr: { name: "Bruschetta aux Tomates", description: "Pain grillé garni de tomates fraîches, basilic, ail et huile d'olive extra vierge" },
        ar: { name: "بروسكيتا بالطماطم", description: "خبز محمص مغطى بالطماطم الطازجة والريحان والثوم وزيت الزيتون البكر الممتاز" }
      },
      "Caprese Salad": {
        fr: { name: "Salade Caprese", description: "Mozzarella fraîche, tomates et basilic avec glaçage balsamique" },
        ar: { name: "سلطة كابريزي", description: "موزاريلا طازجة وطماطم وريحان مع صلصة البلسمك" }
      },
      "Spaghetti Carbonara": {
        fr: { name: "Spaghetti Carbonara", description: "Pâtes romaines classiques aux œufs, fromage pecorino, guanciale et poivre noir" },
        ar: { name: "سباغيتي كاربونارا", description: "معكرونة رومانية كلاسيكية مع البيض وجبنة البيكورينو والغوانشيالي والفلفل الأسود" }
      },
      "Margherita Pizza": {
        fr: { name: "Pizza Margherita", description: "Sauce tomate San Marzano, mozzarella fraîche, basilic et huile d'olive extra vierge" },
        ar: { name: "بيتزا مارغريتا", description: "صلصة طماطم سان مارزانو، موزاريلا طازجة، ريحان وزيت زيتون بكر ممتاز" }
      },
      "Salmon Nigiri": {
        fr: { name: "Nigiri au Saumon", description: "Saumon frais sur riz à sushi assaisonné (2 pièces)" },
        ar: { name: "نيغيري السلمون", description: "سلمون طازج على أرز السوشي المتبل (قطعتان)" }
      },
      "California Roll": {
        fr: { name: "Rouleau Californien", description: "Crabe, avocat, concombre et tobiko" },
        ar: { name: "لفائف كاليفورنيا", description: "سلطعون، أفوكادو، خيار وتوبيكو" }
      },
      "Classic Cheeseburger": {
        fr: { name: "Cheeseburger Classique", description: "Steak 100% bœuf, cheddar, laitue, tomate, oignon et sauce spéciale" },
        ar: { name: "تشيز برجر كلاسيكي", description: "لحم بقري 100%، جبنة شيدر، خس، طماطم، بصل وصلصة خاصة" }
      },
      "Veggie Burger": {
        fr: { name: "Burger Végétarien", description: "Steak végétal, avocat, laitue, tomate et sauce spéciale" },
        ar: { name: "برجر نباتي", description: "قرص نباتي، أفوكادو، خس، طماطم وصلصة خاصة" }
      }
    };

    for (const item of menu.items) {
      const trans = itemTranslations[item.name];
      if (trans) {
        frenchTranslations.push({ entityType: "item", entityId: item.id, field: "name", value: trans.fr.name });
        if (trans.fr.description) {
          frenchTranslations.push({ entityType: "item", entityId: item.id, field: "description", value: trans.fr.description });
        }
        arabicTranslations.push({ entityType: "item", entityId: item.id, field: "name", value: trans.ar.name });
        if (trans.ar.description) {
          arabicTranslations.push({ entityType: "item", entityId: item.id, field: "description", value: trans.ar.description });
        }
      }
    }

    // Translate categories
    const categoryTranslations: Record<string, { fr: string; ar: string }> = {
      "Pasta": { fr: "Pâtes", ar: "معكرونة" },
      "Pizza": { fr: "Pizza", ar: "بيتزا" },
      "Antipasti": { fr: "Antipasti", ar: "المقبلات" },
      "Nigiri": { fr: "Nigiri", ar: "نيغيري" },
      "Maki Rolls": { fr: "Rouleaux Maki", ar: "لفائف ماكي" },
      "Sashimi": { fr: "Sashimi", ar: "ساشيمي" },
      "Beef Burgers": { fr: "Burgers au Bœuf", ar: "برجر اللحم" },
      "Chicken Burgers": { fr: "Burgers au Poulet", ar: "برجر الدجاج" },
      "Vegetarian Options": { fr: "Options Végétariennes", ar: "الخيارات النباتية" },
    };

    for (const cat of menu.categories) {
      const trans = categoryTranslations[cat.name];
      if (trans) {
        frenchTranslations.push({ entityType: "category", entityId: cat.id, field: "name", value: trans.fr });
        arabicTranslations.push({ entityType: "category", entityId: cat.id, field: "name", value: trans.ar });
      }
    }

    // Save translations
    for (const t of frenchTranslations) {
      await prisma.translation.upsert({
        where: {
          menuId_entityType_entityId_languageCode_field: {
            menuId: menu.id,
            entityType: t.entityType,
            entityId: t.entityId,
            languageCode: "fr",
            field: t.field,
          },
        },
        update: { value: t.value },
        create: {
          menuId: menu.id,
          entityType: t.entityType,
          entityId: t.entityId,
          languageCode: "fr",
          field: t.field,
          value: t.value,
        },
      });
    }

    for (const t of arabicTranslations) {
      await prisma.translation.upsert({
        where: {
          menuId_entityType_entityId_languageCode_field: {
            menuId: menu.id,
            entityType: t.entityType,
            entityId: t.entityId,
            languageCode: "ar",
            field: t.field,
          },
        },
        update: { value: t.value },
        create: {
          menuId: menu.id,
          entityType: t.entityType,
          entityId: t.entityId,
          languageCode: "ar",
          field: t.field,
          value: t.value,
        },
      });
    }

    console.log(`   Menu "${menu.name}": ${frenchTranslations.length} French + ${arabicTranslations.length} Arabic translations`);
  }

  const totalTranslations = await prisma.translation.count();
  console.log(`🌐 Created ${totalTranslations} translations total.`);
}

