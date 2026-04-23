import { getTranslations } from "next-intl/server";
import PrivacyPage from "./privacy-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return {
    title: t("title"),
    description: "",
    keywords: "",
  };
}

export default function PrivacyRoute() {
  return <PrivacyPage />;
}
