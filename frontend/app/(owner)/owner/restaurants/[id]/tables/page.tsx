"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api, Table } from "@/lib/api";

const ZONES = ["main", "outdoor", "private", "bar"] as const;

export default function TablesPage() {
  const { id: restaurantId } = useParams<{ id: string }>();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ table_number: "", seats: "", zone: "main" as Table["zone"] });
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.tables.list(restaurantId).then((data) => {
      setTables(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [restaurantId]);

  function openNew() {
    setEditId(null);
    setForm({ table_number: "", seats: "", zone: "main" });
    setError(null);
    setShowForm(true);
  }

  function openEdit(t: Table) {
    setEditId(t.id);
    setForm({ table_number: String(t.table_number), seats: String(t.seats), zone: t.zone });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (editId) {
        const updated = await api.tables.update(editId, {
          seats: Number(form.seats),
          zone: form.zone,
        });
        setTables((prev) => prev.map((t) => (t.id === editId ? updated : t)));
      } else {
        const created = await api.tables.create({
          restaurant_id: restaurantId,
          table_number: Number(form.table_number),
          seats: Number(form.seats),
          zone: form.zone,
        });
        setTables((prev) => [...prev, created]);
      }
      setShowForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save table");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(tableId: string) {
    if (!confirm("Delete this table?")) return;
    try {
      await api.tables.delete(tableId);
      setTables((prev) => prev.filter((t) => t.id !== tableId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete table");
    }
  }

  async function toggleAvailable(t: Table) {
    const updated = await api.tables.update(t.id, { is_available: !t.is_available });
    setTables((prev) => prev.map((tb) => (tb.id === t.id ? updated : tb)));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Manage Tables</h1>
        <button
          onClick={openNew}
          className="bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
        >
          + Add Table
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editId ? "Edit Table" : "New Table"}</h2>
          {error && <div className="mb-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table No.</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.table_number}
                  onChange={(e) => setForm((f) => ({ ...f, table_number: e.target.value }))}
                  disabled={!!editId}
                  className="w-full border rounded-lg px-3 py-2 text-sm disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.seats}
                  onChange={(e) => setForm((f) => ({ ...f, seats: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                <select
                  value={form.zone}
                  onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value as Table["zone"] }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {ZONES.map((z) => (
                    <option key={z} value={z} className="capitalize">{z}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-brand-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50"
              >
                {saving ? "Saving…" : editId ? "Save Changes" : "Add Table"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table list */}
      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : tables.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">🪑</p>
          <p>No tables yet. Add your first one!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Table No.</th>
                <th className="text-left px-4 py-3">Seats</th>
                <th className="text-left px-4 py-3">Zone</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tables.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">#{t.table_number}</td>
                  <td className="px-4 py-3">{t.seats} seats</td>
                  <td className="px-4 py-3 capitalize">{t.zone}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleAvailable(t)}>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${t.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {t.is_available ? "Available" : "Unavailable"}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 flex gap-3">
                    <button onClick={() => openEdit(t)} className="text-brand-600 hover:underline text-xs">Edit</button>
                    <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
