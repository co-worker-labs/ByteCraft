import { getTranslations } from "next-intl/server";
import PasswordPage from "./password-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("password.title"),
    description: t("password.description"),
    keywords: "",
  };
}

export default function PasswordRoute() {
  return <PasswordPage />;
}
