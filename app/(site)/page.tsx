// app/(site)/page.tsx
import HomePageClient from "./components/HomePageClient";

async function getData(endpoint: string) {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const url = `${base}/api/content?endpoint=${endpoint}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  return res.json();
}

export default async function HomePage() {
  // ✅ SSR fetch
  const [popular, comingSoon, movies, series, originals] = await Promise.all([
    getData("popular"),
    getData("coming-soon"),
    getData("movies"),
    getData("series"),
    getData("originals"),
  ]);

  // ✅ kirim ke client biar bisa handle loading state visual, hover preload dll
  return (
    <HomePageClient
      initialData={{ popular, comingSoon, movies, series, originals }}
    />
  );
}
