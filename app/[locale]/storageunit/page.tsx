import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import StorageUnitPage from "./storageunit-page";

const PATH = "/storageunit";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("storageunit.title"),
    description: t("storageunit.description"),
  });
}

export default function StorageUnitRoute() {
  return <StorageUnitPage />;
}
