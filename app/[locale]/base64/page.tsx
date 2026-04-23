import { getTranslations } from "next-intl/server";
import Base64Page from "./base64-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("base64.title"),
    description: t("base64.description"),
    keywords: "",
  };
}

export default function Base64Route() {
  return <Base64Page />;
}
