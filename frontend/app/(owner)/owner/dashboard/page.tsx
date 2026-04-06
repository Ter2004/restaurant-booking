"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { api, Restaurant } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function OwnerDashboard() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      const role = data.user.user_metadata?.role;
      if (role !== "owner" && role !== "admin") { router.push("/"); return; }
    });
    // For owner: list their own restaurants via the API
    api.restaurants.list().then((data) => {
      setRestaurants(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  async function handleDelete(id: string) {
    if (!confirm("Deactivate this restaurant?")) return;
    await api.restaurants.delete(id);
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Restaurants</h1>
        <Link
          href="/owner/restaurants/new"
          className="bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
        >
          + Add Restaurant
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">🏪</p>
          <p>No restaurants yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {restaurants.map((r) => (
            <div key={r.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{r.name}</h3>
                  <p className="text-sm text-gray-500">{r.cuisine_type} · {r.city}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {r.opening_time} – {r.closing_time} · {r.capacity} seats
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {r.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex gap-3 mt-4">
                <Link
                  href={`/owner/restaurants/${r.id}/edit`}
                  className="text-sm text-brand-600 hover:underline"
                >
                  Edit
                </Link>
                <Link
                  href={`/owner/restaurants/${r.id}/tables`}
                  className="text-sm text-brand-600 hover:underline"
                >
                  Tables
                </Link>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
