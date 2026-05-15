"use client";

import React, { useEffect, useRef } from "react";
import { ImageIcon, ArrowLeftRight } from "lucide-react";

interface CompareSliderProps {
  originalUrl: string | null;
  resultUrl: string | null;
  sliderPos: number;
  onSliderChange: (pos: number) => void;
  draggingRef: React.MutableRefObject<boolean>;
  containerRef: React.RefObject<HTMLDivElement>;
  aspectRatio: number;
  processing: boolean;
  t: (key: string) => string;
}

export default function CompareSlider({
  originalUrl,
  resultUrl,
  sliderPos,
  onSliderChange,
  draggingRef,
  containerRef,
  aspectRatio,
  processing,
  t,
}: CompareSliderProps) {
  function updatePosition(clientX: number) {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    onSliderChange(Math.max(0, Math.min(100, x)));
  }

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    draggingRef.current = true;
    updatePosition(e.clientX);
  }

  function onTouchStart(e: React.TouchEvent) {
    draggingRef.current = true;
    updatePosition(e.touches[0].clientX);
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!draggingRef.current) return;
      updatePosition(e.clientX);
    }
    function onMouseUp() {
      draggingRef.current = false;
    }
    function onTouchMove(e: TouchEvent) {
      if (!draggingRef.current) return;
      updatePosition(e.touches[0].clientX);
    }
    function onTouchEnd() {
      draggingRef.current = false;
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- image comparison slider (pointer only) */
    <div
      ref={containerRef}
      className="relative w-full rounded-lg border border-border-default bg-bg-surface overflow-hidden cursor-col-resize select-none"
      style={{ aspectRatio: `${aspectRatio}`, maxHeight: "500px" }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* Original image — visible on the left side */}
      {originalUrl && (
        <img
          src={originalUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-contain"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          draggable={false}
        />
      )}
      {/* Compressed image — visible on the right side */}
      {resultUrl && (
        <img
          src={resultUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-contain"
          style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
          draggable={false}
        />
      )}
      {!resultUrl && !processing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon size={48} className="opacity-30 text-fg-muted" />
        </div>
      )}

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-accent-cyan z-10 pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-bg-surface border-2 border-accent-cyan flex items-center justify-center shadow-lg pointer-events-none">
          <ArrowLeftRight size={12} className="text-accent-cyan" />
        </div>
      </div>

      {/* Labels */}
      {resultUrl && (
        <>
          <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded text-xs font-semibold bg-bg-base/70 text-fg-secondary pointer-events-none">
            {t("original")}
          </div>
          <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded text-xs font-semibold bg-bg-base/70 text-fg-secondary pointer-events-none">
            {t("compressed")}
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded text-xs text-fg-muted bg-bg-base/50 pointer-events-none">
            {t("dragToCompare")}
          </div>
        </>
      )}

      {/* Processing overlay */}
      {processing && (
        <div className="absolute inset-0 bg-bg-base/60 flex flex-col items-center justify-center gap-2 z-30">
          <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-fg-secondary">{t("processing")}</span>
        </div>
      )}
    </div>
  );
}
