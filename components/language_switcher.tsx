"use client";

import { useRouter, usePathname } from "../i18n/navigation";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { Dropdown } from "./ui/dropdown";

const languages = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "zh-CN", label: "简体中文", shortLabel: "中" },
  { code: "zh-TW", label: "繁體中文", shortLabel: "繁" },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  function switchLocale(locale: string) {
    router.replace(pathname, { locale });
  }

  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-secondary hover:text-accent-cyan hover:bg-accent-cyan/10 transition-colors"
          aria-label="Language"
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
