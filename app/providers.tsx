"use client";

import { useEffect } from "react";
import { ThemeProvider } from "../libs/theme";
import { ToastProvider, useToastContext } from "../components/ui/toast";
import { registerToastFn } from "../libs/toast";

function ToastBridge() {
  const { addToast } = useToastContext();
  useEffect(() => {
    registerToastFn(addToast);
  }, [addToast]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ToastBridge />
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
}
