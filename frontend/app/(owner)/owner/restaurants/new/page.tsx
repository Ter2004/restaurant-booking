"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function NewRestaurantPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    cuisine_type: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    capacity: 30,
    opening_time: "09:00",
    closing_time: "22:00",
    open_days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function toggleDay(day: string) {
    setForm((f) => ({
      ...f,
      open_days: f.open_days.includes(day)
        ? f.open_days.filter((d) => d !== day)
        : [...f.open_days, day],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.restaurants.create({ ...form, capacity: Number(form.capacity) });
      router.push("/owner/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create restaurant");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Add Restaurant</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
        {(["name", "cuisine_type", "address", "city", "phone", "email"] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              {field.replace("_", " ")}
            </label>
            <input name={field} value={(form as Record<string, unknown>)[field] as string}
              onChange={handleChange} required={["name","cuisine_type","address","city"].includes(field)}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange}
            rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input name="capacity" type="number" min={1} value={form.capacity}
              onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opens</label>
            <input name="opening_time" type="time" value={form.opening_time}
              onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Closes</label>
            <input name="closing_time" type="time" value={form.closing_time}
              onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Open Days</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <button key={day} type="button" onClick={() => toggleDay(day)}
                className={`text-xs px-3 py-1 rounded-full border transition ${form.open_days.includes(day) ? "bg-brand-600 text-white border-brand-600" : "text-gray-600 border-gray-300"}`}>
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-brand-600 text-white rounded-lg py-2 font-medium hover:bg-brand-700 transition disabled:opacity-50">
          {loading ? "Creating…" : "Create Restaurant"}
        </button>
      </form>
    </div>
  );
}
