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
  website?: string;
  image_url?: string;
  capacity: number;
  opening_time: string;
  closing_time: string;
  open_days: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  rating?: number;
  review_count?: number;
}

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: number;
  seats: number;
  zone: "A" | "B" | "C" | "main" | "outdoor" | "private" | "bar";
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
  restaurant?: Restaurant;
  table?: Table;
  customer?: User;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "customer" | "owner" | "admin";
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
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
  customer?: User;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type UserRole = "customer" | "owner" | "admin";
