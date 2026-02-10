"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiPlay,
  FiStar,
  FiClock,
  FiShare2,
  FiHeart,
  FiChevronDown,
  FiChevronUp,
  FiUsers,
  FiGlobe,
} from "react-icons/fi";

interface Movie {
  _id: string;
  title: string;
  poster: string;
  landscapePoster?: string;
  description: string;
  year: number;
  genre: string;
  type: "movie" | "series";
  rating: number;
  duration?: string;
  episodes?: number;
  country?: string;
  cast: string[];
  tags: string[];
  similar: any[];
}

export default function MovieDetailClient({ movie }: { movie: Movie }) {
  const [showMore, setShowMore] = useState(false);
  const isSeries = movie.type === "series";

  // 🌟 Track 5 konten terakhir yang dilihat
  useEffect(() => {
    if (!movie?._id || !movie?.genre) return;

    try {
      const current = JSON.parse(localStorage.getItem("viewHistory") || "[]");

      // hapus duplikat
      const filtered = current.filter((v: any) => v._id !== movie._id);

      // tambah baru di akhir (paling baru di bawah)
      const updated = [...filtered, { _id: movie._id, genre: movie.genre }];
      const lastFive = updated.slice(-5);

      localStorage.setItem("viewHistory", JSON.stringify(lastFive));
      // console.log("✅ Updated viewHistory:", lastFive);
    } catch (err) {
      console.error("❌ Failed to update viewHistory:", err);
    }
  }, [movie?._id, movie?.genre]);

  const shortDesc =
    movie.description && movie.description.length > 220
      ? movie.description.slice(0, 220) + "..."
      : movie.description;

  const toggleMore = () => setShowMore((prev) => !prev);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-[65%_1fr] gap-10 items-start">
        {/* === 🎬 Poster besar === */}
        <div className="relative rounded-2xl overflow-hidden group shadow-[0_6px_25px_rgba(0,0,0,0.6)] border border-white/10 aspect-video">
          <img
            src={movie.landscapePoster || movie.poster || "/viemo5.png"}
            alt={movie.title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.03] group-hover:brightness-[0.85]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Tombol Play */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0] flex items-center justify-center shadow-[0_0_40px_rgba(88,224,192,0.4)] hover:shadow-[0_0_60px_rgba(88,224,192,0.6)] cursor-pointer transition-transform duration-300 hover:scale-110">
              <FiPlay className="w-10 h-10 text-white ml-1" />
            </div>
          </div>
        </div>

        {/* === INFO DETAIL === */}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-1">
              {movie.title}
            </h1>
            <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm flex-wrap">
              {movie.rating && (
                <span className="flex items-center gap-1 text-yellow-400 font-semibold px-2 py-[2px] rounded-full border border-yellow-400/40 bg-black/30">
                  <FiStar className="w-3.5 h-3.5 fill-yellow-400" />{" "}
                  {movie.rating.toFixed(1)}
                </span>
              )}

              <span className="text-white/80">
                {movie.year} • {movie.genre} •{" "}
                {isSeries
                  ? `${movie.episodes || "?"} Episodes`
                  : movie.duration || "N/A"}
              </span>

              {movie.tags?.includes("original") && (
                <span className="ml-2 bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0] text-[10px] font-bold uppercase px-2 py-[2px] rounded-full text-[#0A0A0A] shadow-[0_0_8px_rgba(88,224,192,0.4)]">
                  Original
                </span>
              )}
            </div>
          </div>

          {/* Tombol aksi */}
          <div className="flex items-center flex-wrap gap-3">
            <button className="flex items-center gap-2 bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] px-5 py-2 rounded-full font-semibold text-black text-sm shadow-md shadow-[#58E0C0]/30">
              <FiPlay className="w-4 h-4" />{" "}
              {isSeries ? "Stream Now" : "Watch Now"}
            </button>
            <button className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition">
              <FiClock className="w-4 h-4 text-white" />
            </button>
            <button className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition">
              <FiShare2 className="w-4 h-4 text-white" />
            </button>
            <button className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition">
              <FiHeart className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Deskripsi */}
          <div className="pt-1">
            <h3 className="text-base font-semibold text-[#58E0C0] mb-1">
              Synopsis
            </h3>
            <p className="text-gray-300 leading-relaxed text-sm md:text-[15px]">
              {showMore
                ? movie.description
                : shortDesc || "No description available."}
            </p>
            {movie.description?.length > 220 && (
              <button
                onClick={toggleMore}
                className="mt-2 flex items-center gap-1 text-[#1D8CFF] hover:text-[#58E0C0] transition text-xs font-semibold"
              >
                {showMore ? (
                  <>
                    Show Less <FiChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    Read More <FiChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Cast & Country */}
          <div className="flex flex-col gap-2 text-sm text-gray-300">
            {movie.cast?.length > 0 && (
              <div className="flex items-start gap-2">
                <FiUsers className="w-4 h-4 text-[#58E0C0] mt-[2px]" />
                <div>
                  <span className="font-semibold text-white/80 block mb-0.5">
                    Cast:
                  </span>
                  <p className="line-clamp-2 text-[13px]">
                    {movie.cast.join(", ")}
                  </p>
                </div>
              </div>
            )}
            {movie.country && (
              <div className="flex items-start gap-2">
                <FiGlobe className="w-4 h-4 text-[#58E0C0] mt-[2px]" />
                <div>
                  <span className="font-semibold text-white/80 block mb-0.5">
                    Country:
                  </span>
                  <p className="text-[13px]">{movie.country}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {movie.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {movie.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-white/10 border border-white/20 px-2.5 py-[3px] rounded-full text-[13px] text-gray-200 hover:bg-white/30 transition"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rekomendasi */}
      <div className="max-w-7xl mx-auto mt-20 px-6 md:px-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-100">
          {isSeries ? "Other Seasons & Episodes" : "You May Also Like"}
        </h2>

        {movie.similar?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6 relative">
            {movie.similar.slice(0, 6).map((m: any) => {
              const isSoon =
                m.releaseDate && new Date(m.releaseDate).getTime() > Date.now();
              const isOriginal = m.tags?.includes("original");
              const badgeText = isSoon ? "Soon" : isOriginal ? "Original" : null;

              return (
                <Link
                  href={`/movie/${m._id}`}
                  key={m._id}
                  className="relative group block cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                >
                  <div className="relative rounded-md overflow-hidden shadow-md">
                    <img
                      src={m.poster || "/viemo5.png"}
                      alt={m.title}
                      className="w-full aspect-[2/3] object-cover transition-all duration-500 group-hover:brightness-[0.85]"
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
                  </div>

                  <div className="mt-2 px-1 text-left">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-[2px]">
                      {m.type?.toUpperCase() || "MOVIE"}{" "}
                      {m.year && <>| {m.year}</>}
                    </p>
                    <h3 className="text-sm font-semibold text-white line-clamp-1 hover:text-[#58E0C0] transition">
                      {m.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400">No recommendations available.</p>
        )}
      </div>
    </div>
  );
}
