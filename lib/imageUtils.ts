// Utility to format any image URL, converting Google Drive & web share links to direct viewable URLs
export function formatImageUrl(url: string): string {
  if (!url) return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800";

  const trimmed = url.replace(/[\r\n\t]+/g, "").trim();

  // If local uploaded image path or Base64 data URL, return clean path
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("uploads/") || trimmed.startsWith("data:image/")) {
    return trimmed.startsWith("/") || trimmed.startsWith("data:") ? trimmed : `/${trimmed}`;
  }

  // Handle Google Drive file URLs
  // Pattern 1: https://drive.google.com/file/d/FILE_ID/view...
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
  }

  // Pattern 2: https://drive.google.com/open?id=FILE_ID or ?id=FILE_ID or uc?export=view&id=FILE_ID
  const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (trimmed.includes("drive.google.com") && driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  // Pattern 3: googleusercontent direct links
  if (trimmed.includes("googleusercontent.com")) {
    return trimmed;
  }

  return trimmed;
}

// Client-side lightweight image compression (to ~60KB - 120KB Base64 JPEG)
export function compressImageFile(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new globalThis.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image for compression"));
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}


