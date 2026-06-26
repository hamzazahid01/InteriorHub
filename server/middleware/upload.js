const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "..", "uploads");

function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

function fileFilter(req, file, cb) {
  const fileType = file.mimetype?.split("/")[0];
  if (!fileType || !["image", "video"].includes(fileType)) {
    return cb(new Error("Only image and video files are allowed."), false);
  }
  cb(null, true);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadsDir();
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const isVideo = file.mimetype?.startsWith("video/");
    const allowedImageExts = [".jpg", ".jpeg", ".png", ".webp"];
    const allowedVideoExts = [".mp4", ".mov", ".webm", ".mkv"];
    const safeExt = isVideo
      ? (allowedVideoExts.includes(ext) ? ext : ".mp4")
      : (allowedImageExts.includes(ext) ? ext : ".jpg");
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${unique}${safeExt}`);
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB per file
});

module.exports = upload;

