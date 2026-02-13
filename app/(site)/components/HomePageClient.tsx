// app/(site)/components/HomePageClient.tsx
"use client";

import { useEffect, useState } from "react";
import ContentSection from "./ContentSection";
import Hero from "./Hero";
import TopPicksClient from "./TopPicksClient";
import CategorySection from "./CategorySection";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import { Content } from "@/types/content";

export default function HomePageClient({
  initialData,
}: {
  initialData: {
    popular: Content[];
    comingSoon: Content[];
    movies: Content[];
    series: Content[];
    originals: Content[];
  };
}) {
  const { popular, comingSoon, movies, series, originals } = initialData;

  // 🧩 Pisahkan konten upcoming
  const now = Date.now();
  const splitUpcoming = (arr: Content[]) => {
    const upcoming = arr.filter(
      (item) => item.releaseDate && new Date(item.releaseDate).getTime() > now
    );
    const normal = arr.filter(
      (item) => !item.releaseDate || new Date(item.releaseDate).getTime() <= now
    );
    return { upcoming, normal };
  };

  const { upcoming: upcomingMovies, normal: filteredMovies } = splitUpcoming(movies);
  const { upcoming: upcomingSeries, normal: filteredSeries } = splitUpcoming(series);
  const { upcoming: upcomingOriginals, normal: filteredOriginals } = splitUpcoming(originals);

  const allUpcoming = [
    ...comingSoon,
    ...upcomingMovies,
    ...upcomingSeries,
    ...upcomingOriginals,
  ]
    .filter((v, i, self) => i === self.findIndex((x) => x._id === v._id))
    .sort(
      (a, b) =>
        new Date(a.releaseDate || 0).getTime() -
        new Date(b.releaseDate || 0).getTime()
    );

  // 🖼️ Preload gambar hover (biar animasi hover halus)
  useEffect(() => {
    const preload = () => {
      [
        ...popular,
        ...filteredMovies,
        ...filteredSeries,
        ...filteredOriginals,
        ...allUpcoming,
      ]
        .filter((c) => c.landscapePoster)
        .forEach((c) => {
          const img = new Image();
          img.src = c.landscapePoster!;
        });
    };
    preload();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20 overflow-x-hidden">
      {/* HERO */}
      <div className="relative min-h-screen">
        {popular.length > 0 ? (
          <Hero popular={popular} />
        ) : (
          <div className="w-full h-screen flex items-center justify-center bg-[#0A0A0A]">
            <div className="w-12 h-12 border-4 border-white/20 border-t-[#58E0C0] rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="px-4 md:px-8 relative z-20">
        {/* Category picker */}
        <CategorySection />

        {/* Top Picks */}
        <TopPicksClient
          allContent={[
            ...popular,
            ...filteredMovies,
            ...filteredSeries,
            ...filteredOriginals,
          ]}
        />

        {/* Movies */}
        <div className="flex items-center justify-between px-4 md:px-8 mt-10 mb-2">
          <h2 className="text-2xl font-semibold text-gray-100">Movies</h2>
          <Link
            href="/movies"
            className="flex items-center gap-1 text-sm text-[#58A4B0] hover:underline"
          >
            Explore All <FiChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <ContentSection title="" items={filteredMovies} loading={false} limit={6} />

        {/* Series */}
        <div className="flex items-center justify-between px-4 md:px-8 mt-10 mb-2">
          <h2 className="text-2xl font-semibold text-gray-100">Series</h2>
          <Link
            href="/series"
            className="flex items-center gap-1 text-sm text-[#58A4B0] hover:underline"
          >
            Explore All <FiChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <ContentSection title="" items={filteredSeries} loading={false} limit={6} />

        {/* Originals */}
        <div className="flex items-center justify-between px-4 md:px-8 mt-10 mb-2">
          <h2 className="text-2xl font-semibold text-gray-100">Originals</h2>
          <Link
            href="/originals"
            className="flex items-center gap-1 text-sm text-[#58A4B0] hover:underline"
          >
            Explore All <FiChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <ContentSection title="" items={filteredOriginals} loading={false} limit={6} />

        {/* Coming Soon */}
        <ContentSection
          title="Coming Soon"
          items={allUpcoming}
          loading={false}
          comingSoon
          limit={6}
        />
      </div>
    </div>
  );
}
