import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import PasswordPage from "./password-page";

const PATH = "/password";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("password.title"),
    description: t("password.description"),
  });
}

export default async function PasswordRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const tp = await getTranslations({ locale, namespace: "password" });
  const schemas = buildToolSchemas({
    name: t("password.title"),
    description: t("password.description"),
    path: PATH,
    faqItems: [1, 2, 3, 4, 5].map((i) => ({
      q: tp(`descriptions.faq${i}Q`),
      a: tp(`descriptions.faq${i}A`),
    })),
    howToSteps: [1, 2, 3, 4, 5].map((i) => ({
      name: tp(`descriptions.step${i}Title`),
      text: tp(`descriptions.step${i}Desc`),
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
      <PasswordPage />
    </>
  );
}
