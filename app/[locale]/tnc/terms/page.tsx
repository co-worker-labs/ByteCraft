import { getTranslations } from "next-intl/server";
import TermsPage from "./terms-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return {
    title: t("title"),
    description: "",
    keywords: "",
  };
}

export default function TermsRoute() {
  return <TermsPage />;
}
