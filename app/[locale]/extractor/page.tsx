import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import ExtractorPage from "./extractor-page";

const PATH = "/extractor";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("extractor.title"),
    description: t("extractor.description"),
  });
}

export default function ExtractorRoute() {
  return <ExtractorPage />;
}
