import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl";
}

const maxWidths = {
  sm: "max-w-sm",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
  "7xl": "max-w-7xl",
};

export default function PageWrapper({ children, className, maxWidth = "7xl" }: PageWrapperProps) {
  return (
    <div className={cn("min-h-screen page-enter", className)}>
      <div className={cn("mx-auto px-4 sm:px-6 lg:px-8 py-8", maxWidths[maxWidth])}>
        {children}
      </div>
    </div>
  );
}
