import { getTranslations } from "next-intl/server";
import HtmlCodePage from "./htmlcode-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("htmlcode.title"),
    description: t("htmlcode.description"),
    keywords: "",
  };
}

export default function HtmlCodeRoute() {
  return <HtmlCodePage />;
}
