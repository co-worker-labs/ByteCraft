"use client";

import { Link } from "../../../i18n/navigation";
import { useTranslations } from "next-intl";
import Layout from "../../../components/layout";

export default function OfflinePage() {
  const t = useTranslations("common");

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <svg
          className="w-16 h-16 text-accent-cyan"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="2" y1="2" x2="22" y2="22" />
          <path d="M8.5 16.5a5 5 0 0 1 7 0" />
          <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
          <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
          <path d="M16.85 11.25a10 10 0 0 1 2.22 2.5" />
          <path d="M5 12.86a10 10 0 0 1 1.63-2.03" />
        </svg>
        <h1 className="text-xl font-semibold">{t("offline.title")}</h1>
        <p className="text-sm text-fg-secondary text-center max-w-md leading-relaxed">
          {t("offline.message")}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 rounded-full bg-accent-cyan px-6 py-2 text-sm font-semibold text-bg-base hover:bg-accent-cyan/90 transition-colors"
        >
          {t("offline.reload")}
        </button>
      </div>
    </Layout>
  );
}
