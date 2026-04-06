"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { api, Restaurant, Review } from "@/lib/api";

const STARS = [1, 2, 3, 4, 5];

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
  }, []);

  useEffect(() => {
    Promise.all([api.restaurants.get(id), api.reviews.list(id)])
      .then(([r, rv]) => {
        setRestaurant(r);
        setReviews(rv);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-16 text-gray-400">Loading…</div>;
  if (!restaurant) return <div className="max-w-4xl mx-auto px-4 py-16 text-gray-400">Restaurant not found.</div>;

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Hero */}
      {restaurant.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-64 object-cover rounded-2xl mb-6" />
      ) : (
        <div className="w-full h-64 bg-brand-100 flex items-center justify-center text-brand-600 text-7xl rounded-2xl mb-6">
          🍽️
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{restaurant.name}</h1>
          <p className="text-gray-500 mt-1">{restaurant.cuisine_type} · {restaurant.city}</p>
          {avgRating && (
            <p className="text-yellow-500 font-medium mt-1">★ {avgRating} ({reviews.length} reviews)</p>
          )}
        </div>
        {isLoggedIn ? (
          <Link
            href={`/customer/bookings/new?restaurant_id=${restaurant.id}`}
            className="bg-brand-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-700 transition whitespace-nowrap"
          >
            Book a Table
          </Link>
        ) : (
          <button
            onClick={() => router.push(`/auth/login?redirect=/restaurants/${restaurant.id}`)}
            className="bg-brand-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-700 transition whitespace-nowrap"
          >
            Book a Table
          </button>
        )}
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {restaurant.description && (
          <div className="sm:col-span-2">
            <p className="text-gray-700">{restaurant.description}</p>
          </div>
        )}
        <div>
          <p className="text-gray-400 font-medium uppercase text-xs mb-1">Address</p>
          <p>{restaurant.address}, {restaurant.city}</p>
        </div>
        <div>
          <p className="text-gray-400 font-medium uppercase text-xs mb-1">Hours</p>
          <p>{restaurant.opening_time} – {restaurant.closing_time}</p>
        </div>
        <div>
          <p className="text-gray-400 font-medium uppercase text-xs mb-1">Capacity</p>
          <p>{restaurant.capacity} seats</p>
        </div>
        <div>
          <p className="text-gray-400 font-medium uppercase text-xs mb-1">Open Days</p>
          <p className="capitalize">{restaurant.open_days.join(", ")}</p>
        </div>
        {restaurant.phone && (
          <div>
            <p className="text-gray-400 font-medium uppercase text-xs mb-1">Phone</p>
            <p>{restaurant.phone}</p>
          </div>
        )}
        {restaurant.email && (
          <div>
            <p className="text-gray-400 font-medium uppercase text-xs mb-1">Email</p>
            <p>{restaurant.email}</p>
          </div>
        )}
      </div>

      {/* Reviews */}
      <h2 className="text-xl font-bold mb-4">Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-gray-400">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-500 font-bold">
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </span>
                <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              {r.title && <p className="font-semibold text-sm mb-1">{r.title}</p>}
              {r.body && <p className="text-sm text-gray-600">{r.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
