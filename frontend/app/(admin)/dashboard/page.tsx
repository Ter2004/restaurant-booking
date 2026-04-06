"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { api, Restaurant, Booking } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      if (data.user.user_metadata?.role !== "admin") { router.push("/"); return; }
    });
    api.restaurants.list().then((data) => {
      setRestaurants(data);
      setLoading(false);
    });
  }, [router]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
      <p className="text-gray-500 mb-8">Platform overview and management</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Restaurants" value={restaurants.length} color="brand" />
        <StatCard title="Active Restaurants" value={restaurants.filter((r) => r.is_active).length} color="green" />
        <StatCard title="Inactive Restaurants" value={restaurants.filter((r) => !r.is_active).length} color="red" />
      </div>

      <h2 className="text-lg font-semibold mb-4">All Restaurants</h2>
      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Cuisine</th>
                <th className="text-left px-4 py-3">City</th>
                <th className="text-left px-4 py-3">Capacity</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {restaurants.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-gray-500">{r.cuisine_type}</td>
                  <td className="px-4 py-3 text-gray-500">{r.city}</td>
                  <td className="px-4 py-3">{r.capacity}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {r.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    green: "bg-green-50 text-green-700",
    red:   "bg-red-50 text-red-700",
  };
  return (
    <div className={`rounded-xl p-5 ${colors[color] ?? colors.brand}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
