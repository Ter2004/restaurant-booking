"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Users, ChevronRight, Star, CalendarDays, CheckCircle2, XCircle, PlusCircle } from "lucide-react";
import { api } from "@/lib/api";
import type { Booking } from "@/types";
import { mockBookings } from "@/lib/mockData";
import { formatDateShort, formatTime, cn } from "@/lib/utils";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonRow } from "@/components/ui/Skeleton";
import type { BookingStatus } from "@/types";

export default function CustomerDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.bookings.list()
      .then(setBookings)
      .catch(() => setBookings(mockBookings))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = bookings.filter((b) => b.status === "pending" || b.status === "confirmed");
  const past = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: Calendar, color: "text-blue-400" },
    { label: "Upcoming", value: upcoming.length, icon: CalendarDays, color: "text-gold" },
    { label: "Completed", value: bookings.filter((b) => b.status === "completed").length, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Cancelled", value: bookings.filter((b) => b.status === "cancelled").length, icon: XCircle, color: "text-red-400" },
  ];

  return (
    <div className="flex min-h-screen bg-base">
      <DashboardSidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="px-6 py-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl font-semibold text-[var(--text-primary)]">My Dashboard</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your restaurant bookings</p>
            </div>
            <Link href="/customer/bookings/new">
              <Button variant="primary" size="sm"><PlusCircle size={14} /> New Booking</Button>
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

          {/* Upcoming bookings */}
          <div className="mb-8">
            <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4">Upcoming Bookings</h2>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</div>
            ) : upcoming.length === 0 ? (
              <EmptyState
                title="No upcoming bookings"
                description="Find a restaurant and make your first reservation"
                action={{ label: "Browse Restaurants", href: "/" }}
              />
            ) : (
              <div className="space-y-3">
                {upcoming.map((b) => <BookingCard key={b.id} booking={b} />)}
              </div>
            )}
          </div>

          {/* Past bookings */}
          {past.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4">Past Bookings</h2>
              <div className="space-y-3">
                {past.slice(0, 5).map((b) => <BookingCard key={b.id} booking={b} />)}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function BookingCard({ booking: b }: { booking: Booking }) {
  const { day, month } = formatDateShort(b.booking_date);

  return (
    <div className="bg-elevated border border-[var(--border-subtle)] rounded-lg p-4 flex items-center gap-4 card-hover">
      {/* Date block */}
      <div className="w-14 h-14 rounded-lg bg-gold/10 border border-gold/20 flex flex-col items-center justify-center flex-shrink-0">
        <span className="text-xl font-display font-bold text-gold leading-none">{day}</span>
        <span className="text-[10px] font-medium text-gold/70 mt-0.5">{month}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--text-primary)] truncate">{b.restaurant?.name ?? "Restaurant"}</p>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[var(--text-secondary)]">
          <span className="flex items-center gap-1"><Clock size={11} />{formatTime(b.start_time)}</span>
          <span className="flex items-center gap-1"><Users size={11} />{b.party_size} guests</span>
          {b.table && <span>Table #{b.table.table_number}</span>}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Badge variant={b.status as BookingStatus}>{b.status}</Badge>
        <Link href={`/customer/bookings/${b.id}`}>
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-gold transition-colors">
            {b.status === "completed" ? (
              <><Star size={11} /> Review</>
            ) : b.status !== "cancelled" ? (
              <>Details <ChevronRight size={11} /></>
            ) : (
              <>View <ChevronRight size={11} /></>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
