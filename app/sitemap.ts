import { MetadataRoute } from "next";
import { routing } from "../i18n/routing";
import { SITE_URL } from "../libs/site";
import { TOOLS } from "../libs/tools";

function makeAlternates(path: string) {
  return {
    languages: {
      "x-default": `${SITE_URL}${path}`,
      en: `${SITE_URL}${path}`,
      "zh-CN": `${SITE_URL}/zh-CN${path}`,
      "zh-TW": `${SITE_URL}/zh-TW${path}`,
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const { defaultLocale } = routing;
  const urls: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    const localePrefix = locale === defaultLocale ? "" : `/${locale}`;
    const isDefault = locale === defaultLocale;

    urls.push({
      url: `${SITE_URL}${localePrefix}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: isDefault ? 1 : 0.9,
      alternates: makeAlternates(""),
    });
  }

  for (const locale of routing.locales) {
    const localePrefix = locale === defaultLocale ? "" : `/${locale}`;

    for (const tool of TOOLS) {
      urls.push({
        url: `${SITE_URL}${localePrefix}${tool.path}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
        alternates: makeAlternates(tool.path),
      });
    }
  }

  const staticPages = ["terms", "privacy"];
  for (const locale of routing.locales) {
    const localePrefix = locale === defaultLocale ? "" : `/${locale}`;

    for (const page of staticPages) {
      const path = `/tnc/${page}`;
      urls.push({
        url: `${SITE_URL}${localePrefix}${path}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.3,
        alternates: makeAlternates(path),
      });
    }
  }

  return urls;
}
