import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const ROOT_UPLOADS_DIR = path.join(process.cwd(), "uploads");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") || formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No image file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = (file as File).name || "uploaded_image.jpg";
    const ext = path.extname(originalName) || ".jpg";
    const filename = `upload_${Date.now()}${ext}`;

    // Ensure upload directories exist in both public/uploads and root/uploads
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    if (!fs.existsSync(ROOT_UPLOADS_DIR)) {
      fs.mkdirSync(ROOT_UPLOADS_DIR, { recursive: true });
    }

    const publicPath = path.join(UPLOADS_DIR, filename);
    const rootPath = path.join(ROOT_UPLOADS_DIR, filename);

    fs.writeFileSync(publicPath, buffer);
    fs.writeFileSync(rootPath, buffer);

    const imagePath = `/uploads/${filename}`;
    return NextResponse.json({ success: true, imagePath, image_url: imagePath });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to upload image";
    console.error("Upload error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
