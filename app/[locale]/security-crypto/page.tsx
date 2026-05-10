import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildCategorySchema } from "../../../components/json-ld";
import { TOOL_CATEGORIES, TOOLS } from "../../../libs/tools";
import { SITE_URL } from "../../../libs/site";
import CategoryPage from "../../../components/category-page";

const CATEGORY_KEY = "security" as const;
const PATH = "/security-crypto";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "categories" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t(`${CATEGORY_KEY}.title`),
    description: t(`${CATEGORY_KEY}.description`),
  });
}

export default async function SecurityCryptoRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tc = await getTranslations({ locale, namespace: "categories" });

  const categoryTools = TOOL_CATEGORIES.find((c) => c.key === CATEGORY_KEY)!;
  const toolSchemas = categoryTools.tools.map((key) => ({
    name: t(`${key}.shortTitle`),
    url: `${SITE_URL}/${TOOLS.find((tool) => tool.key === key)!.path}`,
  }));

  const schemas = buildCategorySchema({
    name: tc(`${CATEGORY_KEY}.shortTitle`),
    description: tc(`${CATEGORY_KEY}.description`),
    path: PATH,
    tools: toolSchemas,
    faqItems: [1, 2, 3]
      .map((i) =>
        tc.has(`${CATEGORY_KEY}.faq${i}Q`)
          ? { q: tc(`${CATEGORY_KEY}.faq${i}Q`), a: tc(`${CATEGORY_KEY}.faq${i}A`) }
          : null
      )
      .filter(Boolean) as { q: string; a: string }[],
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
      <CategoryPage categoryKey={CATEGORY_KEY} />
    </>
  );
}
