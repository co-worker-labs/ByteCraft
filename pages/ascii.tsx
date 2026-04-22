import { GetStaticProps, InferGetStaticPropsType } from "next";
import { useTranslation } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { ToolPageHeadBuilder } from "../components/head_builder";
import Layout from "../components/layout";
import { ControlCode, getControlCodes, getPrintableCharacters } from "../libs/ascii";
import { findTool, ToolData } from "../libs/tools";
import { NeonTabs } from "../components/ui/tabs";

function beautyPrint(
  code: number,
  radix: number,
  perLen: number,
  minLen: number,
  fillChar: string
) {
  let str = code.toString(radix);
  const fillCount = str.length % perLen;
  if (fillCount > 0) {
    let prefix = "";
    for (var i = 0; i < perLen - fillCount; i++) {
      prefix += fillChar;
    }
    str = prefix + str;
  }
  if (str.length < minLen) {
    for (var i = 0; i < minLen - str.length; i++) {
      str = fillChar + str;
    }
  }
  const divided = str.length / perLen;
  if (divided == 1) {
    return str;
  } else {
    const result: string[] = [];
    for (var i = 0; i < divided; i++) {
      const start = i * divided;
      result.push(str.substring(start, start + perLen));
    }
    return (
      <>
        {result.map((data, index) => {
          if (index == result.length - 1) {
            return (
              <span key={code + "_" + radix + "_" + index} className="text-accent-cyan">
                {data}
              </span>
            );
          } else {
            return <span key={code + "_" + radix + "_" + index}>{data}&nbsp;&nbsp;</span>;
          }
        })}
      </>
    );
  }
}

function ControlCodeChart({ list }: { list: ControlCode[] }) {
  const { t } = useTranslation("ascii");
  return (
    <table className="w-full text-center border-collapse">
      <thead className="bg-bg-elevated sticky top-12">
        <tr className="text-xs uppercase text-fg-muted">
          <th className="py-2 px-3 border border-border-default">{t("tableHeaders.decimal")}</th>
          <th className="py-2 px-3 border border-border-default">{t("tableHeaders.binary")}</th>
          <th className="py-2 px-3 border border-border-default">{t("tableHeaders.oct")}</th>
          <th className="py-2 px-3 border border-border-default">{t("tableHeaders.hex")}</th>
          <th className="py-2 px-3 border border-border-default">{t("tableHeaders.abbr")}</th>
          <th className="py-2 px-3 border border-border-default">{t("tableHeaders.desc")}</th>
        </tr>
      </thead>
      <tbody>
        {list.map((data) => {
          return (
            <tr key={data.code} className="even:bg-bg-elevated/50 hover:bg-bg-elevated/80">
              <td className="py-2 px-3 border border-border-default text-sm">{data.code}</td>
              <td className="py-2 px-3 border border-border-default text-sm font-mono">
                {beautyPrint(data.code, 2, 4, 8, "0")}
              </td>
              <td className="py-2 px-3 border border-border-default text-sm font-mono">
                {beautyPrint(data.code, 8, 3, 3, "0")}
              </td>
              <td className="py-2 px-3 border border-border-default text-sm font-mono uppercase">
                {beautyPrint(data.code, 16, 2, 2, "0")}
              </td>
              <td className="py-2 px-3 border border-border-default text-sm uppercase">
                {data.popular ? <span className="text-danger">{data.abbr}</span> : data.abbr}
              </td>
              <td className="py-2 px-3 border border-border-default text-sm">
                {data.popular ? <span className="text-danger">{data.desc}</span> : data.desc}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function PrintableCharacters({ list }: { list: number[] }) {
  const { t } = useTranslation("ascii");
  function printGlyph(code: number) {
    let char = String.fromCharCode(code);

    if (char >= "0" && char <= "9") {
      return <span className="text-accent-cyan">{char}</span>;
    } else if ((char >= "a" && char <= "z") || (char >= "A" && char <= "Z")) {
      return char;
    } else {
      if (char == " ") {
        char = "space";
      }
      return <span className="text-danger">{char}</span>;
    }
  }

  return (
    <table className="w-full text-center border-collapse">
      <thead className="bg-bg-elevated sticky top-12">
        <tr className="text-xs uppercase text-fg-muted">
          <th className="py-2 px-3 border border-border-default">{t("tableHeaders.decimal")}</th>
          <th className="py-2 px-3 border border-border-default">{t("tableHeaders.binary")}</th>
          <th className="py-2 px-3 border border-border-default">{t("tableHeaders.oct")}</th>
          <th className="py-2 px-3 border border-border-default">{t("tableHeaders.hex")}</th>
          <th className="py-2 px-3 border border-border-default">{t("tableHeaders.html")}</th>
          <th className="py-2 px-3 border border-border-default">{t("tableHeaders.glyph")}</th>
        </tr>
      </thead>
      <tbody>
        {list.map((data) => {
          return (
            <tr
              key={data}
              className={`even:bg-bg-elevated/50 hover:bg-bg-elevated/80 ${[48, 65, 97].includes(data) ? "bg-accent-purple-dim/20" : ""}`}
            >
              <td className="py-2 px-3 border border-border-default text-sm">{data}</td>
              <td className="py-2 px-3 border border-border-default text-sm font-mono">
                {beautyPrint(data, 2, 4, 8, "0")}
              </td>
              <td className="py-2 px-3 border border-border-default text-sm font-mono">
                {beautyPrint(data, 8, 3, 3, "0")}
              </td>
              <td className="py-2 px-3 border border-border-default text-sm">
                {data.toString(16).toUpperCase()}
              </td>
              <td className="py-2 px-3 border border-border-default text-sm">
                <code className="text-accent-cyan">{"&#" + data + ";"}</code>
              </td>
              <td className="py-2 px-3 border border-border-default text-sm">{printGlyph(data)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function AsciiPage({
  toolData,
  printableCharacters,
  controlCodes,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { t } = useTranslation(["ascii", "common", "tools"]);
  return (
    <>
      <ToolPageHeadBuilder toolPath="/ascii" />
      <Layout title={t("tools:ascii.title")}>
        <div className="container mx-auto px-4 py-4">
          <section id="description" className="py-3">
            <p className="text-fg-secondary" style={{ textIndent: "3rem", lineHeight: "2rem" }}>
              {t("ascii:description")}
            </p>
          </section>
          <section>
            <NeonTabs
              tabs={[
                {
                  label: <span className="font-bold">{t("ascii:printableCharacters")}</span>,
                  content: <PrintableCharacters list={printableCharacters} />,
                },
                {
                  label: <span className="font-bold">{t("ascii:controlCodeCharts")}</span>,
                  content: <ControlCodeChart list={controlCodes} />,
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
  const path = "/ascii";
  const toolData: ToolData = findTool(path);
  const printableCharacters: number[] = getPrintableCharacters();
  const controlCodes: ControlCode[] = getControlCodes();

  return {
    props: {
      toolData: toolData,
      printableCharacters: printableCharacters,
      controlCodes: controlCodes,
      ...(await serverSideTranslations(locale, ["common", "ascii", "tools"])),
    },
  };
};

export default AsciiPage;
