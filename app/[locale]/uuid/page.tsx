import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import UuidPage from "./uuid-page";

const PATH = "/uuid";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("uuid.title"),
    description: t("uuid.description"),
  });
}

export default function UuidRoute() {
  return <UuidPage />;
}
