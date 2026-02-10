"use client";

import { useRef, useState } from "react";
import { FiPlay, FiMaximize2, FiStar } from "react-icons/fi";

interface MovieDetailClientProps {
  movie: {
    _id: string;
    title: string;
    genre?: string;
    year?: number;
    description?: string;
    rating?: number;
    type: string;
    poster?: string;
    similar?: any[];
  };
}

export default function MovieDetailClient({ movie }: MovieDetailClientProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-[1fr,1.2fr] gap-8 items-start animate-fadein">
      {/* 🎬 Video Poster */}
      <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg group">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="object-cover w-full h-full"
            ref={videoRef as any}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400">
            No Video
          </div>
        )}

        {/* Tombol Play */}
        <button
          className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 text-sm rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition"
        >
          <FiPlay size={14} /> Play
        </button>

        {/* Tombol Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition"
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          <FiMaximize2 size={16} />
        </button>
      </div>

      {/* 📝 Detail Film */}
      <div className="space-y-3 transition-all duration-500 opacity-0 animate-fadein">
        <h1 className="text-2xl font-bold text-white">{movie.title}</h1>
        <p className="text-sm text-white/60">
          {movie.genre} • {movie.year} •{" "}
          <span className="inline-flex items-center gap-1">
            <FiStar className="text-yellow-400" /> {movie.rating || "-"}
          </span>
        </p>

        <p className="text-white/80 text-sm leading-relaxed line-clamp-4">
          {movie.description?.length
            ? movie.description.length > 200
              ? movie.description.slice(0, 200) + "..."
              : movie.description
            : "No description available."}
        </p>

        <div className="flex gap-3 pt-2">
          <button className="bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0] hover:opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium transition">
            Watch Now
          </button>
          <button className="border border-white/20 hover:bg-white/10 text-white px-4 py-2 rounded-md text-sm transition">
            Add to Watchlist
          </button>
        </div>
      </div>

      {/* Rekomendasi */}
      {movie.similar?.length ? (
        <div className="md:col-span-2 mt-10">
          <h2 className="text-lg font-semibold mb-3 text-white/90">
            Recommended for You
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {movie.similar.map((s: any) => (
              <div key={s._id} className="group relative">
                <img
                  src={s.poster || "/placeholder.jpg"}
                  alt={s.title}
                  className="rounded-lg w-full h-36 object-cover group-hover:opacity-80 transition"
                />
                <p className="mt-1 text-xs text-white/70 line-clamp-1">{s.title}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
