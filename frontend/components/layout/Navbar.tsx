"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, UtensilsCrossed, ChevronDown, LayoutDashboard, Calendar, LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";

interface NavUser {
  email: string;
  full_name: string;
  role: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<NavUser | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email ?? "",
          full_name: session.user.user_metadata?.full_name ?? session.user.email ?? "User",
          role: session.user.user_metadata?.role ?? "customer",
        });
      } else {
        setUser(null);
      }
    });

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    router.push("/auth/login");
  }

  const dashboardHref =
    user?.role === "owner" ? "/owner/dashboard" :
    user?.role === "admin" ? "/admin/dashboard" :
    "/customer/dashboard";

  const navLinks = [
    { href: "/", label: "Browse" },
    { href: "/#how-it-works", label: "How it works" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-[var(--bg-surface)]/90 backdrop-blur-nav border-b border-[var(--border-subtle)] shadow-soft"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gold rounded-md flex items-center justify-center shadow-glow-sm">
              <UtensilsCrossed size={16} className="text-base" />
            </div>
            <span className="font-display text-lg font-semibold text-[var(--text-primary)] tracking-tight">
              TableReserve
            </span>
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm transition-colors duration-200",
                  pathname === link.href
                    ? "text-gold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-colors"
                >
                  <Avatar name={user.full_name} size="xs" />
                  <span className="text-sm text-[var(--text-secondary)] max-w-[120px] truncate">{user.full_name}</span>
                  <ChevronDown size={14} className={cn("text-[var(--text-muted)] transition-transform", dropdownOpen && "rotate-180")} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-elevated border border-[var(--border-default)] rounded-lg shadow-soft overflow-hidden fade-in">
                    <div className="px-3 py-2.5 border-b border-[var(--border-subtle)]">
                      <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                      <p className="text-xs text-gold capitalize mt-0.5">{user.role}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href={dashboardHref}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-overlay transition-colors"
                      >
                        <LayoutDashboard size={14} />
                        Dashboard
                      </Link>
                      {user.role === "customer" && (
                        <Link
                          href="/customer/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-overlay transition-colors"
                        >
                          <Calendar size={14} />
                          My Bookings
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-400/5 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-4 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm bg-gold text-base px-5 py-2 rounded-full font-medium hover:bg-gold-dim transition-colors shadow-glow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-overlay transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-surface border-t border-[var(--border-subtle)] slide-up">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-md text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-elevated transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[var(--border-subtle)] mt-3 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar name={user.full_name} size="sm" />
                    <div>
                      <p className="text-sm text-[var(--text-primary)]">{user.full_name}</p>
                      <p className="text-xs text-gold capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Link href={dashboardHref} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-[var(--text-secondary)] hover:bg-elevated transition-colors">
                    <LayoutDashboard size={14} /> Dashboard
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-red-400 hover:bg-red-400/5 transition-colors">
                    <LogOut size={14} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-md text-sm text-[var(--text-secondary)] hover:bg-elevated transition-colors">Sign In</Link>
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-md text-sm bg-gold text-base text-center font-medium">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
