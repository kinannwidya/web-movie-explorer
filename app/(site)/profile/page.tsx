"use client";

import { User, Mail, LogOut } from "lucide-react";

export default function ProfilePage() {
  // nanti ini bisa diganti dari auth / session
  const user = {
    name: "Kinan Widya",
    email: "kinan@example.com",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-28">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0] flex items-center justify-center shadow-md">
              <User className="w-8 h-8 text-white" />
            </div>

            {/* Info */}
            <div>
              <p className="text-xl font-semibold">{user.name}</p>
              <p className="text-sm text-white/60 flex items-center gap-1 mt-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition text-sm">
              Edit Profile
            </button>
            <button className="px-4 py-2 rounded-md bg-red-500/80 hover:bg-red-500 transition text-sm flex items-center gap-1">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
