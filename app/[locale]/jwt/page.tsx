import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import JwtPage from "./jwt-page";

const PATH = "/jwt";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("jwt.title"),
    description: t("jwt.description"),
  });
}

export default function JwtRoute() {
  return <JwtPage />;
}
