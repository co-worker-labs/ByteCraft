import { getTranslations } from "next-intl/server";
import HomePage from "./home-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: t("title"),
    description: t("metaDescription"),
    keywords: "",
  };
}

export default function HomeRoute() {
  return <HomePage />;
}
