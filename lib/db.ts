// lib/db.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing! Check your .env.local file.");
  throw new Error("Please define MONGODB_URI in .env.local");
}

// Reuse koneksi biar gak reconnect tiap request (Next.js hot reload)
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    console.log("🔌 Connecting to MongoDB...");
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => {
      console.log("✅ MongoDB Connected");
      return m;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
