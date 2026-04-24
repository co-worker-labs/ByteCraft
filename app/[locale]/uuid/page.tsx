import { getTranslations } from "next-intl/server";
import UuidPage from "./uuid-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("uuid.title"),
    description: t("uuid.description"),
    keywords: "",
  };
}

export default function UuidRoute() {
  return <UuidPage />;
}
