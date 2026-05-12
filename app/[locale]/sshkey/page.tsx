import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import { TOOLS, TOOL_CATEGORIES, CATEGORY_SLUGS } from "../../../libs/tools";
import SshKeyPage from "./sshkey-page";

const PATH = "/sshkey";
const TOOL_KEY = "sshkey";
const tool = TOOLS.find((t) => t.key === TOOL_KEY)!;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("sshkey.title"),
    description: t("sshkey.description"),
    ogImage: { type: "tool", key: TOOL_KEY },
  });
}

export default async function SshKeyRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const ts = await getTranslations({ locale, namespace: "sshkey" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const category = TOOL_CATEGORIES.find((c) => c.tools.includes(TOOL_KEY))!;
  const categorySlug = CATEGORY_SLUGS[category.key];
  const howToSteps = [1, 2, 3, 4].map((i) => ({
    name: ts(`descriptions.step${i}Title`),
    text: ts(`descriptions.step${i}Desc`),
  }));
  const schemas = buildToolSchemas({
    name: t("sshkey.title"),
    description: ts.has("descriptions.aeoDefinition")
      ? ts("descriptions.aeoDefinition")
      : t("sshkey.description"),
    path: PATH,
    categoryName: tc(`${category.key}.shortTitle`),
    categoryPath: `/${categorySlug}`,
    faqItems: [1, 2, 3, 4].map((i) => ({
      q: ts(`descriptions.faq${i}Q`),
      a: ts(`descriptions.faq${i}A`),
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
      <SshKeyPage />
    </>
  );
}
