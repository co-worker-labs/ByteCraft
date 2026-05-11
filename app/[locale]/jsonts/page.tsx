import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOL_CATEGORIES, CATEGORY_SLUGS, TOOLS } from "../../../libs/tools";
import JsontsPage from "./jsonts-page";

const PATH = "/jsonts";
const TOOL_KEY = "jsonts";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("jsonts.title"),
    description: t("jsonts.description"),
    ogImage: { title: t("jsonts.shortTitle"), emoji: tool.emoji, desc: t("jsonts.description") },
  });
}

export default async function JsontsRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "jsonts" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = Array.from({ length: 3 }, (_, i) => ({
    name: tx(`descriptions.step${i + 1}Title`),
    text: tx(`descriptions.step${i + 1}Text`),
  })).filter((step) => step.name);
  const schemas = buildToolSchemas({
    name: t("jsonts.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("jsonts.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems: [1, 2, 3].map((i) => ({
      q: tx(`descriptions.faq${i}Q`),
      a: tx(`descriptions.faq${i}A`),
    })),
    howToSteps,
    sameAs: tool.sameAs,
  });

  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
      <JsontsPage />
    </>
  );
}
