import MovieDetailClient from "./MovieDetailClient";
import { notFound } from "next/navigation";

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/content/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) notFound();

  const movie = await res.json();
  if (!movie) notFound();

  return <MovieDetailClient movie={movie} />;
}
