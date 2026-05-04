export interface Language {
  code: string;
  label: string;
  shortLabel: string;
}

export const languages: Language[] = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "zh-CN", label: "简体中文", shortLabel: "中" },
  { code: "zh-TW", label: "繁體中文", shortLabel: "繁" },
  { code: "ja", label: "日本語", shortLabel: "日" },
  { code: "ko", label: "한국어", shortLabel: "한" },
  { code: "es", label: "Español", shortLabel: "ES" },
  { code: "pt-BR", label: "Português (BR)", shortLabel: "PT" },
  { code: "fr", label: "Français", shortLabel: "FR" },
  { code: "de", label: "Deutsch", shortLabel: "DE" },
  { code: "ru", label: "Русский", shortLabel: "RU" },
];
