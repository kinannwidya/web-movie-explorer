// app/components/TopPicksClient.tsx
"use client";

import { useEffect, useState } from "react";
import ContentSection from "./ContentSection";
import { Content } from "@/types/content";


export default function TopPicksClient({ allContent }: { allContent: Content[] }) {
  const [topPicks, setTopPicks] = useState<Content[]>([]);

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem("viewHistory") || "[]");
      if (!Array.isArray(history) || history.length === 0) {
        setTopPicks([]);
        return;
      }

      // ambil 5 konten terakhir (end of array is latest in our MovieDetail logic)
      const lastFive = history.slice(-5);
      const genres = [...new Set(lastFive.map((v: any) => v.genre).filter(Boolean))];

      // unique allContent by _id
      const uniqueById = (arr: Content[]) => arr.filter((v, i, self) => i === self.findIndex((x) => x._id === v._id));
      const pool = uniqueById(allContent || []);

      const recommendations = pool.filter((item) => item.genre && genres.includes(item.genre));
      setTopPicks(recommendations.slice(0, 6));
    } catch (err) {
      console.error("Failed to generate Top Picks:", err);
      setTopPicks([]);
    }
  }, [allContent]);

  if (!topPicks || topPicks.length === 0) return null;

  return <ContentSection title="Your Top Picks" items={topPicks} loading={false} limit={6} />;
}
