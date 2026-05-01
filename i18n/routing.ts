import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "zh-CN", "zh-TW", "ja", "ko", "es", "pt-BR", "fr", "de", "ru"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
