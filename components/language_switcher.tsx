"use client";

import { useState } from "react";
import { useRouter, usePathname } from "../i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { Dropdown } from "./ui/dropdown";
import { languages } from "../libs/i18n/languages";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations("common");
  const [bouncing, setBouncing] = useState(false);

  function switchLocale(locale: string) {
    router.replace(pathname, { locale });
  }

  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-fg-secondary hover:text-accent-cyan hover:bg-accent-cyan/10 transition-colors ${bouncing ? "nav-btn-bounce" : ""}`}
          onClick={() => setBouncing(true)}
          onAnimationEnd={() => setBouncing(false)}
          aria-label={t("language")}
        >
          <Globe size={16} />
        </button>
      }
      items={languages.map((lang) => ({
        label: lang.label,
        onClick: () => switchLocale(lang.code),
        active: lang.code === currentLocale,
      }))}
    />
  );
}
