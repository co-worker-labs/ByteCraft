"use client";

import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";

interface PrivacyBannerProps {
  variant?: "text" | "files";
}

export default function PrivacyBanner({ variant = "text" }: PrivacyBannerProps) {
  const tc = useTranslations("common");
  const text = variant === "files" ? tc("alert.filesNotTransferred") : tc("alert.notTransferred");

  return (
    <div className="flex items-start gap-2 border-l-2 border-accent-cyan bg-accent-cyan-dim/30 rounded-r-lg p-3 my-4">
      <Lock size={16} className="text-accent-cyan mt-0.5 shrink-0" />
      <span className="text-sm text-fg-secondary leading-relaxed">{text}</span>
    </div>
  );
}
