"use client";

import { useEffect, useState } from "react";
import ContentSection from "../components/ContentSection";
import { Content } from "@/types/content";

export default function MoviesPage() {
  const [movies, setMovies] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // 🎬 Ambil semua movie dari API database kamu
        const res = await fetch("/api/content?endpoint=movies");
        if (!res.ok) throw new Error("Failed to fetch movies");

        const data = await res.json();

        const now = Date.now();

        // 🔹 Filter: cuma ambil yang SUDAH rilis
        const releasedMovies = data.filter(
          (m: any) => !m.releaseDate || new Date(m.releaseDate).getTime() <= now
        );

        // 🧩 Format data biar sesuai type `Content`
        const formatted: Content[] = releasedMovies.map((m: any) => ({
          _id: m._id,
          title: m.title,
          poster: m.poster,
          description: m.description || "",
          year: m.year,
          genre: m.genre,
          rating: m.rating,
          type: m.type || "movie",
          tags: m.tags ?? [],
          ageRating: m.ageRating ?? "13+",
          releaseDate: m.releaseDate,
        }));

        setMovies(formatted);
      } catch (err) {
        console.error("❌ Error loading movies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className="pt-28 px-4 md:px-8">
      <div className="min-h-screen bg-[#0A0A0A] text-white pb-20">
        <h1 className="text-2xl font-bold mb-8 px-4 md:px-8">All Movies</h1>
        <ContentSection title="" items={movies} loading={loading} />
      </div>
    </div>
  );
}
