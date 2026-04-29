import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import HashingPage from "./hashing-page";

const PATH = "/hashing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("hashing.title"),
    description: t("hashing.description"),
  });
}

export default function HashingRoute() {
  return <HashingPage />;
}
