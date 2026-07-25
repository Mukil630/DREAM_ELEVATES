// Utility to format any image URL, converting Google Drive & web share links to direct viewable URLs
export function formatImageUrl(url: string): string {
  if (!url) return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800";

  const trimmed = url.replace(/[\r\n\t]+/g, "").trim();

  // If local uploaded image path, return clean relative path
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("uploads/")) {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  // Handle Google Drive file URLs
  // Pattern 1: https://drive.google.com/file/d/FILE_ID/view...
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveFileMatch[1]}`;
  }

  // Pattern 2: https://drive.google.com/open?id=FILE_ID or ?id=FILE_ID
  const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (trimmed.includes("drive.google.com") && driveIdMatch && driveIdMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveIdMatch[1]}`;
  }

  // Pattern 3: Google Drive thumbnail / uc link format
  if (trimmed.includes("drive.google.com/uc") || trimmed.includes("googleusercontent.com")) {
    return trimmed;
  }

  return trimmed;
}
