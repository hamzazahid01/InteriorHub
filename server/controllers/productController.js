const mongoose = require("mongoose");
const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");

function normalizeLegacyImages(p) {
  const obj = p.toObject ? p.toObject() : p;
  const images = Array.isArray(obj.images) ? obj.images : [];
  const mainImage = obj.mainImage || obj.image || images[0] || "";
  const finalImages = images.length ? images : obj.image ? [obj.image] : [];
  return {
    ...obj,
    images: finalImages,
    mainImage,
    image: obj.image || mainImage, // keep legacy field populated
  };
}

function parseExistingImages(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function toUploadUrlFromFilename(filename) {
  return filename ? `/uploads/${filename}` : "";
}

function deleteLocalUploadByUrl(url) {
  if (!url || typeof url !== "string") return;
  if (!url.startsWith("/uploads/")) return;
  const filename = url.replace("/uploads/", "");
  const filePath = path.join(__dirname, "..", "uploads", filename);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // ignore
  }
}

async function getProducts(req, res) {
  try {
    const { search, page, limit, category } = req.query;

    const filter = {};
    if (category && mongoose.Types.ObjectId.isValid(String(category))) {
      filter.category = String(category);
    }
    if (search) {
      const s = String(search).trim();
      if (s) {
        filter.$or = [
          { name: { $regex: s, $options: "i" } },
          { description: { $regex: s, $options: "i" } },
        ];
      }
    }

    // Backward compatible: if no pagination params, return array (old behavior)
    const wantsPaged = page !== undefined || limit !== undefined;

    const baseQuery = Product.find(filter)
      .select("name price description images mainImage image category isFeatured averageRating createdAt")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    if (!wantsPaged) {
      const products = await baseQuery;
      return res.json(products.map(normalizeLegacyImages));
    }

    const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
    const limitNum = Math.min(30, Math.max(1, parseInt(limit || "9", 10) || 9));
    const skipNum = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      baseQuery.skip(skipNum).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      items: items.map(normalizeLegacyImages),
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      limit: limitNum,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
}

async function getFeaturedProducts(req, res) {
  try {
    const products = await Product.find({ isFeatured: true })
      .populate("category", "name")
      .sort({ createdAt: -1 });
    res.json(products.map(normalizeLegacyImages));
  } catch {
    res.status(500).json({ message: "Failed to fetch featured products" });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id).populate("category", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(normalizeLegacyImages(product));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
}

async function createProduct(req, res) {
  try {
    const { name, price, description, category, isFeatured, mainNewIndex } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: "name and price are required" });
    }

    if (!category || !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "category is required" });
    }

    const files = Array.isArray(req.files) ? req.files : [];
    if (files.length === 0) {
      return res.status(400).json({ message: "At least one image is required." });
    }
    if (files.length > 5) {
      return res.status(400).json({ message: "A product can have up to 5 images only." });
    }

    const images = files
      .map((f) => toUploadUrlFromFilename(f.filename))
      .filter(Boolean)
      .slice(0, 5);

    const mainIdx = Number.isFinite(Number(mainNewIndex)) ? Number(mainNewIndex) : 0;
    const mainImage = images[mainIdx] || images[0] || "";
    if (!mainImage || !images.includes(mainImage)) {
      return res.status(400).json({ message: "mainImage must be one of the images." });
    }

    const product = await Product.create({
      name: name.trim(),
      price: Number(price),
      description: (description || "").trim(),
      images,
      mainImage,
      image: mainImage, // legacy
      category,
      isFeatured: String(isFeatured) === "true",
    });

    const populated = await Product.findById(product._id).populate("category", "name");
    res.status(201).json(normalizeLegacyImages(populated));
  } catch (err) {
    console.error("createProduct error:", err);
    // Surface validation errors to help admin UI
    if (err?.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Failed to create product" });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const {
      name,
      price,
      description,
      category,
      isFeatured,
      mainImage,
      mainNewIndex,
      existingImages,
    } = req.body;

    const keepImages = parseExistingImages(existingImages);
    const newFiles = Array.isArray(req.files) ? req.files : [];

    if (keepImages.length + newFiles.length > 5) {
      return res.status(400).json({ message: "A product can have up to 5 images only." });
    }

    const uploadedUrls = newFiles
      .map((f) => toUploadUrlFromFilename(f.filename))
      .filter(Boolean);

    const nextImages = [...keepImages, ...uploadedUrls].slice(0, 5);

    let nextMain = "";
    if (mainImage) {
      nextMain = String(mainImage);
    } else if (mainNewIndex !== undefined && uploadedUrls.length > 0) {
      const idx = Number(mainNewIndex);
      nextMain = uploadedUrls[idx] || uploadedUrls[0] || "";
    }

    // If not provided, keep current mainImage if still present; otherwise default to first.
    const current = await Product.findById(id);
    if (!current) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (!nextMain) {
      const curMain = current.mainImage || current.image;
      nextMain = nextImages.includes(curMain) ? curMain : nextImages[0] || "";
    }

    if (nextImages.length === 0) {
      return res.status(400).json({ message: "At least one image is required." });
    }
    if (!nextMain || !nextImages.includes(nextMain)) {
      return res.status(400).json({ message: "mainImage must be one of the images." });
    }

    if (category !== undefined && category !== "" && !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const update = {
      ...(name !== undefined ? { name: String(name).trim() } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(description !== undefined
        ? { description: String(description).trim() }
        : {}),
      ...(category !== undefined ? { category: category || null } : {}),
      images: nextImages,
      mainImage: nextMain,
      image: nextMain, // legacy
      ...(isFeatured !== undefined ? { isFeatured: String(isFeatured) === "true" } : {}),
    };

    const updated = await Product.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    const populated = await Product.findById(updated._id).populate("category", "name");
    res.json(normalizeLegacyImages(populated));
  } catch (err) {
    console.error("updateProduct error:", err);
    res.status(500).json({ message: "Failed to update product" });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const urls = Array.isArray(product.images) && product.images.length
      ? product.images
      : product.image
        ? [product.image]
        : [];

    // Delete local uploaded files
    urls.forEach(deleteLocalUploadByUrl);

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product" });
  }
}

async function addRating(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const { userName, rating, comment } = req.body;
    const trimmedName = String(userName || "").trim();
    const numRating = Number(rating);

    if (!trimmedName || !Number.isFinite(numRating)) {
      return res.status(400).json({ message: "userName and rating are required" });
    }
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "rating must be between 1 and 5" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.ratings.push({
      userName: trimmedName,
      rating: numRating,
      comment: String(comment || "").trim(),
    });

    const sum = product.ratings.reduce((acc, r) => acc + (r.rating || 0), 0);
    product.averageRating = product.ratings.length ? sum / product.ratings.length : 0;

    await product.save();

    res.status(201).json({
      averageRating: product.averageRating,
      ratingsCount: product.ratings.length,
      rating: product.ratings[product.ratings.length - 1],
    });
  } catch {
    res.status(500).json({ message: "Failed to add rating" });
  }
}

async function getRatings(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    const product = await Product.findById(id).select("ratings averageRating");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({
      averageRating: product.averageRating || 0,
      ratings: product.ratings || [],
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch ratings" });
  }
}

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addRating,
  getRatings,
};

