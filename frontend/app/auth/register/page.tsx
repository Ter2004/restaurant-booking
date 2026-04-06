"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UtensilsCrossed, Mail, Lock, User, ShoppingBag, Store } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

type Role = "customer" | "owner";

export default function RegisterPage() {
  const router = useRouter();
  const { error: showError } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("customer");
  const [agreed, setAgreed] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }
    if (!agreed) {
      showError("Please agree to the Terms of Service");
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });

    if (error) {
      showError(error.message);
      setLoading(false);
      return;
    }

    if (role === "owner") router.push("/owner/dashboard");
    else router.push("/customer/dashboard");
  }

  const roleCards: { value: Role; label: string; desc: string; icon: React.ElementType }[] = [
    { value: "customer", label: "Customer", desc: "Browse & book restaurants", icon: ShoppingBag },
    { value: "owner", label: "Restaurant Owner", desc: "List & manage your restaurant", icon: Store },
  ];

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
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-[100px]" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 bg-gold rounded-md flex items-center justify-center">
            <UtensilsCrossed size={16} className="text-base" />
          </div>
          <span className="font-display text-lg font-semibold text-[var(--text-primary)]">TableReserve</span>
        </div>

        <div className="relative z-10">
          <blockquote className="font-display text-3xl text-[var(--text-primary)] leading-snug mb-6">
            &ldquo;One cannot think well, love well, sleep well, if one has not dined well.&rdquo;
          </blockquote>
          <p className="text-[var(--text-muted)] text-sm">— Virginia Woolf</p>

          <div className="mt-12 space-y-4">
            {[
              "Instant booking confirmation",
              "Curated dining experiences",
              "Free cancellation on most bookings",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                <div className="w-5 h-5 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold text-xs">✓</span>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 overflow-y-auto page-enter">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-gold rounded-md flex items-center justify-center">
              <UtensilsCrossed size={16} className="text-base" />
            </div>
            <span className="font-display text-lg font-semibold text-[var(--text-primary)]">TableReserve</span>
          </div>

          <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">Create your account</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-8">Join thousands of food lovers</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              type="text"
              placeholder="Alex Chen"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              icon={<User size={14} />}
            />
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
              placeholder="Min. 8 characters"
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
            <Input
              label="Confirm password"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              icon={<Lock size={14} />}
            />

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {roleCards.map((card) => {
                  const Icon = card.icon;
                  const selected = role === card.value;
                  return (
                    <button
                      key={card.value}
                      type="button"
                      onClick={() => setRole(card.value)}
                      className={cn(
                        "relative flex flex-col items-center gap-2 p-4 rounded-lg border text-center transition-all",
                        selected
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                      )}
                    >
                      {selected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-gold flex items-center justify-center">
                          <span className="text-base text-[8px] font-bold">✓</span>
                        </div>
                      )}
                      <Icon size={20} />
                      <div>
                        <p className="text-xs font-semibold">{card.label}</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{card.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-[var(--accent-primary)]"
              />
              <span className="text-xs text-[var(--text-secondary)]">
                I agree to the{" "}
                <Link href="#" className="text-gold hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="#" className="text-gold hover:underline">Privacy Policy</Link>
              </span>
            </label>

            <Button type="submit" variant="primary" fullWidth loading={loading} size="lg">
              Create Account
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
            <span className="text-xs text-[var(--text-muted)]">or</span>
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
          </div>

          <p className="text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-gold hover:text-gold-dim font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
