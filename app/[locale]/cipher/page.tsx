import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import CipherPage from "./cipher-page";

const PATH = "/cipher";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("cipher.title"),
    description: t("cipher.description"),
  });
}

export default function CipherRoute() {
  return <CipherPage />;
}
