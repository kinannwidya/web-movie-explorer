import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "posters";

    if (!file)
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `viemo/${folder}` },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (error || !result) {
            console.error("❌ Cloudinary upload error:", error);
            reject(NextResponse.json({ error: "Upload failed" }, { status: 500 }));
          } else {
            resolve(
              NextResponse.json({
                url: result.secure_url,
                publicId: result.public_id, // ⬅️ penting buat delete nanti
              })
            );
          }
        }
      );
      stream.end(buffer);
    });
  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
