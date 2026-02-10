"use client";

export default function AdminUsersPage() {
  // Placeholder – sambil nunggu integrasi auth/user store
  const users = [
    { id: 1, name: "Sarah J", email: "sarah@example.com", role: "admin" },
    { id: 2, name: "Rafi", email: "rafi@example.com", role: "editor" },
    { id: 3, name: "Nia", email: "nia@example.com", role: "viewer" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Users</h2>

      <div className="overflow-hidden rounded-md border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-white/10">
                <td className="p-3">{u.name}</td>
                <td className="p-3 opacity-80">{u.email}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-white/10 border border-white/20">
                    {u.role}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 mr-2">
                    Edit
                  </button>
                  <button className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-rose-300">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center opacity-70">No users.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
