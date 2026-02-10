// app\(site)\[id]\page.tsx
import MovieDetailClient from "./MovieDetailClient";
import { connectDB } from "@/lib/db";
import Content from "@/models/Content";

export default async function MovieDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  await connectDB();

  interface ContentType {
    _id: string;
    title: string;
    genre?: string;
    year?: number;
    description?: string;
    rating?: number;
    type: string;
    poster?: string;
    duration?: string;
    country?: string;
    tags?: string[];
    cast?: string[];
    similar?: ContentType[];
  }

  const movie = (await Content.findById(id).lean()) as unknown as ContentType | null;

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-400 text-center">
        <p className="text-xl font-medium">🎬 Movie not found</p>
        <p className="text-sm text-gray-500 mt-1">
          The movie may have been removed or unpublished.
        </p>
      </div>
    );
  }

  const similar = await Content.find({
    _id: { $ne: id },
    genre: movie.genre,
    status: "published",
  })
    .limit(6)
    .lean();

  const safeMovie = JSON.parse(JSON.stringify({ ...movie, similar }));

  return <MovieDetailClient movie={safeMovie} />;
}
