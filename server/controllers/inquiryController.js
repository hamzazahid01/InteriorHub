const mongoose = require("mongoose");
const Inquiry = require("../models/Inquiry");

async function createInquiry(req, res) {
  try {
    const { name, phone, message, productId } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "name and phone are required" });
    }

    if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const inquiry = await Inquiry.create({
      name,
      phone,
      message,
      productId,
    });

    res.status(201).json(inquiry);
  } catch (err) {
    res.status(500).json({ message: "Failed to create inquiry" });
  }
}

async function getInquiries(req, res) {
  try {
    const inquiries = await Inquiry.find()
      .sort({ createdAt: -1 })
      .populate("productId", "name price category");
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch inquiries" });
  }
}

module.exports = { createInquiry, getInquiries };

