"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, Clock, AlertCircle, PlusCircle, Check, X, Users, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import type { Booking, Restaurant } from "@/types";
import { mockBookings, mockRestaurants } from "@/lib/mockData";
import { formatDate, formatTime, cn } from "@/lib/utils";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import type { BookingStatus } from "@/types";

export default function OwnerDashboardPage() {
  const { success, error: showError } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.restaurants.list().catch(() => mockRestaurants.slice(0, 3)),
      api.bookings.listOwner().catch(() => mockBookings),
    ]).then(([r, b]) => {
      setRestaurants(r);
      setBookings(b);
    }).finally(() => setLoading(false));
  }, []);

  async function handleStatus(id: string, status: "confirmed" | "cancelled") {
    try {
      await api.bookings.updateOwner(id, { status });
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      success(status === "confirmed" ? "Booking confirmed!" : "Booking cancelled");
    } catch {
      showError("Failed to update booking");
    }
  }

  const pending = bookings.filter((b) => b.status === "pending");
  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter((b) => b.booking_date === todayStr);

  const stats = [
    { label: "My Restaurants", value: restaurants.length, icon: Store, color: "text-purple-400" },
    { label: "Bookings Today", value: todayBookings.length, icon: Clock, color: "text-gold" },
    { label: "Pending", value: pending.length, icon: AlertCircle, color: "text-yellow-400" },
    { label: "Confirmed Today", value: todayBookings.filter((b) => b.status === "confirmed").length, icon: Check, color: "text-emerald-400" },
  ];

  return (
    <div className="flex min-h-screen bg-base">
      <DashboardSidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="px-6 py-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl font-semibold text-[var(--text-primary)]">Owner Dashboard</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your restaurants and bookings</p>
            </div>
            <Link href="/owner/restaurants/new">
              <Button variant="primary" size="sm"><PlusCircle size={14} /> Add Restaurant</Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-elevated border border-[var(--border-subtle)] rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[var(--text-muted)]">{stat.label}</span>
                    <Icon size={16} className={stat.color} />
                  </div>
                  <p className="text-3xl font-display font-bold text-[var(--text-primary)]">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Pending Bookings */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">Pending Confirmations</h2>
              {pending.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 text-xs flex items-center justify-center font-medium">
                  {pending.length}
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</div>
            ) : pending.length === 0 ? (
              <div className="bg-elevated border border-[var(--border-subtle)] rounded-lg p-8 text-center">
                <p className="text-2xl mb-2">🎉</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">No pending bookings</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map((b) => (
                  <div key={b.id} className="bg-elevated border border-yellow-400/10 rounded-lg p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text-primary)] text-sm">
                        {b.customer?.full_name ?? "Customer"} — {b.restaurant?.name ?? "Restaurant"}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-[var(--text-secondary)]">
                        <span>{formatDate(b.booking_date)}</span>
                        <span>{formatTime(b.start_time)}</span>
                        <span className="flex items-center gap-1"><Users size={10} />{b.party_size} guests</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleStatus(b.id, "confirmed")}
                        className="w-8 h-8 rounded-md bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-400/20 transition-colors"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => handleStatus(b.id, "cancelled")}
                        className="w-8 h-8 rounded-md bg-red-400/10 border border-red-400/20 text-red-400 flex items-center justify-center hover:bg-red-400/20 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Restaurants */}
          <div>
            <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4">My Restaurants</h2>
            {restaurants.length === 0 ? (
              <EmptyState
                icon="🏪"
                title="No restaurants yet"
                description="Add your first restaurant to start accepting bookings"
                action={{ label: "Add Restaurant", href: "/owner/restaurants/new" }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurants.map((r) => (
                  <div key={r.id} className="bg-elevated border border-[var(--border-subtle)] rounded-lg p-5 card-hover">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display text-base font-semibold text-[var(--text-primary)] leading-tight">{r.name}</h3>
                      <span className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", r.is_active ? "bg-emerald-400" : "bg-red-400")} />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mb-3">{r.cuisine_type} · {r.city}</p>
                    <div className="text-xs text-[var(--text-muted)] space-y-1 mb-4">
                      <p>Capacity: {r.capacity} seats</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/owner/restaurants/${r.id}/edit`} className="flex-1">
                        <Button variant="secondary" size="sm" fullWidth>Edit</Button>
                      </Link>
                      <Link href={`/owner/restaurants/${r.id}/tables`}>
                        <Button variant="ghost" size="sm">Tables</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
