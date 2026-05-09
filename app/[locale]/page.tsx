import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../libs/seo";
import { buildToolSchemas } from "../../components/json-ld";
import HomeClient from "./home-page";

const PATH = "";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return generatePageMeta({
    locale,
    path: PATH,
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
