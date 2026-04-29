import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import Base64Page from "./base64-page";

const PATH = "/base64";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("base64.title"),
    description: t("base64.description"),
  });
}

export default function Base64Route() {
  return <Base64Page />;
}
