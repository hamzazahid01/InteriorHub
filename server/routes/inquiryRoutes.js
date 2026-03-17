const express = require("express");
const { createInquiry, getInquiries } = require("../controllers/inquiryController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", createInquiry);
router.get("/", protect, getInquiries);

module.exports = router;

