import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import ChecksumPage from "./checksum-page";

const PATH = "/checksum";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("checksum.title"),
    description: t("checksum.description"),
  });
}

export default function ChecksumRoute() {
  return <ChecksumPage />;
}
