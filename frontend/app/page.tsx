"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Star, Users, ArrowRight, Search, ChefHat, CalendarCheck, Smile } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import type { Restaurant } from "@/types";
import { cuisineEmoji, cn } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";

const CUISINES = ["All", "Thai", "Japanese", "French", "Indian", "German", "Vegan"];

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCuisine, setActiveCuisine] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
    api.restaurants.list()
      .then(setRestaurants)
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = restaurants.filter((r) => {
    const matchCuisine = activeCuisine === "All" || r.cuisine_type === activeCuisine;
    const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCuisine && matchSearch;
  });

  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-20">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]" />
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gold/3 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto page-enter">
            {/* Category pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {[
                { label: "🍣 Japanese", color: "bg-red-500/10 text-red-300 border-red-500/20" },
                { label: "🍕 Italian", color: "bg-orange-500/10 text-orange-300 border-orange-500/20" },
                { label: "🥩 Steakhouse", color: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
                { label: "🌿 Vegan", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
              ].map((pill) => (
                <span key={pill.label} className={cn("text-xs px-3 py-1.5 rounded-full border font-medium", pill.color)}>
                  {pill.label}
                </span>
              ))}
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--text-primary)] leading-tight tracking-tight mb-6">
              Reserve Your{" "}
              <span className="text-gradient-gold">Perfect Table</span>
            </h1>
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
              Discover curated restaurants and book instantly. From hidden gems to Michelin-starred experiences.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" size="lg" onClick={() => document.getElementById("restaurants")?.scrollIntoView({ behavior: "smooth" })}>
                Browse Restaurants <ArrowRight size={16} />
              </Button>
              <Link href="/auth/register">
                <Button variant="ghost" size="lg">List Your Restaurant</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Featured Restaurants ──────────────────────────────── */}
        <section id="restaurants" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-3xl font-semibold text-[var(--text-primary)]">Featured Restaurants</h2>
              <p className="text-[var(--text-secondary)] mt-1 text-sm">Hand-picked dining experiences</p>
            </div>
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-overlay border border-[var(--border-default)] rounded-full text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-56 focus:w-72 transition-all duration-300"
              />
            </div>
          </div>

          {/* Cuisine filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CUISINES.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCuisine(c)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                  activeCuisine === c
                    ? "bg-gold text-base border-gold shadow-glow-sm"
                    : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-secondary)]">
              <p className="text-4xl mb-4">🍽️</p>
              <p className="font-medium">No restaurants found</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Try a different filter or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(0, 6).map((r) => (
                <RestaurantCard key={r.id} restaurant={r} isLoggedIn={isLoggedIn} />
              ))}
            </div>
          )}
        </section>

        {/* ── How It Works ─────────────────────────────────────── */}
        <section id="how-it-works" className="bg-surface border-y border-[var(--border-subtle)] py-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="font-display text-3xl font-semibold text-[var(--text-primary)] mb-3">How It Works</h2>
            <p className="text-[var(--text-secondary)] mb-12">Book a table in three simple steps</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { icon: Search, step: "1", title: "Find", desc: "Browse our curated selection of top restaurants filtered by cuisine, location, and availability." },
                { icon: CalendarCheck, step: "2", title: "Book", desc: "Select your date, time, and party size. Confirm instantly with no waiting." },
                { icon: Smile, step: "3", title: "Enjoy", desc: "Show up and enjoy. We'll handle the reminders and special requests." },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center group">
                  <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                    <item.icon size={22} className="text-gold" />
                  </div>
                  <div className="text-xs font-mono text-[var(--text-muted)] mb-2">Step {item.step}</div>
                  <h3 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────────────── */}
        <section className="py-20 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-gold/5 rounded-full blur-[80px]" />
          </div>
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-semibold text-[var(--text-primary)] mb-4">
              Ready to find your table?
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
              Join thousands of diners who have discovered their perfect restaurant experience.
            </p>
            <Link href="/auth/register">
              <Button variant="primary" size="lg">Get Started Free <ArrowRight size={16} /></Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function RestaurantCard({ restaurant: r, isLoggedIn }: { restaurant: Restaurant; isLoggedIn: boolean }) {
  const emoji = cuisineEmoji(r.cuisine_type);

  return (
    <Link href={`/restaurants/${r.id}`} className="group">
      <div className="bg-elevated border border-[var(--border-subtle)] rounded-lg overflow-hidden card-hover h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-overlay to-base flex items-center justify-center overflow-hidden">
          {r.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl opacity-60 group-hover:scale-110 transition-transform duration-300">{emoji}</span>
          )}
          {/* Cuisine badge */}
          <div className="absolute top-3 left-3">
            <span className="text-xs px-2 py-1 rounded-full bg-base/80 border border-[var(--border-default)] text-[var(--text-secondary)] backdrop-blur-sm">
              {r.cuisine_type}
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-display text-lg font-semibold text-[var(--text-primary)] leading-tight">{r.name}</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">{r.city}</p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={11} className={i < Math.floor(r.rating ?? 4.5) ? "text-gold fill-gold" : "text-[var(--text-muted)]"} />
              ))}
            </div>
            <span className="text-xs text-[var(--text-secondary)]">{r.rating ?? "4.5"}</span>
            <span className="text-xs text-[var(--text-muted)]">({r.review_count ?? 0} reviews)</span>
          </div>

          {/* Capacity */}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-[var(--text-muted)]">
            <Users size={11} />
            <span>max {r.capacity} seats</span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] mt-3 line-clamp-2 flex-1">{r.description}</p>

          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
            <span className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] group-hover:text-gold transition-colors py-1.5">
              View & Book <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
