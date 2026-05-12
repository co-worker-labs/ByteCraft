import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import PasswordPage from "./password-page";

const PATH = "/password";
const TOOL_KEY = "password";
const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("password.title"),
    description: t("password.description"),
    ogImage: { type: "tool", key: TOOL_KEY },
  });
}

export default async function PasswordRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tp = await getTranslations({ locale, namespace: "password" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = [1, 2, 3, 4, 5].map((i) => ({
    name: tp(`descriptions.step${i}Title`),
    text: tp(`descriptions.step${i}Desc`),
  }));
  const schemas = buildToolSchemas({
    name: t("password.title"),
    description: tp.has("descriptions.aeoDefinition")
      ? tp("descriptions.aeoDefinition")
      : t("password.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems: [1, 2, 3].map((i) => ({
      q: tp(`descriptions.faq${i}Q`),
      a: tp(`descriptions.faq${i}A`),
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
      <PasswordPage />
    </>
  );
}
