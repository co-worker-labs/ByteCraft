import { getTranslations } from "next-intl/server";
import CipherPage from "./cipher-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("cipher.title"),
    description: t("cipher.description"),
    keywords: "",
  };
}

export default function CipherRoute() {
  return <CipherPage />;
}
