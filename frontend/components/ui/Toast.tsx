"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const value: ToastContextValue = {
    toast: addToast,
    success: (msg) => addToast("success", msg),
    error: (msg) => addToast("error", msg),
    info: (msg) => addToast("info", msg),
  };

  const icons = {
    success: <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />,
    error: <XCircle size={16} className="text-red-400 flex-shrink-0" />,
    info: <Info size={16} className="text-blue-400 flex-shrink-0" />,
  };

  const styles = {
    success: "border-emerald-400/20 bg-emerald-400/5",
    error: "border-red-400/20 bg-red-400/5",
    info: "border-blue-400/20 bg-blue-400/5",
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-lg border bg-elevated shadow-soft pointer-events-auto slide-up",
              styles[t.type]
            )}
          >
            {icons[t.type]}
            <p className="text-sm text-[var(--text-primary)] flex-1">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
