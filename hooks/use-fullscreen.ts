"use client";

import { useSyncExternalStore, useCallback } from "react";

interface UseFullscreenReturn {
  isFullscreen: boolean;
  toggle: () => void;
  isSupported: boolean;
  requestFullscreen: () => void;
}

function subscribe(callback: () => void) {
  document.addEventListener("fullscreenchange", callback);
  return () => document.removeEventListener("fullscreenchange", callback);
}

function getFullscreen() {
  return !!document.fullscreenElement;
}

export function useFullscreen(): UseFullscreenReturn {
  const isFullscreen = useSyncExternalStore(subscribe, getFullscreen, () => false);

  const requestFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    }
  }, []);

  const toggle = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      requestFullscreen();
    }
  };

  return { isFullscreen, toggle, isSupported: true, requestFullscreen };
}
