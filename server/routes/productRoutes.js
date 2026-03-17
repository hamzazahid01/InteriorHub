const express = require("express");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/authMiddleware");
const {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addRating,
  getRatings,
} = require("../controllers/productController");

const router = express.Router();

router.get("/featured", getFeaturedProducts);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/:id/rate", addRating);
router.get("/:id/ratings", getRatings);
router.post("/", protect, upload.array("images", 5), createProduct);
router.put("/:id", protect, upload.array("images", 5), updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;

