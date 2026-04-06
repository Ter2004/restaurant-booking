"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { api, Booking } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function OwnerBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      const role = data.user.user_metadata?.role;
      if (role !== "owner" && role !== "admin") { router.push("/"); return; }
    });
    api.bookings.listOwner().then((data) => {
      setBookings(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  async function handleStatus(id: string, newStatus: string) {
    await api.bookings.updateOwner(id, { status: newStatus as Booking["status"] });
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: newStatus as Booking["status"] } : b));
  }

  const filtered = filter ? bookings.filter((b) => b.status === filter) : bookings;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Incoming Bookings</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">📋</p>
          <p>No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div key={b.id} className="bg-white rounded-xl shadow p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold">{b.booking_date}</p>
                <p className="text-sm text-gray-500">
                  {b.start_time} – {b.end_time} · Party of {b.party_size}
                </p>
                {b.special_requests && (
                  <p className="text-xs text-gray-400 mt-1">Note: {b.special_requests}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[b.status]}`}>
                  {b.status}
                </span>
                {b.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleStatus(b.id, "confirmed")}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatus(b.id, "cancelled")}
                      className="text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {b.status === "confirmed" && (
                  <>
                    <button
                      onClick={() => handleStatus(b.id, "completed")}
                      className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => handleStatus(b.id, "cancelled")}
                      className="text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
