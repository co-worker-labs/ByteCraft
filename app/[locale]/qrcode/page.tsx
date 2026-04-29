import { getTranslations } from "next-intl/server";
import QrCodePage from "./qrcode-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("qrcode.title"),
    description: t("qrcode.description"),
    keywords: "",
  };
}

export default function QrCodeRoute() {
  return <QrCodePage />;
}
