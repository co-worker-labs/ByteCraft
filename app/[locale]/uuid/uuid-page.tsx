"use client";

import Layout from "../../../components/layout";
import { useTranslations } from "next-intl";

export default function UuidPage() {
  const t = useTranslations("uuid");
  return (
    <Layout title={t("shortTitle")}>
      <div className="container mx-auto px-4 py-6">
        <p className="text-fg-muted">UUID Generator (under construction)</p>
      </div>
    </Layout>
  );
}
