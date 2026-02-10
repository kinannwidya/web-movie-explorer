"use client";

import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiArrowLeft, FiStar, FiSave, FiMove } from "react-icons/fi";
import Link from "next/link";

interface Content {
  _id: string;
  title: string;
  poster?: string;
  popularityRank: number;
  type: string;
  year?: number;
}

export default function ReorderPage() {
  const [items, setItems] = useState<Content[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/content?endpoint=popular");
      const data = await res.json();
      setItems(data);
    };
    fetchData();
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i._id === active.id);
    const newIndex = items.findIndex((i) => i._id === over.id);
    setItems((items) => arrayMove(items, oldIndex, newIndex));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (let i = 0; i < items.length; i++) {
        await fetch(`/api/content/${items[i]._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            popularityRank: i + 1,
            isPopular: true,
          }),
        });
      }
      alert("✅ Ranking saved!");
    } catch {
      alert("❌ Gagal menyimpan urutan!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/popularity"
            className="text-sm text-white/70 hover:text-white transition flex items-center gap-1"
          >
            <FiArrowLeft /> Back
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FiStar className="text-yellow-400" /> Reorder Popular Content
          </h1>
        </div>

        <button
  onClick={handleSave}
  disabled={saving}
  className={`flex items-center gap-2 text-sm font-semibold text-black 
              bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0] 
              px-4 py-2 rounded-md 
              shadow-[0_0_12px_rgba(88,224,192,0.1)] 
              hover:shadow-[0_0_18px_rgba(88,224,192,0.4)] 
              hover:scale-[1.03] transition-all duration-300 
              disabled:opacity-60 disabled:cursor-not-allowed`}
>
  <FiSave className="w-4 h-4" />
  {saving ? "Saving..." : "Save Order"}
</button>

      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={items.map((i) => i._id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="divide-y divide-white/10 rounded-md border border-white/10 overflow-hidden">
            {items.map((item, index) => (
              <SortableItem key={item._id} item={item} index={index} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableItem({ item, index }: { item: Content; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 px-3 py-2 bg-white/[0.02] backdrop-blur-sm cursor-grab
        ${isDragging ? "bg-white/[0.06] scale-[1.01] shadow-lg z-50" : "hover:bg-white/[0.04]"}`}
    >
      <div className="w-12 h-16 shrink-0 rounded-md overflow-hidden bg-gray-800">
        {item.poster ? (
          <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-[10px]">
            No Poster
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-white text-sm line-clamp-1">{item.title}</h3>
        <p className="text-xs text-white/50">
          {item.type?.toUpperCase()} • {item.year || "-"}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-base font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-4 py-0.5 rounded-full">
          #{index + 1}
        </span>
        <FiMove className="text-white/50 text-base" />
      </div>
    </li>
  );
}
