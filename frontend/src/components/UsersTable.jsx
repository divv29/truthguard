/**
 * src/components/UsersTable.jsx
 *
 * Fetches all users from GET /api/users and renders them in a clean,
 * professor-demo-ready table with role badges, active status, and
 * a summary bar showing total / active / admin counts.
 *
 * Drop this file into your frontend/src/components/ folder and import it
 * wherever you need it (e.g., in App.jsx or a dedicated /users page).
 *
 * Usage:
 *   import UsersTable from "./components/UsersTable";
 *   <UsersTable />
 */

import { useEffect, useState } from "react";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Map role → Tailwind badge colours */
const ROLE_BADGE = {
  admin:     "bg-purple-500/20 text-purple-300 border border-purple-500/40",
  moderator: "bg-blue-500/20   text-blue-300   border border-blue-500/40",
  user:      "bg-slate-500/20  text-slate-300  border border-slate-500/40",
};

/** Format ISO timestamp to readable local date */
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });

// ── Component ─────────────────────────────────────────────────────────────────

export default function UsersTable() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

    fetch(`${API_URL}/api/users`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
        return res.json();
      })
      .then((json) => {
        if (!json.success) throw new Error("API returned success: false");
        setUsers(json.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived stats (for the summary bar) ────────────────────────────────────
  const total       = users.length;
  const activeCount = users.filter((u) => u.is_active).length;
  const adminCount  = users.filter((u) => u.role === "admin").length;

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <svg className="animate-spin h-6 w-6 mr-3 text-indigo-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path  className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Loading users…
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
        <p className="font-semibold">Failed to load users</p>
        <p className="text-sm mt-1 opacity-75">{error}</p>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <span className="text-sm text-slate-400">
          Endpoint: <code className="text-indigo-400">GET /api/users</code>
        </span>
      </div>

      {/* ── Summary bar ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Users",   value: total,       color: "text-white"        },
          { label: "Active",        value: activeCount, color: "text-emerald-400"  },
          { label: "Admins",        value: adminCount,  color: "text-purple-400"   },
        ].map(({ label, value, color }) => (
          <div key={label}
               className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-slate-400 text-left">
            <tr>
              {["ID", "Name", "Email", "Role", "Status", "Joined"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id}
                  className="hover:bg-white/5 transition-colors">
                {/* ID */}
                <td className="px-4 py-3 text-slate-500 font-mono">#{user.id}</td>

                {/* Name */}
                <td className="px-4 py-3 font-medium text-white">{user.name}</td>

                {/* Email */}
                <td className="px-4 py-3 text-slate-300">{user.email}</td>

                {/* Role badge */}
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_BADGE[user.role] ?? ROLE_BADGE.user}`}>
                    {user.role}
                  </span>
                </td>

                {/* Active status */}
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1.5 text-xs font-medium
                    ${user.is_active ? "text-emerald-400" : "text-slate-500"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${user.is_active ? "bg-emerald-400" : "bg-slate-600"}`}/>
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Created at */}
                <td className="px-4 py-3 text-slate-400">{fmtDate(user.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Footer note (good for professor demos) ── */}
      <p className="text-xs text-slate-500 text-right">
        ⚠ <code>password_hash</code> is excluded from all API responses
      </p>
    </div>
  );
}
