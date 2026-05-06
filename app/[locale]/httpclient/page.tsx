import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import HttpClientPage from "./httpclient-page";

const PATH = "/httpclient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("httpclient.title"),
    description: t("httpclient.description"),
  });
}

export default function HttpClientRoute() {
  return <HttpClientPage />;
}
