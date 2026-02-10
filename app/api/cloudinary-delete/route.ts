// app/api/cloudinary-delete/route.ts
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req: Request) {
  const { publicId } = await req.json();
  if (!publicId) {
    return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return NextResponse.json({ result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
