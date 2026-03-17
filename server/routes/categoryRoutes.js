const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getCategories,
  createCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

router.get("/", getCategories);
router.post("/", protect, createCategory);
router.delete("/:id", protect, deleteCategory);

module.exports = router;

