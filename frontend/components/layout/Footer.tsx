import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gold rounded-md flex items-center justify-center">
              <UtensilsCrossed size={14} className="text-base" />
            </div>
            <div>
              <span className="font-display text-base font-semibold text-[var(--text-primary)]">TableReserve</span>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Curated dining, reserved for you.</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Browse</Link>
            <Link href="/auth/register" className="hover:text-[var(--text-secondary)] transition-colors">List Restaurant</Link>
            <Link href="/auth/login" className="hover:text-[var(--text-secondary)] transition-colors">Sign In</Link>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} TableReserve. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
