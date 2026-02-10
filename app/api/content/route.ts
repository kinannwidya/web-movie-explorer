// app/api/content/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Content from "@/models/Content";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const genre = searchParams.get("genre");
  const type = searchParams.get("type");
  const endpoint = searchParams.get("endpoint");
  const limit = Math.min(Number(searchParams.get("limit") || 24), 100);

  try {
    // shortcuts
    if (endpoint === "popular") {
      const res = await Content.find({ isPopular: true, status: "published" })
        .sort({ popularityRank: 1 })
        .limit(limit);
      return NextResponse.json(res);
    }
    if (endpoint === "coming-soon") {
      const now = new Date();
      const res = await Content.find({
        releaseDate: { $gt: now },
        status: "published",
      })
        .sort({ releaseDate: 1 })
        .limit(limit);
      return NextResponse.json(res);
    }
    if (endpoint === "movies") {
      const res = await Content.find({ type: "movie", status: "published" }).limit(limit);
      return NextResponse.json(res);
    }
    if (endpoint === "series") {
      const res = await Content.find({ type: "series", status: "published" }).limit(limit);
      return NextResponse.json(res);
    }
    if (endpoint === "originals") {
      const res = await Content.find({
        tags: { $in: ["original"] },
        status: "published",
      }).limit(limit);
      return NextResponse.json(res);
    }

    // generic query
    const query: any = { status: "published" };
    if (genre) query.genre = { $regex: new RegExp(`^${genre}$`, "i") };
    if (type) query.type = type;

    const results = await Content.find(query).limit(limit);
    return NextResponse.json(results);
  } catch (err) {
    console.error("❌ Error in /api/content:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  try {
    const payload = {
      ...body,
      isPopular: body.isPopular ?? false,
      popularityRank: body.popularityRank ?? null,
      status: body.status ?? "published",
    };
    const newContent = await Content.create(payload);
    return NextResponse.json(newContent, { status: 201 });
  } catch (err) {
    console.error("❌ Failed to create content:", err);
    return NextResponse.json({ error: "Failed to create content" }, { status: 500 });
  }
}
