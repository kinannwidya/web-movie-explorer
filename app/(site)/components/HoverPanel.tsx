"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiStar, FiPlay, FiShare2, FiHeart } from "react-icons/fi";
import { Content } from "@/types/content";

export default function HoverPanel({
  item,
  isActive,
  isTop10,
  rank,
}: {
  item: Content;
  isActive: boolean;
  isTop10: boolean;
  rank: number;
}) {
  const [visibleTags, setVisibleTags] = useState<string[]>([]);
  const [extraCount, setExtraCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!item.tags || item.tags.length === 0) return;
    const container = containerRef.current;
    if (!container) return;

    const calcTags = () => {
      const temp = document.createElement("div");
      temp.style.visibility = "hidden";
      temp.style.position = "absolute";
      temp.style.whiteSpace = "nowrap";
      temp.style.width = `${container.offsetWidth}px`;
      document.body.appendChild(temp);

      let total = 0;
      const max = container.offsetWidth;
      const shown: string[] = [];

      for (const tag of item.tags!) {
        const span = document.createElement("span");
        span.className =
          "inline-flex items-center px-2 py-0.5 text-[10px] text-gray-200 bg-white/10 border border-white/20 rounded-full mr-1";
        span.textContent = tag;
        temp.appendChild(span);
        const w = span.offsetWidth + 4;
        total += w;
        if (total < max - 40) shown.push(tag);
        else break;
      }

      const remain = item.tags!.length - shown.length;
      setVisibleTags(shown);
      setExtraCount(remain > 0 ? remain : 0);
      temp.remove();
    };

    calcTags();
    const observer = new ResizeObserver(calcTags);
    observer.observe(container);
    return () => observer.disconnect();
  }, [item.tags]);

  const isSoon =
    item.releaseDate && new Date(item.releaseDate).getTime() > Date.now();
  const isOriginal = item.tags?.includes("original");
  const badgeText = isSoon ? "Soon" : isOriginal ? "Original" : null;

  return (
    <Link
      href={`/movie/${item._id}`}
      className={`absolute z-50 top-[-10px] left-1/2 -translate-x-1/2 w-[230px]
        transition-all duration-250 ease-out
        ${
          isActive
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-[3px] pointer-events-none"
        }`}
    >
      <div
        className="bg-[#0A141F] bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent
          border border-white/10 rounded-tr-xl rounded-bl-xl
          shadow-[0_6px_18px_rgba(0,0,0,0.35)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]
          overflow-hidden transition-all duration-200 ease-out"
      >
        {/* 🌆 Gambar landscape */}
        <div className="relative w-full aspect-video overflow-hidden">
          <img
            src={item.landscapePoster || item.poster || "/viemo5.png"}
            alt={item.title}
            className="w-full h-full object-cover brightness-[0.9]"
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
        </div>

        {/* Info bawah */}
        <div className="p-3">
          <h4 className="font-semibold text-sm text-white line-clamp-1 mb-1">
            {item.title}
          </h4>

          <p className="flex items-center gap-1 text-[11px] text-gray-300 mb-2">
            {Number(item.rating) > 0 && (
              <span className="flex items-center gap-[4px] font-medium">
                <FiStar className="w-3 h-3 fill-gray-300" />
                {Number(item.rating).toFixed(1)}
              </span>
            )}
            {item.genre && (
              <>
                {Number(item.rating) > 0 && (
                  <span className="text-gray-500">|</span>
                )}
                <span>{item.genre}</span>
              </>
            )}
            {item.ageRating && (
              <>
                {(Number(item.rating) > 0 || item.genre) && (
                  <span className="text-gray-500">|</span>
                )}
                <span>{item.ageRating}</span>
              </>
            )}
          </p>

          {item.tags && item.tags.length > 0 && (
            <div
              ref={containerRef}
              className="flex items-center gap-1 mb-2 flex-nowrap overflow-hidden"
            >
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-white/10 border border-white/15 text-[10px] text-gray-200 px-2 py-0.5 rounded-full whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
              {extraCount > 0 && (
                <span className="bg-white/10 border border-white/15 text-[10px] text-gray-300 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  +{extraCount}
                </span>
              )}
            </div>
          )}

          <p className="text-[11px] text-white/85 line-clamp-3 mb-3">
            {item.description || "No description available"}
          </p>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 text-xs font-semibold bg-gradient-to-r from-[#1D8CFF]/25 to-[#58E0C0]/25 hover:from-[#1D8CFF]/45 hover:to-[#58E0C0]/45 text-white px-3 py-1.5 rounded-full border border-white/20 transition-all duration-200 ease-out">
              <FiPlay className="w-3.5 h-3.5" />
              Watch
            </button>
            <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition">
              <FiShare2 className="w-3.5 h-3.5 text-white" />
            </button>
            <button className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition">
              <FiHeart className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
