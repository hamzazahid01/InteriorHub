const mongoose = require("mongoose");
const Category = require("../models/Category");

async function getCategories(req, res) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
}

async function createCategory(req, res) {
  try {
    const { name } = req.body;
    const trimmed = String(name || "").trim();

    if (!trimmed) {
      return res.status(400).json({ message: "name is required" });
    }

    const existing = await Category.findOne({ name: trimmed });
    if (existing) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const category = await Category.create({ name: trimmed });
    res.status(201).json(category);
  } catch {
    res.status(500).json({ message: "Failed to create category" });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete category" });
  }
}

module.exports = { getCategories, createCategory, deleteCategory };

