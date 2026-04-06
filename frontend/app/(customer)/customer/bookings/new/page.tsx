"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, Restaurant, Table } from "@/lib/api";

function NewBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedRestaurantId = searchParams.get("restaurant_id") ?? "";

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [form, setForm] = useState({
    restaurant_id: preselectedRestaurantId,
    table_id: "",
    booking_date: "",
    start_time: "",
    end_time: "",
    party_size: 2,
    special_requests: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.restaurants.list().then(setRestaurants);
  }, []);

  useEffect(() => {
    if (form.restaurant_id) {
      api.tables.list(form.restaurant_id).then(setTables);
    }
  }, [form.restaurant_id]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.bookings.create({ ...form, party_size: Number(form.party_size) });
      router.push("/customer/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">New Booking</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant</label>
          <select name="restaurant_id" value={form.restaurant_id} onChange={handleChange} required
            className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="">Select a restaurant…</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>{r.name} — {r.city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Table</label>
          <select name="table_id" value={form.table_id} onChange={handleChange} required
            disabled={!form.restaurant_id}
            className="w-full border rounded-lg px-3 py-2 text-sm disabled:opacity-50">
            <option value="">Select a table…</option>
            {tables.filter((t) => t.is_available).map((t) => (
              <option key={t.id} value={t.id}>
                Table {t.table_number} · {t.seats} seats · {t.zone}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input name="booking_date" type="date" required value={form.booking_date}
              onChange={handleChange} min={new Date().toISOString().split("T")[0]}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Party Size</label>
            <input name="party_size" type="number" min={1} required value={form.party_size}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input name="start_time" type="time" required value={form.start_time}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input name="end_time" type="time" required value={form.end_time}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
          <textarea name="special_requests" value={form.special_requests} onChange={handleChange}
            rows={3} placeholder="Allergies, high chair, etc."
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-brand-600 text-white rounded-lg py-2 font-medium hover:bg-brand-700 transition disabled:opacity-50">
          {loading ? "Booking…" : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense>
      <NewBookingForm />
    </Suspense>
  );
}
