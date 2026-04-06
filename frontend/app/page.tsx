"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { api, Restaurant } from "@/lib/api";

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setIsLoggedIn(true);
        api.restaurants.list().then(setRestaurants).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="bg-brand-600 py-20 text-white text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Book Your Perfect Table
        </h1>
        <p className="text-lg text-brand-100 mb-8">
          Discover top restaurants and reserve your spot in seconds.
        </p>
        {isLoggedIn ? (
          <a
            href="#restaurants"
            className="bg-white text-brand-600 font-semibold px-8 py-3 rounded-full hover:bg-brand-50 transition"
          >
            Browse Restaurants
          </a>
        ) : (
          <Link
            href="/auth/login"
            className="bg-white text-brand-600 font-semibold px-8 py-3 rounded-full hover:bg-brand-50 transition"
          >
            Get Started
          </Link>
        )}
      </section>

      {/* Restaurant Grid */}
      <section id="restaurants" className="max-w-7xl mx-auto px-4 py-12">
        {!isLoggedIn ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-base">Please log in to browse restaurants</p>
          </div>
        ) : loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6">Featured Restaurants</h2>
            {restaurants.length === 0 ? (
              <p className="text-gray-500">No restaurants available yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-md transition overflow-hidden">
      {restaurant.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={restaurant.image_url}
          alt={restaurant.name}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-brand-100 flex items-center justify-center text-brand-600 text-5xl">
          🍽️
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg">{restaurant.name}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {restaurant.cuisine_type} · {restaurant.city}
        </p>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {restaurant.description}
        </p>
        <Link
          href={`/restaurants/${restaurant.id}`}
          className="mt-4 block text-center bg-brand-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-brand-700 transition"
        >
          View & Book
        </Link>
      </div>
    </div>
  );
}
