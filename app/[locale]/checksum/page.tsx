import { getTranslations } from "next-intl/server";
import ChecksumPage from "./checksum-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("checksum.title"),
    description: t("checksum.description"),
    keywords: "",
  };
}

export default function ChecksumRoute() {
  return <ChecksumPage />;
}
