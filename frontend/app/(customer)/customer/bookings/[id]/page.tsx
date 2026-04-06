"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { api, Booking, Review } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSaving, setReviewSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      setUserId(data.user.id);
    });

    api.bookings.get(id).then((b) => {
      setBooking(b);
      // Try to load existing review
      api.reviews.list(b.restaurant_id).then((reviews) => {
        const mine = reviews.find((r) => r.booking_id === id);
        if (mine) setReview(mine);
      }).catch(() => {});
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!booking) return;
    setReviewError(null);
    setReviewSaving(true);
    try {
      const created = await api.reviews.create({
        booking_id: id,
        customer_id: userId,
        restaurant_id: booking.restaurant_id,
        rating,
        title: title || undefined,
        body: body || undefined,
      });
      setReview(created);
      setShowReviewForm(false);
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setReviewSaving(false);
    }
  }

  async function handleDeleteReview() {
    if (!review || !confirm("Delete your review?")) return;
    await api.reviews.delete(review.id);
    setReview(null);
  }

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-16 text-gray-400">Loading…</div>;
  if (!booking) return <div className="max-w-2xl mx-auto px-4 py-16 text-gray-400">Booking not found.</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:underline mb-6 block">← Back</button>

      <h1 className="text-2xl font-bold mb-6">Booking Details</h1>

      {/* Booking info */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6 space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Status</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[booking.status]}`}>
            {booking.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Date</span>
          <span className="font-medium">{booking.booking_date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Time</span>
          <span className="font-medium">{booking.start_time} – {booking.end_time}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Party size</span>
          <span className="font-medium">{booking.party_size} guests</span>
        </div>
        {booking.special_requests && (
          <div className="flex justify-between">
            <span className="text-gray-500">Special requests</span>
            <span className="font-medium text-right max-w-xs">{booking.special_requests}</span>
          </div>
        )}
      </div>

      {/* Review section — only for completed bookings */}
      {booking.status === "completed" && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Review</h2>

          {review ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-500 font-bold text-lg">
                  {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                </span>
              </div>
              {review.title && <p className="font-semibold text-sm mb-1">{review.title}</p>}
              {review.body && <p className="text-sm text-gray-600 mb-4">{review.body}</p>}
              <button
                onClick={handleDeleteReview}
                className="text-sm text-red-500 hover:underline"
              >
                Delete review
              </button>
            </div>
          ) : showReviewForm ? (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {reviewError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{reviewError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className={`text-2xl ${s <= rating ? "text-yellow-400" : "text-gray-300"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. Great experience!"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review (optional)</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                  placeholder="Tell others about your experience…"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSaving}
                  className="flex-1 bg-brand-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50"
                >
                  {reviewSaving ? "Submitting…" : "Submit Review"}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm mb-4">You haven&apos;t reviewed this booking yet.</p>
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-brand-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
              >
                Write a Review
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
