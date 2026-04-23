"use client";

import { useTranslations } from "next-intl";
import Layout from "../../../../components/layout";

function tList(t: ReturnType<typeof useTranslations>, key: string): string[] {
  return t.raw(key) as string[];
}

export default function TermsPage() {
  const t = useTranslations("terms");

  const navItems = [
    { id: "overview", label: t("overviewTitle") },
    { id: "acceptance", label: t("acceptanceTitle") },
    { id: "services", label: t("servicesTitle") },
    { id: "conduct", label: t("conductTitle") },
    { id: "ip", label: t("ipTitle") },
    { id: "advertising", label: t("advertisingTitle") },
    { id: "disclaimer", label: t("disclaimerTitle") },
    { id: "changes", label: t("changesTitle") },
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
          <p className="mt-2 text-sm text-fg-muted">{t("lastUpdated")}</p>
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

      <section className="container mx-auto px-4 py-8 space-y-6">
        <div id="overview" className="scroll-mt-6">
          <div className="border-l-2 border-accent-cyan pl-3 mb-3">
            <h3 className="text-lg font-semibold text-fg-primary">{t("overviewTitle")}</h3>
          </div>
          <div className="text-fg-secondary leading-relaxed text-justify space-y-3">
            <p>{t("overviewP1")}</p>
            <p>{t("overviewP2")}</p>
          </div>
        </div>

        <div id="acceptance" className="scroll-mt-6">
          <div className="border-l-2 border-accent-cyan pl-3 mb-3">
            <h3 className="text-lg font-semibold text-fg-primary">{t("acceptanceTitle")}</h3>
          </div>
          <div className="text-fg-secondary leading-relaxed text-justify space-y-3">
            <p>{t("acceptanceP1")}</p>
            <p>{t("acceptanceP2")}</p>
          </div>
        </div>

        <div id="services" className="scroll-mt-6">
          <div className="border-l-2 border-accent-cyan pl-3 mb-3">
            <h3 className="text-lg font-semibold text-fg-primary">{t("servicesTitle")}</h3>
          </div>
          <div className="text-fg-secondary leading-relaxed text-justify space-y-3">
            <p>{t("servicesP1")}</p>
            <ul className="list-disc list-outside ml-5 space-y-1.5">
              {tList(t, "servicesList1").map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>{t("servicesP2")}</p>
          </div>
        </div>

        <div id="conduct" className="scroll-mt-6">
          <div className="border-l-2 border-accent-cyan pl-3 mb-3">
            <h3 className="text-lg font-semibold text-fg-primary">{t("conductTitle")}</h3>
          </div>
          <div className="text-fg-secondary leading-relaxed text-justify space-y-3">
            <p>{t("conductP1")}</p>
            <ul className="list-disc list-outside ml-5 space-y-1.5">
              {tList(t, "conductList1").map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>{t("conductP2")}</p>
          </div>
        </div>

        <div id="ip" className="scroll-mt-6">
          <div className="border-l-2 border-accent-cyan pl-3 mb-3">
            <h3 className="text-lg font-semibold text-fg-primary">{t("ipTitle")}</h3>
          </div>
          <div className="text-fg-secondary leading-relaxed text-justify space-y-3">
            <p>{t("ipP1")}</p>
            <p>{t("ipP2")}</p>
          </div>
        </div>

        <div id="advertising" className="scroll-mt-6">
          <div className="border-l-2 border-accent-cyan pl-3 mb-3">
            <h3 className="text-lg font-semibold text-fg-primary">{t("advertisingTitle")}</h3>
          </div>
          <div className="text-fg-secondary leading-relaxed text-justify space-y-3">
            <p>{t("advertisingP1")}</p>
            <p>{t("advertisingP2")}</p>
            <p>{t("advertisingP3")}</p>
          </div>
        </div>

        <div id="disclaimer" className="scroll-mt-6">
          <div className="border-l-2 border-accent-cyan pl-3 mb-3">
            <h3 className="text-lg font-semibold text-fg-primary">{t("disclaimerTitle")}</h3>
          </div>
          <div className="text-fg-secondary leading-relaxed text-justify space-y-3">
            <p>{t("disclaimerP1")}</p>
            <p>{t("disclaimerP2")}</p>
            <p>{t("disclaimerP3")}</p>
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
