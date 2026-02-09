const prisma = require('./prismaClient');

module.exports = {
  getSubcategoriesByCategoryId: async (categoryId) => {
    return prisma.subcategory.findMany({
      where: { categoryId: Number(categoryId) }
    });
  },

  getSubcategoryWithProducts: async (id) => {
    return prisma.subcategory.findUnique({
      where: { id: Number(id) },
      include: {
        products: true,
      },
    });
  }
};
