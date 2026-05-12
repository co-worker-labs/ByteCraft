"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

type ToastType = "success" | "danger" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  addToast: (message: string, type: ToastType, timeout?: number) => void;
}

const ToastContext = createContext<ToastContextValue>({ addToast: () => {} });

export function useToastContext() {
  return useContext(ToastContext);
}

let globalNextId = 0;

const typeBorderColors: Record<ToastType, string> = {
  success: "border-l-[#06D6A0]",
  danger: "border-l-[#EF4444]",
  info: "border-l-[#06D6A0]",
  warning: "border-l-[#F59E0B]",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const tc = useTranslations("common");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType, timeout = 3000) => {
    const id = globalNextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, timeout);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-bg-elevated border border-border-default border-l-[3px] shadow-lg min-w-[280px] animate-[slideIn_0.2s_ease-out] ${typeBorderColors[toast.type]}`}
          >
            <span className="text-fg-primary text-sm flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-fg-muted hover:text-fg-primary transition-colors"
              aria-label={tc("close")}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
