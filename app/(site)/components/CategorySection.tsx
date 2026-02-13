// app/components/CategorySection.tsx
"use client";

import { useEffect, useState } from "react";
import ContentSection from "./ContentSection";
import { Content } from "@/types/content";


const categories = ["Trending", "Action", "Romance", "Animation", "Fantasy"];

export default function CategorySection() {
  const [activeCategory, setActiveCategory] = useState("Trending");
  const [items, setItems] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const url =
          activeCategory === "Trending"
            ? "/api/content?endpoint=popular"
            : `/api/content?genre=${encodeURIComponent(activeCategory.toLowerCase())}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load category:", err);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCategory();
    return () => {
      cancelled = true;
    };
  }, [activeCategory]);

  return (
    <section className="mb-6">
      <div className="flex gap-3 py-4 overflow-x-auto justify-start md:justify-center mb-4 px-4 md:px-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              cat === activeCategory
                ? "bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0] text-white shadow-md"
                : "bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/30 text-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <ContentSection 
  title={activeCategory} 
  items={items} 
  loading={loading}
  limit={6}
  showRanking={activeCategory === "Trending"}
/>
    </section>
  );
}
