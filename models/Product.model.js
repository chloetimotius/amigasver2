const prisma = require('./prismaClient');

module.exports = {
  // Get ALL products
  getAllProducts: async () => {
    return prisma.product.findMany();
  },
  
  getProductsBySubcategoryId: async (subcategoryId) => {
    return prisma.product.findMany({
      where: { subcategoryId: Number(subcategoryId) }
    });
  },

  getProductById: async (id) => {
    return prisma.product.findUnique({
      where: { id: Number(id) }
    });
  },

  getProductById: async (id) => {
    return prisma.product.findUnique({
      where: { id: Number(id) }
    });
  },



 // product search filter
  getProductsWithFilters: async ({
    q,
    subcategoryId,
    minPrice,
    maxPrice,
    inStock,
    sort = "newest",
    page = 1,
    limit = 12,
  }) => {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(48, Number(limit) || 12);
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    // Search by product name
    if (q && q.trim() !== "") {
      where.name = {
        contains: q.trim(),
        mode: "insensitive",
      };
    }

    // Subcategory filter
    if (subcategoryId) {
      where.subcategoryId = Number(subcategoryId);
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice !== undefined && minPrice !== "") {
        where.price.gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== "") {
        where.price.lte = Number(maxPrice);
      }
    }

    // Stock filter
    if (String(inStock) === "true") {
      where.stock = { gt: 0 };
    }

    // Sorting
    let orderBy = { id: "desc" }; // newest first
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "name_asc") orderBy = { name: "asc" };
    if (sort === "name_desc") orderBy = { name: "desc" };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          imageUrl: true,
          subcategoryId: true,
        },
      }),
    ]);

    return {
      products,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    };
  },



};
