"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Check, CheckCircle, Minus, Plus, ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import type { Restaurant, Table } from "@/types";
import { mockRestaurants, mockTables } from "@/lib/mockData";
import { cuisineEmoji, generateTimeSlots, formatTime, cn } from "@/lib/utils";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type Step = 1 | 2 | 3;

export default function NewBookingPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();

  const [step, setStep] = useState<Step>(1);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [form, setForm] = useState({ date: "", time: "", partySize: 2, specialRequests: "" });
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ id: string } | null>(null);

  useEffect(() => {
    api.restaurants.list()
      .then(setRestaurants)
      .catch(() => setRestaurants(mockRestaurants));
  }, []);

  useEffect(() => {
    if (selected) {
      api.tables.list(selected.id)
        .then(setTables)
        .catch(() => setTables(mockTables.filter((t) => t.restaurant_id === selected.id)));
    }
  }, [selected]);

  useEffect(() => {
    const available = tables.filter((t) => t.is_available && t.seats >= form.partySize);
    setSelectedTable(available[0] ?? null);
  }, [tables, form.partySize]);

  const filtered = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine_type.toLowerCase().includes(search.toLowerCase())
  );

  const timeSlots = selected ? generateTimeSlots(selected.opening_time, selected.closing_time) : [];

  async function handleConfirm() {
    if (!selected || !selectedTable) return;
    setLoading(true);
    try {
      const b = await api.bookings.create({
        restaurant_id: selected.id,
        table_id: selectedTable.id,
        booking_date: form.date,
        start_time: form.time,
        end_time: `${String(parseInt(form.time) + 2).padStart(2, "0")}:00`,
        party_size: form.partySize,
        special_requests: form.specialRequests || undefined,
      });
      setBookingResult({ id: b.id });
      success("Booking confirmed!");
    } catch {
      showError("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const STEPS = ["Restaurant", "Date & Time", "Confirm"];

  if (bookingResult) {
    return (
      <div className="flex min-h-screen bg-base">
        <DashboardSidebar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center slide-up max-w-sm">
            <div className="w-20 h-20 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={36} className="text-emerald-400" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)] mb-2">Booking Confirmed!</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Your table has been reserved successfully.</p>
            <p className="font-mono text-xs text-[var(--text-muted)] bg-elevated border border-[var(--border-subtle)] rounded-md px-4 py-2 mb-6">
              ID: {bookingResult.id}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="primary" onClick={() => router.push("/customer/dashboard")}>
                View My Bookings
              </Button>
              <Button variant="ghost" onClick={() => { setBookingResult(null); setStep(1); setSelected(null); }}>
                Book Another
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-base">
      <DashboardSidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="px-6 py-8 max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl font-semibold text-[var(--text-primary)]">New Booking</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Reserve your perfect table</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((label, i) => {
              const s = (i + 1) as Step;
              const active = s === step;
              const done = s < step;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    active ? "bg-gold text-base" : done ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" : "bg-elevated text-[var(--text-muted)] border border-[var(--border-subtle)]"
                  )}>
                    {done ? <Check size={11} /> : <span>{s}</span>}
                    {label}
                  </div>
                  {i < STEPS.length - 1 && <ChevronRight size={12} className="text-[var(--text-muted)]" />}
                </div>
              );
            })}
          </div>

          {/* Step 1: Restaurant */}
          {step === 1 && (
            <div className="page-enter space-y-4">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-overlay border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                />
              </div>

              <div className="space-y-2">
                {filtered.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all",
                      selected?.id === r.id
                        ? "border-gold bg-gold/5"
                        : "border-[var(--border-subtle)] bg-elevated hover:border-[var(--border-default)]"
                    )}
                  >
                    <span className="text-3xl flex-shrink-0">{cuisineEmoji(r.cuisine_type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text-primary)]">{r.name}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{r.cuisine_type} · {r.city}</p>
                    </div>
                    {selected?.id === r.id && (
                      <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                        <Check size={11} className="text-base" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" disabled={!selected} onClick={() => setStep(2)}>
                  Continue <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Date, Time, Party */}
          {step === 2 && selected && (
            <div className="page-enter space-y-6">
              <div className="flex items-center gap-3 p-4 bg-elevated border border-[var(--border-subtle)] rounded-lg">
                <span className="text-2xl">{cuisineEmoji(selected.cuisine_type)}</span>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{selected.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{selected.cuisine_type} · {selected.city}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full bg-overlay border border-[var(--border-default)] rounded-md px-4 py-2.5 text-sm text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Time</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setForm((f) => ({ ...f, time: slot }))}
                      className={cn(
                        "py-2 text-xs rounded-md border transition-all font-medium",
                        form.time === slot
                          ? "bg-gold text-base border-gold shadow-glow-sm"
                          : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Party Size</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setForm((f) => ({ ...f, partySize: Math.max(1, f.partySize - 1) }))}
                    className="w-10 h-10 rounded-md border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:border-[var(--border-strong)] transition-all">
                    <Minus size={14} />
                  </button>
                  <span className="text-xl font-display font-bold text-[var(--text-primary)] min-w-[2ch] text-center">{form.partySize}</span>
                  <button onClick={() => setForm((f) => ({ ...f, partySize: Math.min(12, f.partySize + 1) }))}
                    className="w-10 h-10 rounded-md border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:border-[var(--border-strong)] transition-all">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {selectedTable && (
                <div className="bg-overlay rounded-md p-3 border border-[var(--border-subtle)]">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Available table</p>
                  <p className="text-sm text-[var(--text-primary)]">
                    Table #{selectedTable.table_number} · {selectedTable.seats} seats · Zone {selectedTable.zone}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft size={14} /> Back
                </Button>
                <Button variant="primary" disabled={!form.date || !form.time || !selectedTable} onClick={() => setStep(3)}>
                  Continue <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && selected && (
            <div className="page-enter space-y-6">
              <div className="bg-elevated border border-[var(--border-subtle)] rounded-lg divide-y divide-[var(--border-subtle)]">
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-4">Booking Summary</h3>
                  <div className="space-y-3 text-sm">
                    {[
                      { label: "Restaurant", value: selected.name },
                      { label: "Address", value: selected.address },
                      { label: "Date", value: form.date },
                      { label: "Time", value: formatTime(form.time) },
                      { label: "Party Size", value: `${form.partySize} guests` },
                      { label: "Table", value: selectedTable ? `#${selectedTable.table_number} (${selectedTable.seats} seats, Zone ${selectedTable.zone})` : "TBD" },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between gap-4">
                        <span className="text-[var(--text-muted)]">{row.label}</span>
                        <span className="text-[var(--text-primary)] font-medium text-right">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Special Requests (optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Dietary requirements, occasion, seating preference..."
                    value={form.specialRequests}
                    onChange={(e) => setForm((f) => ({ ...f, specialRequests: e.target.value }))}
                    className="w-full bg-overlay border border-[var(--border-default)] rounded-md px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ArrowLeft size={14} /> Back
                </Button>
                <Button variant="primary" loading={loading} onClick={handleConfirm} fullWidth>
                  Confirm Booking
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
