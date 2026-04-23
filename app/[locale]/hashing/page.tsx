import { getTranslations } from "next-intl/server";
import HashingPage from "./hashing-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("hashing.title"),
    description: t("hashing.description"),
    keywords: "",
  };
}

export default function HashingRoute() {
  return <HashingPage />;
}
