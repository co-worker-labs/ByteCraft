import { GetStaticProps, InferGetStaticPropsType } from "next";
import { useTranslation } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { ToolPageHeadBuilder } from "../components/head_builder";
import Layout from "../components/layout";
import {
  getLetters,
  CharacterData,
  getPunctuations,
  getCurrencies,
  getMathematical,
  getDiacritics,
  getAscii,
  getIcons,
  getPronunciations,
  PronunciationCharacterData,
} from "../libs/htmlcode";
import { findTool, ToolData } from "../libs/tools";
import { NeonTabs } from "../components/ui/tabs";

function printEntityName(code: string | undefined) {
  if (code && code.startsWith("&")) {
    return <code className="text-accent-cyan">{code}</code>;
  } else {
    return code;
  }
}

function PronunciationPrinter({
  desc,
  list,
}: {
  list: PronunciationCharacterData[];
  desc: string;
}) {
  const { t } = useTranslation("htmlcode");
  return (
    <div>
      <p className="text-fg-secondary" style={{ textIndent: "3rem", lineHeight: "2rem" }}>
        {desc}
      </p>
      <table className="w-full text-center border-collapse">
        <thead className="bg-bg-elevated sticky top-12">
          <tr className="text-xs uppercase text-fg-muted">
            <th className="py-2 px-3 border border-border-default">
              {t("tableHeaders.character")}
            </th>
            <th className="py-2 px-3 border border-border-default">
              {t("tableHeaders.entityName")}
            </th>
            <th className="py-2 px-3 border border-border-default">
              {t("tableHeaders.entityCode")}
            </th>
            <th className="py-2 px-3 border border-border-default">{t("tableHeaders.ipa")}</th>
            <th className="py-2 px-3 border border-border-default">
              {t("tableHeaders.ipaEntityName")}
            </th>
            <th className="py-2 px-3 border border-border-default">
              {t("tableHeaders.ipaEntityCode")}
            </th>
            <th className="py-2 px-3 border border-border-default">{t("tableHeaders.example")}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((data, index) => {
            return (
              <tr key={index} className="even:bg-bg-elevated/50 hover:bg-bg-elevated/80">
                <td className="py-2 px-3 border border-border-default text-sm">
                  <span dangerouslySetInnerHTML={{ __html: data.code }}></span>
                </td>
                <td className="py-2 px-3 border border-border-default text-sm">
                  {printEntityName(data.entityName)}
                </td>
                <td className="py-2 px-3 border border-border-default text-sm">{data.code}</td>
                <td className="py-2 px-3 border border-border-default text-sm">
                  {data.ipaCode ? (
                    <span dangerouslySetInnerHTML={{ __html: data.ipaCode }}></span>
                  ) : (
                    <></>
                  )}
                </td>
                <td className="py-2 px-3 border border-border-default text-sm">
                  {printEntityName(data.ipaEntityName)}
                </td>
                <td className="py-2 px-3 border border-border-default text-sm">
                  {data.ipaCode || ""}
                </td>
                <td className="py-2 px-3 border border-border-default text-sm">
                  <span dangerouslySetInnerHTML={{ __html: data.example }}></span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CharacterPrinter({ desc, list }: { list: CharacterData[]; desc: string }) {
  const { t } = useTranslation("htmlcode");
  return (
    <div>
      <p className="text-fg-secondary" style={{ textIndent: "3rem", lineHeight: "2rem" }}>
        {desc}
      </p>
      <table className="w-full text-center border-collapse">
        <thead className="bg-bg-elevated sticky top-12">
          <tr className="text-xs uppercase text-fg-muted">
            <th className="py-2 px-3 border border-border-default">
              {t("tableHeaders.character")}
            </th>
            <th className="py-2 px-3 border border-border-default">
              {t("tableHeaders.entityName")}
            </th>
            <th className="py-2 px-3 border border-border-default">
              {t("tableHeaders.entityNumber")}
            </th>
            <th className="py-2 px-3 border border-border-default">{t("tableHeaders.hexCode")}</th>
            <th className="py-2 px-3 border border-border-default">
              {t("tableHeaders.description")}
            </th>
          </tr>
        </thead>
        <tbody>
          {list.map((data, index) => {
            return (
              <tr key={index} className="even:bg-bg-elevated/50 hover:bg-bg-elevated/80">
                <td className="py-2 px-3 border border-border-default text-sm">
                  <span dangerouslySetInnerHTML={{ __html: "&#" + data.entityNumber + ";" }}></span>
                </td>
                <td className="py-2 px-3 border border-border-default text-sm">
                  {printEntityName(data.entityName)}
                </td>
                <td className="py-2 px-3 border border-border-default text-sm font-mono">
                  {"&#" + data.entityNumber + ";"}
                </td>
                <td className="py-2 px-3 border border-border-default text-sm font-mono">
                  {"&#x" + data.entityNumber.toString(16).toUpperCase() + ";"}
                </td>
                <td className="py-2 px-3 border border-border-default text-sm text-fg-secondary">
                  {data.description}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PrintLetters({ list }: { list: CharacterData[] }) {
  const { t } = useTranslation("htmlcode");
  const letters = [];
  for (var i = "A".charCodeAt(0); i <= "Z".charCodeAt(0); i++) {
    letters.push(i);
  }

  return (
    <>
      <div className="my-2 bg-bg-surface border border-border-default rounded-xl p-3">
        <div className="flex flex-wrap">
          {letters.map((code) => {
            const chr = String.fromCharCode(code);
            return (
              <a
                key={"letters-goto-" + chr}
                className="px-3 py-1 m-1 rounded-lg text-fg-primary hover:bg-bg-elevated hover:text-accent-cyan transition-colors"
                href={"#letters-" + chr}
              >
                {chr}
              </a>
            );
          })}
        </div>
      </div>
      <table className="w-full text-center border-collapse">
        <thead className="bg-bg-elevated sticky top-12">
          <tr className="text-xs uppercase text-fg-muted">
            <th className="py-2 px-3 border border-border-default">
              {t("tableHeaders.character")}
            </th>
            <th className="py-2 px-3 border border-border-default">
              {t("tableHeaders.entityName")}
            </th>
            <th className="py-2 px-3 border border-border-default">
              {t("tableHeaders.entityNumber")}
            </th>
            <th className="py-2 px-3 border border-border-default">{t("tableHeaders.hexCode")}</th>
            <th className="py-2 px-3 border border-border-default">
              {t("tableHeaders.description")}
            </th>
          </tr>
        </thead>
        <tbody>
          {list.map((data, index) => {
            const chr = String.fromCharCode(data.entityNumber);
            return (
              <tr
                key={index}
                id={chr >= "A" && chr <= "Z" ? "letters-" + chr : undefined}
                className="even:bg-bg-elevated/50 hover:bg-bg-elevated/80"
              >
                <td className="py-2 px-3 border border-border-default text-sm">{chr}</td>
                <td className="py-2 px-3 border border-border-default text-sm">
                  {printEntityName(data.entityName)}
                </td>
                <td className="py-2 px-3 border border-border-default text-sm font-mono">
                  {"&#" + data.entityNumber + ";"}
                </td>
                <td className="py-2 px-3 border border-border-default text-sm font-mono">
                  {"&#x" + data.entityNumber.toString(16).toUpperCase() + ";"}
                </td>
                <td className="py-2 px-3 border border-border-default text-sm text-fg-secondary">
                  {data.description}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function Description() {
  const { t } = useTranslation("htmlcode");
  return (
    <section id="description" className="mt-3 text-break">
      <p className="text-fg-secondary" style={{ textIndent: "3rem", lineHeight: "2rem" }}>
        {t("description.p1")}
      </p>
      <p className="text-fg-secondary" style={{ textIndent: "3rem", lineHeight: "2rem" }}>
        {t("description.p2")}
      </p>
      <div className="flex justify-start">
        <pre className="border border-border-default col-auto rounded-xl py-2 px-5 ms-md-4 bg-bg-elevated text-fg-secondary font-mono text-sm">
          &lt;meta charset=&quot;utf-8&quot; &gt;
        </pre>
      </div>
    </section>
  );
}

function HtmlCodePage({
  toolData,
  letters,
  punctuations,
  currencies,
  mathematical,
  diacritics,
  ascii,
  icons,
  pronunciations,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { t } = useTranslation(["htmlcode", "tools"]);
  return (
    <>
      <ToolPageHeadBuilder toolPath="/htmlcode" />
      <Layout title={t("tools:htmlcode.title")}>
        <div className="container mx-auto px-4 py-4">
          <Description />
          <section>
            <NeonTabs
              tabs={[
                {
                  label: <span className="font-bold">{t("tabs.letters")}</span>,
                  content: <PrintLetters list={letters} />,
                },
                {
                  label: <span className="font-bold">{t("tabs.punctuation")}</span>,
                  content: (
                    <CharacterPrinter desc={t("tabDescriptions.punctuation")} list={punctuations} />
                  ),
                },
                {
                  label: <span className="font-bold">{t("tabs.currencies")}</span>,
                  content: (
                    <CharacterPrinter desc={t("tabDescriptions.currencies")} list={currencies} />
                  ),
                },
                {
                  label: <span className="font-bold">{t("tabs.mathematical")}</span>,
                  content: (
                    <CharacterPrinter
                      desc={t("tabDescriptions.mathematical")}
                      list={mathematical}
                    />
                  ),
                },
                {
                  label: <span className="font-bold">{t("tabs.pronunciations")}</span>,
                  content: (
                    <PronunciationPrinter
                      desc={t("tabDescriptions.pronunciations")}
                      list={pronunciations}
                    />
                  ),
                },
                {
                  label: <span className="font-bold">{t("tabs.diacritics")}</span>,
                  content: (
                    <CharacterPrinter desc={t("tabDescriptions.diacritics")} list={diacritics} />
                  ),
                },
                {
                  label: <span className="font-bold">{t("tabs.ascii")}</span>,
                  content: <CharacterPrinter desc={t("tabDescriptions.ascii")} list={ascii} />,
                },
                {
                  label: <span className="font-bold">{t("tabs.icons")}</span>,
                  content: <CharacterPrinter desc={t("tabDescriptions.icons")} list={icons} />,
                },
              ]}
            />
          </section>
        </div>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale || "en";
  const path = "/htmlcode";
  const toolData: ToolData = findTool(path);
  const letters = getLetters();
  const punctuations = getPunctuations();
  const currencies = getCurrencies();
  const mathematical = getMathematical();
  const diacritics = getDiacritics();
  const ascii = getAscii();
  const icons = getIcons();
  const pronunciations = getPronunciations();
  return {
    props: {
      toolData,
      letters,
      punctuations,
      currencies,
      mathematical,
      diacritics,
      ascii,
      icons,
      pronunciations,
      ...(await serverSideTranslations(locale, ["common", "htmlcode", "tools"])),
    },
  };
};

export default HtmlCodePage;
