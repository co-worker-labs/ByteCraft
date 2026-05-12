"use client";

import { useState } from "react";

export function getOnboardingState(storageKey: string): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(storageKey) === "true";
}

export function useOnboarding(storageKey: string) {
  const [dismissed, setDismissed] = useState(() => getOnboardingState(storageKey));

  const dismiss = () => {
    localStorage.setItem(storageKey, "true");
    setDismissed(true);
  };

  return { shouldShow: !dismissed, dismiss };
}
