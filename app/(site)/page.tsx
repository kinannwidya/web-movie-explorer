// app/(site)/page.tsx
import HomePageClient from "./components/HomePageClient";
async function getData(endpoint: string) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://web-movie-explorer.vercel.app";

    const res = await fetch(
      `${baseUrl}/api/content?endpoint=${endpoint}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      console.error(`❌ Failed to fetch ${endpoint}`, res.status);
      return [];
    }

    return await res.json();
  } catch (err) {
    console.error(`❌ Error fetching ${endpoint}`, err);
    return [];
  }
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
