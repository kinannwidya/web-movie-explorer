"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiMonitor,
  FiFilm,
  FiUsers,
  FiSettings,
  FiSearch,
  FiPlus,
  FiStar,
} from "react-icons/fi";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", icon: <FiMonitor />, label: "Dashboard" },
    { href: "/admin/content", icon: <FiFilm />, label: "Content" },
    { href: "/admin/popularity", icon: <FiStar />, label: "Popularity" },
    { href: "/admin/users", icon: <FiUsers />, label: "Users" },
    { href: "/admin/settings", icon: <FiSettings />, label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex bg-[#0d1b2a] text-white">
      {/* 🧭 Sidebar */}
      <aside className="hidden md:flex flex-col w-55 bg-[#0A141F] border-r border-white/10 sticky top-0 h-screen z-30">
        <div className="h-[64px] flex items-center px-4 border-b border-white/10 gap-2">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#1D8CFF]/20 to-[#58E0C0]/50 flex items-center justify-center">
            <FiMonitor />
          </div>
          <span className="font-bold tracking-wide">Viemo CMS</span>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-lg">{l.icon}</span>
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 text-xs text-white/50">
          © 2025 Viemo
        </div>
      </aside>

      {/* 🧱 Main Area */}
      <div className="flex-1 flex flex-col relative z-20">
        {/* 🔝 Topbar */}
        <header className="sticky top-0 z-40 bg-[#0d1b2a]/80 backdrop-blur border-b border-white/10 h-[64px] flex items-center">
          <div className="px-6 w-full flex flex-wrap items-center gap-6">
            {/* 🔍 Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-md px-3 h-[36px]">
                <FiSearch className="opacity-70" />
                <input
                  placeholder="Search…"
                  className="bg-transparent outline-none w-full placeholder:text-white/60 text-sm"
                />
              </div>
            </div>

            {/* ➕ Add Content */}
            <div className="flex-shrink-0">
              <Link
                href="/admin/new"
                className="flex text-sm items-center gap-2 bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0] text-black px-4 py-2 rounded-md shadow hover:opacity-90 transition-all"
              >
                <FiPlus />
                <span className="hidden sm:inline">Add Content</span>
              </Link>
            </div>
          </div>
        </header>

        {/* 🧾 Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
