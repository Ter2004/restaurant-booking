"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { api, Booking } from "@/lib/api";
import { useRouter } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function CustomerDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      setUserName(data.user.user_metadata?.full_name ?? data.user.email ?? "");
    });

    api.bookings.list().then((data) => {
      setBookings(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  async function handleCancel(id: string) {
    if (!confirm("Cancel this booking?")) return;
    await api.bookings.cancel(id);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {userName}</p>
        </div>
        <Link
          href="/customer/bookings/new"
          className="bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
        >
          + New Booking
        </Link>
      </div>

      <h2 className="text-lg font-semibold mb-4">My Bookings</h2>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">📅</p>
          <p>No bookings yet. Start by booking a restaurant!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-xl shadow p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{b.booking_date} · {b.start_time} – {b.end_time}</p>
                <p className="text-sm text-gray-500">Party of {b.party_size}</p>
                {b.special_requests && (
                  <p className="text-xs text-gray-400 mt-1">Note: {b.special_requests}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[b.status]}`}>
                  {b.status}
                </span>
                {b.status === "pending" && (
                  <button
                    onClick={() => handleCancel(b.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
