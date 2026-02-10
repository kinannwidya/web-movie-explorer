"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiStar,
  FiUsers,
  FiFilm,
  FiDollarSign,
  FiClock,
  FiTrendingUp,
  FiActivity,
  FiAlertTriangle,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// 📈 Recharts
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
  Cell,
} from "recharts";

type MovieItem = {
  _id: string;
  title: string;
  type?: "movie" | "series";
  year?: number;
  genre?: string;
  country?: string;
  tags?: string[];
  poster?: string;
  description?: string;
  rating?: number;
  episodes?: number;
  views?: number;
  watchHours?: number;
  createdAt?: string;
  updatedAt?: string;
  status?: "Published" | "Draft";
  publicId?: string;
};

type RangeKey = "today" | "7d" | "30d";

export default function AdminDashboardPage() {
  // 🧱 base states
  const [items, setItems] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const anchors = useRef<Record<string, HTMLElement | null>>({});
  const router = useRouter();

  // ✨ range & metrics (computed locally — no external fetch)
  const [range, setRange] = useState<RangeKey>("7d");
  const [activeNow, setActiveNow] = useState<number>(0); // snapshot (statis, gak ikut range)
  const [dau, setDau] = useState<number>(0);            // tampil sesuai range (harian / avg daily)
  const [activeSubs, setActiveSubs] = useState<number>(0); // MRR basis
  const [revenue, setRevenue] = useState<number>(0);     // mengikuti range (today/week/month)
  const [watchHours, setWatchHours] = useState<number>(0); // mengikuti range
  const [lastUpdatedAgo, setLastUpdatedAgo] = useState<string>("just now");

  const getRangeLabel = (r: RangeKey) =>
    r === "today" ? "Today" : r === "7d" ? "7 Days" : "30 Days";

  const revenueLabel = useMemo(
    () => (range === "today" ? "Revenue (Today)" : range === "7d" ? "Revenue (Week)" : "Revenue (Month)"),
    [range]
  );

  // Sub text revenue: 30d = MRR (no est), selain itu est.
  const revenueSub = useMemo(() => {
    if (range === "30d") return "MRR";
    return "≈ $" + (activeSubs * 5).toLocaleString() + " /mo est.";
  }, [range, activeSubs]);

  // 🔄 load content (ONLY /api/content)
  const load = async () => {
    try {
      setLoading(true);
      const data = await fetch("/api/content").then((r) => r.json());
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load /api/content", e);
      setItems([]);
    } finally {
      setLoading(false);
      setLastUpdatedAgo("just now");
    }
  };

  // 🧮 compute metrics locally (no /api/metrics)
  const computeMetrics = () => {
    // gunakan items.length sebagai baseline agar stabil tapi tetap terasa realistis
    const contentCount = items.length || 20;

    // baseline DAU (harian) kira-kira 18–22 viewer/title/day
    const baseDaily = Math.max(120, Math.round(contentCount * 20));

    // active subs ~ 45–55% dari DAU baseline (kamu bisa sambungkan ke real MRR nanti)
    const subs = Math.round(baseDaily * 0.5);
    setActiveSubs(subs);

    // pilih DAU sesuai range (7d/30d = average daily)
    const dauToday = baseDaily;
    const dau7dAvg = Math.round(baseDaily * 0.93);
    const dau30dAvg = Math.round(baseDaily * 0.9);
    const pickedDau = range === "today" ? dauToday : range === "7d" ? dau7dAvg : dau30dAvg;
    setDau(pickedDau);

    // ❗ Active Now TIDAK diubah di sini (biar statis)

    // Revenue: MRR = subs * $5, prorata untuk today/week
    const mrr = subs * 5;
    const revenueToday = Math.round(mrr / 30);
    const revenue7d = Math.round(mrr / 4.3);
    const revenue30d = mrr;
    setRevenue(range === "today" ? revenueToday : range === "7d" ? revenue7d : revenue30d);

    // Watch hours: ~1.5 jam/user/hari; 30d dikasih faktor 0.95 biar realistis (churn/seasonality)
    const dailyHours = Math.round(pickedDau * 1.5);
    const hours = range === "today" ? dailyHours : range === "7d" ? dailyHours * 7 : Math.round(dailyHours * 30 * 0.95);
    setWatchHours(hours);
  };

  // initial load
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // set Active Now SEKALI saat data pertama kali ada (statis, gak ikut range)
  useEffect(() => {
    if (items.length && activeNow === 0) {
      const contentCount = items.length || 20;
      const baseDaily = Math.max(120, Math.round(contentCount * 20));
      const snapshot = Math.max(10, Math.round(baseDaily * 0.12));
      setActiveNow(snapshot);
    }
  }, [items.length, activeNow]);

  // recompute other metrics whenever range or item count changes (Active Now tidak ikut berubah)
  useEffect(() => {
    computeMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, items.length]);

  // ⛔ TIDAK ADA wobble/interval — Active Now benar-benar statis

  // 🧮 content stats
  const stats = useMemo(() => {
    const total = items.length;
    const movies = items.filter((i) => i.type === "movie").length;
    const series = items.filter((i) => i.type === "series").length;
    const originals = items
      .filter((i) => (i.tags || []).map((t) => t.toLowerCase()).includes("original")).length;
    return { total, movies, series, originals };
  }, [items]);

  const genres = useMemo(
    () => ["All", "Romance", "Comedy", "Fantasy", "Action", "History", "Horror", "Sci-Fi"],
    []
  );

  // 📈 chart data (dynamic by range)
  const chartData = useMemo(() => {
    if (range === "today") {
      return Array.from({ length: 24 }).map((_, h) => {
        const base = (items.length * 5 + h * 9) % 280;
        const views = base + 80 + Math.floor(Math.random() * 60);
        const watchHours = Math.round(views * 0.35);
        const signups = Math.max(0, Math.round(views * 0.03 - (h % 2)));
        const label = `${h.toString().padStart(2, "0")}:00`;
        return { day: label, views, watchHours, signups };
      });
    }

    const len = range === "7d" ? 7 : 30;
    return Array.from({ length: len }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (len - 1 - i));
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      const base = (items.length * 7 + i * 13) % 300;
      const views = base + 100 + Math.floor(Math.random() * 80);
      const watchHours = Math.round(views * 0.6);
      const signups = Math.max(0, Math.round(views * 0.05 - (i % 3)));
      return { day: label, views, watchHours, signups };
    });
  }, [items.length, range]);

  // 📊 Top Genres: dynamic realistic + slight fluctuation
  const topGenres = useMemo(() => {
    const fluctuate = (v: number) => Math.round(v * (0.97 + Math.random() * 0.06));

    if (range === "today") {
      // Hari ini: hiburan cepat & ringan
      return [
        { genre: "Action", total: fluctuate(310) },
        { genre: "Comedy", total: fluctuate(270) },
        { genre: "Romance", total: fluctuate(230) },
      ];
    }

    if (range === "7d") {
      // Mingguan: kombinasi story-driven + aksi
      return [
        { genre: "Drama", total: fluctuate(1620) },
        { genre: "Action", total: fluctuate(1450) },
        { genre: "Sci-Fi", total: fluctuate(1280) },
      ];
    }

    // Bulanan: yang bertahan lama (cerita kuat / world-building)
    return [
      { genre: "Drama", total: fluctuate(6920) },
      { genre: "Fantasy", total: fluctuate(6450) },
      { genre: "Action", total: fluctuate(6100) },
    ];
  }, [range]);

  const topGenresTitle = useMemo(
    () =>
      range === "today"
        ? "Top Genres (Today)"
        : range === "7d"
          ? "Top Genres (This Week)"
          : "Top Genres (This Month)",
    [range]
  );

  // 🔥 Trending Content (NO DUMMY) + loading/empty states
  const trending = useMemo(() => {
    if (!items.length) return [];
    return items
      .slice()
      .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
      .slice(0, 3);
  }, [items]);

  // 🆕 Recently Added (NO DUMMY) + loading fallback
  const recent = useMemo(() => {
    if (!items.length) return [];
    return items
      .slice()
      .sort(
        (a, b) =>
          +new Date(b.updatedAt || b.createdAt || 0) -
          +new Date(a.updatedAt || a.createdAt || 0)
      )
      .slice(0, 4);
  }, [items]);

  const [heatmap, setHeatmap] = useState<{ day: string; values: number[] }[]>([]);

  useEffect(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data = days.map((d, i) => {
      const row = Array.from({ length: 24 }).map((_, h) => {
        const base = h >= 19 && h <= 22 ? 0.9 : h >= 12 && h <= 14 ? 0.6 : 0.3;
        const jitter = (Math.sin((i + h) * 1.3) + 1) / 6;
        return Math.min(1, Math.max(0, base + jitter));
      });
      return { day: d, values: row };
    });
    setHeatmap(data);
  }, []);

  const openEdit = (m: MovieItem) => {
    router.push(`/admin/edit/${m._id}`);
  };

  const currency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-8">
      {/* 🧭 Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Welcome back, Kinan 👋</h1>
            <p className="text-sm opacity-70">
              Here’s how your platform’s doing {range === "today" ? "today" : "recently"} • Updated {lastUpdatedAgo}
            </p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-white/20 text-white bg-white/10 hover:bg-white/15">
                  Range: {getRangeLabel(range)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0d1b2a] text-white border border-white/20">
                <DropdownMenuItem onClick={() => setRange("today")}>Today</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRange("7d")}>7 Days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRange("30d")}>30 Days</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* 📊 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          {
            icon: <FiUsers />,
            label: "Active Now",
            value: activeNow.toString(),
            sub: "peak today: ~40",
          },
          {
            icon: <FiActivity />,
            label: range === "today" ? "Active Users Today" : "Avg Daily Active",
            value: dau.toString(),
            sub: range === "today" ? "vs yesterday: +8%" : "est. daily",
          },
          {
            icon: <FiDollarSign />,
            label: revenueLabel,
            value: currency(revenue),
            sub: revenueSub, // ✅ Month = MRR, selain itu "≈ $... /mo est."
          },
          {
            icon: <FiClock />,
            label: range === "today" ? "Watch Hours (Today)" : range === "7d" ? "Watch Hours (7d)" : "Watch Hours (30d)",
            value: `${watchHours.toLocaleString()}h`,
            sub:
              range === "today"
                ? "live estimate"
                : "avg " + Math.round(watchHours / (range === "7d" ? 7 : 30)) + "h/day",
          },
          {
            icon: <FiUsers />,
            label: "Active Subscribers",
            value: activeSubs.toString(),
            sub: "renewal week: " + Math.round(activeSubs * 0.15),
          },
          {
            icon: <FiFilm />,
            label: "Total Content",
            value: stats.total.toString(),
            sub: `${stats.movies} movies • ${stats.series} series`,
          },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center gap-2 text-white/80">
              <span className="text-lg">{s.icon}</span>
              <span className="text-sm">{s.label}</span>
            </div>
            <div className="mt-2 text-2xl font-semibold">{s.value}</div>
            <div className="text-xs opacity-70">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* 📈 Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="xl:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="flex flex-col mb-3">
            <div className="flex items-center gap-2">
              <FiTrendingUp className="opacity-80" />
              <h3 className="font-semibold">
                Performance ({range === "today" ? "Today" : range === "7d" ? "Last 7 Days" : "Last 30 Days"})
              </h3>
            </div>
            <span className="text-xs text-white/60 mt-1">Signups • Views • Watch Hours</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#658292" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="#658292" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="day"
                  stroke="rgba(255,255,255,0.6)"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.7)" }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.6)"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.7)" }}
                />

                <Tooltip
                  cursor={false}
                  content={({ active, payload, label, coordinate }: any) => {
                    if (!active || !payload?.length) return null;
                    const info = payload.map((p: any) => ({
                      name: p.name,
                      value: p.value,
                      color: p.color,
                    }));

                    const x = coordinate?.x ?? 0;
                    const y = (coordinate?.y ?? 0) - 40;

                    return (
                      <div
                        className="pointer-events-none absolute"
                        style={{
                          left: x,
                          top: y,
                          transform: "translate(-50%, -100%)",
                          zIndex: 50,
                        }}
                      >
                        <div
                          className="px-3 py-2 rounded-md border border-white/10 bg-white/10 backdrop-blur-md text-[12px] shadow-lg"
                          style={{
                            color: "rgba(255,255,255,0.95)",
                            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                            minWidth: "140px",
                            textAlign: "center",
                          }}
                        >
                          <div className="font-semibold text-white mb-1">{label}</div>
                          {info.map((d: any) => (
                            <div key={d.name} className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-1 opacity-80">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                {d.name}
                              </span>
                              <span className="font-medium text-white/90">{d.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#658292"
                  strokeWidth={2}
                  strokeOpacity={0.9}
                  fill="url(#grad1)"
                  activeDot={{ r: 5, fill: "#fff", stroke: "#658292", strokeWidth: 2 }}
                  name="Views"
                />
                <Line
                  type="monotone"
                  dataKey="watchHours"
                  stroke="#a25c68"
                  strokeWidth={1.8}
                  dot={false}
                  strokeOpacity={0.7}
                  name="Watch Hours"
                />
                <Line
                  type="monotone"
                  dataKey="signups"
                  stroke="#d1b3b8"
                  strokeWidth={1.5}
                  dot={false}
                  strokeOpacity={0.6}
                  name="Signups"
                />

                <Legend verticalAlign="bottom" height={24} wrapperStyle={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar top genres */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="flex flex-col mb-3">
            <div className="flex items-center gap-2">
              <FiFilm className="opacity-80" />
              <h3 className="font-semibold">{topGenresTitle}</h3>
            </div>
            <span className="text-xs text-white/60 mt-1">based on total watch hours</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topGenres} margin={{ top: 10, right: 20, left: 0, bottom: 0 }} barGap={6}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#658292" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="#658292" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="genre" stroke="rgba(255,255,255,0.6)" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.7)" }} />
                <YAxis stroke="rgba(255,255,255,0.6)" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.7)" }} />

                <Tooltip
                  cursor={false}
                  content={({ active, payload, label, coordinate }: any) => {
                    if (!active || !payload?.length) return null;
                    const x = coordinate?.x ?? 0;
                    const y = (coordinate?.y ?? 0) - 30;
                    return (
                      <div
                        className="pointer-events-none absolute"
                        style={{ left: x, top: y, transform: "translate(-50%, -100%)", zIndex: 50 }}
                      >
                        <div
                          className="px-3 py-2 rounded-md border border-white/10 bg-white/10 backdrop-blur-md text-[12px] shadow-lg text-white/90"
                          style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.25)", minWidth: "100px", textAlign: "center" }}
                        >
                          <div className="font-semibold text-white mb-0.5">{label}</div>
                          <div className="opacity-80 text-xs">{payload[0].value.toLocaleString()} h watched</div>
                        </div>
                      </div>
                    );
                  }}
                />

                <Bar dataKey="total" fill="url(#barGrad)" radius={[10, 10, 0, 0]} barSize={36}>
                  {topGenres.map((_, index) => {
                    const colors = ["#658292", "#a25c68", "#7b9aa8"];
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#barGrad)`}
                        stroke={colors[index]}
                        strokeWidth={1.2}
                        style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.25))" }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 🍿 Trending & 🆕 Recent */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Trending Content */}
        <div className="xl:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FiTrendingUp />
              <h3 className="font-semibold">Trending Content</h3>
            </div>
            <Button
              variant="outline"
              className="border-white/20 text-white bg-white/10 hover:bg-white/15"
              onClick={() => router.push("/admin/content")}
            >
              View all
            </Button>
          </div>

          {loading ? (
            <div className="py-6 text-center text-sm opacity-70">Loading trending…</div>
          ) : trending.length === 0 ? (
            <div className="py-6 text-center text-sm opacity-60">No trending content</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {trending.map((m) => (
                <div key={m._id} className="group rounded-md overflow-hidden border border-white/10 bg-white/5">
                  <div className="h-40 bg-white/10">
                    {m.poster ? (
                      <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">No Poster</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs opacity-70">
                      {(m.type || "CONTENT").toUpperCase()} • {m.year ?? "-"}
                    </p>
                    <h4 className="font-semibold line-clamp-1">{m.title}</h4>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 text-yellow-300">
                        <FiStar /> {m.rating ?? "-"}
                      </span>
                      <span className="opacity-70">•</span>
                      <span className="opacity-80">{(m.views ?? 0).toLocaleString()} views</span>
                      <Button onClick={() => openEdit(m)} className="ml-auto h-7 px-3 text-xs bg-rose-500 hover:bg-rose-600">
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <FiClock />
            <h3 className="font-semibold">Recently Added</h3>
          </div>

          {loading ? (
            <div className="py-6 text-center text-sm opacity-70">Loading latest content…</div>
          ) : recent.length === 0 ? (
            <div className="py-6 text-center text-sm opacity-60">No content found</div>
          ) : (
            <div className="space-y-3">
              {recent.map((m) => (
                <div key={m._id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-white/10">
                    {m.poster ? (
                      <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px]">No Poster</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{m.title}</div>
                    <div className="text-xs opacity-70">
                      {(m.status ?? "Published")} • {m.year ?? "-"}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="ml-auto h-7 px-3 text-xs border-white/20 bg-white/10 hover:bg-white/15"
                    onClick={() => openEdit(m)}
                  >
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 💬 Insights & Alerts + 🔥 Peak Hours */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Insights */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <FiActivity />
            <h3 className="font-semibold">Insights</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/30">
              🔥 Viewer engagement naik <b>12%</b> minggu ini.
            </div>
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-400/30">
              <FiAlertTriangle className="inline mr-1" />
              Ada <b>3 film</b> berstatus <b>Draft</b> — pertimbangkan untuk publish.
            </div>
            <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-400/30">
              Genre <b>Sci-Fi</b> punya retention tertinggi (avg <b>42 min</b>).
            </div>
          </div>
        </div>

        {/* Peak Hours Heatmap */}
        <div className="xl:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <FiClock />
            <h3 className="font-semibold">
              Peak Viewing Hours ({range === "today" ? "Today" : range === "7d" ? "7 Days" : "30 Days"})
            </h3>
          </div>
          <div className="text-xs opacity-70 mb-2">Brighter = more active users • Peak: 19:00–22:00 WIB</div>
          <div className="grid grid-rows-7 gap-1">
            {heatmap.length === 0 ? (
  <div className="py-6 text-center text-sm opacity-50">Loading heatmap…</div>
) : (
  heatmap.map((row) => (
    <div key={row.day} className="grid" style={{ gridTemplateColumns: "24px repeat(24, minmax(0, 1fr))", gap: "4px" }}>
      <div className="text-xs opacity-70 h-4 leading-4">{row.day}</div>
      {row.values.map((v, idx) => (
        <div
          key={idx}
          className="h-4 rounded-[2px]"
          style={{
            background: `linear-gradient(180deg,
              rgba(101,130,146,${0.15 + Math.pow(v, 1.8) * 0.6}),
              rgba(162,92,104,${Math.pow(v, 1.8) * 0.55})
            )`,
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: v > 0.75 ? "0 0 5px rgba(162,92,104,0.4)" : "none",
          }}
          title={`${idx}:00 • activity ${(v * 100).toFixed(0)}%`}
        />
      ))}
    </div>
  ))
)}
            {/* jam label */}
            <div className="grid" style={{ gridTemplateColumns: "24px repeat(24, minmax(0, 1fr))", gap: "4px" }}>
              <div />
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h} className="text-[10px] text-center opacity-60">
                  {h}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
