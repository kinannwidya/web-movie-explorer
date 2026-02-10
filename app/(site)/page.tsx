// app/(site)/page.tsx
import HomePageClient from "./components/HomePageClient";

async function getData(endpoint: string) {
  const res = await fetch(
    `/api/content?endpoint=${endpoint}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    console.error(`❌ Failed to fetch ${endpoint}`, res.status);
    return []; // ⬅️ jangan crash SSR
  }

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
