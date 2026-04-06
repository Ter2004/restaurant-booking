"use client";

import { useEffect, useState } from "react";
import { Check, X, Eye, Users, Clock, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import type { Booking } from "@/types";
import { mockBookings } from "@/lib/mockData";
import { formatDate, formatTime, cn } from "@/lib/utils";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import type { BookingStatus } from "@/types";

type Tab = "all" | "pending" | "confirmed" | "completed" | "cancelled";
const TABS: Tab[] = ["all", "pending", "confirmed", "completed", "cancelled"];
const PAGE_SIZE = 10;

export default function OwnerBookingsPage() {
  const { success, error: showError } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.bookings.listOwner()
      .then(setBookings)
      .catch(() => setBookings(mockBookings))
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(id: string, status: "confirmed" | "cancelled" | "completed") {
    try {
      await api.bookings.updateOwner(id, { status });
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      success(`Booking ${status}`);
    } catch {
      showError("Failed to update booking");
    }
  }

  const filtered = bookings.filter((b) => {
    const matchTab = activeTab === "all" || b.status === activeTab;
    const matchSearch = !search ||
      b.restaurant?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.customer?.full_name?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex min-h-screen bg-base">
      <DashboardSidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="px-6 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl font-semibold text-[var(--text-primary)]">Incoming Bookings</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{bookings.length} total bookings</p>
          </div>

          {/* Tabs + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex gap-1 bg-elevated border border-[var(--border-subtle)] rounded-lg p-1">
              {TABS.map((tab) => {
                const count = tab === "all" ? bookings.length : bookings.filter((b) => b.status === tab).length;
                return (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setPage(1); }}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all flex items-center gap-1.5",
                      activeTab === tab
                        ? "bg-gold text-base shadow-glow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    )}
                  >
                    {tab}
                    {count > 0 && (
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full",
                        activeTab === tab ? "bg-base/30" : "bg-overlay"
                      )}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 pr-4 py-2 bg-overlay border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-52"
              />
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-elevated border border-[var(--border-subtle)] rounded-lg overflow-hidden">
            <div className="grid grid-cols-7 gap-3 px-4 py-3 bg-overlay text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
              <span className="col-span-2">Customer</span>
              <span className="col-span-2">Restaurant</span>
              <span>Date & Time</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-[var(--text-muted)] text-sm">Loading...</div>
            ) : paginated.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-muted)] text-sm">No bookings found</div>
            ) : (
              paginated.map((b) => (
                <div key={b.id} className="grid grid-cols-7 gap-3 px-4 py-3.5 border-b border-[var(--border-subtle)] last:border-0 items-center hover:bg-overlay/50 transition-colors">
                  <div className="col-span-2">
                    <p className="text-sm text-[var(--text-primary)] font-medium truncate">{b.customer?.full_name ?? "Customer"}</p>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5"><Users size={9} />{b.party_size} guests</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-[var(--text-primary)] truncate">{b.restaurant?.name ?? "Restaurant"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">{formatDate(b.booking_date)}</p>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5"><Clock size={9} />{formatTime(b.start_time)}</p>
                  </div>
                  <div>
                    <Badge variant={b.status as BookingStatus}>{b.status}</Badge>
                  </div>
                  <div className="flex gap-1.5">
                    {b.status === "pending" && (
                      <>
                        <button onClick={() => handleAction(b.id, "confirmed")}
                          className="w-7 h-7 rounded bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-400/20 transition-colors" title="Confirm">
                          <Check size={12} />
                        </button>
                        <button onClick={() => handleAction(b.id, "cancelled")}
                          className="w-7 h-7 rounded bg-red-400/10 border border-red-400/20 text-red-400 flex items-center justify-center hover:bg-red-400/20 transition-colors" title="Cancel">
                          <X size={12} />
                        </button>
                      </>
                    )}
                    {b.status === "confirmed" && (
                      <>
                        <button onClick={() => handleAction(b.id, "completed")}
                          className="px-2 h-7 rounded bg-blue-400/10 border border-blue-400/20 text-blue-400 text-xs flex items-center hover:bg-blue-400/20 transition-colors">
                          Done
                        </button>
                        <button onClick={() => handleAction(b.id, "cancelled")}
                          className="w-7 h-7 rounded bg-red-400/10 border border-red-400/20 text-red-400 flex items-center justify-center hover:bg-red-400/20 transition-colors">
                          <X size={12} />
                        </button>
                      </>
                    )}
                    {(b.status === "completed" || b.status === "cancelled") && (
                      <span className="text-xs text-[var(--text-muted)]">—</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {paginated.map((b) => (
              <div key={b.id} className="bg-elevated border border-[var(--border-subtle)] rounded-lg p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-medium text-[var(--text-primary)] text-sm">{b.customer?.full_name ?? "Customer"}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{b.restaurant?.name}</p>
                  </div>
                  <Badge variant={b.status as BookingStatus}>{b.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)] mb-3">
                  <span>{formatDate(b.booking_date)}</span>
                  <span>{formatTime(b.start_time)}</span>
                  <span>{b.party_size} guests</span>
                </div>
                <div className="flex gap-2">
                  {b.status === "pending" && (
                    <>
                      <Button variant="secondary" size="sm" onClick={() => handleAction(b.id, "confirmed")}><Check size={12} /> Confirm</Button>
                      <Button variant="danger" size="sm" onClick={() => handleAction(b.id, "cancelled")}><X size={12} /> Cancel</Button>
                    </>
                  )}
                  {b.status === "confirmed" && (
                    <>
                      <Button variant="secondary" size="sm" onClick={() => handleAction(b.id, "completed")}>Complete</Button>
                      <Button variant="danger" size="sm" onClick={() => handleAction(b.id, "cancelled")}><X size={12} /></Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border-subtle)]">
              <p className="text-xs text-[var(--text-muted)]">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                  className="w-8 h-8 rounded-md border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-40 transition-colors">
                  <ChevronLeft size={14} />
                </button>
                <span className="text-sm text-[var(--text-secondary)]">Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                  className="w-8 h-8 rounded-md border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-40 transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
