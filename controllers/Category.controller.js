const Category = require('../models/Category.model');

module.exports = {
  getCategories: async (req, res) => {
    try {
      const categories = await Category.getAllCategories();
      res.json(categories);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getCategoryDetails: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.getCategoryWithSubcategories(id);

      if (!category) return res.status(404).json({ error: "Category not found" });

      res.json(category);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
