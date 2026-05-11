import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import HttpStatusPage from "./httpstatus-page";

const PATH = "/httpstatus";
const TOOL_KEY = "httpstatus";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("httpstatus.title"),
    description: t("httpstatus.description"),
    ogImage: {
      title: t("httpstatus.shortTitle"),
      emoji: tool.emoji,
      desc: t("httpstatus.description"),
    },
  });
}

export default async function HttpStatusRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tx = await getTranslations({ locale, namespace: "httpstatus" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

  const faqCount = 3;
  const faqItems = Array.from({ length: faqCount }, (_, i) => {
    const qKey = `descriptions.faq${i + 1}Q`;
    return tx.has(qKey) ? { q: tx(qKey), a: tx(`descriptions.faq${i + 1}A`) } : null;
  }).filter((item): item is { q: string; a: string } => item !== null);

  const howToStepCount = 3;
  const howToSteps = Array.from({ length: howToStepCount }, (_, i) => {
    const nameKey = `descriptions.step${i + 1}Title`;
    return tx.has(nameKey)
      ? {
          name: tx(nameKey),
          text: tx.has(`descriptions.step${i + 1}Text`) ? tx(`descriptions.step${i + 1}Text`) : "",
        }
      : null;
  }).filter((step): step is { name: string; text: string } => step !== null);

  const schemas = buildToolSchemas({
    name: t("httpstatus.title"),
    description: tx.has("descriptions.aeoDefinition")
      ? tx("descriptions.aeoDefinition")
      : t("httpstatus.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems,
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
      <HttpStatusPage />
    </>
  );
}
