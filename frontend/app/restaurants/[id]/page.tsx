"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Star, Users, Clock, MapPin, Phone, Globe, ChevronLeft, Minus, Plus, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import type { Restaurant, Review, Table } from "@/types";
import { mockRestaurants, mockReviews, mockTables } from "@/lib/mockData";
import { cuisineEmoji, formatDate, formatTime, generateTimeSlots, cn } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Skeleton from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { success, error: showError } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [booking, setBooking] = useState({ date: "", time: "", partySize: 2 });
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));

    Promise.all([
      api.restaurants.get(id).catch(() => mockRestaurants.find((r) => r.id === id) ?? mockRestaurants[0]),
      api.reviews.list(id).catch(() => mockReviews.filter((r) => r.restaurant_id === id)),
      api.tables.list(id).catch(() => mockTables.filter((t) => t.restaurant_id === id)),
    ]).then(([r, rv, tb]) => {
      setRestaurant(r);
      setReviews(rv);
      setTables(tb);
    }).finally(() => setLoading(false));
  }, [id]);

  const timeSlots = restaurant ? generateTimeSlots(restaurant.opening_time, restaurant.closing_time) : [];
  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  useEffect(() => {
    const available = tables.filter((t) => t.is_available && t.seats >= booking.partySize);
    setSelectedTable(available[0] ?? null);
  }, [tables, booking.partySize]);

  async function handleBook() {
    if (!booking.date || !booking.time) return showError("Please select a date and time");
    if (!selectedTable) return showError("No available table for your party size");
    if (!isLoggedIn) return router.push("/auth/login");

    setBookingLoading(true);
    try {
      await api.bookings.create({
        restaurant_id: id,
        table_id: selectedTable.id,
        booking_date: booking.date,
        start_time: booking.time,
        end_time: `${parseInt(booking.time) + 2}:00`,
        party_size: booking.partySize,
      });
      success("Booking confirmed!");
      router.push("/customer/dashboard");
    } catch {
      showError("Failed to create booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-16">
          <Skeleton height="300px" className="rounded-none" />
          <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton height="24px" width="60%" />
              <Skeleton height="16px" width="100%" />
              <Skeleton height="16px" width="80%" />
            </div>
            <Skeleton height="400px" className="rounded-lg" />
          </div>
        </div>
      </>
    );
  }

  if (!restaurant) return null;

  const emoji = cuisineEmoji(restaurant.cuisine_type);

  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero banner */}
        <div className="relative h-72 bg-gradient-to-br from-overlay to-base flex items-center justify-center overflow-hidden">
          {restaurant.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={restaurant.image_url} alt={restaurant.name} className="absolute inset-0 w-full h-full object-cover opacity-40" />
          ) : (
            <span className="text-9xl opacity-20">{emoji}</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-base via-base/50 to-transparent" />

          {/* Back */}
          <Link href="/" className="absolute top-4 left-4 flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors bg-base/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[var(--border-subtle)]">
            <ChevronLeft size={14} /> Back
          </Link>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-6 max-w-7xl mx-auto">
            <div className="flex flex-wrap items-end gap-4 justify-between">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">{restaurant.name}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="default">{restaurant.cuisine_type}</Badge>
                  {avgRating && (
                    <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                      <Star size={13} className="text-gold fill-gold" />
                      <span className="font-medium text-[var(--text-primary)]">{avgRating}</span>
                      <span>({reviews.length} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              {restaurant.description && (
                <div>
                  <h2 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-3">About</h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed">{restaurant.description}</p>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <MapPin size={14} className="text-gold" />{restaurant.address}
                    </div>
                    {restaurant.phone && (
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <Phone size={14} className="text-gold" />{restaurant.phone}
                      </div>
                    )}
                    {restaurant.website && (
                      <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gold hover:text-gold-dim transition-colors">
                        <Globe size={14} />Website
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Opening Hours */}
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-3">Opening Hours</h2>
                <div className="bg-elevated border border-[var(--border-subtle)] rounded-lg overflow-hidden">
                  {DAYS.map((day, i) => {
                    const isOpen = restaurant.open_days.includes(day);
                    const isToday = day === today;
                    return (
                      <div
                        key={day}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 text-sm border-b border-[var(--border-subtle)] last:border-0",
                          isToday && "bg-gold/5 border-l-2 border-l-gold"
                        )}
                      >
                        <span className={cn("font-medium", isToday ? "text-gold" : "text-[var(--text-secondary)]")}>
                          {DAY_LABELS[i]}{isToday && " (Today)"}
                        </span>
                        {isOpen ? (
                          <span className="text-[var(--text-primary)]">
                            {formatTime(restaurant.opening_time)} – {formatTime(restaurant.closing_time)}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">Closed</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">Reviews</h2>
                  {avgRating && (
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-display font-bold text-[var(--text-primary)]">{avgRating}</span>
                      <div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} className={i < Math.floor(parseFloat(avgRating)) ? "text-gold fill-gold" : "text-[var(--text-muted)]"} />
                          ))}
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">{reviews.length} reviews</p>
                      </div>
                    </div>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                    No reviews yet. Be the first to review!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-elevated border border-[var(--border-subtle)] rounded-lg p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={review.customer?.full_name ?? "User"} size="sm" />
                            <div>
                              <p className="text-sm font-medium text-[var(--text-primary)]">{review.customer?.full_name ?? "Anonymous"}</p>
                              <p className="text-xs text-[var(--text-muted)]">{formatDate(review.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5 flex-shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={11} className={i < review.rating ? "text-gold fill-gold" : "text-[var(--text-muted)]"} />
                            ))}
                          </div>
                        </div>
                        {review.title && (
                          <p className="mt-3 text-sm font-medium text-[var(--text-primary)]">{review.title}</p>
                        )}
                        {review.body && (
                          <p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed">{review.body}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Booking widget */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-elevated border border-[var(--border-default)] rounded-xl p-6 shadow-soft">
                <h2 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-5">Reserve a Table</h2>

                <div className="space-y-4">
                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={booking.date}
                      onChange={(e) => setBooking((b) => ({ ...b, date: e.target.value }))}
                      className="w-full bg-overlay border border-[var(--border-default)] rounded-md px-4 py-2.5 text-sm text-[var(--text-primary)] transition-all"
                    />
                  </div>

                  {/* Time slots */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Time</label>
                    <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setBooking((b) => ({ ...b, time: slot }))}
                          className={cn(
                            "py-2 text-xs rounded-md border transition-all font-medium",
                            booking.time === slot
                              ? "bg-gold text-base border-gold shadow-glow-sm"
                              : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Party size */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Party Size</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setBooking((b) => ({ ...b, partySize: Math.max(1, b.partySize - 1) }))}
                        className="w-9 h-9 rounded-md border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] transition-all"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-lg font-semibold text-[var(--text-primary)] min-w-[2ch] text-center">
                        {booking.partySize}
                      </span>
                      <button
                        onClick={() => setBooking((b) => ({ ...b, partySize: Math.min(restaurant.capacity, b.partySize + 1) }))}
                        className="w-9 h-9 rounded-md border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] transition-all"
                      >
                        <Plus size={14} />
                      </button>
                      <span className="text-xs text-[var(--text-muted)]">guests</span>
                    </div>
                  </div>

                  {/* Table preview */}
                  {selectedTable && (
                    <div className="bg-overlay rounded-md p-3 border border-[var(--border-subtle)]">
                      <p className="text-xs text-[var(--text-muted)] mb-1">Auto-selected table</p>
                      <p className="text-sm text-[var(--text-primary)] font-medium">
                        Table #{selectedTable.table_number} · {selectedTable.seats} seats · Zone {selectedTable.zone}
                      </p>
                    </div>
                  )}

                  {isLoggedIn ? (
                    <Button variant="primary" fullWidth size="lg" loading={bookingLoading} onClick={handleBook}>
                      Book Now <ArrowRight size={15} />
                    </Button>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-[var(--text-secondary)] mb-3">Sign in to complete your booking</p>
                      <Link href="/auth/login">
                        <Button variant="primary" fullWidth>Sign In to Book</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
