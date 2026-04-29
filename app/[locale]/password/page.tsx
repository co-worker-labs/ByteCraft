import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import PasswordPage from "./password-page";

const PATH = "/password";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("password.title"),
    description: t("password.description"),
  });
}

export default function PasswordRoute() {
  return <PasswordPage />;
}
