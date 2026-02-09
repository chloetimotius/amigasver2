const prisma = require("./prismaClient");

module.exports = {
  // Get all categories
  getAllCategories: async () => {
    return prisma.category.findMany();
  },

  // Get a single category + its subcategories + products
  getCategoryWithSubcategories: async (id) => {
    return prisma.category.findUnique({
      where: { id: Number(id) },
      include: {
        subcategories: {
          include: {
            products: true   
          }
        }
      },
    });
  },
};

