import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import QrCodePage from "./qrcode-page";

const PATH = "/qrcode";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("qrcode.title"),
    description: t("qrcode.description"),
  });
}

export default function QrCodeRoute() {
  return <QrCodePage />;
}
