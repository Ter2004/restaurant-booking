"use client";

import { useEffect, useState } from "react";
import { Users, Store, Calendar, TrendingUp, AlertCircle, XCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { mockUsers, mockRestaurants, mockBookings } from "@/lib/mockData";
import type { User, Restaurant, Booking } from "@/types";
import { formatDate, relativeTime, cn } from "@/lib/utils";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import type { BookingStatus } from "@/types";

export default function AdminDashboardPage() {
  const [users] = useState<User[]>(mockUsers);
  const [restaurants] = useState<Restaurant[]>(mockRestaurants);
  const [bookings] = useState<Booking[]>(mockBookings);
  const [userSearch, setUserSearch] = useState("");
  const [restaurantSearch, setRestaurantSearch] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter((b) => b.booking_date === today);
  const cancelRate = bookings.length > 0
    ? ((bookings.filter((b) => b.status === "cancelled").length / bookings.length) * 100).toFixed(0)
    : "0";

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "text-blue-400" },
    { label: "Total Restaurants", value: restaurants.length, icon: Store, color: "text-purple-400" },
    { label: "Bookings Today", value: todayBookings.length, icon: Calendar, color: "text-gold" },
    { label: "Total Bookings", value: bookings.length, icon: TrendingUp, color: "text-emerald-400" },
    { label: "Pending", value: bookings.filter((b) => b.status === "pending").length, icon: AlertCircle, color: "text-yellow-400" },
    { label: "Cancel Rate", value: `${cancelRate}%`, icon: XCircle, color: "text-red-400" },
  ];

  const filteredUsers = users.filter(
    (u) => u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredRestaurants = restaurants.filter(
    (r) => r.name.toLowerCase().includes(restaurantSearch.toLowerCase())
  );

  // Recent activity from bookings (most recent first)
  const recentActivity = [...bookings]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  const activityColors: Record<BookingStatus, string> = {
    confirmed: "text-emerald-400 bg-emerald-400/10",
    pending: "text-yellow-400 bg-yellow-400/10",
    completed: "text-blue-400 bg-blue-400/10",
    cancelled: "text-red-400 bg-red-400/10",
  };

  return (
    <div className="flex min-h-screen bg-base">
      <DashboardSidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="px-6 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl font-semibold text-[var(--text-primary)]">Admin Dashboard</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Platform overview and management</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-elevated border border-[var(--border-subtle)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[var(--text-muted)] leading-tight">{stat.label}</span>
                    <Icon size={14} className={stat.color} />
                  </div>
                  <p className="text-2xl font-display font-bold text-[var(--text-primary)]">{stat.value}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            {/* Recent activity */}
            <div className="xl:col-span-1">
              <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4">Recent Activity</h2>
              <div className="bg-elevated border border-[var(--border-subtle)] rounded-lg overflow-hidden">
                {recentActivity.map((b, i) => (
                  <div key={b.id} className="flex items-start gap-3 px-4 py-3.5 border-b border-[var(--border-subtle)] last:border-0">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5",
                      activityColors[b.status as BookingStatus]
                    )}>
                      {b.status === "confirmed" ? "C" : b.status === "cancelled" ? "X" : b.status === "completed" ? "D" : "P"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--text-primary)] leading-tight">
                        <span className="font-medium">{b.customer?.full_name ?? "Customer"}</span>{" "}
                        {b.status === "pending" ? "requested" : b.status} a booking at{" "}
                        <span className="font-medium">{b.restaurant?.name ?? "restaurant"}</span>
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{relativeTime(b.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts placeholder / quick stats */}
            <div className="xl:col-span-2">
              <h2 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4">Booking Status Overview</h2>
              <div className="bg-elevated border border-[var(--border-subtle)] rounded-lg p-5">
                <div className="space-y-4">
                  {(["pending", "confirmed", "completed", "cancelled"] as BookingStatus[]).map((status) => {
                    const count = bookings.filter((b) => b.status === status).length;
                    const pct = bookings.length ? (count / bookings.length) * 100 : 0;
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Badge variant={status}>{status}</Badge>
                            <span className="text-sm text-[var(--text-secondary)]">{count} bookings</span>
                          </div>
                          <span className="text-xs text-[var(--text-muted)]">{pct.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-overlay rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", {
                              "bg-yellow-400": status === "pending",
                              "bg-emerald-400": status === "confirmed",
                              "bg-blue-400": status === "completed",
                              "bg-red-400": status === "cancelled",
                            })}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Users table */}
          <div id="users" className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">Users</h2>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 pr-4 py-2 bg-overlay border border-[var(--border-default)] rounded-md text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-48"
                />
              </div>
            </div>

            <div className="bg-elevated border border-[var(--border-subtle)] rounded-lg overflow-hidden">
              <div className="grid grid-cols-5 gap-3 px-4 py-3 bg-overlay text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                <span className="col-span-2">User</span>
                <span>Role</span>
                <span>Joined</span>
                <span>Status</span>
              </div>
              {filteredUsers.map((u) => (
                <div key={u.id} className="grid grid-cols-5 gap-3 px-4 py-3.5 border-b border-[var(--border-subtle)] last:border-0 items-center hover:bg-overlay/50 transition-colors">
                  <div className="col-span-2 flex items-center gap-3">
                    <Avatar name={u.full_name} size="xs" />
                    <div className="min-w-0">
                      <p className="text-sm text-[var(--text-primary)] font-medium truncate">{u.full_name}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{u.email}</p>
                    </div>
                  </div>
                  <div>
                    <Badge variant={u.role as any}>{u.role}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)]">{formatDate(u.created_at)}</p>
                  </div>
                  <div>
                    <span className={cn(
                      "inline-flex items-center gap-1 text-xs",
                      u.is_active ? "text-emerald-400" : "text-red-400"
                    )}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {u.is_active ? "Active" : "Suspended"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Restaurants table */}
          <div id="restaurants">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">Restaurants</h2>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  value={restaurantSearch}
                  onChange={(e) => setRestaurantSearch(e.target.value)}
                  className="pl-8 pr-4 py-2 bg-overlay border border-[var(--border-default)] rounded-md text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-48"
                />
              </div>
            </div>

            <div className="bg-elevated border border-[var(--border-subtle)] rounded-lg overflow-hidden">
              <div className="grid grid-cols-5 gap-3 px-4 py-3 bg-overlay text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                <span className="col-span-2">Restaurant</span>
                <span>Cuisine</span>
                <span>Capacity</span>
                <span>Status</span>
              </div>
              {filteredRestaurants.map((r) => (
                <div key={r.id} className="grid grid-cols-5 gap-3 px-4 py-3.5 border-b border-[var(--border-subtle)] last:border-0 items-center hover:bg-overlay/50 transition-colors">
                  <div className="col-span-2 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] font-medium truncate">{r.name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{r.city}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--text-secondary)]">{r.cuisine_type}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--text-secondary)]">{r.capacity} seats</span>
                  </div>
                  <div>
                    <span className={cn(
                      "inline-flex items-center gap-1 text-xs",
                      r.is_active ? "text-emerald-400" : "text-red-400"
                    )}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {r.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
