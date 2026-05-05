"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, Minus } from "lucide-react";
import { api } from "@/lib/api";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const CUISINES = ["Thai", "Japanese", "Italian", "French", "Indian", "German", "Chinese", "Korean", "Mexican", "Vegan", "Mediterranean", "Steakhouse", "Other"];

interface DayHours { open: boolean; openTime: string; closeTime: string; }

export default function NewRestaurantPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    cuisine_type: "Thai",
    description: "",
    capacity: 40,
    address: "",
    city: "",
    phone: "",
    website: "",
  });

  const [hours, setHours] = useState<Record<string, DayHours>>(
    Object.fromEntries(DAYS.map((d) => [d, { open: true, openTime: "11:00", closeTime: "22:00" }]))
  );

  function setField(key: string, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setDayHours(day: string, patch: Partial<DayHours>) {
    setHours((h) => ({ ...h, [day]: { ...h[day], ...patch } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const openDays = DAYS.filter((d) => hours[d].open);
      const opening_time = hours[openDays[0]]?.openTime ?? "11:00";
      const closing_time = hours[openDays[0]]?.closeTime ?? "22:00";

      await api.restaurants.create({
        ...form,
        open_days: openDays,
        opening_time,
        closing_time,
        is_active: true,
      });
      success("Restaurant created!");
      router.push("/owner/dashboard");
    } catch {
      showError("Failed to create restaurant");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-base">
      <DashboardSidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="px-6 py-8 max-w-2xl">
          <Link href="/owner/dashboard" className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6">
            <ChevronLeft size={14} /> Back to Dashboard
          </Link>

          <h1 className="font-display text-2xl font-semibold text-[var(--text-primary)] mb-8">Add Your Restaurant</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <section>
              <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Basic Info</h2>
              <div className="space-y-4">
                <Input label="Restaurant Name" value={form.name} onChange={(e) => setField("name", e.target.value)} required placeholder="e.g. Nobu Bangkok" />

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Cuisine Type</label>
                  <select
                    value={form.cuisine_type}
                    onChange={(e) => setField("cuisine_type", e.target.value)}
                    className="w-full bg-overlay border border-[var(--border-default)] rounded-md px-4 py-2.5 text-sm text-[var(--text-primary)] appearance-none"
                  >
                    {CUISINES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Description</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder="Describe your restaurant..."
                    className="w-full bg-overlay border border-[var(--border-default)] rounded-md px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Max Capacity</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setField("capacity", Math.max(1, form.capacity - 5))}
                      className="w-9 h-9 rounded-md border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:border-[var(--border-strong)] transition-all">
                      <Minus size={14} />
                    </button>
                    <span className="text-lg font-display font-bold text-[var(--text-primary)] min-w-[3ch] text-center">{form.capacity}</span>
                    <button type="button" onClick={() => setField("capacity", form.capacity + 5)}
                      className="w-9 h-9 rounded-md border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:border-[var(--border-strong)] transition-all">
                      <Plus size={14} />
                    </button>
                    <span className="text-xs text-[var(--text-muted)]">seats</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Contact & Location</h2>
              <div className="space-y-4">
                <Input label="Address" value={form.address} onChange={(e) => setField("address", e.target.value)} required placeholder="123 Main St, District" />
                <Input label="City" value={form.city} onChange={(e) => setField("city", e.target.value)} required placeholder="Bangkok" />
                <Input label="Phone Number" type="tel" value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="+66 2 000 0000" />
                <Input label="Website (optional)" type="url" value={form.website} onChange={(e) => setField("website", e.target.value)} placeholder="https://example.com" />
              </div>
            </section>

            {/* Hours */}
            <section>
              <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Opening Hours</h2>
              <div className="bg-elevated border border-[var(--border-subtle)] rounded-lg overflow-hidden">
                {DAYS.map((day, i) => {
                  const h = hours[day];
                  return (
                    <div key={day} className={`flex items-center gap-4 px-4 py-3 border-b border-[var(--border-subtle)] last:border-0 ${!h.open ? "opacity-50" : ""}`}>
                      <label className="flex items-center gap-2 w-28 flex-shrink-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={h.open}
                          onChange={(e) => setDayHours(day, { open: e.target.checked })}
                          className="accent-[var(--accent-primary)]"
                        />
                        <span className="text-sm text-[var(--text-secondary)]">{DAY_LABELS[i]}</span>
                      </label>
                      {h.open ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={h.openTime}
                            onChange={(e) => setDayHours(day, { openTime: e.target.value })}
                            className="bg-overlay border border-[var(--border-default)] rounded px-2 py-1 text-xs text-[var(--text-primary)] w-28"
                          />
                          <span className="text-xs text-[var(--text-muted)]">to</span>
                          <input
                            type="time"
                            value={h.closeTime}
                            onChange={(e) => setDayHours(day, { closeTime: e.target.value })}
                            className="bg-overlay border border-[var(--border-default)] rounded px-2 py-1 text-xs text-[var(--text-primary)] w-28"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)]">Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" loading={loading}>Create Restaurant</Button>
              <Link href="/owner/dashboard"><Button type="button" variant="ghost">Cancel</Button></Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
