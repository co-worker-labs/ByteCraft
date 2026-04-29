import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import DiffPage from "./diff-page";

const PATH = "/diff";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("diff.title"),
    description: t("diff.description"),
  });
}

export default function DiffRoute() {
  return <DiffPage />;
}
