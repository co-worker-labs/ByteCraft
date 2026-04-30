import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import YamlPage from "./yaml-page";

const PATH = "/yaml";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("yaml.title"),
    description: t("yaml.description"),
  });
}

export default function YamlRoute() {
  return <YamlPage />;
}
