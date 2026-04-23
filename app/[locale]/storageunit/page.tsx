import { getTranslations } from "next-intl/server";
import StorageUnitPage from "./storageunit-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("storageunit.title"),
    description: t("storageunit.description"),
    keywords: "",
  };
}

export default function StorageUnitRoute() {
  return <StorageUnitPage />;
}
