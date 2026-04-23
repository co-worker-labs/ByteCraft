"use client";

import { useTranslations } from "next-intl";
import Layout from "../../../../components/layout";

function tList(t: ReturnType<typeof useTranslations>, key: string): string[] {
   
  return (t as any)(key, { returnObjects: true }) as string[];
}

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  return (
    <Layout footerPosition="none" title={t("title")}>
      <section className="container mx-auto px-4 pt-3 text-break">
        <div className="text-start">
          <h1 className="text-2xl font-bold text-fg-primary">{t("title")}</h1>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-fg-primary">{t("privacyStatementTitle")}</h3>
          <div className="text-fg-secondary">
            <p className="mt-1">{t("privacyStatementP1")}</p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-fg-primary">{t("personalInfoTitle")}</h3>
          <div className="text-fg-secondary">
            <p className="mt-1">{t("personalInfoP1")}</p>
            <p className="mt-1">{t("personalInfoP2")}</p>
            <ul className="list-disc list-inside mt-1">
              {tList(t, "personalInfoList1").map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-1">{t("personalInfoP3")}</p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-fg-primary">{t("personalUserInfoTitle")}</h3>
          <div className="text-fg-secondary">
            <p className="mt-1">{t("personalUserInfoP1")}</p>
            <p className="mt-1">{t("personalUserInfoP2")}</p>
            <p className="mt-1">{t("personalUserInfoP3")}</p>
            <ul className="list-disc list-inside mt-1">
              {tList(t, "personalUserInfoList1").map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <p className="mt-1">{t("personalUserInfoP4")}</p>
            <p className="mt-1">{t("personalUserInfoP5")}</p>
            <ul className="list-disc list-inside mt-1">
              {tList(t, "personalUserInfoList2").map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-fg-primary">{t("sharingTitle")}</h3>
          <div className="text-fg-secondary">
            <p className="mt-1">{t("sharingP1")}</p>
            <p className="mt-1">{t("sharingP2")}</p>
            <p className="mt-1">{t("sharingP3")}</p>
            <p className="mt-1">{t("sharingP4")}</p>
            <p className="mt-1">{t("sharingP5")}</p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-fg-primary">{t("advertisingTitle")}</h3>
          <div className="text-fg-secondary">
            <p className="mt-1">{t("advertisingP1")}</p>
            <p className="mt-1">{t("advertisingP2")}</p>
            <ul className="list-disc list-inside mt-1">
              {tList(t, "advertisingList").map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <p className="mt-1">{t("advertisingP3")}</p>
            <p className="mt-1">{t("advertisingP4")}</p>
            <p className="mt-1">{t("advertisingP5")}</p>
            <p>
              <span className="font-bold">{t("advertisingNote")}</span>
            </p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-fg-primary">{t("doNotTrackTitle")}</h3>
          <div className="text-fg-secondary">{t("doNotTrackP1")}</div>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-fg-primary">{t("yourRightsTitle")}</h3>
          <div className="text-fg-secondary">
            <p className="mt-1">{t("yourRightsP1")}</p>
            <p className="mt-1">{t("yourRightsP2")}</p>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-fg-primary">{t("dataRetentionTitle")}</h3>
          <div className="text-fg-secondary">
            <p className="mt-1">{t("dataRetentionP1")}</p>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-fg-primary">{t("changesTitle")}</h3>
          <div className="text-fg-secondary">
            <p className="mt-1">{t("changesP1")}</p>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-fg-primary">{t("googleDriveTitle")}</h3>
          <div className="text-fg-secondary">
            <p className="mt-1">{t("googleDriveP1")}</p>
            <p className="mt-1">{t("googleDriveP2")}</p>
            <ul className="list-disc list-inside mt-1">
              {tList(t, "googleDriveList").map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-1">{t("googleDriveP3")}</p>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-fg-primary">{t("linksTitle")}</h3>
          <div className="text-fg-secondary">
            <p className="mt-1">{t("linksP1")}</p>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-fg-primary">{t("contactTitle")}</h3>
          <div className="text-fg-secondary">
            <p className="mt-1">{t("contactP1")}</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
