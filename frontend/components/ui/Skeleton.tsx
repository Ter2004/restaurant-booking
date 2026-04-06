import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
}

export default function Skeleton({ className, width, height, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton rounded-md", className)}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-elevated border border-[var(--border-subtle)] rounded-lg overflow-hidden">
      <Skeleton height="180px" className="rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton height="20px" width="70%" />
        <Skeleton height="14px" width="40%" />
        <Skeleton height="14px" width="90%" />
        <Skeleton height="36px" className="mt-4" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 bg-elevated border border-[var(--border-subtle)] rounded-lg">
      <Skeleton width="48px" height="48px" className="rounded-md flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton height="16px" width="60%" />
        <Skeleton height="12px" width="40%" />
      </div>
      <Skeleton height="28px" width="80px" className="rounded-full" />
    </div>
  );
}
