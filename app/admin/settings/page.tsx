"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("Viemo");
  const [accent, setAccent] = useState("#58A4B0");
  const [watermark, setWatermark] = useState(true);

  const save = () => {
    // TODO: POST ke /api/settings
    alert("Settings saved (mock).");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-md p-4">
          <h3 className="font-semibold mb-3">Brand</h3>
          <label className="block text-sm mb-1">Site Name</label>
          <input
            value={siteName}
            onChange={(e)=>setSiteName(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 mb-3"
          />

          <label className="block text-sm mb-1">Accent Color</label>
          <input
            type="color"
            value={accent}
            onChange={(e)=>setAccent(e.target.value)}
            className="h-10 w-16 p-1 bg-transparent border border-white/20 rounded"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-md p-4">
          <h3 className="font-semibold mb-3">Playback</h3>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={watermark}
              onChange={(e)=>setWatermark(e.target.checked)}
            />
            <span className="text-sm">Enable watermark on player</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          className="px-5 py-2 rounded-md bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0] hover:opacity-90"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
