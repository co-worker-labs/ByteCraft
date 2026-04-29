import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import HtmlCodePage from "./htmlcode-page";

const PATH = "/htmlcode";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("htmlcode.title"),
    description: t("htmlcode.description"),
  });
}

export default function HtmlCodeRoute() {
  return <HtmlCodePage />;
}
