import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import UnixtimePage from "./unixtime-page";

const PATH = "/unixtime";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("unixtime.title"),
    description: t("unixtime.description"),
  });
}

export default function UnixtimeRoute() {
  return <UnixtimePage />;
}
