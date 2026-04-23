"use client";

import { useTranslations } from "next-intl";
import Layout from "../../../../components/layout";

function tList(t: ReturnType<typeof useTranslations>, key: string): string[] {
  return t.raw(key) as string[];
}

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  const navItems = [
    { id: "privacy-statement", label: t("privacyStatementTitle") },
    { id: "personal-info", label: t("personalInfoTitle") },
    { id: "personal-user-info", label: t("personalUserInfoTitle") },
    { id: "sharing", label: t("sharingTitle") },
    { id: "advertising", label: t("advertisingTitle") },
    { id: "do-not-track", label: t("doNotTrackTitle") },
    { id: "your-rights", label: t("yourRightsTitle") },
    { id: "data-retention", label: t("dataRetentionTitle") },
    { id: "changes", label: t("changesTitle") },
    { id: "google-drive", label: t("googleDriveTitle") },
    { id: "links", label: t("linksTitle") },
    { id: "contact", label: t("contactTitle") },
  ];

  return (
    <Layout footerPosition="none" title={t("title")}>
      <section className="relative overflow-hidden bg-gradient-to-b from-bg-base via-bg-base to-bg-surface">
        <div className="bg-grid-pattern absolute inset-0" />
        <div
          className="pointer-events-none absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[200px] w-[400px] rounded-full bg-accent-cyan/5 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative container mx-auto px-6 py-10 md:py-14">
          <h1 className="text-2xl md:text-3xl font-bold text-fg-primary tracking-tight">
            {t("title")}
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="h-px w-12 bg-gradient-to-r from-accent-cyan/40 to-transparent" />
            <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan/60" />
          </div>
          <nav className="mt-6 flex flex-wrap gap-2">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-xs px-2.5 py-1 rounded-full border border-border-default text-fg-muted hover:text-accent-cyan hover:border-accent-cyan/30 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 space-y-6 break-words">
        <div id="privacy-statement" className="scroll-mt-6">
          <div className="border-l-2 border-accent-cyan pl-3 mb-3">
            <h3 className="text-lg font-semibold text-fg-primary">{t("privacyStatementTitle")}</h3>
          </div>
          <div className="text-fg-secondary leading-relaxed text-justify space-y-3">
            <p>{t("privacyStatementP1")}</p>
          </div>
        </div>

        <div id="personal-info" className="scroll-mt-6">
          <div className="border-l-2 border-accent-cyan pl-3 mb-3">
            <h3 className="text-lg font-semibold text-fg-primary">{t("personalInfoTitle")}</h3>
          </div>
          <div className="text-fg-secondary leading-relaxed text-justify space-y-3">
            <p>{t("personalInfoP1")}</p>
            <p>{t("personalInfoP2")}</p>
            <ul className="list-disc list-outside ml-5 space-y-1.5">
              {tList(t, "personalInfoList1").map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>{t("personalInfoP3")}</p>
          </div>
        </div>

        <div id="personal-user-info" className="scroll-mt-6">
          <div className="border-l-2 border-accent-cyan pl-3 mb-3">
            <h3 className="text-lg font-semibold text-fg-primary">{t("personalUserInfoTitle")}</h3>
          </div>
          <div className="text-fg-secondary leading-relaxed text-justify space-y-3">
            <p>{t("personalUserInfoP1")}</p>
            <p>{t("personalUserInfoP2")}</p>
            <p>{t("personalUserInfoP3")}</p>
            <ul className="list-disc list-outside ml-5 space-y-1.5">
              {tList(t, "personalUserInfoList1").map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>{t("personalUserInfoP4")}</p>
            <p>{t("personalUserInfoP5")}</p>
            <ul className="list-disc list-outside ml-5 space-y-1.5">
              {tList(t, "personalUserInfoList2").map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div id="sharing" className="scroll-mt-6">
          <div className="border-l-2 border-accent-cyan pl-3 mb-3">
            <h3 className="text-lg font-semibold text-fg-primary">{t("sharingTitle")}</h3>
          </div>
          <div className="text-fg-secondary leading-relaxed text-justify space-y-3">
            <p>{t("sharingP1")}</p>
            <p>{t("sharingP2")}</p>
            <p>{t("sharingP3")}</p>
            <p>{t("sharingP4")}</p>
            <p>{t("sharingP5")}</p>
          </div>
        </div>

        <div id="advertising" className="scroll-mt-6">
          <div className="border-l-2 border-accent-cyan pl-3 mb-3">
            <h3 className="text-lg font-semibold text-fg-primary">{t("advertisingTitle")}</h3>
          </div>
          <div className="text-fg-secondary leading-relaxed text-justify space-y-3">
            <p>{t("advertisingP1")}</p>
            <p>{t("advertisingP2")}</p>
            <ul className="list-disc list-outside ml-5 space-y-1.5">
              {tList(t, "advertisingList").map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>{t("advertisingP3")}</p>
            <p>{t("advertisingP4")}</p>
            <p>{t("advertisingP5")}</p>
            <div className="flex items-start gap-2 border-l-2 border-accent-purple bg-accent-purple-dim/30 rounded-r-lg p-3">
              <span className="font-semibold text-fg-primary text-sm">{t("advertisingNote")}</span>
            </div>
          </div>
        </div>

        <div id="do-not-track" className="scroll-mt-6">
          <div className="border-l-2 border-accent-cyan pl-3 mb-3">
            <h3 className="text-lg font-semibold text-fg-primary">{t("doNotTrackTitle")}</h3>
          </div>
          <div className="text-fg-secondary leading-relaxed text-justify">{t("doNotTrackP1")}</div>
        </div>

        <div id="your-rights" className="scroll-mt-6">
          <div className="border-l-2 border-accent-cyan pl-3 mb-3">
            <h3 className="text-lg font-semibold text-fg-primary">{t("yourRightsTitle")}</h3>
          </div>
          <div className="text-fg-secondary leading-relaxed text-justify space-y-3">
            <p>{t("yourRightsP1")}</p>
            <p>{t("yourRightsP2")}</p>
          </div>
        </div>

        <div id="data-retention" className="scroll-mt-6">
          <div className="border-l-2 border-accent-cyan pl-3 mb-3">
            <h3 className="text-lg font-semibold text-fg-primary">{t("dataRetentionTitle")}</h3>
          </div>
          <div className="text-fg-secondary leading-relaxed text-justify space-y-3">
            <p>{t("dataRetentionP1")}</p>
          </div>
        </div>

        <div id="changes" className="scroll-mt-6">
          <div className="border-l-2 border-accent-cyan pl-3 mb-3">
            <h3 className="text-lg font-semibold text-fg-primary">{t("changesTitle")}</h3>
          </div>
          <div className="text-fg-secondary leading-relaxed text-justify space-y-3">
            <p>{t("changesP1")}</p>
          </div>
        </div>

        <div id="google-drive" className="scroll-mt-6">
          <div className="border-l-2 border-accent-cyan pl-3 mb-3">
            <h3 className="text-lg font-semibold text-fg-primary">{t("googleDriveTitle")}</h3>
          </div>
          <div className="text-fg-secondary leading-relaxed text-justify space-y-3">
            <p>{t("googleDriveP1")}</p>
            <p>{t("googleDriveP2")}</p>
            <ul className="list-disc list-outside ml-5 space-y-1.5">
              {tList(t, "googleDriveList").map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>{t("googleDriveP3")}</p>
          </div>
        </div>

        <div id="links" className="scroll-mt-6">
          <div className="border-l-2 border-accent-cyan pl-3 mb-3">
            <h3 className="text-lg font-semibold text-fg-primary">{t("linksTitle")}</h3>
          </div>
          <div className="text-fg-secondary leading-relaxed text-justify space-y-3">
            <p>{t("linksP1")}</p>
          </div>
        </div>

        <div id="contact" className="scroll-mt-6">
          <div className="border-l-2 border-accent-cyan pl-3 mb-3">
            <h3 className="text-lg font-semibold text-fg-primary">{t("contactTitle")}</h3>
          </div>
          <div className="text-fg-secondary leading-relaxed text-justify space-y-3">
            <p>{t("contactP1")}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4 pb-8">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-accent-cyan/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan/60" />
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-accent-cyan/40" />
        </div>
      </section>
    </Layout>
  );
}
