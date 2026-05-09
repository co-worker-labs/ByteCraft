import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import { buildToolSchemas } from "../../../components/json-ld";
import SshKeyPage from "./sshkey-page";

const PATH = "/sshkey";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("sshkey.title"),
    description: t("sshkey.description"),
  });
}

export default async function SshKeyRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  const ts = await getTranslations({ locale, namespace: "sshkey" });
  const schemas = buildToolSchemas({
    name: t("sshkey.title"),
    description: t("sshkey.description"),
    path: PATH,
    faqItems: [1, 2, 3, 4].map((i) => ({
      q: ts(`descriptions.faq${i}Q`),
      a: ts(`descriptions.faq${i}A`),
    })),
    howToSteps: [1, 2, 3, 4].map((i) => ({
      name: ts(`descriptions.step${i}Title`),
      text: ts(`descriptions.step${i}Desc`),
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
      <SshKeyPage />
    </>
  );
}
