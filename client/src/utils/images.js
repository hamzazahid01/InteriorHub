export function resolveImageUrl(image) {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  if (image.startsWith("/uploads/")) {
    const origin =
      (import.meta.env.VITE_API_ORIGIN || "").trim() || "http://localhost:5000";
    return `${origin}${image}`;
  }
  return image;
}

