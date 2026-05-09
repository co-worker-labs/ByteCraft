import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import Base64Page from "./base64-page";

const PATH = "/base64";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("base64.title"),
    description: t("base64.description"),
  });
}

export default async function Base64Route({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tb = await getTranslations({ locale, namespace: "base64" });
  const schemas = buildToolSchemas({
    name: t("base64.title"),
    description: t("base64.description"),
    path: PATH,
    howToSteps: [1, 2, 3, 4].map((i) => ({
      name: tb(`descriptions.howStep${i}`),
      text: tb(`descriptions.howStep${i}`),
    })),
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
      <Base64Page />
    </>
  );
}
