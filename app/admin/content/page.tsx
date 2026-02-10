"use client";

import { useEffect, useMemo, useState } from "react";
import ContentSidebar from "./ContentSidebar";
import ContentList from "./ContentList";

export default function AdminContentPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    genre: null as string | null,
    sortBy: "newest" as "newest" | "rating" | "year",
    type: "all" as "all" | "movie" | "series" | "original",
    status: "all" as "all" | "draft" | "published",
    popularOnly: false,
    comingSoonOnly: false,
  });

  // 🔸 Fetch content
  const load = async () => {
    const res = await fetch("/api/content");
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    load();
    const cb = () => load();
    window.addEventListener("admin:content:changed", cb);
    return () => window.removeEventListener("admin:content:changed", cb);
  }, []);

  // 🔸 Stats
  const stats = useMemo(() => {
    const total = items.length;
    const movies = items.filter((i) => i.type === "movie").length;
    const series = items.filter((i) => i.type === "series").length;
    const originals = items.filter(
      (i) => Array.isArray(i.tags) && i.tags.includes("original")
    ).length;
    const draft = items.filter((i) => i.status === "draft").length;
    const published = items.filter((i) => i.status === "published").length;
    return { total, movies, series, originals, draft, published };
  }, [items]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      {/* Sidebar kiri */}
      <aside className="lg:col-span-3 flex flex-col gap-6 sticky top-0 h-fit">
        <ContentSidebar
          filters={filters}
          setFilters={setFilters}
          stats={stats}
        />
      </aside>

      {/* Konten utama */}
      <main className="lg:col-span-9 space-y-4">
        <ContentList items={items} filters={filters} />
      </main>
    </div>
  );
}
