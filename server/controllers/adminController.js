const Product = require("../models/Product");
const Inquiry = require("../models/Inquiry");
const Category = require("../models/Category");

async function getAnalytics(req, res) {
  try {
    const [totalProducts, totalInquiries, totalFeaturedProducts, totalCategories] =
      await Promise.all([
        Product.countDocuments({}),
        Inquiry.countDocuments({}),
        Product.countDocuments({ isFeatured: true }),
        Category.countDocuments({}),
      ]);

    res.json({
      totalProducts,
      totalInquiries,
      totalFeaturedProducts,
      totalCategories,
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
}

module.exports = { getAnalytics };

