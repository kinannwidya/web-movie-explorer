import { NextResponse } from "next/server";
import Content from "@/models/Content";

export async function GET() {
  const schemaPaths = Object.keys(Content.schema.paths);
  return NextResponse.json({ schemaPaths });
}
