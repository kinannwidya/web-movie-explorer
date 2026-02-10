// app/api/content/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Content from "@/models/Content";

interface RouteParams {
  params: Promise<{ id: string }>; // ⚡ wajib Promise di Next.js 15+
}

// 🟩 GET
export async function GET(req: Request, { params }: RouteParams) {
  const { id } = await params;
  await connectDB();

  try {
    const content = await Content.findById(id);
    if (!content)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(content);
  } catch (err) {
    console.error("❌ Failed to fetch content:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 🟦 PATCH (update)
export async function PATCH(req: Request, { params }: RouteParams) {
  const { id } = await params;
  await connectDB();

  try {
    const body = await req.json();

    // 🔹 daftar field yang boleh diupdate (termasuk hero)
    const allowedFields = [
      "title",
      "description",
      "poster",
      "publicId",
      "landscapePoster",
      "landscapePublicId",
      "year",
      "genre",
      "rating",
      "duration",
      "episodes",
      "country",
      "ageRating",
      "releaseDate",
      "cast",
      "tags",
      "isPopular",
      "popularityRank",
      "status",
      "heroBg",
      "heroBgPublicId",
      "heroCharacter",
      "heroCharacterPublicId",
      "heroTitle",
      "heroTitlePublicId",
    ];

    // 🔹 filter field agar tidak kirim field asing
    const updateData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }

    const updated = await Content.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("❌ Failed to update content:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 🟥 DELETE
export async function DELETE(req: Request, { params }: RouteParams) {
  const { id } = await params;
  await connectDB();

  try {
    const deleted = await Content.findByIdAndDelete(id);
    if (!deleted)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to delete content:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
