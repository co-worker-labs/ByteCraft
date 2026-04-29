import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import AsciiPage from "./ascii-page";

const PATH = "/ascii";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("ascii.title"),
    description: t("ascii.description"),
  });
}

export default function AsciiRoute() {
  return <AsciiPage />;
}
