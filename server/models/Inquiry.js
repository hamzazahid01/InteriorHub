const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  message: { type: String, default: "" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Inquiry", inquirySchema);

