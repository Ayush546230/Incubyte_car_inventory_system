/**
 * Shared API configuration for the frontend.
 *
 * In development: Vite proxy forwards /api and /uploads to the backend
 *                 (see vite.config.js), so we use "" (empty string).
 * In production:  window.location.origin works because both are on the same domain,
 *                 OR set VITE_API_BASE in the .env to point to the backend.
 */
export const API_BASE =
  import.meta.env.VITE_API_BASE || "";

/**
 * Build a full image URL from a path stored in MongoDB.
 * Handles: full URLs, /uploads/..., bare filenames like "car.jpg".
 */
export const buildImageSrc = (img) => {
  if (!img) return "";
  const s = String(img).trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/uploads/")) return `${API_BASE}${s}`;
  if (s.startsWith("uploads/")) return `${API_BASE}/${s}`;
  return `${API_BASE}/uploads/${s.replace(/^\/+/, "")}`;
};
