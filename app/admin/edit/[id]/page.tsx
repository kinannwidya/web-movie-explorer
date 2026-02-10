import AdminForm from "../../components/_form";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>; // ✅ params sekarang Promise
}) {
  const { id } = await params; // ✅ wajib di-await

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/content/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch content data");
  }

  const content = await res.json();

  return (
    <div className="p-5">
      {/* Ubah prop dari movie → content */}
      <AdminForm content={content} />
    </div>
  );
}
