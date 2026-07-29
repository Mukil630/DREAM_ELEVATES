export function formatImageUrl(url: string): string {
  const fallback = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800";
  if (!url) return fallback;

  let trimmed = url.trim();

  // Handle Base64 Data URLs - strip any internal whitespace or linebreaks
  if (trimmed.includes("data:image/")) {
    const dataIdx = trimmed.indexOf("data:image/");
    return trimmed.substring(dataIdx).replace(/\s+/g, "");
  }

  // If local uploaded image path
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("uploads/")) {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  // Handle Google Drive file URLs
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
  }

  const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (trimmed.includes("drive.google.com") && driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  if (trimmed.includes("googleusercontent.com")) {
    return trimmed;
  }

  return trimmed;
}

// Client-side lightweight image compression (to ~15KB - 35KB Base64 JPEG)
export function compressImageFile(
  file: File,
  maxWidth = 500,
  maxHeight = 500,
  quality = 0.65
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



