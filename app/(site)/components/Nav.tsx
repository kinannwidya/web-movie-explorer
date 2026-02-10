"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, Home, Film, ListVideo, Zap, CalendarDays, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

type NavLink = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

export default function Nav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const links: NavLink[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/movies", label: "Movies", icon: Film },
    { href: "/series", label: "Series", icon: ListVideo },
    { href: "/originals", label: "Originals", icon: Zap },
    { href: "/coming-soon", label: "Soon", icon: CalendarDays }, // 🆕 Added
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-90 transition-all duration-500 ease-out
        ${
          scrolled
            ? "bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.5)]"
            : "bg-transparent border-transparent"
        }`}
    >
      {/* ✨ Inner container */}
      <div
        className={`flex items-center justify-between w-[92%] md:w-[90%] max-w-7xl mx-auto 
        transition-all duration-500 ease-out
        ${scrolled ? "py-3" : "py-5"}`}
      >
        {/* 🌟 Logo */}
        <Link
          href="/"
          className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-0.5 whitespace-nowrap"
        >
          <span className="text-white drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)]">Viemo</span>
          <span className="bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0] bg-clip-text text-transparent drop-shadow-[1px_1px_2px_rgba(0,0,0,0.7)]">
            .id
          </span>
        </Link>

        {/* 💻 Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative text-[15px] font-semibold tracking-wide transition-all group ${
                isActive(href)
                  ? "text-white drop-shadow-[1px_1px_1px_rgba(255,255,255,0.9)]"
                  : "text-gray-300 hover:text-white drop-shadow-[1px_1px_1px_rgba(0,0,0,0.9)]"
              }`}
            >
              {label}
              {isActive(href) && (
                <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-[60%] h-[2px] bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0] rounded-full shadow-[0_0_4px_rgba(88,224,192,0.6)]"></span>
              )}
              {!isActive(href) && (
                <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-0 group-hover:w-[30%] h-[1px] bg-gray-400/70 rounded-full transition-all duration-300"></span>
              )}
            </Link>
          ))}
        </div>

        {/* 🔍 Right Section */}
        <div className="hidden lg:flex items-center justify-end gap-3 relative w-[260px]">
          {/* Search Box */}
          <div
            className="group flex items-center justify-between overflow-hidden
                       bg-black/40 border border-white/20 rounded-full backdrop-blur-md
                       shadow-[1px_1px_3px_rgba(0,0,0,0.7)] transition-all duration-300
                       hover:bg-black/60 focus-within:bg-black/60
                       w-[42px] hover:w-[200px] focus-within:w-[200px]"
          >
            <div className="flex items-center justify-center min-w-[42px] h-[42px]">
              <Search className="w-5 h-5 text-white drop-shadow-[1px_1px_1px_rgba(0,0,0,0.9)]" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300
                         text-white placeholder-white/60 bg-transparent outline-none text-sm pr-4"
            />
          </div>

          {/* Profile */}
          <Link href="/profile" className="group shrink-0">
            <div
              className="w-9 h-9 flex items-center justify-center rounded-full
                         bg-gradient-to-r from-[#1D8CFF] to-[#58E0C0]
                         shadow-[1px_1px_3px_rgba(0,0,0,0.6)]
                         hover:shadow-[1px_1px_4px_rgba(0,0,0,0.7)]
                         group-hover:scale-[1.05] transition-all"
            >
              <User className="w-4 h-4 text-white drop-shadow-[1px_1px_1px_rgba(0,0,0,0.95)]" />
            </div>
          </Link>
        </div>

        {/* 📱 Mobile Controls */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            className="p-2.5 rounded-full text-white
                       bg-black/40 hover:bg-black/60
                       border border-white/20 backdrop-blur-md
                       shadow-[1px_1px_3px_rgba(0,0,0,0.7)]
                       transition-all"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            aria-label="Search"
          >
            <Search className="w-5 h-5 drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)]" />
          </button>

          {isSearchOpen && (
            <input
              type="text"
              placeholder="Search..."
              className="absolute right-16 top-1/2 -translate-y-1/2 w-40 px-3 py-1.5 text-sm rounded-full 
                         bg-black/60 text-white placeholder-white/70 border border-white/20
                         shadow-[1px_1px_3px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all duration-300"
            />
          )}

          <button
            className="p-2.5 text-white bg-black/40 hover:bg-black/60
                       border border-white/20 backdrop-blur-md
                       shadow-[1px_1px_3px_rgba(0,0,0,0.7)]
                       rounded-full transition-all"
            onClick={() => setIsMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.95)]" />
            ) : (
              <Menu className="w-6 h-6 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.95)]" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
