"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Star, Check, Clock, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import type { Booking } from "@/types";
import { mockBookings } from "@/lib/mockData";
import { formatDate, formatTime, cn } from "@/lib/utils";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { BookingStatus } from "@/types";

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [review, setReview] = useState({ rating: 5, title: "", body: "" });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    api.bookings.get(id)
      .then(setBooking)
      .catch(() => setBooking(mockBookings.find((b) => b.id === id) ?? mockBookings[0]))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCancel() {
    if (!booking) return;
    setCancelling(true);
    try {
      await api.bookings.cancel(booking.id);
      setBooking((b) => b ? { ...b, status: "cancelled" } : b);
      success("Booking cancelled");
    } catch {
      showError("Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  }

  async function handleReview() {
    if (!booking) return;
    setReviewLoading(true);
    try {
      await api.reviews.create({
        booking_id: booking.id,
        restaurant_id: booking.restaurant_id,
        rating: review.rating,
        title: review.title || undefined,
        body: review.body || undefined,
      });
      success("Review submitted! Thank you.");
      setShowReview(false);
    } catch {
      showError("Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  }

  const timeline = [
    { label: "Booking Created", done: true },
    { label: "Awaiting Confirmation", done: booking?.status !== "pending" },
    { label: "Confirmed", done: booking?.status === "confirmed" || booking?.status === "completed" },
    { label: "Completed", done: booking?.status === "completed" },
  ];

  if (loading || !booking) {
    return (
      <div className="flex min-h-screen bg-base">
        <DashboardSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-base">
      <DashboardSidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="px-6 py-8 max-w-2xl page-enter">
          {/* Back */}
          <Link href="/customer/dashboard" className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6">
            <ChevronLeft size={14} /> Back to Dashboard
          </Link>

          {/* Status */}
          <div className="flex items-center gap-3 mb-6">
            <h1 className="font-display text-2xl font-semibold text-[var(--text-primary)]">Booking Details</h1>
            <Badge variant={booking.status as BookingStatus} className="text-sm px-3 py-1">
              {booking.status}
            </Badge>
          </div>

          {/* Info card */}
          <div className="bg-elevated border border-[var(--border-subtle)] rounded-xl divide-y divide-[var(--border-subtle)] mb-6">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/restaurants/${booking.restaurant_id}`}
                    className="font-display text-xl font-semibold text-[var(--text-primary)] hover:text-gold transition-colors flex items-center gap-1.5"
                  >
                    {booking.restaurant?.name ?? "Restaurant"}
                    <ExternalLink size={14} />
                  </Link>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{booking.restaurant?.address}</p>
                </div>
              </div>
            </div>

            <div className="p-5 grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "Date", value: formatDate(booking.booking_date) },
                { label: "Time", value: `${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}` },
                { label: "Party Size", value: `${booking.party_size} guests` },
                { label: "Table", value: booking.table ? `#${booking.table.table_number} (Zone ${booking.table.zone})` : "Assigned" },
              ].map((row) => (
                <div key={row.label}>
                  <p className="text-xs text-[var(--text-muted)] mb-0.5">{row.label}</p>
                  <p className="text-[var(--text-primary)] font-medium">{row.value}</p>
                </div>
              ))}
            </div>

            {booking.special_requests && (
              <div className="p-5">
                <p className="text-xs text-[var(--text-muted)] mb-1">Special Requests</p>
                <p className="text-sm text-[var(--text-secondary)]">{booking.special_requests}</p>
              </div>
            )}

            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-0.5">Booking ID</p>
                <p className="font-mono text-xs text-[var(--text-muted)]">{booking.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[var(--text-muted)] mb-0.5">Created</p>
                <p className="text-xs text-[var(--text-secondary)]">{formatDate(booking.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-elevated border border-[var(--border-subtle)] rounded-xl p-5 mb-6">
            <h2 className="font-display text-base font-semibold text-[var(--text-primary)] mb-4">Timeline</h2>
            <div className="space-y-4">
              {timeline.map((item, i) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                    item.done ? "bg-emerald-400/10 border border-emerald-400/30" : "bg-elevated border border-[var(--border-default)]"
                  )}>
                    {item.done ? <Check size={11} className="text-emerald-400" /> : (
                      <div className="w-2 h-2 rounded-full bg-[var(--border-default)]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-sm font-medium", item.done ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]")}>
                      {item.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {(booking.status === "pending" || booking.status === "confirmed") && (
              <Button variant="danger" loading={cancelling} onClick={handleCancel}>
                Cancel Booking
              </Button>
            )}
            {booking.status === "completed" && (
              <Button variant="primary" onClick={() => setShowReview((s) => !s)}>
                <Star size={14} /> Leave a Review
              </Button>
            )}
          </div>

          {/* Inline review form */}
          {showReview && (
            <div className="mt-6 bg-elevated border border-[var(--border-default)] rounded-xl p-5 slide-up">
              <h3 className="font-display text-base font-semibold text-[var(--text-primary)] mb-4">Write a Review</h3>

              {/* Star rating */}
              <div className="mb-4">
                <p className="text-sm text-[var(--text-secondary)] mb-2">Rating</p>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setReview((r) => ({ ...r, rating: i + 1 }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={24}
                        className={cn(
                          "transition-colors",
                          i < review.rating ? "text-gold fill-gold" : "text-[var(--text-muted)]"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Review title (optional)"
                  value={review.title}
                  onChange={(e) => setReview((r) => ({ ...r, title: e.target.value }))}
                  className="w-full bg-overlay border border-[var(--border-default)] rounded-md px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                />
                <textarea
                  rows={4}
                  placeholder="Share your dining experience..."
                  value={review.body}
                  onChange={(e) => setReview((r) => ({ ...r, body: e.target.value }))}
                  className="w-full bg-overlay border border-[var(--border-default)] rounded-md px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none"
                />
                <div className="flex gap-3">
                  <Button variant="primary" loading={reviewLoading} onClick={handleReview}>Submit Review</Button>
                  <Button variant="ghost" onClick={() => setShowReview(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
