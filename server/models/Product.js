const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    // Backward-compatible single image (kept so existing UI/API doesn't break).
    // Going forward, prefer `mainImage` and `images`.
    image: { type: String, default: "" },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 5,
        message: "A product can have up to 5 images only.",
      },
    },
    mainImage: { type: String, default: "" },
    ratings: {
      type: [
        {
          userName: { type: String, required: true, trim: true },
          rating: { type: Number, required: true, min: 1, max: 5 },
          comment: { type: String, default: "", trim: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    // NOTE: This used to be a string. It's now a Category reference.
    // Existing documents may still have a string value stored; handle gracefully in controllers/UI.
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.pre("validate", function preValidate() {
  if (this.mainImage && Array.isArray(this.images) && this.images.length > 0) {
    if (!this.images.includes(this.mainImage)) {
      throw new Error("mainImage must be one of the images.");
    }
  }
});

// Performance indexes
productSchema.index({ category: 1 });
productSchema.index({ name: 1 });

module.exports = mongoose.model("Product", productSchema);

