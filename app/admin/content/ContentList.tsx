"use client";

import { useMemo, useState, useEffect } from "react";
import { FiEdit2, FiPlay, FiStar, FiTrash2 } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ContentItem {
  _id: string;
  title: string;
  poster?: string;
  landscapePoster?: string;
  description?: string;
  genre?: string;
  year?: number;
  type: string;
  rating?: number;
  status: "draft" | "published";
  tags?: string[];
  ageRating?: string;
  isPopular: boolean;
  popularityRank: number | null;
  releaseDate?: string;
  // optional cloudinary ids
  publicId?: string;
  landscapePublicId?: string;
}

interface ContentListProps {
  items: ContentItem[];
  filters: {
    search: string;
    genre: string | null;
    sortBy: "newest" | "rating" | "year";
    type: "all" | "movie" | "series" | "original";
    status: "all" | "draft" | "published";
    popularOnly: boolean;
    comingSoonOnly: boolean;
  };
}

export default function ContentList({ items, filters }: ContentListProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [localItems, setLocalItems] = useState<ContentItem[]>(items);
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  // Sync local state when props change
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // Filtering + Sorting
  const filtered = useMemo(() => {
    let arr = [...localItems];

    // Status
    if (filters.status !== "all") arr = arr.filter((m) => m.status === filters.status);

    // Type
    if (filters.type !== "all") {
      arr =
        filters.type === "original"
          ? arr.filter((m) => m.tags?.includes("original"))
          : arr.filter((m) => m.type === filters.type);
    }

    // Genre
    if (filters.genre && filters.genre !== "All") {
      arr = arr.filter(
        (m) => (m.genre || "").toLowerCase() === filters.genre!.toLowerCase()
      );
    }

    // Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      arr = arr.filter((m) =>
        [m.title, m.genre, (m.tags || []).join(" ")].join(" ").toLowerCase().includes(q)
      );
    }

    // Coming soon
    if (filters.comingSoonOnly) {
      arr = arr.filter((m) => {
        if (!m.releaseDate) return false;
        return new Date(m.releaseDate).getTime() > Date.now();
      });
      arr.sort(
        (a, b) =>
          new Date(a.releaseDate!).getTime() - new Date(b.releaseDate!).getTime()
      );
      return arr;
    }

    // Popular only
    if (filters.popularOnly) {
      arr = arr
        .filter((m) => m.isPopular)
        .sort((a, b) => (a.popularityRank ?? 0) - (b.popularityRank ?? 0));
      return arr;
    }

    // Sorting umum
    if (filters.sortBy === "newest") {
      arr.sort(
        (a: any, b: any) =>
          +new Date(b.updatedAt || b.createdAt || 0) - +new Date(a.updatedAt || a.createdAt || 0)
      );
    } else if (filters.sortBy === "rating") {
      arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filters.sortBy === "year") {
      arr.sort((a, b) => (b.year || 0) - (a.year || 0));
    }

    return arr;
  }, [localItems, filters]);

  // Toggle Popular
  const togglePopularity = async (item: ContentItem) => {
    const newValue = !item.isPopular;

    try {
      const res = await fetch(`/api/content/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPopular: newValue,
          popularityRank: newValue ? 9999 : null,
        }),
      });

      if (!res.ok) throw new Error("Failed to update popularity");

      setLocalItems((prev) =>
        prev.map((i) =>
          i._id === item._id
            ? { ...i, isPopular: newValue, popularityRank: newValue ? 9999 : null }
            : i
        )
      );
    } catch (err) {
      console.error(err);
      alert("Gagal mengubah popularitas.");
    }
  };

  // Open delete modal (instead of confirm)
  const openDeleteModal = (m: ContentItem) => {
    setDeleteTarget(m);
  };

  // Confirm delete (actual delete action)
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      // delete cloudinary images if exists
      if ((deleteTarget as any).publicId) {
        await fetch("/api/cloudinary-delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: (deleteTarget as any).publicId }),
        });
      }
      if ((deleteTarget as any).landscapePublicId) {
        await fetch("/api/cloudinary-delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: (deleteTarget as any).landscapePublicId }),
        });
      }

      // delete content
      const res = await fetch(`/api/content/${deleteTarget._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete content");

      // update local UI immediately
      setLocalItems((prev) => prev.filter((i) => i._id !== deleteTarget._id));
      setDeleteTarget(null);

      // refresh server data (optional, for SSR etc)
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus konten.");
    } finally {
      setDeleting(false);
    }
  };

  // Edit
  const openEdit = (m: ContentItem) => {
    router.push(`/admin/edit/${m._id}`);
  };

  // ---------- New: contextual count label logic ----------
  const totalCount = items?.length ?? 0; // total from props (unfiltered)
  const filteredCount = filtered.length;

  const noFiltersApplied =
    filters.type === "all" &&
    (filters.genre === null || filters.genre === "All") &&
    filters.search.trim() === "" &&
    filters.status === "all" &&
    !filters.popularOnly &&
    !filters.comingSoonOnly;

  const pluralizeType = (type: string, count: number) => {
    if (type === "original") return count === 1 ? "original" : "originals";
    if (type === "movie") return count === 1 ? "movie" : "movies";
    if (type === "series") return count === 1 ? "series" : "series";
    return "";
  };

  const headerLabel = noFiltersApplied
    ? `Content (${totalCount})`
    : filters.type === "all"
      ? `Results (${filteredCount})`
      : `Results (${filteredCount} ${pluralizeType(filters.type, filteredCount)})`;
  // ------------------------------------------------------

  return (
    <>
      {/* Header with contextual count (single-line, simplified) */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm text-white/80 font-semibold">{headerLabel}</h3>
        </div>
        {/* reserved for future controls */}
        <div className="text-[12px] text-white/60" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-6">
        {filtered.map((m) => (
          <div
            key={m._id}
            className="group relative"
            onMouseEnter={() => setHoverId(m._id)}
            onMouseLeave={() => setHoverId(null)}
          >
            {/* Poster */}
            <div
              className={`rounded-md overflow-hidden aspect-[2/3] relative shadow-sm transition-all
  ${m.status === "draft"
                  ? "bg-white/[0.03] scale-[0.98] opacity-80 grayscale hover:scale-[1.0]"
                  : "bg-white/[0.05] hover:scale-[1.02]"
                }`}
            >
              {m.poster ? (
                <img
                  src={m.poster}
                  alt={m.title}
                  className={`w-full h-full object-cover transition-all duration-300 ${m.status === "draft" ? "grayscale opacity-80" : ""
                    }`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-white/60 bg-gradient-to-br from-[#0A369D]/40 to-[#58A4B0]/30">
                  No Poster
                </div>
              )}

              {/* 🟠 Coming Soon OR Original badge (prioritas Coming Soon) */}
              {(() => {
                const isComingSoon =
                  m.releaseDate && new Date(m.releaseDate).getTime() > Date.now();
                const isOriginal = Array.isArray(m.tags) && m.tags.includes("original");

                if (isComingSoon) {
                  return (
                    <div className="absolute -top-[5px] left-0 z-20">
                      <span
                        className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide
                bg-gradient-to-r from-amber-500 to-rose-500 text-[#0d1b2a]
                shadow-md rounded-br-md"
                      >
                        Soon
                      </span>
                    </div>
                  );
                }

                if (isOriginal) {
                  return (
                    <div className="absolute -top-[5px] left-0 z-20">
                      <span
                        className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide
                bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0] text-[#0d1b2a]
                shadow-md rounded-br-md"
                      >
                        Original
                      </span>
                    </div>
                  );
                }

                return null;
              })()}

              {/* Popular badge (tetap di kanan atas) */}
              {m.isPopular && (
                <div
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-yellow-400 text-black shadow-md"
                  title="Popular content"
                >
                  <FiStar size={14} />
                </div>
              )}
            </div>

            {/* Title */}
            <div className="mt-2">
              <p className="text-[11px] text-white/50">
                {m.type?.toUpperCase()} • {m.year}
              </p>
              <h3 className="font-medium text-sm line-clamp-1 text-white">{m.title}</h3>
            </div>

            {/* Hover Panel */}
            {hoverId === m._id && (
              <HoverPanel
                item={m}
                onEdit={openEdit}
                onDelete={openDeleteModal}
                onStar={() => togglePopularity(m)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog (Glasmorphism) */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent
          className="rounded-2xl p-6 bg-white/10 backdrop-blur-xl border border-white/20
               shadow-[0_8px_32px_rgba(0,0,0,0.25)] text-white max-w-sm w-[90%] mx-auto"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Delete Content
            </DialogTitle>
            <DialogDescription className="text-white/80 text-sm mt-1">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">{deleteTarget?.title}</span>?
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-md transition-all duration-150"
            >
              Cancel
            </Button>

            <Button
              onClick={confirmDelete}
              disabled={deleting}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:opacity-90 text-white border border-red-800/30 rounded-md flex items-center gap-2 transition-all duration-150 shadow-md"
            >
              {deleting ? <Loader2 className="animate-spin w-4 h-4" /> : <FiTrash2 />}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ===========================
   Hover Panel Component
   =========================== */
function HoverPanel({ item, onEdit, onDelete, onStar }: any) {
  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 top-0 w-[220px] z-30
        bg-[#0A141F]/75 backdrop-blur-xl backdrop-saturate-100
        shadow-[0_8px_30px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden
        transition-all duration-300 ease-out origin-bottom`}
      role="dialog"
    >
      <div className="relative pointer-events-auto" onClick={(e) => e.stopPropagation()}>
        <div className="relative w-full aspect-video bg-black/20 overflow-hidden">
          {item.landscapePoster ? (
            <img src={item.landscapePoster} alt={item.title} className="w-full h-full object-cover" />
          ) : item.poster ? (
            <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-white/50 bg-[#0A1E4A]/30">
              No Image
            </div>
          )}

          {/* 🟡 Upcoming / 🔵 Original badge on hover */}
          {(() => {
            const isUpcoming = item.releaseDate && new Date(item.releaseDate).getTime() > Date.now();
            const isOriginal = Array.isArray(item.tags) && item.tags.includes("original");
            const badgeText = isUpcoming ? "Soon" : isOriginal ? "Original" : null;

            if (!badgeText) return null;

            return (
              <div className="absolute -top-[5px] left-0 z-20">
                <span
                  className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow-md rounded-br-md
            ${isUpcoming
                      ? "bg-gradient-to-r from-amber-500 to-rose-500 text-[#0d1b2a]"
                      : "bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0] text-[#0d1b2a]"
                    }`}
                >
                  {badgeText}
                </span>
              </div>
            );
          })()}
        </div>

        {/* Deskripsi + tombol action */}
        <div className="p-3 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-extrabold text-[13px] pr-2 bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0] bg-clip-text text-transparent line-clamp-2">
              {item.title}
            </h4>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStar();
                }}
                className={`p-1.5 rounded-full transition ${item.isPopular
                  ? "bg-yellow-400 text-black hover:bg-yellow-300"
                  : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                title={item.isPopular ? "Unmark Popular" : "Mark as Popular"}
              >
                <FiStar size={12} />
              </button>
            </div>
          </div>

          <div className="flex items-center text-[11px] text-white/70 mb-2 gap-2">
            <span>{item.year || "-"}</span>
            <span className="text-white/40">|</span>
            {item.genre && <span>{item.genre}</span>}
            <span className="text-white/40">|</span>
            {item.ageRating && <span>{item.ageRating}</span>}
          </div>

          <p className="text-[11px] text-white/90 line-clamp-3 flex-1 transition-all duration-300 ease-out group-hover:opacity-90">
            {item.description}
          </p>

          {/* Modern action buttons — 2 columns, equal width */}
          <div
            className="grid grid-cols-2 gap-2 pt-4
    opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
    transition-all duration-300 ease-out"
          >
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="flex items-center justify-center gap-1 w-full px-3 py-1.5 rounded-lg
      text-[11px] text-[#58E0C0]
      bg-white/5 backdrop-blur-md
      shadow-[0_0_10px_rgba(29,140,255,0.6)]
      transition-all duration-300
      hover:bg-[#1D8CFF]/50 hover:text-white hover:scale-[0.97]"
            >
              <FiEdit2 />
              Edit
            </button>

            <button
              type="button"
              onClick={() => onDelete(item)}
              className="flex items-center justify-center gap-1 w-full px-3 py-1.5 rounded-lg
      text-[11px] text-rose-400
      bg-white/5 backdrop-blur-md
      shadow-[0_0_10px_rgba(244,63,94,0.6)]
      transition-all duration-300
      hover:bg-rose-500/50 hover:text-white hover:scale-[0.97]"
            >
              <FiTrash2 />
              Delete
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
