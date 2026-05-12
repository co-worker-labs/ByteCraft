import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { routing } from "../../../i18n/routing";

import enTools from "../../../public/locales/en/tools.json";
import zhCnTools from "../../../public/locales/zh-CN/tools.json";
import zhTwTools from "../../../public/locales/zh-TW/tools.json";
import jaTools from "../../../public/locales/ja/tools.json";
import koTools from "../../../public/locales/ko/tools.json";
import esTools from "../../../public/locales/es/tools.json";
import ptBrTools from "../../../public/locales/pt-BR/tools.json";
import frTools from "../../../public/locales/fr/tools.json";
import deTools from "../../../public/locales/de/tools.json";
import ruTools from "../../../public/locales/ru/tools.json";

import enCategories from "../../../public/locales/en/categories.json";
import zhCnCategories from "../../../public/locales/zh-CN/categories.json";
import zhTwCategories from "../../../public/locales/zh-TW/categories.json";
import jaCategories from "../../../public/locales/ja/categories.json";
import koCategories from "../../../public/locales/ko/categories.json";
import esCategories from "../../../public/locales/es/categories.json";
import ptBrCategories from "../../../public/locales/pt-BR/categories.json";
import frCategories from "../../../public/locales/fr/categories.json";
import deCategories from "../../../public/locales/de/categories.json";
import ruCategories from "../../../public/locales/ru/categories.json";

import enHome from "../../../public/locales/en/home.json";
import zhCnHome from "../../../public/locales/zh-CN/home.json";
import zhTwHome from "../../../public/locales/zh-TW/home.json";
import jaHome from "../../../public/locales/ja/home.json";
import koHome from "../../../public/locales/ko/home.json";
import esHome from "../../../public/locales/es/home.json";
import ptBrHome from "../../../public/locales/pt-BR/home.json";
import frHome from "../../../public/locales/fr/home.json";
import deHome from "../../../public/locales/de/home.json";
import ruHome from "../../../public/locales/ru/home.json";

export const runtime = "edge";

type Locale = (typeof routing.locales)[number];

type ToolEntry = { shortTitle: string; description: string };
type CategoryEntry = { shortTitle: string; description: string };
type HomeEntry = { title: string; metaDescription: string };

 
const TOOL_MAP: Record<string, Record<string, any>> = {
  en: enTools,
  "zh-CN": zhCnTools,
  "zh-TW": zhTwTools,
  ja: jaTools,
  ko: koTools,
  es: esTools,
  "pt-BR": ptBrTools,
  fr: frTools,
  de: deTools,
  ru: ruTools,
};

 
const CATEGORY_MAP: Record<string, Record<string, any>> = {
  en: enCategories,
  "zh-CN": zhCnCategories,
  "zh-TW": zhTwCategories,
  ja: jaCategories,
  ko: koCategories,
  es: esCategories,
  "pt-BR": ptBrCategories,
  fr: frCategories,
  de: deCategories,
  ru: ruCategories,
};

const HOME_MAP: Record<string, HomeEntry> = {
  en: enHome,
  "zh-CN": zhCnHome,
  "zh-TW": zhTwHome,
  ja: jaHome,
  ko: koHome,
  es: esHome,
  "pt-BR": ptBrHome,
  fr: frHome,
  de: deHome,
  ru: ruHome,
};

const LOCALE_SET = new Set<string>(routing.locales);

function resolveLocale(raw: string | null): Locale {
  if (raw && LOCALE_SET.has(raw)) return raw as Locale;
  return routing.defaultLocale;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "home";
  const locale = resolveLocale(searchParams.get("locale"));
  const key = searchParams.get("key") || "";

  let title = "OmniKit";
  let desc = "Free Online Developer Tools";

  if (type === "tool" && key) {
    const entry = TOOL_MAP[locale]?.[key];
    if (entry) {
      title = entry.shortTitle;
      desc = entry.description;
    }
  } else if (type === "category" && key) {
    const entry = CATEGORY_MAP[locale]?.[key];
    if (entry) {
      title = entry.shortTitle;
      desc = entry.description;
    }
  } else if (type === "home") {
    const entry = HOME_MAP[locale];
    if (entry) {
      title = entry.title;
      desc = entry.metaDescription;
    }
  } else if (type === "custom") {
    title = searchParams.get("title") || title;
    desc = searchParams.get("desc") || desc;
  }

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0b0f1a, #111827)",
        padding: "60px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(#06d6a0 0.5px, transparent 0.5px), linear-gradient(90deg, #06d6a0 0.5px, transparent 0.5px)",
          backgroundSize: "40px 40px",
          opacity: 0.03,
        }}
      />

      <svg width="320" height="160" viewBox="-240 -100 480 200" style={{ marginBottom: 32 }}>
        <defs>
          <linearGradient id="r" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#06d6a0" />
            <stop offset="35%" stopColor="#06d6a0" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="65%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06d6a0" />
          </linearGradient>
        </defs>
        <path
          d="M0 55 C0 100 -44 138 -100 138 C-170 138 -220 88 -220 28 C-220 -32 -170 -82 -100 -82 C-44 -82 0 -44 0 0 C0 -44 44 -82 100 -82 C170 -82 220 -32 220 28 C220 88 170 138 100 138 C44 138 0 100 0 55Z"
          fill="none"
          stroke="url(#r)"
          strokeWidth="32"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div
        style={{
          fontSize: 52,
          fontWeight: 700,
          color: "#f1f5f9",
          fontFamily: "monospace",
          textAlign: "center",
          lineHeight: 1.2,
          letterSpacing: "-1.5px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          width: 140,
          height: 3,
          borderRadius: 1.5,
          background: "#06d6a0",
          marginTop: 12,
          marginBottom: 20,
        }}
      />

      <div
        style={{
          fontSize: 22,
          color: "#94a3b8",
          textAlign: "center",
          lineHeight: 1.5,
          maxWidth: 700,
        }}
      >
        {desc}
      </div>

      <div
        style={{
          fontSize: 13,
          color: "#06d6a0",
          opacity: 0.4,
          marginTop: "auto",
          letterSpacing: "0.05em",
        }}
      >
        omnikit.run
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
