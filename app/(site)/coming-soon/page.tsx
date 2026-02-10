"use client";

import { useEffect, useState } from "react";
import ContentSection from "../components/ContentSection";
import { Content } from "@/types/content";

export default function ComingSoonPage() {
  const [comingSoon, setComingSoon] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComingSoon = async () => {
      try {
        const res = await fetch("/api/content?endpoint=coming-soon");
        if (!res.ok) throw new Error("Failed to fetch coming soon content");

        const data = await res.json();

        // 🎬 Filter & format data biar aman
        const now = Date.now();
        const upcoming = data.filter(
          (item: any) => item.releaseDate && new Date(item.releaseDate).getTime() > now
        );

        const formatted: Content[] = upcoming.map((m: any) => ({
          _id: m._id,
          title: m.title,
          poster: m.poster,
          description: m.description || "",
          year: m.year,
          genre: m.genre,
          rating: m.rating,
          releaseDate: m.releaseDate,
          type: m.type,
          tags: m.tags ?? [],
          ageRating: m.ageRating ?? "13+",
        }));

        setComingSoon(formatted);
      } catch (err) {
        console.error("❌ Error loading coming soon:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComingSoon();
  }, []);

  return (
    <div className="pt-28 px-4 md:px-8">
      <div className="min-h-screen bg-[#0A0A0A] text-white pb-20">
        <h1 className="text-2xl font-bold mb-8 px-4 md:px-8">Coming Soon</h1>
        <ContentSection title="" items={comingSoon} loading={loading} />
      </div>
    </div>
  );
}
