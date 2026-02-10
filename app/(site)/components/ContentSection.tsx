"use client";

import { useState } from "react";
import Link from "next/link";
import { Content } from "@/types/content";
import HoverPanel from "./HoverPanel";

export default function ContentSection({
  title,
  items,
  loading,
  comingSoon = false,
  limit,
  onItemClick,
}: {
  title: string;
  items: Content[];
  loading: boolean;
  comingSoon?: boolean;
  limit?: number;
  onItemClick?: (item: Content) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const visibleItems = limit ? items.slice(0, limit) : items;
  const isPopularSection = title?.toLowerCase().includes("popular") ?? false;

  // Hapus duplikat id
  const uniqueItems = visibleItems.filter(
    (v, i, self) => i === self.findIndex((x) => x._id === v._id)
  );

  /* 🩶 Skeleton shimmer loader */
  if (loading) {
    return (
      <section className="pb-10 px-4 md:px-8">
        {title && (
          <h2 className="text-2xl font-semibold mb-6 text-gray-100">{title}</h2>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6">
          {Array.from({ length: limit || 6 }).map((_, i) => (
            <div key={i} className="relative animate-pulse">
              <div className="w-full aspect-[2/3] bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-md overflow-hidden" />
              <div className="mt-3 space-y-2 px-1">
                <div className="h-3 w-1/3 bg-white/10 rounded-full" />
                <div className="h-4 w-2/3 bg-white/10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (uniqueItems.length === 0)
    return <p className="text-gray-400 text-center">No content found</p>;

  return (
    <section className="pb-10 px-4 md:px-8 relative">
      {title && (
        <h2 className="text-2xl font-semibold mb-6 text-gray-100">{title}</h2>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6 relative">
        {uniqueItems.map((m, i) => {
          const rank = m.popularityRank ?? i + 1;
          const isTop10 = isPopularSection && rank <= 10;
          const isSoon =
            m.releaseDate && new Date(m.releaseDate).getTime() > Date.now();
          const isOriginal = m.tags?.includes("original");
          const badgeText = isSoon ? "Soon" : isOriginal ? "Original" : null;

          return (
            <div
              key={m._id}
              className="relative group"
              onMouseEnter={() => setHovered(m._id)}
              onMouseLeave={() => setHovered(null)}
            >
              <Link
                href={`/movie/${m._id}`}
                onClick={() => {
                  onItemClick?.(m);
                  try {
                    const history = JSON.parse(
                      localStorage.getItem("viewHistory") || "[]"
                    );
                    const filtered = history.filter((x: any) => x._id !== m._id);
                    const updated = [
                      ...filtered,
                      { _id: m._id, genre: m.genre },
                    ];
                    localStorage.setItem(
                      "viewHistory",
                      JSON.stringify(updated.slice(-5))
                    );
                  } catch (err) {
                    console.error("Failed to update viewHistory:", err);
                  }
                }}
                className="relative block rounded-md overflow-hidden shadow-md transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                <img
                  src={m.poster || "/viemo5.png"}
                  alt={m.title}
                  className="w-full aspect-[2/3] object-cover transition-all duration-500 group-hover:brightness-[0.8]"
                />

                {badgeText && (
                  <div className="absolute -top-[4px] left-0 z-20">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow-md rounded-br-md
                        ${
                          isSoon
                            ? "bg-gradient-to-r from-amber-500 to-rose-500 text-[#0d1b2a]"
                            : "bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0] text-[#0d1b2a]"
                        }`}
                    >
                      {badgeText}
                    </span>
                  </div>
                )}

                {isTop10 && (
                  <div
                    className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-[2px] rounded-full shadow-lg
                      ${
                        rank === 1
                          ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-black"
                          : rank <= 3
                          ? "bg-gradient-to-r from-gray-100 to-gray-400 text-black"
                          : "bg-white/10 border border-white/30 text-white"
                      }`}
                  >
                    TOP {rank}
                  </div>
                )}
              </Link>

              <div className="mt-2 px-1 text-left">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-[2px]">
                  {m.type?.toUpperCase() || "MOVIE"} {m.year && <>| {m.year}</>}
                </p>
                <h3 className="text-sm font-semibold text-white line-clamp-1 hover:text-[#58E0C0] transition">
                  {m.title}
                </h3>
              </div>

              <HoverPanel
                item={m}
                isActive={hovered === m._id}
                isTop10={isTop10}
                rank={rank}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
