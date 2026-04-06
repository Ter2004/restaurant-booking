import { getAccessToken } from "./supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? "API error");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Restaurants ──────────────────────────────────────────────
export const api = {
  restaurants: {
    list: (params?: { city?: string; cuisine?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return apiFetch<Restaurant[]>(`/restaurants/${q ? `?${q}` : ""}`);
    },
    get: (id: string) => apiFetch<Restaurant>(`/restaurants/${id}`),
    create: (data: Partial<Restaurant>) =>
      apiFetch<Restaurant>("/restaurants/", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Restaurant>) =>
      apiFetch<Restaurant>(`/restaurants/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch<void>(`/restaurants/${id}`, { method: "DELETE" }),
  },

  tables: {
    list: (restaurantId: string) =>
      apiFetch<Table[]>(`/tables/?restaurant_id=${restaurantId}`),
    create: (data: Partial<Table>) =>
      apiFetch<Table>("/tables/", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Table>) =>
      apiFetch<Table>(`/tables/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch<void>(`/tables/${id}`, { method: "DELETE" }),
  },

  bookings: {
    list: (params?: { restaurant_id?: string; status?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return apiFetch<Booking[]>(`/bookings/${q ? `?${q}` : ""}`);
    },
    listOwner: (params?: { restaurant_id?: string; status?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return apiFetch<Booking[]>(`/bookings/owner${q ? `?${q}` : ""}`);
    },
    updateOwner: (id: string, data: Partial<Booking>) =>
      apiFetch<Booking>(`/bookings/owner/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    get: (id: string) => apiFetch<Booking>(`/bookings/${id}`),
    create: (data: Partial<Booking>) =>
      apiFetch<Booking>("/bookings/", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Booking>) =>
      apiFetch<Booking>(`/bookings/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    cancel: (id: string) => apiFetch<void>(`/bookings/${id}`, { method: "DELETE" }),
  },

  reviews: {
    list: (restaurantId: string) =>
      apiFetch<Review[]>(`/reviews/?restaurant_id=${restaurantId}`),
    create: (data: Partial<Review>) =>
      apiFetch<Review>("/reviews/", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Review>) =>
      apiFetch<Review>(`/reviews/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch<void>(`/reviews/${id}`, { method: "DELETE" }),
  },
};

// ── Types ────────────────────────────────────────────────────
export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  cuisine_type: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  image_url?: string;
  capacity: number;
  opening_time: string;
  closing_time: string;
  open_days: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: number;
  seats: number;
  zone: "main" | "outdoor" | "private" | "bar";
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  restaurant_id: string;
  table_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  party_size: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  restaurant_id: string;
  rating: number;
  title?: string;
  body?: string;
  created_at: string;
  updated_at: string;
}
