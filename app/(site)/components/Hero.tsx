"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Content } from "@/types/content";
import { FiPlay, FiClock, FiShare2, FiHeart, FiStar } from "react-icons/fi";
import { ImageOff } from "lucide-react";

interface HeroProps {
  popular: Content[];
}

export default function Hero({ popular }: HeroProps) {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🧠 Preload hero images
  useEffect(() => {
    const preloadImages = async () => {
      const heroImages: string[] = [];
      popular.forEach((item) => {
        if (item.heroBg) heroImages.push(item.heroBg);
        if (item.heroCharacter) heroImages.push(item.heroCharacter);
        if (item.heroTitle) heroImages.push(item.heroTitle);
      });
      await Promise.all(
        heroImages.map(
          (src) =>
            new Promise((resolve) => {
              const img = new Image();
              img.src = src;
              img.decode?.().then(resolve).catch(resolve);
            })
        )
      );
      setReady(true);
    };
    preloadImages();
  }, [popular]);

  // Auto-slide
  const startAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % popular.length);
    }, 20000);
  };

  useEffect(() => {
    if (!popular.length) return;
    startAutoSlide();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [popular]);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % popular.length);
    startAutoSlide();
  };
  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + popular.length) % popular.length);
    startAutoSlide();
  };

  if (!ready)
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#0A0A0A] text-gray-400">
        <div className="w-12 h-12 border-4 border-white/20 border-t-[#58E0C0] rounded-full animate-spin mb-3" />
        <p className="text-sm tracking-wide">Preparing your experience...</p>
      </div>
    );

  if (!popular.length) return null;

  const featured = popular[index];
  const tags = featured.tags?.slice(0, 6) || [];
  const extraTags =
    featured.tags && featured.tags.length > 6 ? featured.tags.length - 4 : 0;

  // 🎨 Placeholder design (no more static asset)
  const assets = {
    bg: featured.heroBg?.toString() || "",
    chara: featured.heroCharacter?.toString() || "",
    title: featured.heroTitle?.toString() || "",
  };

  return (
    <section className="relative w-full h-screen overflow-hidden mb-14 rounded-b-3xl shadow-[0_0_60px_rgba(0,0,0,0.6)]">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={featured._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
          className="absolute inset-0"
        >
          {/* 🖼 Background */}
          {assets.bg ? (
            <motion.img
              key={assets.bg}
              src={assets.bg}
              alt="Background"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover z-0 brightness-[0.9] saturate-[1.15]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-[#102C2C] to-[#1B1B1B]">
              <div className="w-[60%] h-[60%] border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-white/40">
                <ImageOff size={48} className="mb-3" />
                <p className="text-xs uppercase tracking-widest">No Background</p>
              </div>
            </div>
          )}

          {/* Lighting overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#58E0C0]/25 via-white/10 to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-t from-sky-400/40 to-transparent z-10" />

          {/* 🧍 Character */}
          {assets.chara ? (
            <motion.img
              key={assets.chara}
              src={assets.chara}
              alt="Character"
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
              className="absolute bottom-0 right-[clamp(20px,8vw,100px)] h-[68%] sm:h-[82%] md:h-[90%] object-contain z-20 pointer-events-none"
            />
          ) : (
            <div className="absolute bottom-0 right-[clamp(20px,8vw,100px)] flex flex-col items-center justify-center h-[70%] w-[40%] bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl text-white/30 z-20 backdrop-blur-[2px]">
              <ImageOff size={40} className="mb-2" />
              <p className="text-xs uppercase tracking-widest">No Character</p>
            </div>
          )}

          {/* 🏷 Title / text */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-end px-6 sm:px-12 lg:px-20 pb-16 sm:pb-20 z-30 max-w-2xl drop-shadow-[1px_1px_1px_rgba(0,0,0,0.9)]">
            {assets.title ? (
              <motion.img
                key={assets.title}
                src={assets.title}
                alt={featured.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.25 }}
                className="w-[240px] sm:w-[320px] md:w-[400px] mb-8 drop-shadow-[0_0_30px_rgba(88,224,192,0.55)] select-none pointer-events-none"
              />
            ) : (
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                {featured.title}
              </h1>
            )}

            {/* Info */}
            <div className="flex items-center flex-wrap gap-2 mb-3 text-[11px] sm:text-xs md:text-sm text-gray-300">
              <span className="bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0] text-[9px] sm:text-xs font-semibold px-3 py-0.5 rounded-md text-white uppercase tracking-wide">
                TOP {index + 1}
              </span>
              {featured.rating && (
                <span className="flex items-center gap-1 text-yellow-400 font-semibold px-2 py-[2px] rounded-full border border-yellow-400/40 bg-black/10">
                  <FiStar className="w-3.5 h-3.5 fill-yellow-400" />
                  {featured.rating.toFixed(1)}
                </span>
              )}
              {featured.year && <span>{featured.year}</span>}
              {featured.genre && <span>{featured.genre}</span>}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-white/10 border border-white/20 text-[10px] sm:text-[11px] text-gray-200 px-2 py-[2px] rounded-full whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
                {extraTags > 0 && (
                  <span className="bg-white/10 border border-white/20 text-[10px] sm:text-[11px] text-gray-300 px-1.5 py-[2px] rounded-full whitespace-nowrap">
                    +{extraTags}
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            <div className="text-gray-200 text-[13px] sm:text-sm leading-relaxed mb-5 max-w-md">
              <p className="line-clamp-2 opacity-90">{featured.description}</p>
              <Link
                href={`/movie/${featured._id}`}
                className="inline-block mt-1 text-sky-400 text-[13px] sm:text-sm font-semibold hover:text-sky-300 transition"
              >
                Read More
              </Link>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href={`/movie/${featured._id}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0] text-black font-semibold px-5 py-2.5 rounded-full shadow-[0_0_25px_rgba(88,224,192,0.5)] hover:scale-[1.05] hover:shadow-[0_0_35px_rgba(88,224,192,0.8)] transition-all text-[13px] sm:text-sm"
              >
                <FiPlay className="w-4 h-4" />
                Watch Now
              </Link>

              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border border-white/20 text-sm">
                <FiClock /> Watch Later
              </button>
              <button className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition">
                <FiShare2 className="w-4 h-4 text-white" />
              </button>
              <button className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition">
                <FiHeart className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-16 sm:bottom-20 right-6 sm:right-12 lg:right-20 flex flex-col items-end gap-3 z-50">
        <div className="flex gap-0">
          <button
            onClick={handlePrev}
            className="px-2.5 py-1.5 text-5xl hover:bg-white/20 text-white"
          >
            ‹
          </button>
          <button
            onClick={handleNext}
            className="px-2.5 py-1.5 text-5xl hover:bg-white/20 text-white"
          >
            ›
          </button>
        </div>

        <div className="flex gap-2">
          {popular.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIndex(i);
                startAutoSlide();
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === index
                  ? "bg-white scale-110"
                  : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
