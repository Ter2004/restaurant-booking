"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          email: data.user.email ?? "",
          role: data.user.user_metadata?.role ?? "customer",
        });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email ?? "",
          role: session.user.user_metadata?.role ?? "customer",
        });
      } else {
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-bold text-brand-600 text-lg">
          TableBook
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              {user.role === "customer" && (
                <Link href="/customer/dashboard" className="text-gray-600 hover:text-brand-600">
                  My Bookings
                </Link>
              )}
              {(user.role === "owner" || user.role === "admin") && (
                <Link href="/owner/dashboard" className="text-gray-600 hover:text-brand-600">
                  Dashboard
                </Link>
              )}
              {user.role === "admin" && (
                <Link href="/admin/dashboard" className="text-gray-600 hover:text-brand-600">
                  Admin
                </Link>
              )}
              <span className="text-gray-400 hidden sm:inline">{user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-600 hover:text-brand-600">
                Log In
              </Link>
              <Link
                href="/auth/register"
                className="bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
