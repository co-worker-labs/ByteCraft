import { getTranslations } from "next-intl/server";
import AsciiPage from "./ascii-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("ascii.title"),
    description: t("ascii.description"),
    keywords: "",
  };
}

export default function AsciiRoute() {
  return <AsciiPage />;
}
