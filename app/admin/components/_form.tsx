// app/admin/components/_form.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiSave, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

// Optional crop UI
// If you don't want the crop dependency, you can still upload a landscape file without cropping.
import Cropper, { Area } from "react-easy-crop";
import Slider from "@mui/material/Slider";

interface FormState {
  type: "movie" | "series";
  title: string;
  year: string | number;
  genre: string;
  poster: string;
  publicId: string;
  // new landscape fields
  landscapePoster?: string;
  landscapePublicId?: string;
  description: string;
  rating: string | number;
  duration: string;
  episodes: string | number;
  trailer: string;
  cast: string;
  country: string;
  tags: string;
  ageRating: string;
  status: "draft" | "published";
  releaseDate: string;
}

const genres = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Romance",
  "Thriller",
  "Horror",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Animation",
  "Documentary",
  "Crime",
  "Family",
  "Historical",
];

const countries = [
  "USA",
  "UK",
  "Japan",
  "South Korea",
  "France",
  "China",
  "India",
  "Canada",
  "Germany",
  "Indonesia",
  "Spain",
  "Italy",
  "Australia",
  "Mexico",
  "Thailand",
];

export default function AdminForm({ content }: { content?: any }) {
  const router = useRouter();
  const isEdit = !!content?._id;

  const formatDateForInput = (d: any) => {
    if (!d) return "";
    try {
      const date = new Date(d);
      if (Number.isNaN(date.getTime())) return "";
      return date.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  const [form, setForm] = useState<FormState>({
    type: content?.type || "movie",
    title: content?.title || "",
    year: content?.year || "",
    genre: content?.genre || "",
    poster: content?.poster || "",
    publicId: content?.publicId || "",
    landscapePoster: content?.landscapePoster || "",
    landscapePublicId: content?.landscapePublicId || "",
    description: content?.description || "",
    rating: content?.rating || "",
    duration: content?.duration || "",
    episodes: content?.episodes || "",
    trailer: content?.trailer || "",
    cast: Array.isArray(content?.cast) ? content.cast.join(", ") : content?.cast || "",
    country: content?.country || "",
    tags: Array.isArray(content?.tags) ? content.tags.join(", ") : content?.tags || "",
    ageRating: content?.ageRating || "13+",
    status: content?.status || "draft",
    releaseDate: formatDateForInput(content?.releaseDate),
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Crop states for landscape
  const [cropOpen, setCropOpen] = useState(false);
  const [selectedLandscapeUrl, setSelectedLandscapeUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const inputLandscapeRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setForm((prev) => ({ ...prev, [name]: value } as any));
  };

  // Helper: call cloudinary-delete endpoint
  const deleteFromCloudinary = async (publicId?: string | null) => {
    if (!publicId) return { ok: false, msg: "no publicId" };
    try {
      const res = await fetch("/api/cloudinary-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (err) {
      console.error("Cloudinary delete error:", err);
      return { ok: false, err };
    }
  };

  // Generic upload helper used for both poster & landscape
  const uploadFileToServer = async (file: Blob, folder = "posters") => {
    const fd = new FormData();
    // @ts-ignore
    fd.append("file", file, (file as any).name || "upload.jpg");
    fd.append("folder", folder);

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    return { ok: res.ok, data };
  };

  // Poster upload (keeps existing behavior)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      if (isEdit && form.publicId) {
        const del = await deleteFromCloudinary(form.publicId);
        if (!del.ok) console.warn("Failed to delete old Cloudinary file:", del);
      }

      const { ok, data } = await uploadFileToServer(file, "posters/original");
      if (ok && data?.url) {
        setForm((p) => ({ ...p, poster: data.url, publicId: data.publicId } as any));
      } else {
        console.error("Upload failed:", data);
        alert("Upload gagal. Cek console.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Terjadi kesalahan saat upload.");
    } finally {
      setUploading(false);
    }
  };

  // LANDSCAPE: when file selected we open crop modal
  const handleLandscapeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSelectedLandscapeUrl(url);
    setCropOpen(true);
    if (inputLandscapeRef.current) inputLandscapeRef.current.dataset.filename = file.name;
  };

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPx: Area) => {
      setCroppedAreaPixels(croppedAreaPx);
    },
    []
  );

  // helper to create an Image element from url
  const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", (err) => reject(err));
      img.setAttribute("crossOrigin", "anonymous");
      img.src = url;
    });

  // getCroppedImg: returns Blob
  async function getCroppedImg(imageSrc: string, pixelCrop: any) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Cannot get canvas context");

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
    });
  }

  // When user confirms crop: create blob and upload
  const handleConfirmLandscapeCrop = async () => {
    if (!selectedLandscapeUrl || !croppedAreaPixels) return;
    setUploading(true);

    try {
      const blob = await getCroppedImg(selectedLandscapeUrl, croppedAreaPixels);
      if (!blob) throw new Error("Failed to create cropped image blob");

      const filename = inputLandscapeRef.current?.dataset.filename || "landscape.jpg";
      const fileWithName = new File([blob], filename, { type: "image/jpeg" });

      // delete old landscape if exists
      if (isEdit && form.landscapePublicId) {
        const del = await deleteFromCloudinary(form.landscapePublicId);
        if (!del.ok) console.warn("Failed to delete old landscape image:", del);
      }

      const { ok, data } = await uploadFileToServer(fileWithName, "posters/landscape");
      if (ok && data?.url) {
        setForm((p) => ({ ...p, landscapePoster: data.url, landscapePublicId: data.publicId } as any));
        setCropOpen(false);
        setSelectedLandscapeUrl(null);
      } else {
        console.error("Landscape upload failed:", data);
        alert("Upload landscape gagal. Cek console.");
      }
    } catch (err) {
      console.error("Crop/upload error:", err);
      alert("Terjadi kesalahan saat memproses gambar.");
    } finally {
      setUploading(false);
    }
  };

  // Allow uploading landscape file without cropping (fallback)
  const handleLandscapeDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      if (isEdit && form.landscapePublicId) {
        const del = await deleteFromCloudinary(form.landscapePublicId);
        if (!del.ok) console.warn("Failed to delete old landscape image:", del);
      }
      const { ok, data } = await uploadFileToServer(file, "posters/landscape");
      if (ok && data?.url) {
        setForm((p) => ({ ...p, landscapePoster: data.url, landscapePublicId: data.publicId } as any));
      } else {
        console.error("Landscape direct upload failed:", data);
        alert("Upload landscape gagal. Cek console.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat upload landscape.");
    } finally {
      setUploading(false);
    }
  };

  // Cancel crop
  const handleCancelCrop = () => {
    setCropOpen(false);
    setSelectedLandscapeUrl(null);
  };

  // Submit
  // ✅ Submit (with loading → success popup)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (uploading) {
      alert("Upload masih berlangsung — tunggu sampai selesai lalu tekan Save.");
      return;
    }

    // Tampilkan modal + spinner loading
    setShowSuccessModal(true);
    setLoading(true);

    const payload: any = {
      type: form.type,
      title: form.title?.trim(),
      poster: form.poster?.trim() || content?.poster || undefined,
      publicId: form.publicId?.trim() || content?.publicId || undefined,
      landscapePoster: form.landscapePoster || content?.landscapePoster || undefined,
      landscapePublicId: form.landscapePublicId || content?.landscapePublicId || undefined,
      description: form.description?.trim() || undefined,
      year: form.year === "" ? undefined : Number(form.year),
      genre: form.genre || undefined,
      duration: form.duration || undefined,
      episodes: form.episodes === "" ? undefined : Number(form.episodes),
      trailer: form.trailer || undefined,
      country: form.country || undefined,
      rating: form.rating === "" ? undefined : Math.min(Number(form.rating), 10),
      tags: form.tags
        ? String(form.tags).split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
        : [],
      cast: form.cast
        ? String(form.cast).split(",").map((c) => c.trim()).filter(Boolean)
        : [],
      status: form.status,
      releaseDate: form.releaseDate ? new Date(form.releaseDate) : undefined,

      // Keep previous flags
      isPopular: content?.isPopular ?? false,
      popularityRank: content?.popularityRank ?? null,
    };

    try {
      if (isEdit) {
        const id = content._id;
        if (!id) throw new Error("Missing content._id");
        const res = await fetch(`/api/content/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        await res.json();
      } else {
        const res = await fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        await res.json();
      }

      // 🟢 Selesai request → ubah modal jadi success (centang)
      setLoading(false);

      window.dispatchEvent(new CustomEvent("admin:content:changed"));

      // Auto close + redirect setelah 1.2 detik
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push("/admin/content");
      }, 1500);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Terjadi kesalahan saat menyimpan.");
      setShowSuccessModal(false);
      setLoading(false);
    }
  };

  // Delete content
  const handleDelete = async () => {
    if (!content?._id) return;
    setLoading(true);
    try {
      if (form.publicId) await deleteFromCloudinary(form.publicId);
      if (form.landscapePublicId) await deleteFromCloudinary(form.landscapePublicId);
      const res = await fetch(`/api/content/${content._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      window.dispatchEvent(new CustomEvent("admin:content:changed"));
      router.push("/admin/content");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Terjadi kesalahan saat menghapus.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle original tag helper
  const toggleOriginalTag = (checked: boolean) => {
    const tagsArr = form.tags
      ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    let newTags: string[] = tagsArr;

    if (checked && !tagsArr.includes("original")) {
      newTags = [...tagsArr, "original"];
    } else if (!checked) {
      newTags = tagsArr.filter((t) => t !== "original");
    }

    setForm((p) => ({ ...p, tags: newTags.join(", ") } as any));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        {isEdit ? "Edit Content" : "Add New Content"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1️⃣ Type & Title */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Type</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full capitalize">
                  {form.type || "Select type"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="bg-[#0d1b2a] text-white border border-white/20"
              >
                <DropdownMenuLabel>Select Type</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {["movie", "series"].map((t) => (
                  <DropdownMenuItem
                    key={t}
                    onClick={() => setForm((p) => ({ ...p, type: t as any }))}
                    className="cursor-pointer focus:bg-white/10 capitalize"
                  >
                    {t}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter title (e.g. Interstellar)"
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Year, Genre, Duration/Episodes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Year</label>
            <input
              name="year"
              type="number"
              placeholder="e.g. 2024"
              value={form.year as any}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Genre</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                  {form.genre || "Select genre"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="bg-[#0d1b2a] text-white border border-white/20 max-h-64 overflow-y-auto"
              >
                <DropdownMenuLabel>Select Genre</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {genres.map((g) => (
                  <DropdownMenuItem
                    key={g}
                    onClick={() => setForm((p) => ({ ...p, genre: g }))}
                    className="cursor-pointer focus:bg-white/10"
                  >
                    {g}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {form.type === "movie" ? (
            <div>
              <label className="block text-sm mb-1">Duration</label>
              <input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g. 2h 10m"
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm mb-1">Episodes</label>
              <input
                name="episodes"
                type="number"
                placeholder="e.g. 16"
                value={form.episodes as any}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2"
              />
            </div>
          )}
        </div>

        {/* Poster & Description */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Poster</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2"
            />
            {uploading ? (
              <p className="text-sm text-gray-400 mt-1">Uploading...</p>
            ) : form.poster ? (
              <img
                src={form.poster}
                alt="poster"
                className="h-22 mt-2 rounded border border-white/10 object-cover"
              />
            ) : null}

            {/* Landscape upload/crop block (kept minimal & non-destructive) */}
            <div className="mt-4">
              <label className="block text-sm mb-1">Landscape (for hover card)</label>

              <div className="flex gap-2">
                <input
                  ref={inputLandscapeRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLandscapeSelect}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2"
                />
                {/* fallback direct upload if admin doesn't want to crop */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLandscapeDirectUpload}
                  className="hidden"
                />
              </div>

              {form.landscapePoster ? (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={form.landscapePoster}
                    alt="landscape"
                    className="h-16 rounded border border-white/10 object-cover"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      // open cropper with existing landscape as source (re-crop)
                      setSelectedLandscapeUrl(form.landscapePoster || null);
                      setCropOpen(true);
                    }}
                    className="text-sm underline"
                  >
                    Re-crop
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-1">No landscape uploaded yet.</p>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Description</label>
            <textarea
              name="description"
              placeholder="Write a short description..."
              value={form.description}
              onChange={handleChange}
              rows={5}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Rating, Country & Age Rating */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Rating</label>
            <input
              name="rating"
              type="number"
              step="0.1"
              max={10}
              placeholder="0 - 10"
              value={form.rating as any}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Country</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                  {form.country || "Select country"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="bg-[#0d1b2a] text-white border border-white/20 max-h-64 overflow-y-auto"
              >
                <DropdownMenuLabel>Select Country</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {countries.map((c) => (
                  <DropdownMenuItem
                    key={c}
                    onClick={() => setForm((p) => ({ ...p, country: c }))}
                    className="cursor-pointer focus:bg-white/10"
                  >
                    {c}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 🔥 NEW Age Rating */}
          <div>
            <label className="block text-sm mb-1">Age Rating</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                  {form.ageRating || "Select age rating"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="bg-[#0d1b2a] text-white border border-white/20"
              >
                <DropdownMenuLabel>Select Age Rating</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {["All Ages", "7+", "13+", "16+", "18+"].map((a) => (
                  <DropdownMenuItem
                    key={a}
                    onClick={() => setForm((p) => ({ ...p, ageRating: a }))}
                    className="cursor-pointer focus:bg-white/10"
                  >
                    {a}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Cast & Tags */}
        <div>
          <label className="block text-sm mb-1">Cast</label>
          <input
            name="cast"
            value={form.cast}
            onChange={handleChange}
            placeholder="Actor 1, Actor 2"
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Tags</label>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="original, drama, thriller"
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2"
          />
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="original"
              checked={form.tags
                .split(",")
                .map((t) => t.trim().toLowerCase())
                .includes("original")}
              onChange={(e) => toggleOriginalTag(e.target.checked)}
            />
            <label htmlFor="original" className="text-sm">
              Mark as Original
            </label>
          </div>
        </div>

        {/* Release Date & Status (same row) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm mb-1">Release Date</label>
              <input
                name="releaseDate"
                type="date"
                value={form.releaseDate}
                onChange={handleChange}
                className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2 [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Status</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full capitalize">
                    {form.status || "Select status"}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className="bg-[#0d1b2a] text-white border border-white/20"
                >
                  <DropdownMenuLabel>Select Status</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  {["draft", "published"].map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => setForm((p) => ({ ...p, status: s as any }))}
                      className="cursor-pointer focus:bg-white/10 capitalize"
                    >
                      {s}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

        /* Actions */}
        <div className="pt-3 flex items-center gap-3">
         <button
  type="submit"
  disabled={loading || uploading}
  className="flex items-center gap-2 bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0]
             text-white font-semibold px-4 py-2.5 rounded-md
             text-sm hover:opacity-90 active:scale-[0.97]
             transition-all duration-200"
>
  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <FiSave className="w-4 h-4" />}
  {isEdit ? "Save Changes" : "Create"}
</button>

          {isEdit && (
            <button
  type="button"
  onClick={() => setShowDeleteModal(true)}
  className="flex items-center gap-2 bg-[#1a1f2e]/70 text-white
             hover:bg-[#2a3145]/90 px-4 py-2.5 rounded-md text-sm
             border border-white/10 shadow-sm transition-all duration-300"
>
  <FiTrash2 /> Delete
</button>
          )}
        </div>
      </form>

      {/* Crop Dialog for landscape */}
      <Dialog open={cropOpen} onOpenChange={setCropOpen}>
        <DialogContent className="bg-[#0d1b2a] text-white border border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop Landscape Image (16:9)</DialogTitle>
            <DialogDescription>Sesuaikan area crop untuk hover card.</DialogDescription>
          </DialogHeader>

          <div style={{ position: "relative", height: 280, background: "#333" }}>
            {selectedLandscapeUrl && (
              <Cropper
                image={selectedLandscapeUrl}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>

          <div className="mt-3">
            <label className="text-sm">Zoom</label>
            <div>
              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(_, v) => setZoom(v as number)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={handleCancelCrop} className="px-4 py-2 bg-white/10">
              Cancel
            </Button>
            <Button onClick={handleConfirmLandscapeCrop} className="px-4 py-2 bg-rose-500">
              {uploading ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Landscape"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
<Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
  <DialogContent
    className="rounded-2xl p-6 bg-white/10 backdrop-blur-xl border border-white/20
               shadow-[0_8px_32px_rgba(0,0,0,0.25)] text-white max-w-sm w-[90%]"
  >
    <DialogHeader>
      <DialogTitle className="text-lg font-semibold tracking-tight">
        Delete Content
      </DialogTitle>
      <DialogDescription className="text-white/80 text-sm mt-1">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-white">{form.title}</span>?<br />
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>

    <div className="flex justify-end gap-3">
      <Button
        onClick={() => setShowDeleteModal(false)}
        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20
                   rounded-md transition-all duration-150"
      >
        Cancel
      </Button>

      <Button
        onClick={handleDelete}
        disabled={loading || uploading}
        className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600
                   hover:opacity-90 text-white border border-red-800/30
                   rounded-md flex items-center gap-2 transition-all duration-150 shadow-md"
      >
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <FiTrash2 />}
        Delete
      </Button>
    </div>
  </DialogContent>
</Dialog>

      {/* Success Modal */}
      {/* ✅ Success / Loading Popup */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="rounded-2xl p-8 max-w-sm w-[90%] text-center
                 bg-white/10 backdrop-blur-xl border border-white/20
                 shadow-[0_8px_32px_rgba(0,0,0,0.25)]
                 flex flex-col items-center justify-center animate-fadeIn"
          >
            {loading ? (
              <>
                <div className="w-12 h-12 border-4 border-white/40 border-t-white rounded-full animate-spin mb-3"></div>
                <p className="text-sm md:text-base text-white/90">Saving changes...</p>
              </>
            ) : (
              <>
                {/* Gradient circle + white check */}
                <div className="mb-3 animate-[pop_0.3s_ease-out]">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0]
                            flex items-center justify-center mx-auto shadow-lg">
                    <svg
                      className="w-8 h-8 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-lg md:text-xl font-semibold text-white tracking-tight">
                  Success
                </h3>
                <p className="text-sm md:text-base text-white/90 mt-1">
                  {isEdit ? "Changes saved successfully!" : "New content created successfully!"}
                </p>
              </>
            )}
          </div>
        </div>
      )}


    </div>
  );
}

/*
  NOTES:
  - This file is a drop-in replacement for app/admin/components/_form.tsx with the landscape crop feature
    integrated without removing other form functionality.
  - Optional dependencies (for cropping UI):
      npm install react-easy-crop @mui/material @emotion/react @emotion/styled

  - Ensure your /api/upload accepts FormData with keys: file (Blob), folder (string)
    and returns JSON: { url: string, publicId: string }

  - Update your Mongoose model (app/models/Content.ts) to include:
      landscapePoster: String,
      landscapePublicId: String,

  - Hover card usage suggestion: when rendering the hover card, prefer `content.landscapePoster`.
    If it doesn't exist, you can generate a landscape crop client-side via Cloudinary transformations
    (e.g. add `/c_fill,g_auto,w_640,h_360/` to the Cloudinary URL) as a fallback.
*/
