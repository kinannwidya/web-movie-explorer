"use client";

import { useEffect, useState } from "react";
import ContentSection from "../components/ContentSection";
import { Content } from "@/types/content";

export default function OriginalsPage() {
  const [originals, setOriginals] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOriginals = async () => {
      try {
        // 🌟 Ambil semua konten yang punya tag "original"
        const res = await fetch("/api/content?endpoint=originals");
        if (!res.ok) throw new Error("Failed to fetch originals");

        const data = await res.json();

        const now = Date.now();

        // 🔹 Filter: cuma yang SUDAH rilis
        const releasedOriginals = data.filter(
          (item: any) => !item.releaseDate || new Date(item.releaseDate).getTime() <= now
        );

        // 🧩 Format biar sesuai dengan Content interface
        const formatted: Content[] = releasedOriginals.map((m: any) => ({
          _id: m._id,
          title: m.title,
          poster: m.poster,
          description: m.description || "",
          year: m.year,
          genre: m.genre,
          rating: m.rating,
          type: m.type || "original",
          tags: m.tags ?? [],
          ageRating: m.ageRating ?? "13+",
          releaseDate: m.releaseDate,
        }));

        setOriginals(formatted);
      } catch (err) {
        console.error("❌ Error loading originals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOriginals();
  }, []);

  return (
    <div className="pt-28 px-4 md:px-8">
      <div className="min-h-screen bg-[#0A0A0A] text-white pb-20">
        <h1 className="text-2xl font-bold mb-8 px-4 md:px-8">Originals</h1>
        <ContentSection title="" items={originals} loading={loading} />
      </div>
    </div>
  );
}
