"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiStar, FiEdit3, FiFeather } from "react-icons/fi";

interface Content {
  _id: string;
  title: string;
  poster?: string;
  tags?: string[];
  releaseDate?: string;
  popularityRank: number;
  type: string;
  year?: number;
  status?: "draft" | "published";
}

export default function PopularityPage() {
  const [items, setItems] = useState<Content[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/content?endpoint=popular");
      const data = await res.json();
      setItems(data);
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-[1500px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FiStar className="text-yellow-400" /> Popular Content
        </h1>

        <Link
          href="/admin/popularity/reorder"
          className="flex text-sm items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium px-4 py-2 rounded-md shadow transition"
        >
          <FiEdit3 /> Edit Ranking
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-white/60 text-sm">Loading popular content...</p>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm text-white/80 font-semibold">
              Popular Items ({items.length})
            </h3>
            <div className="text-[12px] text-white/60" />
          </div>

          {/* Grid with 5 columns in desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
            {items.map((m) => {
              const isComingSoon =
                m.releaseDate && new Date(m.releaseDate).getTime() > Date.now();
              const isOriginal = Array.isArray(m.tags) && m.tags.includes("original");

              return (
                <div
                  key={m._id}
                  className="group relative rounded-md overflow-hidden aspect-[2/3] shadow-sm border border-white/10 bg-white/[0.05] transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(255,255,255,0.06)]"
                >
                  {/* Poster */}
                  {m.poster ? (
                    <img
                      src={m.poster}
                      alt={m.title}
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        m.status === "draft" ? "grayscale opacity-80" : ""
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-white/60 bg-gradient-to-br from-[#0A369D]/40 to-[#58A4B0]/30">
                      No Poster
                    </div>
                  )}

                  {/* 🟠 Coming Soon / Original Badge */}
                  {isComingSoon ? (
                    <Badge label="Soon" color="from-amber-500 to-rose-500" />
                  ) : isOriginal ? (
                    <Badge label="Original" color="from-[#1D8CFF] to-[#58E0C0]" />
                  ) : null}

                  {/* ⭐ Popular Badge */}
                  <div
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-yellow-400 text-black shadow-md"
                    title="Popular content"
                  >
                    <FiStar size={14} />
                  </div>

                  {/* Gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black/90 via-black/75 to-transparent pointer-events-none"></div>

                  {/* Content Info */}
                  <div className="absolute inset-x-0 bottom-0 p-3 z-10 flex flex-col justify-end">
                    <p className="text-[10px] text-white/60 mb-[2px]">
                      {m.type?.toUpperCase()} • {m.year || "-"}
                    </p>
                    <h3 className="text-white text-sm font-semibold line-clamp-1 mb-2">
                      {m.title}
                    </h3>

                    {/* Gradient Hero Button */}
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-400 text-xs font-semibold">
                        #{m.popularityRank}
                      </span>

                      <Link
  href={`/admin/hero/${m._id}`}
  className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full
             bg-gradient-to-r from-[#58E0C0] to-[#1D8CFF] text-black 
             shadow-[0_0_10px_rgba(88,224,192,0.4)] hover:shadow-[0_0_15px_rgba(88,224,192,0.6)]
             hover:scale-[1.05] transition-all duration-200"
>
  <FiFeather size={12} className="opacity-90" />
  Hero
</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* 🔹 Gradient badge helper component */
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <div className="absolute -top-[5px] left-0 z-20">
      <span
        className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-gradient-to-r ${color} text-[#0d1b2a] shadow-md rounded-br-md`}
      >
        {label}
      </span>
    </div>
  );
}
