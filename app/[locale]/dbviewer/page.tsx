import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import DbViewerPage from "./dbviewer-page";

const PATH = "/dbviewer";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("dbviewer.title"),
    description: t("dbviewer.description"),
  });
}

export default function DbViewerRoute() {
  return <DbViewerPage />;
}
