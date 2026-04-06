import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeVariant = "pending" | "confirmed" | "completed" | "cancelled" | "owner" | "customer" | "admin" | "default";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  confirmed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  completed: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
  owner: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  customer: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  admin: "text-gold bg-gold/10 border-gold/20",
  default: "text-[var(--text-secondary)] bg-[var(--bg-overlay)] border-[var(--border-default)]",
};

export default function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
