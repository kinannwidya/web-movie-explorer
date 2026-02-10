"use client";

import { useEffect, useState } from "react";
import ContentSection from "../components/ContentSection";
import { Content } from "@/types/content";

export default function SeriesPage() {
  const [series, setSeries] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        // 📺 Ambil semua series dari API database kamu
        const res = await fetch("/api/content?endpoint=series");
        if (!res.ok) throw new Error("Failed to fetch series");

        const data = await res.json();

        const now = Date.now();

        // 🔹 Filter: cuma ambil yang SUDAH rilis
        const releasedSeries = data.filter(
          (s: any) => !s.releaseDate || new Date(s.releaseDate).getTime() <= now
        );

        // 🧩 Format data biar sesuai type `Content`
        const formatted: Content[] = releasedSeries.map((m: any) => ({
          _id: m._id,
          title: m.title,
          poster: m.poster,
          description: m.description || "",
          year: m.year,
          genre: m.genre,
          rating: m.rating,
          type: m.type || "series",
          tags: m.tags ?? [],
          ageRating: m.ageRating ?? "13+",
          releaseDate: m.releaseDate,
        }));

        setSeries(formatted);
      } catch (err) {
        console.error("❌ Error loading series:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  return (
    <div className="pt-28 px-4 md:px-8">
      <div className="min-h-screen bg-[#0A0A0A] text-white pb-20">
        <h1 className="text-2xl font-bold mb-8 px-4 md:px-8">All Series</h1>
        <ContentSection title="" items={series} loading={loading} />
      </div>
    </div>
  );
}
