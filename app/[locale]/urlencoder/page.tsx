import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import UrlencoderPage from "./urlencoder-page";

const PATH = "/urlencoder";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("urlencoder.title"),
    description: t("urlencoder.description"),
  });
}

export default function UrlencoderRoute() {
  return <UrlencoderPage />;
}
