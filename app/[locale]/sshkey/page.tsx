import { getTranslations } from "next-intl/server";
import { generatePageMeta } from "../../../libs/seo";
import SshKeyPage from "./sshkey-page";

const PATH = "/sshkey";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return generatePageMeta({
    locale,
    path: PATH,
    title: t("sshkey.title"),
    description: t("sshkey.description"),
  });
}

export default function SshKeyRoute() {
  return <SshKeyPage />;
}
