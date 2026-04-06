"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Calendar, PlusCircle, Store, ClipboardList,
  Users, Settings, LogOut, UtensilsCrossed, ChevronLeft, ChevronRight,
  Shield
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navByRole: Record<string, SidebarItem[]> = {
  customer: [
    { href: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/customer/bookings/new", label: "New Booking", icon: PlusCircle },
    { href: "/", label: "Browse Restaurants", icon: Store },
  ],
  owner: [
    { href: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/owner/bookings", label: "Bookings", icon: ClipboardList },
    { href: "/owner/restaurants/new", label: "Add Restaurant", icon: PlusCircle },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/dashboard#users", label: "Users", icon: Users },
    { href: "/admin/dashboard#restaurants", label: "Restaurants", icon: Store },
  ],
};

interface NavUser {
  email: string;
  full_name: string;
  role: string;
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<NavUser | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          email: data.user.email ?? "",
          full_name: data.user.user_metadata?.full_name ?? data.user.email ?? "User",
          role: data.user.user_metadata?.role ?? "customer",
        });
      }
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  const role = user?.role ?? "customer";
  const items = navByRole[role] ?? navByRole.customer;

  return (
    <aside
      className={cn(
        "flex flex-col bg-surface border-r border-[var(--border-subtle)] transition-all duration-300 min-h-screen sticky top-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-2 px-4 h-16 border-b border-[var(--border-subtle)]", collapsed && "justify-center px-0")}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gold rounded-md flex items-center justify-center flex-shrink-0">
            <UtensilsCrossed size={14} className="text-base" />
          </div>
          {!collapsed && (
            <span className="font-display text-sm font-semibold text-[var(--text-primary)] truncate">TableReserve</span>
          )}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150 group relative",
                active
                  ? "bg-gold/10 text-gold border-l-2 border-gold pl-[10px]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-elevated",
                collapsed && "justify-center px-2 border-l-0 pl-2"
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-elevated border border-[var(--border-default)] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user + logout */}
      <div className="mt-auto border-t border-[var(--border-subtle)] p-3 space-y-1">
        {user && !collapsed && (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-md bg-elevated mb-2">
            <Avatar name={user.full_name} size="xs" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--text-primary)] truncate">{user.full_name}</p>
              <p className="text-xs text-gold capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-400/5 transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={15} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-20 w-6 h-6 bg-elevated border border-[var(--border-default)] rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shadow-soft"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
