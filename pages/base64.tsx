import { GetStaticProps, InferGetStaticPropsType } from "next";
import Image from "next/image";
import { useState } from "react";
import { CopyButton } from "../components/ui/copy-btn";
import { ToolPageHeadBuilder } from "../components/head_builder";
import Layout from "../components/layout";
import { showToast } from "../libs/toast";
import codingTableImg from "../public/base64/decimal-to-base64-table.png";
import { useTranslation } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { StyledTextarea, StyledInput, StyledSelect, StyledCheckbox } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ChevronsDown, ChevronsUp, X } from "lucide-react";

function Conversion() {
  const { t } = useTranslation(["common", "base64"]);
  const [rawContent, setRawContent] = useState<string>("");
  const [isTrimRaw, setIsTrimRaw] = useState<boolean>(true);
  const [rawCharset, setRawCharset] = useState<BufferEncoding>("utf-8");
  const [encodedContent, setEncodedContent] = useState<string>("");
  const [basicAuthEnabled, setBasicAuthEnabled] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  function updateRawContent(value: string) {
    setRawContent(value);
    const arr = parse2BasicAuth(value);
    setUsername(arr[0]);
    setPassword(arr[1]);
  }

  function parse2BasicAuth(value: string): string[] {
    const index = value.indexOf(":");
    if (index > -1) {
      return [value.substring(0, index), value.substring(index + 1)];
    } else {
      return [value, ""];
    }
  }

  function buildBasicAuth(username: string, password: string) {
    return username + ":" + password;
  }

  function updateEncodedContent(value: string) {
    setEncodedContent(value);
  }

  function doEncode() {
    const raw = isTrimRaw ? rawContent.trim() : rawContent;
    const encoded = Buffer.from(raw, rawCharset).toString("base64");
    updateEncodedContent(encoded);
    updateRawContent(raw);
    showToast(t("common:common.encoded"), "success", 2000);
  }

  function doDecode() {
    let encoded = encodedContent.trim();
    if (basicAuthEnabled) {
      if (encoded.match(/^(basic).*/gi)) {
        encoded = encoded.substring("Basic ".length).trim();
      }
    }
    const raw = Buffer.from(encoded, "base64").toString(rawCharset);
    updateEncodedContent(encoded);
    updateRawContent(raw);
    showToast(t("common:common.decoded"), "success", 2000);
  }

  function isDisabledEncode(): boolean {
    const raw = isTrimRaw ? rawContent.trim() : rawContent;
    return !raw;
  }

  function isDiabledDecode(): boolean {
    return !encodedContent.trim();
  }

  function isDiabledClear(): boolean {
    const raw = isTrimRaw ? rawContent.trim() : rawContent;
    const encoded = encodedContent.trim();
    return !raw && !encoded;
  }

  return (
    <section id="conversion">
      <Card hover={false} className="relative overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-default bg-bg-elevated/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan/60" />
            <span className="font-mono text-sm font-semibold text-accent-cyan">
              {t("base64:plainText")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <StyledCheckbox
              label={t("common:common.trimWhiteSpace")}
              id="isTrimCheck"
              checked={isTrimRaw}
              onChange={(e) => {
                setIsTrimRaw(e.target.checked);
              }}
            />
            <button
              type="button"
              className="text-danger text-xs hover:text-danger/80 transition-colors cursor-pointer"
              onClick={() => {
                updateRawContent("");
                showToast(t("common:common.cleared"), "danger", 2000);
              }}
            >
              {t("common:common.clear")}
            </button>
          </div>
        </div>
        <div className="pt-3 pb-0.5 px-0.5">
          <div className="relative">
            <StyledTextarea
              id="rawContentTextarea"
              placeholder={t("base64:plainTextPlaceholder")}
              rows={6}
              value={rawContent}
              onChange={(e) => {
                updateRawContent(e.target.value);
              }}
              className="font-mono text-sm"
            />
            <CopyButton getContent={() => rawContent} className="absolute end-2 top-2" />
          </div>
        </div>
      </Card>

      <div className="mt-5">
        <StyledCheckbox
          label={t("base64:basicAuthentication")}
          id="basicAuthFlag"
          checked={basicAuthEnabled}
          onChange={(e) => setBasicAuthEnabled(e.target.checked)}
        />
        {basicAuthEnabled && (
          <div className="flex gap-0 mt-2">
            <StyledInput
              type="text"
              placeholder={t("base64:username")}
              aria-label={t("base64:username")}
              value={username}
              onChange={(e) => {
                updateRawContent(buildBasicAuth(e.target.value, password));
              }}
              className="rounded-r-none"
            />
            <span className="flex items-center px-2 bg-bg-elevated border-y border-border-default text-fg-muted font-mono">
              :
            </span>
            <StyledInput
              type="text"
              placeholder={t("base64:password")}
              aria-label={t("base64:password")}
              value={password}
              onChange={(e) => {
                updateRawContent(buildBasicAuth(username, e.target.value));
              }}
              className="rounded-l-none"
            />
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
        <StyledSelect
          aria-label="Plain Content Charset"
          value={rawCharset}
          onChange={(e) => {
            setRawCharset(e.target.value as BufferEncoding);
          }}
          className="appearance-none rounded-full font-bold text-center"
        >
          <option value="ascii">ASCII</option>
          <option value="utf-8">UTF-8</option>
        </StyledSelect>
        <Button
          variant="primary"
          size="md"
          disabled={isDisabledEncode()}
          onClick={doEncode}
          className="rounded-full font-bold"
        >
          {t("base64:encode")}
          <ChevronsDown size={16} className="ms-1" />
        </Button>
        <Button
          variant="primary"
          size="md"
          disabled={isDiabledDecode()}
          onClick={doDecode}
          className="rounded-full font-bold"
        >
          {t("base64:decode")}
          <ChevronsUp size={16} className="ms-1" />
        </Button>
        <Button
          variant="danger"
          size="md"
          disabled={isDiabledClear()}
          onClick={() => {
            updateRawContent("");
            updateEncodedContent("");
            showToast(t("common:common.allCleared"), "danger", 2000);
          }}
          className="rounded-full font-bold"
        >
          {t("common:common.clearAll")}
          <X size={16} className="ms-1" />
        </Button>
      </div>

      <Card hover={false} className="relative overflow-hidden mt-5">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-default bg-bg-elevated/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-purple/60" />
            <span className="font-mono text-sm font-semibold text-accent-purple">
              {t("base64:encodedText")}
            </span>
          </div>
          <button
            type="button"
            className="text-danger text-xs hover:text-danger/80 transition-colors cursor-pointer"
            onClick={() => {
              setEncodedContent("");
              showToast(t("common:common.cleared"), "danger", 2000);
            }}
          >
            {t("common:common.clear")}
          </button>
        </div>
        <div className="pt-3 pb-0.5 px-0.5">
          <div className="relative">
            <StyledTextarea
              id="encodedContentTextarea"
              placeholder={t("base64:encodedOutput")}
              rows={6}
              value={encodedContent}
              onChange={(e) => {
                updateEncodedContent(e.target.value);
              }}
              className="font-mono text-sm"
            />
            <CopyButton getContent={() => encodedContent} className="absolute end-2 top-2" />
          </div>
        </div>
      </Card>
    </section>
  );
}

function Description() {
  const { t } = useTranslation("base64");
  return (
    <section id="description" className="mt-8">
      <Card hover={false} className="mb-4">
        <h3 className="font-semibold text-fg-primary text-base">{t("descriptions.whatIsTitle")}</h3>
        <div className="mt-2 space-y-1.5 text-fg-secondary text-sm leading-relaxed">
          <p>{t("descriptions.whatIsP1")}</p>
          <p>{t("descriptions.whatIsP2")}</p>
          <p>{t("descriptions.whatIsP3")}</p>
        </div>
      </Card>

      <Card hover={false} className="mb-4">
        <h3 className="font-semibold text-fg-primary text-base">{t("descriptions.howTitle")}</h3>
        <p className="text-fg-secondary text-sm mt-2 leading-relaxed">{t("descriptions.howP1")}</p>
        <ol className="list-decimal list-inside text-fg-secondary text-sm mt-2 space-y-1">
          <li>{t("descriptions.howStep1")}</li>
          <li>{t("descriptions.howStep2")}</li>
          <li>{t("descriptions.howStep3")}</li>
          <li>{t("descriptions.howStep4")}</li>
        </ol>
        <div className="mt-4 flex justify-center rounded-lg overflow-hidden border border-border-default bg-bg-elevated/50 p-3">
          <Image src={codingTableImg} alt="" className="h-auto max-w-full" />
        </div>
      </Card>

      <Card hover={false} className="mb-4">
        <h3 className="font-semibold text-fg-primary text-base">{t("descriptions.whyTitle")}</h3>
        <div className="mt-2 space-y-1.5 text-fg-secondary text-sm leading-relaxed">
          <p>{t("descriptions.whyP1")}</p>
          <p>{t("descriptions.whyP2")}</p>
        </div>
      </Card>

      <Card hover={false} className="mb-4">
        <h3 className="font-semibold text-fg-primary text-base">{t("descriptions.useCasesTitle")}</h3>
        <div className="mt-2 space-y-1.5 text-fg-secondary text-sm leading-relaxed">
          <p>{t("descriptions.useCasesP1")}</p>
          <p>{t("descriptions.useCasesP2")}</p>
        </div>
      </Card>

      <Card hover={false} className="mb-4">
        <h3 className="font-semibold text-fg-primary text-base">{t("descriptions.limitationsTitle")}</h3>
        <div className="mt-2 space-y-1.5 text-fg-secondary text-sm leading-relaxed">
          <p>{t("descriptions.limitationsP1")}</p>
          <p>{t("descriptions.limitationsP2")}</p>
        </div>
      </Card>
    </section>
  );
}

function Base64Page() {
  const { t } = useTranslation(["common", "tools"]);
  const title = t("tools:base64.title");

  return (
    <>
      <ToolPageHeadBuilder toolPath="/base64" />
      <Layout title={title}>
        <div className="container mx-auto px-4 pt-3 pb-6">
          <div className="flex items-start gap-2 border-l-2 border-accent-cyan bg-accent-cyan-dim/30 rounded-r-lg p-3 my-4">
            <span className="text-sm text-fg-secondary leading-relaxed">
              {t("common:alert.notTransferred")}
            </span>
          </div>

          <Conversion />
          <Description />
        </div>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale || "en";
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "base64", "tools"])),
    },
  };
};

export default Base64Page;
