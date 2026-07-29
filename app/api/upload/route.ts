import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") || formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No image file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Compress image to compact 500x500 65% quality JPEG (~15KB - 30KB) for 100% Vercel compatibility
    let compressedBuffer: Buffer;
    try {
      compressedBuffer = await sharp(buffer)
        .resize(500, 500, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 65, progressive: true })
        .toBuffer();
    } catch (compressErr) {
      console.warn("Sharp compression fallback to raw buffer:", compressErr);
      compressedBuffer = buffer;
    }

    const mimeType = (file as File).type || "image/jpeg";
    const base64Data = compressedBuffer.toString("base64");
    const dataUrl = `data:${mimeType.startsWith("image/") ? mimeType : "image/jpeg"};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      imagePath: dataUrl,
      image_url: dataUrl,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to upload image";
    console.error("Upload error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

