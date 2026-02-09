const Subcategory = require('../models/Subcategory.model');

module.exports = {
  getSubcategories: async (req, res) => {
    try {
      const { categoryId } = req.params;

      const subs = await Subcategory.getSubcategoriesByCategoryId(categoryId);
      res.json(subs);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getSubcategoryDetails: async (req, res) => {
    try {
      const { id } = req.params;

      const sub = await Subcategory.getSubcategoryWithProducts(id);
      if (!sub) return res.status(404).json({ error: "Subcategory not found" });

      res.json(sub);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
