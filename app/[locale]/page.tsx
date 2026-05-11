import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../libs/seo";
import { buildToolSchemas } from "../../components/json-ld";
import { SITE_URL } from "../../libs/site";
import HomeClient from "./home-page";

const PATH = "";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("title"),
    description: t("metaDescription"),
  });
}

export default async function HomeRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  const schemas = buildToolSchemas({
    name: "OmniKit",
    description: t("metaDescription"),
    path: "/",
    faqItems: [1, 2, 3, 4].map((i) => ({
      q: t(`faq${i}Q`),
      a: t(`faq${i}A`),
    })),
  });

  schemas.push({
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: SITE_URL,
    mainEntity: {
      "@type": "WebApplication",
      name: "OmniKit",
      url: SITE_URL,
      description: t("metaDescription"),
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  });

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <HomeClient />
    </>
  );
}
