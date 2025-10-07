import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const initializeSiteConfig = async () => {
  try {
    const existingConfig = await prisma.site_config.findFirst();
    if (!existingConfig) {
      await prisma.site_config.create({
        data: {
          categories: [
            "Electronics",
            "Clothing",
            "Books",
            "Home & Kitchen",
            "Sports & Outdoors",
          ],
          subCatergories: {
            Electronics: ["Mobile Phones", "Laptops", "Cameras", "Televisions"],
            Clothing: ["T-shirts", "Jeans", "Dresses", "Jackets"],
            Books: [
              "Fiction",
              "Non-fiction",
              "Children's Books",
              "Educational",
            ],
            "Home & Kitchen": ["Furniture", "Appliances", "Cookware", "Decor"],
            "Sports & Outdoors": [
              "Fitness Equipment",
              "Outdoor Gear",
              "Sportswear",
              "Accessories",
            ],
          },
        },
      });
      console.log("Site configuration initialized.");
    }
  } catch (error) {
    console.error("Error initializing site configuration:", error);
  }
};
