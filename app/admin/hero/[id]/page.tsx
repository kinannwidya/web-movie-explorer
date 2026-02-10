"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiSave, FiUpload, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function HeroEditorPage() {
  const { id } = useParams();
  const router = useRouter();

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 🧩 Hero assets + publicIds
  const [heroBg, setHeroBg] = useState<string | null>(null);
  const [heroCharacter, setHeroCharacter] = useState<string | null>(null);
  const [heroTitle, setHeroTitle] = useState<string | null>(null);

  const [heroBgPublicId, setHeroBgPublicId] = useState<string | null>(null);
  const [heroCharacterPublicId, setHeroCharacterPublicId] = useState<string | null>(null);
  const [heroTitlePublicId, setHeroTitlePublicId] = useState<string | null>(null);

  const inputRefs = {
    bg: useRef<HTMLInputElement | null>(null),
    chara: useRef<HTMLInputElement | null>(null),
    title: useRef<HTMLInputElement | null>(null),
  };

  // 🧠 Fetch content data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/content/${id}`);
        const data = await res.json();
        setContent(data);

        setHeroBg(data.heroBg || null);
        setHeroCharacter(data.heroCharacter || null);
        setHeroTitle(data.heroTitle || null);

        setHeroBgPublicId(data.heroBgPublicId || null);
        setHeroCharacterPublicId(data.heroCharacterPublicId || null);
        setHeroTitlePublicId(data.heroTitlePublicId || null);
      } catch (err) {
        console.error("Failed to load content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 🔥 Delete from Cloudinary helper
  const deleteFromCloudinary = async (publicId?: string | null) => {
    if (!publicId) return;
    try {
      const res = await fetch("/api/cloudinary-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
      return res.ok;
    } catch (err) {
      console.error("Cloudinary delete error:", err);
      return false;
    }
  };

  // 🧩 Upload helper
  const uploadFile = async (file: File, folder: string) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", `hero/${folder}`);

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    return { ok: res.ok, data };
  };

  // 🧠 Handle upload + delete old file first
  const handleUpload = async (type: "bg" | "chara" | "title", file?: File) => {
    if (!file) return;
    setUploading(true);

    try {
      // 1️⃣ delete old file if exists
      if (type === "bg" && heroBgPublicId) await deleteFromCloudinary(heroBgPublicId);
      if (type === "chara" && heroCharacterPublicId) await deleteFromCloudinary(heroCharacterPublicId);
      if (type === "title" && heroTitlePublicId) await deleteFromCloudinary(heroTitlePublicId);

      // 2️⃣ upload new file
      const { ok, data } = await uploadFile(file, type);
      if (ok && data?.url) {
        if (type === "bg") {
          setHeroBg(data.url);
          setHeroBgPublicId(data.publicId);
        }
        if (type === "chara") {
          setHeroCharacter(data.url);
          setHeroCharacterPublicId(data.publicId);
        }
        if (type === "title") {
          setHeroTitle(data.url);
          setHeroTitlePublicId(data.publicId);
        }
      } else {
        alert("Upload gagal, cek console.");
        console.error("Upload error:", data);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  // 💾 Save to DB
  const handleSave = async () => {
    setSaving(true);
    setShowSuccess(true);

    try {
      const payload = {
        heroBg,
        heroBgPublicId,
        heroCharacter,
        heroCharacterPublicId,
        heroTitle,
        heroTitlePublicId,
      };

      const res = await fetch(`/api/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      setTimeout(() => setShowSuccess(false), 1500);
    } catch (err) {
      console.error("Save hero failed:", err);
      alert("Gagal menyimpan perubahan hero.");
      setShowSuccess(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-white/70">
        <Loader2 className="animate-spin mr-2" /> Loading hero editor...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/popularity")}
            className="flex items-center gap-2 text-white border-white/20 bg-white/[0.05] hover:bg-white/[0.1] hover:border-white/30 transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.05)]"
          >
            <FiArrowLeft className="text-cyan-300" />
          </Button>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            Edit Hero: 
            <span className="bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0] bg-clip-text  text-transparent"> {content?.title} </span>
          </h1>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || uploading}
          className="flex items-center gap-2 text-black font-semibold bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0] 
                     shadow-[0_0_12px_rgba(88,224,192,0.3)] hover:shadow-[0_0_18px_rgba(88,224,192,0.5)]
                     hover:scale-[1.03] transition-all duration-300"
        >
          {saving ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <FiSave className="opacity-90" />
          )}
          Save Hero
        </Button>
      </div>

      {/* Upload Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <HeroUploadCard
          label="Background"
          image={heroBg}
          onUpload={(file) => handleUpload("bg", file)}
          inputRef={inputRefs.bg}
        />
        <HeroUploadCard
          label="Character"
          image={heroCharacter}
          onUpload={(file) => handleUpload("chara", file)}
          inputRef={inputRefs.chara}
        />
        <HeroUploadCard
          label="Title Image"
          image={heroTitle}
          onUpload={(file) => handleUpload("title", file)}
          inputRef={inputRefs.title}
        />
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="rounded-2xl p-8 max-w-sm w-[90%] text-center
                bg-white/10 backdrop-blur-xl border border-white/20
                shadow-[0_8px_32px_rgba(0,0,0,0.25)]
                flex flex-col items-center justify-center animate-fadeIn"
          >
            {saving ? (
              <>
                <div className="w-12 h-12 border-4 border-white/40 border-t-white rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-white/80">Saving hero changes...</p>
              </>
            ) : (
              <>
                <FiCheckCircle className="text-green-400 text-5xl mb-3" />
                <p className="text-base text-white">Hero updated successfully!</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* 🧩 Reusable upload card */
function HeroUploadCard({
  label,
  image,
  onUpload,
  inputRef,
}: {
  label: string;
  image?: string | null;
  onUpload: (file: File) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 flex flex-col items-center justify-between gap-3 text-white/90 transition-all hover:bg-white/[0.07] hover:border-white/20">
      <h3 className="font-semibold text-sm uppercase tracking-wide text-cyan-300">{label}</h3>

      {image ? (
        <div className="w-full h-40 bg-black/20 rounded-lg overflow-hidden">
          <img src={image} alt={label} className="w-full h-full object-cover rounded-md" />
        </div>
      ) : (
        <div className="w-full h-40 rounded-lg bg-white/5 flex items-center justify-center text-sm text-white/40 border border-dashed border-white/10">
          No image
        </div>
      )}

      <div className="flex gap-2 w-full">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && onUpload(e.target.files[0])}
        />
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 border-white/20 bg-white/[0.05] hover:bg-cyan-500/20 hover:border-cyan-400/30 text-white transition-all"
          onClick={() => inputRef.current?.click()}
        >
          <FiUpload className="text-cyan-300" /> Upload
        </Button>
      </div>
    </div>
  );
}
