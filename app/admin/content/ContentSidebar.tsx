"use client";

import { FiChevronDown, FiFilter, FiStar, FiPlay } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  filters: {
    search: string;
    genre: string | null;
    sortBy: "newest" | "rating" | "year";
    type: "all" | "movie" | "series" | "original";
    status: "all" | "draft" | "published";
    popularOnly: boolean;
    comingSoonOnly: boolean;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      search: string;
      genre: string | null;
      sortBy: "newest" | "rating" | "year";
      type: "all" | "movie" | "series" | "original";
      status: "all" | "draft" | "published";
      popularOnly: boolean;
      comingSoonOnly: boolean;
    }>
  >;
  stats: {
    total: number;
    movies: number;
    series: number;
    originals: number;
    draft: number;
    published: number;
  };
}

export default function ContentSidebar({ filters, setFilters, stats }: SidebarProps) {
  const genres = ["All", "Romance", "Comedy", "Fantasy", "Action", "History", "Horror", "Sci-Fi"];

  const isGenreActive = filters.genre !== null;
  const isSortActive = filters.sortBy !== "newest";

  return (
    <div className="flex flex-col gap-6">
      {/* 📊 Stats */}
      <div className="bg-white/[0.06] rounded-md p-4 flex flex-col gap-3 border border-white/10">
        <h2 className="text-sm font-semibold text-white/80 mb-1">Overview</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatBox
            label="Total"
            value={stats.total}
            isActive={filters.type === "all" && filters.status === "all"}
            onClick={() =>
              setFilters((f) => ({ ...f, type: "all", status: "all" }))
            }
          />
          <StatBox
            label="Movies"
            value={stats.movies}
            isActive={filters.type === "movie"}
            onClick={() => setFilters((f) => ({ ...f, type: "movie" }))}
          />
          <StatBox
            label="Series"
            value={stats.series}
            isActive={filters.type === "series"}
            onClick={() => setFilters((f) => ({ ...f, type: "series" }))}
          />
          <StatBox
            label="Originals"
            value={stats.originals}
            isActive={filters.type === "original"}
            onClick={() => setFilters((f) => ({ ...f, type: "original" }))}
          />
        </div>
      </div>

      {/* 🎛 Filters */}
      <div className="bg-white/[0.06] rounded-md p-4 flex flex-col gap-4 border border-white/10 relative">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/80 leading-none">Filters</h2>
          {(filters.genre ||
            filters.sortBy !== "newest" ||
            filters.search ||
            filters.popularOnly ||
            filters.comingSoonOnly) && (
            <button
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  genre: null,
                  sortBy: "newest",
                  search: "",
                  popularOnly: false,
                  comingSoonOnly: false,
                }))
              }
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 transition"
            >
              <FiFilter size={12} /> Reset
            </button>
          )}
        </div>

        {/* Genre */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={`text-sm flex items-center justify-between w-full
                ${
                  isGenreActive
  ? "bg-gradient-to-r from-[#1D8CFF]/20 to-[#58E0C0]/50 bg-clip-padding text-white border-transparent shadow-md"
  : "bg-white/10 border-white/20 text-white hover:bg-white/15"
                }`}
            >
              Genre: {filters.genre ?? "All"} <FiChevronDown className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#0d1b2a] text-white border-white/20">
            {genres.map((g) => (
              <DropdownMenuItem
                key={g}
                onClick={() =>
                  setFilters((f) => ({ ...f, genre: g === "All" ? null : g }))
                }
                className="cursor-pointer focus:bg-white/10"
              >
                {g}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={`text-sm flex items-center justify-between w-full
                ${
                  isSortActive
                     ? "bg-gradient-to-r from-[#1D8CFF]/20 to-[#58E0C0]/50 bg-clip-padding text-white border-transparent shadow-md"
  : "bg-white/10 border-white/20 text-white hover:bg-white/15"
                }`}
            >
              Sort:{" "}
              {filters.sortBy === "newest"
                ? "Updated"
                : filters.sortBy === "rating"
                ? "Rating"
                : "Year"}{" "}
              <FiChevronDown className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#0d1b2a] text-white border-white/20">
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, sortBy: "newest" }))}>
              Updated
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, sortBy: "rating" }))}>
              Rating
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, sortBy: "year" }))}>
              Year
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Toggles */}
        <div className="grid grid-cols-2 gap-2">
          <ToggleButton
            active={filters.popularOnly}
            onClick={() =>
              setFilters((f) => ({
                ...f,
                popularOnly: !f.popularOnly,
                comingSoonOnly: f.popularOnly ? f.comingSoonOnly : false,
                status: "published",
              }))
            }
            icon={<FiStar className="text-[12px]" />}
            label="Popular"
          />

          <ToggleButton
            active={filters.comingSoonOnly}
            onClick={() =>
              setFilters((f) => ({
                ...f,
                comingSoonOnly: !f.comingSoonOnly,
                popularOnly: f.comingSoonOnly ? f.popularOnly : false,
                status: "published",
              }))
            }
            icon={<FiPlay className="text-[12px]" />}
            label="Soon"
          />
        </div>
      </div>
    </div>
  );
}

/* =========================
   COMPONENTS
   ========================= */

function StatBox({
  label,
  value,
  isActive = false,
  onClick,
}: {
  label: string;
  value: number | string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full px-4 py-2 rounded-lg transition box-border min-h-[56px] flex
        ${
          isActive
            ? "bg-gradient-to-r from-[#1D8CFF]/20 to-[#58E0C0]/50 text-white shadow-md"
            : "bg-white/[0.05] text-white/80 hover:bg-white/[0.1]"
        }`}
    >
      <div aria-hidden className="grow" />
      <div className="shrink-0 text-right leading-tight max-w-full">
        <p className="text-xs opacity-80 whitespace-normal break-words">{label}</p>
        <p className="text-base font-semibold">{value}</p>
      </div>
    </button>
  );
}

function ToggleButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs transition w-full overflow-hidden whitespace-nowrap
        ${
          active
            ? "bg-yellow-400/20 border border-yellow-400 text-yellow-300"
            : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/15"
        }`}
    >
      <span className="shrink-0 flex items-center justify-center">{icon}</span>
      <span className="leading-none">{label}</span>
    </button>
  );
}
