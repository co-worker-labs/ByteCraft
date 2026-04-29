import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import JsonPage from "./json-page";

const PATH = "/json";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("json.title"),
    description: t("json.description"),
  });
}

export default function JsonRoute() {
  return <JsonPage />;
}
