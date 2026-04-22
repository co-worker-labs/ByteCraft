import Head from "next/head";
import Layout from "../components/layout";
import { listMatchedTools, ToolData } from "../libs/tools";
import { useRouter } from "next/router";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { useTranslation } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { getTranslatedTools } from "../libs/tools";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Hash, FileCode, Lock, KeyRound, FileCheck, Type, Code, HardDrive } from "lucide-react";

const toolIcons: Record<string, React.ReactNode> = {
  "/hashing": <Hash size={32} className="text-accent-cyan" />,
  "/base64": <FileCode size={32} className="text-accent-cyan" />,
  "/cipher": <Lock size={32} className="text-accent-cyan" />,
  "/password": <KeyRound size={32} className="text-accent-cyan" />,
  "/checksum": <FileCheck size={32} className="text-accent-cyan" />,
  "/ascii": <Type size={32} className="text-accent-cyan" />,
  "/htmlcode": <Code size={32} className="text-accent-cyan" />,
  "/storageunit": <HardDrive size={32} className="text-accent-cyan" />,
};

function Introduce() {
  const { t } = useTranslation("home");
  return (
    <div className="bg-gradient-to-b from-bg-base to-[#1a1040] bg-grid-pattern py-40 md:py-60">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-mono font-bold text-accent-cyan text-shadow-glow">
          {t("exploreTitle")}
        </h1>
      </div>
    </div>
  );
}

function ToolCollection() {
  const router = useRouter();
  const { t } = useTranslation(["common", "tools"]);
  const data = getTranslatedTools(t);

  return (
    <div className="container mx-auto px-4 text-center mb-20">
      <div className="flex flex-wrap mt-8 -mx-2">
        {data.map((value, index) => {
          const isDisabled = value.path == "";
          const icon = toolIcons[value.path];
          return (
            <div className="w-full md:w-1/2 lg:w-1/4 px-2 py-2" key={index}>
              <Card hover={!isDisabled} className={isDisabled ? "opacity-50" : ""}>
                <div className="p-2">
                  {icon && <div className="mb-3 flex justify-center">{icon}</div>}
                  <h5 className="font-semibold text-fg-primary">{value.title}</h5>
                  <p
                    className="text-sm text-fg-secondary mt-1"
                    style={{ height: "2.8rem", overflow: "hidden" }}
                  >
                    {value.description}
                  </p>
                  <div className="flex justify-center mt-3">
                    <Button
                      variant={isDisabled ? "outline" : "primary"}
                      size="sm"
                      disabled={isDisabled}
                      onClick={() => {
                        if (value.path) router.push(value.path);
                      }}
                      className="w-3/4"
                    >
                      {isDisabled ? t("common:common.comingSoon") : t("common:common.goto")}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home({ tools }: InferGetStaticPropsType<typeof getStaticProps>) {
  const { t } = useTranslation(["home", "tools"]);
  const keywords: string[] = [];
  tools.forEach((value: ToolData) => {
    value.keywords.forEach((kw) => {
      if (!keywords.includes(kw)) {
        keywords.push(kw);
      }
    });
  });
  return (
    <>
      <Head>
        <title>{t("home:title")}</title>
        <meta name="description" content={t("home:metaDescription")} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keyword" content={keywords.join(",")} />
      </Head>
      <Layout headerPosition="none" aside={false}>
        <Introduce />
        <ToolCollection />
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale || "en";
  const tools: ToolData[] = listMatchedTools("");
  return {
    props: {
      tools,
      ...(await serverSideTranslations(locale, ["common", "home", "tools"])),
    },
  };
};
