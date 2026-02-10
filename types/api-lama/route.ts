// //app/api/content/series/route.ts
// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Content from "@/models/Content";

// export async function GET() {
//   try {
//     await connectDB();

//     // 🔍 Ambil konten bertipe "series"
//     const series = await Content.find({ type: "series" }).sort({ createdAt: -1 });

//     return NextResponse.json(series);
//   } catch (error) {
//     console.error("❌ Error fetching series:", error);
//     return NextResponse.json({ error: "Failed to fetch series" }, { status: 500 });
//   }
// }


// //app/api/content/originals/route.ts
// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Content from "@/models/Content";

// export async function GET() {
//   try {
//     await connectDB();

//     // 🌟 Ambil semua konten yang punya tag "original"
//     const originals = await Content.find({ tags: { $in: ["original"] } }).sort({ createdAt: -1 });

//     return NextResponse.json(originals);
//   } catch (error) {
//     console.error("❌ Error fetching originals:", error);
//     return NextResponse.json({ error: "Failed to fetch originals" }, { status: 500 });
//   }
// }

// //app/api/content/popular/route.ts
// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Content from "@/models/Content";

// export async function GET() {
//   try {
//     await connectDB();

//     // Ambil konten populer yg sudah publish, urut manual berdasarkan popularityRank
//     const contents = await Content.find({
//       status: "published",
//       isPopular: true,
//     })
//       .sort({ popularityRank: 1 }) // ✅ urut dari rank 1 ke bawah
//       .limit(20);

//     return NextResponse.json(contents);
//   } catch (error) {
//     console.error("❌ Error fetching popular contents:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch popular contents" },
//       { status: 500 }
//     );
//   }
// }

// // app/api/content/movies/route.ts
// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Content from "@/models/Content";

// export async function GET() {
//   try {
//     await connectDB();

//     // 🎬 Ambil semua konten bertipe "movie" dari database
//     const movies = await Content.find({ type: "movie" }).sort({ createdAt: -1 });

//     return NextResponse.json(movies);
//   } catch (error) {
//     console.error("❌ Error fetching movies:", error);
//     return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
//   }
// }


// //coming soon/route.ts
// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Content from "@/models/Content";

// export async function GET() {
//   try {
//     await connectDB();

//     // ambil film yg tanggal rilisnya masih di masa depan
//     const contents = await Content.find({
//       status: "published",
//       releaseDate: { $gte: new Date() },
//     }).sort({ releaseDate: 1 }); // urut dari yg paling dekat

//     return NextResponse.json(contents);
//   } catch (error) {
//     console.error("❌ Error fetching coming soon contents:", error);
//     return NextResponse.json({ error: "Failed to fetch coming soon contents" }, { status: 500 });
//   }
// }
