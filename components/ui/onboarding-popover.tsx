"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

interface OnboardingPopoverProps {
  show: boolean;
  onDismiss: () => void;
  targetRef: RefObject<HTMLElement | null>;
  icon: ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
}

export function OnboardingPopover({
  show,
  onDismiss,
  targetRef,
  icon,
  title,
  description,
  buttonLabel,
}: OnboardingPopoverProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = "onboarding-title";
  const descId = "onboarding-desc";

  const updatePosition = useCallback(() => {
    if (!targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const popoverWidth = 280;
    let left = rect.right - popoverWidth;
    if (left < 8) left = 8;
    const top = rect.bottom + 8;
    setPosition({ top, left });
  }, [targetRef]);

  useEffect(() => {
    if (!show) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [show, updatePosition]);

  useEffect(() => {
    if (!show) return;
    requestAnimationFrame(() => {
      const btn = dialogRef.current?.querySelector<HTMLElement>("[data-onboarding-dismiss]");
      btn?.focus();
    });
  }, [show]);

  const handleDismiss = useCallback(() => {
    onDismiss();
    previousFocusRef.current?.focus();
  }, [onDismiss]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleDismiss();
      }
    },
    [handleDismiss]
  );

  if (!show) return null;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onKeyDown={handleKeyDown}
      className="fixed z-[9999] max-w-[280px] rounded-lg border border-border-default bg-bg-elevated shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      <div className="absolute -top-2 right-6 h-0 w-0 border-x-[8px] border-b-[8px] border-x-transparent border-b-accent-cyan" />

      <div className="flex items-start gap-3 p-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-cyan/15 text-accent-cyan">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 id={titleId} className="text-sm font-semibold text-fg-primary">
            {title}
          </h3>
          <p id={descId} className="mt-1 text-xs leading-relaxed text-fg-secondary">
            {description}
          </p>
        </div>
      </div>

      <div className="border-t border-border-default px-3 py-2">
        <button
          type="button"
          data-onboarding-dismiss
          onClick={handleDismiss}
          className="w-full rounded-md bg-accent-cyan/15 px-3 py-1.5 text-xs font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/25"
        >
          {buttonLabel}
        </button>
      </div>
    </div>,
    document.body
  );
}
