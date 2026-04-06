"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UtensilsCrossed, Mail, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { error: showError } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const role = data.user.user_metadata?.role ?? "customer";
      if (role === "owner") router.replace("/owner/dashboard");
      else if (role === "admin") router.replace("/admin/dashboard");
      else router.replace("/customer/dashboard");
    });
  }, [router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      showError(error.message);
      setLoading(false);
      return;
    }

    const role = data.user?.user_metadata?.role ?? "customer";
    if (role === "owner") router.push("/owner/dashboard");
    else if (role === "admin") router.push("/admin/dashboard");
    else router.push("/customer/dashboard");
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(var(--border-default) 1px, transparent 1px), linear-gradient(90deg, var(--border-default) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-[100px]" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 bg-gold rounded-md flex items-center justify-center">
            <UtensilsCrossed size={16} className="text-base" />
          </div>
          <span className="font-display text-lg font-semibold text-[var(--text-primary)]">TableReserve</span>
        </div>

        <div className="relative z-10">
          <blockquote className="font-display text-3xl text-[var(--text-primary)] leading-snug mb-6">
            &ldquo;Good food is the foundation of genuine happiness.&rdquo;
          </blockquote>
          <p className="text-[var(--text-muted)] text-sm">— Auguste Escoffier</p>

          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { value: "200+", label: "Restaurants" },
              { value: "50K+", label: "Bookings" },
              { value: "4.9★", label: "Avg Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-3 rounded-lg bg-elevated border border-[var(--border-subtle)]">
                <div className="text-gold font-display text-xl font-semibold">{stat.value}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 page-enter">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-gold rounded-md flex items-center justify-center">
              <UtensilsCrossed size={16} className="text-base" />
            </div>
            <span className="font-display text-lg font-semibold text-[var(--text-primary)]">TableReserve</span>
          </div>

          <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">Welcome back</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<Mail size={14} />}
            />

            <Input
              label="Password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={<Lock size={14} />}
              iconRight={
                <button type="button" onClick={() => setShowPw((s) => !s)} className="hover:text-[var(--text-secondary)] transition-colors">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />

            <div className="flex justify-end">
              <Link href="#" className="text-xs text-[var(--text-muted)] hover:text-gold transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" fullWidth loading={loading} size="lg">
              Sign In
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
            <span className="text-xs text-[var(--text-muted)]">or</span>
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
          </div>

          <p className="text-center text-sm text-[var(--text-secondary)]">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-gold hover:text-gold-dim font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
