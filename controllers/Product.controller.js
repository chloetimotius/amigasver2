const Product = require('../models/Product.model');

module.exports = {
   // Get ALL products
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.getAllProducts();
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  
  getProducts: async (req, res) => {
    try {
      const { subcategoryId } = req.params;

      const products = await Product.getProductsBySubcategoryId(subcategoryId);
      res.json(products);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getProductDetails: async (req, res) => {
    try {
      const { id } = req.params;

      const product = await Product.getProductById(id);
      if (!product) return res.status(404).json({ error: "Product not found" });

      res.json(product);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

//   getProductById: async (req, res) => {
//   const product = await prisma.product.findUnique({
//     where: { id: Number(req.params.id) }
//   });
//   res.json(product);
// },

getProductById: async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.getProductById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error getting product by ID:", error);
    res.status(500).json({ message: "Failed to get product" });
  }
},

getProductsWithFilters: async (req, res) => {
    try {
      const result = await Product.getProductsWithFilters({
        q: req.query.q,
        subcategoryId: req.query.subcategoryId,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        inStock: req.query.inStock,
        sort: req.query.sort,
        page: req.query.page,
        limit: req.query.limit,
      });

      res.status(200).json(result);
    } catch (error) {
      console.error("Error getting filtered products:", error);
      res.status(500).json({ message: "Failed to get products" });
    }
  },

};

