import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import CronPage from "./cron-page";

const PATH = "/cron";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("cron.title"),
    description: t("cron.description"),
  });
}

export default function CronRoute() {
  return <CronPage />;
}
