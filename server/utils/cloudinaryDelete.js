const { initCloudinary } = require("../config/cloudinary");

function extractPublicIdFromCloudinaryUrl(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    const uploadIdx = parts.findIndex((p) => p === "upload");
    if (uploadIdx === -1) return "";

    // After /upload/ there may be transformations and a version segment (v1234)
    const afterUpload = parts.slice(uploadIdx + 1);
    const versionIdx = afterUpload.findIndex((p) => /^v\d+$/.test(p));
    const publicIdParts =
      versionIdx !== -1 ? afterUpload.slice(versionIdx + 1) : afterUpload;

    const joined = publicIdParts.join("/");
    if (!joined) return "";

    // Remove extension
    return joined.replace(/\.[^/.]+$/, "");
  } catch {
    return "";
  }
}

async function deleteCloudinaryByUrl(url) {
  const publicId = extractPublicIdFromCloudinaryUrl(url);
  if (!publicId) return { result: "skipped" };

  const cloudinary = initCloudinary();
  return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

module.exports = { extractPublicIdFromCloudinaryUrl, deleteCloudinaryByUrl };

