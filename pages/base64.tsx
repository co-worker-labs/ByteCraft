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
import { StyledTextarea } from "../components/ui/input";
import { StyledInput } from "../components/ui/input";
import { StyledSelect } from "../components/ui/input";
import { StyledCheckbox } from "../components/ui/input";
import { Button } from "../components/ui/button";
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
      <div>
        <div className="flex flex-wrap justify-between items-center">
          <label htmlFor="rawContentTextarea" className="col-auto">
            <span className="font-bold text-accent-cyan">{t("base64:plainText")}</span>
            <a
              href="#"
              className="text-danger text-xs ms-2"
              onClick={(e) => {
                e.preventDefault();
                updateRawContent("");
                showToast(t("common:common.cleared"), "danger", 2000);
              }}
            >
              {t("common:common.clear")}
            </a>
          </label>
          <StyledCheckbox
            label={t("common:common.trimWhiteSpace")}
            id="isTrimCheck"
            checked={isTrimRaw}
            onChange={(e) => {
              setIsTrimRaw(e.target.checked);
            }}
          />
        </div>
        <div className="relative">
          <StyledTextarea
            id="rawContentTextarea"
            placeholder={t("base64:plainTextPlaceholder")}
            rows={5}
            value={rawContent}
            onChange={(e) => {
              updateRawContent(e.target.value);
            }}
          />
          <CopyButton getContent={() => rawContent} className="absolute end-0 top-0" />
        </div>
      </div>
      <div className="mt-2">
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
            <span className="flex items-center px-2 bg-bg-elevated border-y border-border-default text-fg-muted">
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
      <div className="flex flex-wrap justify-start mb-3">
        <div className="mt-3 pe-0 w-auto">
          <StyledSelect
            aria-label="Plain Content Charset"
            value={rawCharset}
            onChange={(e) => {
              setRawCharset(e.target.value as BufferEncoding);
            }}
          >
            <option value="ascii">ASCII</option>
            <option value="utf-8">UTF-8</option>
          </StyledSelect>
        </div>
        <Button
          variant="primary"
          size="sm"
          disabled={isDisabledEncode()}
          onClick={doEncode}
          className="ms-1 mt-3"
        >
          {t("base64:encode")}
          <ChevronsDown size={16} className="ms-1" />
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={isDiabledDecode()}
          onClick={doDecode}
          className="ms-1 mt-3"
        >
          {t("base64:decode")}
          <ChevronsUp size={16} className="ms-1" />
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={isDiabledClear()}
          onClick={() => {
            updateRawContent("");
            updateEncodedContent("");
            showToast(t("common:common.allCleared"), "danger", 2000);
          }}
          className="ms-1 mt-3"
        >
          {t("common:common.clearAll")}
          <X size={16} className="ms-1" />
        </Button>
      </div>
      <div className="mb-3">
        <label htmlFor="encodedContentTextarea">
          <span className="font-bold text-accent-cyan">{t("base64:encodedText")}</span>
          <a
            href="#"
            className="text-danger text-xs ms-2"
            onClick={(e) => {
              e.preventDefault();
              setEncodedContent("");
              showToast(t("common:common.cleared"), "danger", 2000);
            }}
          >
            {t("common:common.clear")}
          </a>
        </label>
        <div className="relative">
          <StyledTextarea
            id="encodedContentTextarea"
            placeholder={t("base64:encodedOutput")}
            rows={5}
            value={encodedContent}
            onChange={(e) => {
              updateEncodedContent(e.target.value);
            }}
          />
          <CopyButton getContent={() => encodedContent} className="absolute end-0 top-0" />
        </div>
      </div>
    </section>
  );
}

function Description() {
  const { t } = useTranslation("base64");
  return (
    <section id="description" className="mt-4">
      <div className="mb-4">
        <h3 className="font-semibold text-fg-primary">{t("descriptions.whatIsTitle")}</h3>
        <p className="text-fg-secondary mt-1">{t("descriptions.whatIsP1")}</p>
        <p className="text-fg-secondary mt-1">{t("descriptions.whatIsP2")}</p>
        <p className="text-fg-secondary mt-1">{t("descriptions.whatIsP3")}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-fg-primary">{t("descriptions.howTitle")}</h3>
        <p className="text-fg-secondary mt-1">{t("descriptions.howP1")}</p>
        <ol className="list-decimal list-inside text-fg-secondary mt-1">
          <li>{t("descriptions.howStep1")}</li>
          <li>{t("descriptions.howStep2")}</li>
          <li>{t("descriptions.howStep3")}</li>
          <li>{t("descriptions.howStep4")}</li>
        </ol>
        <Image src={codingTableImg} alt="" />
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-fg-primary">{t("descriptions.whyTitle")}</h3>
        <p className="text-fg-secondary mt-1">{t("descriptions.whyP1")}</p>
        <p className="text-fg-secondary mt-1">{t("descriptions.whyP2")}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-fg-primary">{t("descriptions.useCasesTitle")}</h3>
        <p className="text-fg-secondary mt-1">{t("descriptions.useCasesP1")}</p>
        <p className="text-fg-secondary mt-1">{t("descriptions.useCasesP2")}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-fg-primary">{t("descriptions.limitationsTitle")}</h3>
        <p className="text-fg-secondary mt-1">{t("descriptions.limitationsP1")}</p>
        <p className="text-fg-secondary mt-1">{t("descriptions.limitationsP2")}</p>
      </div>
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
        <div className="container mx-auto px-4 pt-3">
          <div className="bg-accent-cyan-dim/20 border border-accent-cyan/30 rounded-xl p-3 text-fg-secondary text-sm my-4">
            {t("common:alert.notTransferred")}
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
