import type { ReactNode } from "react";
import type { Viewport } from "next";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { routing } from "../../i18n/routing";
import { Providers } from "../providers";
import { COOKIE_KEYS } from "../../libs/storage-keys";
import type { Theme } from "../../libs/theme";
import { SITE_URL } from "../../libs/site";
import { SerwistProvider } from "../serwist";
import { IOSSplashLinks } from "../../components/ios-splash-links";
import { WebsiteJsonLd, buildOrganizationSchema } from "../../components/json-ld";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("title"),
      template: "%s | OmniKit",
    },
    alternates: {
      languages: {
        "x-default": SITE_URL + "/",
        ...Object.fromEntries(
          routing.locales.map((loc) => {
            const prefix = loc === routing.defaultLocale ? "" : `/${loc}`;
            return [loc, SITE_URL + prefix + "/"];
          })
        ),
      },
    },
    icons: {
      icon: { url: "/favicon.svg", type: "image/svg+xml" },
      apple: "/icons/apple-touch-icon.png",
    },
    manifest: `/${locale}/manifest.webmanifest`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "OmniKit",
    },
    other: {
      "mobile-web-app-capable": "yes",
    },
    openGraph: {
      siteName: "OmniKit",
      images: [
        {
          url: "/api/og?title=OmniKit&icon=🛠&desc=Free+online+developer+tools",
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f1a" },
  ],
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const [messages, cookieStore] = await Promise.all([getMessages(), cookies()]);
  const themeCookie = cookieStore.get(COOKIE_KEYS.theme)?.value;
  const initialTheme: Theme = themeCookie === "dark" ? "dark" : "light";

  return (
    <>
      <IOSSplashLinks />
      <WebsiteJsonLd />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationSchema()) }}
      />
      <NextIntlClientProvider messages={messages}>
        <Providers initialTheme={initialTheme}>
          <SerwistProvider swUrl="/serwist/sw.js">{children}</SerwistProvider>
        </Providers>
      </NextIntlClientProvider>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
