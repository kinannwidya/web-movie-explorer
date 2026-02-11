import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Content from "@/models/Content";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// 🟩 GET
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await connectDB();

  try {
    const content = await Content.findById(id).lean();

    if (!content) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(content);
  } catch (err) {
    console.error("❌ Failed to fetch content:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 🟦 PATCH
export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;
  await connectDB();

  try {
    const body = await req.json();

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

    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }

    const updated = await Content.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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
export async function DELETE(
  req: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;
  await connectDB();

  try {
    const deleted = await Content.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to delete content:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
