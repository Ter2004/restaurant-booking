"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, Minus, Edit2, Trash2, Check, X } from "lucide-react";
import { api } from "@/lib/api";
import type { Table, Restaurant } from "@/types";
import { mockTables, mockRestaurants } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type Zone = "A" | "B" | "C";

const ZONE_COLORS: Record<Zone, string> = {
  A: "bg-blue-400/10 border-blue-400/20 text-blue-400",
  B: "bg-emerald-400/10 border-emerald-400/20 text-emerald-400",
  C: "bg-orange-400/10 border-orange-400/20 text-orange-400",
};

interface TableForm {
  table_number: number;
  seats: number;
  zone: Zone;
  is_available: boolean;
}

const DEFAULT_FORM: TableForm = { table_number: 1, seats: 4, zone: "A", is_available: true };

export default function TablesPage() {
  const { id } = useParams<{ id: string }>();
  const { success, error: showError } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [form, setForm] = useState<TableForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.restaurants.get(id).catch(() => mockRestaurants.find((r) => r.id === id) ?? mockRestaurants[0]),
      api.tables.list(id).catch(() => mockTables.filter((t) => t.restaurant_id === id)),
    ]).then(([r, t]) => {
      setRestaurant(r);
      setTables(t);
    }).finally(() => setLoading(false));
  }, [id]);

  function openAdd() {
    const nextNum = Math.max(0, ...tables.map((t) => t.table_number)) + 1;
    setForm({ ...DEFAULT_FORM, table_number: nextNum });
    setEditingTable(null);
    setShowPanel(true);
  }

  function openEdit(table: Table) {
    setForm({
      table_number: table.table_number,
      seats: table.seats,
      zone: (table.zone as Zone) || "A",
      is_available: table.is_available,
    });
    setEditingTable(table);
    setShowPanel(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingTable) {
        const updated = await api.tables.update(editingTable.id, { ...form, zone: form.zone as any }).catch(() => ({ ...editingTable, ...form }));
        setTables((prev) => prev.map((t) => t.id === editingTable.id ? { ...t, ...form } : t));
        success("Table updated!");
      } else {
        const created = await api.tables.create({ ...form, restaurant_id: id, zone: form.zone as any }).catch(() => ({ id: `t${Date.now()}`, restaurant_id: id, ...form, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }));
        setTables((prev) => [...prev, created as Table]);
        success("Table added!");
      }
      setShowPanel(false);
    } catch {
      showError("Failed to save table");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(tableId: string) {
    setDeletingId(tableId);
    try {
      await api.tables.delete(tableId).catch(() => {});
      setTables((prev) => prev.filter((t) => t.id !== tableId));
      success("Table deleted");
    } catch {
      showError("Failed to delete table");
    } finally {
      setDeletingId(null);
    }
  }

  const zones: Zone[] = ["A", "B", "C"];

  return (
    <div className="flex min-h-screen bg-base">
      <DashboardSidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="px-6 py-8 max-w-4xl">
          <Link href="/owner/dashboard" className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6">
            <ChevronLeft size={14} /> Back to Dashboard
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
                {restaurant?.name ?? "Restaurant"} — Tables
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{tables.length} tables configured</p>
            </div>
            <Button variant="primary" size="sm" onClick={openAdd}>
              <Plus size={14} /> Add Table
            </Button>
          </div>

          {/* Tables grid */}
          {loading ? (
            <div className="text-center py-12 text-[var(--text-muted)]">Loading...</div>
          ) : tables.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">🪑</p>
              <p className="font-medium text-[var(--text-primary)]">No tables yet</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1 mb-4">Add your first table to start accepting bookings</p>
              <Button variant="primary" size="sm" onClick={openAdd}><Plus size={14} /> Add Table</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {tables.map((table) => {
                const zone = (table.zone as Zone) || "A";
                return (
                  <div key={table.id} className={cn(
                    "rounded-lg border p-4 relative group transition-all",
                    ZONE_COLORS[zone]
                  )}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-display text-2xl font-bold">#{table.table_number}</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-base/30">Zone {zone}</span>
                    </div>
                    <p className="text-sm font-medium mb-1">{table.seats} seats</p>
                    <div className={cn("text-xs", table.is_available ? "text-emerald-400" : "text-red-400")}>
                      {table.is_available ? "● Available" : "● Unavailable"}
                    </div>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(table)}
                        className="w-6 h-6 rounded bg-base/60 flex items-center justify-center hover:bg-base transition-colors">
                        <Edit2 size={11} />
                      </button>
                      <button onClick={() => handleDelete(table.id)} disabled={deletingId === table.id}
                        className="w-6 h-6 rounded bg-base/60 flex items-center justify-center hover:bg-red-400/20 text-red-400 transition-colors">
                        {deletingId === table.id ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" /> : <Trash2 size={11} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Slide-in panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPanel(false)} />
          <div className="relative w-full max-w-sm bg-elevated border-l border-[var(--border-default)] p-6 overflow-y-auto shadow-soft slide-in-right">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                {editingTable ? "Edit Table" : "Add Table"}
              </h3>
              <button onClick={() => setShowPanel(false)} className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-overlay transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Table number */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Table Number</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setForm((f) => ({ ...f, table_number: Math.max(1, f.table_number - 1) }))}
                    className="w-9 h-9 rounded-md border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:border-[var(--border-strong)] transition-all">
                    <Minus size={14} />
                  </button>
                  <span className="text-xl font-display font-bold text-[var(--text-primary)] min-w-[2ch] text-center">{form.table_number}</span>
                  <button onClick={() => setForm((f) => ({ ...f, table_number: f.table_number + 1 }))}
                    className="w-9 h-9 rounded-md border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:border-[var(--border-strong)] transition-all">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Seats */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Number of Seats</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setForm((f) => ({ ...f, seats: Math.max(1, f.seats - 1) }))}
                    className="w-9 h-9 rounded-md border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:border-[var(--border-strong)] transition-all">
                    <Minus size={14} />
                  </button>
                  <span className="text-xl font-display font-bold text-[var(--text-primary)] min-w-[2ch] text-center">{form.seats}</span>
                  <button onClick={() => setForm((f) => ({ ...f, seats: Math.min(12, f.seats + 1) }))}
                    className="w-9 h-9 rounded-md border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:border-[var(--border-strong)] transition-all">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Zone */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Zone</label>
                <div className="flex gap-2">
                  {zones.map((z) => (
                    <button key={z} onClick={() => setForm((f) => ({ ...f, zone: z }))}
                      className={cn(
                        "flex-1 py-2.5 rounded-md border text-sm font-medium transition-all",
                        form.zone === z ? ZONE_COLORS[z] : "border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--border-strong)]"
                      )}>
                      Zone {z}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available */}
              <label className="flex items-center justify-between p-3 bg-overlay rounded-md border border-[var(--border-default)] cursor-pointer">
                <span className="text-sm text-[var(--text-secondary)]">Available for booking</span>
                <div
                  onClick={() => setForm((f) => ({ ...f, is_available: !f.is_available }))}
                  className={cn(
                    "w-10 h-5 rounded-full transition-colors relative",
                    form.is_available ? "bg-emerald-400" : "bg-overlay border border-[var(--border-strong)]"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                    form.is_available ? "translate-x-5" : "translate-x-0.5"
                  )} />
                </div>
              </label>

              <div className="flex gap-3 pt-2">
                <Button variant="primary" fullWidth loading={saving} onClick={handleSave}>
                  {editingTable ? "Save Changes" : "Add Table"}
                </Button>
                <Button variant="ghost" onClick={() => setShowPanel(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
