import { GetStaticProps } from "next";
import { useTranslation } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";

import Layout from "../../components/layout";

export default function Terms() {
  const { t } = useTranslation("terms");

  return (
    <Layout footerPosition="none" title={t("title")}>
      <section className="container mx-auto px-4 pt-3">
        <div className="text-start">
          <h1 className="text-2xl font-bold text-fg-primary">{t("title")}</h1>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-fg-primary">{t("overviewTitle")}</h3>
          <div className="text-fg-secondary">
            <p className="mt-1">{t("overviewP1")}</p>
            <p className="mt-1">{t("overviewP2")}</p>
            <p className="mt-1">{t("overviewP3")}</p>
            <p className="mt-1">{t("overviewP4")}</p>
            <p className="mt-1">{t("overviewP5")}</p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-fg-primary">{t("siteUsageTitle")}</h3>
          <div className="text-fg-secondary">
            <p className="mt-1">{t("siteUsageP1")}</p>
            <p className="mt-1">{t("siteUsageP2")}</p>
            <p className="mt-1">{t("siteUsageP3")}</p>
            <p className="mt-1">{t("siteUsageP4")}</p>
            <p className="mt-1">{t("siteUsageP5")}</p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-fg-primary">{t("generalConditionsTitle")}</h3>
          <div className="text-fg-secondary">
            <p className="mt-1">{t("generalConditionsP1")}</p>
            <p className="mt-1">{t("generalConditionsP2")}</p>
            <p className="mt-1">{t("generalConditionsP3")}</p>
            <p className="mt-1">{t("generalConditionsP4")}</p>
            <p className="mt-1">{t("generalConditionsP5")}</p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-fg-primary">{t("fairUseTitle")}</h3>
          <div className="text-fg-secondary">
            <p className="mt-1">{t("fairUseP1")}</p>
            <p className="mt-1">{t("fairUseP2")}</p>
            <ul className="list-disc list-inside mt-1">
              {(t("fairUseList1", { returnObjects: true }) as string[]).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <p className="mt-1">{t("fairUseP3")}</p>
            <ul className="list-disc list-inside mt-1">
              {(t("fairUseList2", { returnObjects: true }) as string[]).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale || "en";
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "terms"])),
    },
  };
};
