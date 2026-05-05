import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({ className, hover = false, padding = "md", children, ...props }: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <div
      className={cn(
        "bg-elevated border border-[var(--border-subtle)] rounded-lg",
        paddings[padding],
        hover && "card-hover cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
