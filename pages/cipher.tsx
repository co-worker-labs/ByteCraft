import { GetStaticProps, InferGetStaticPropsType } from "next";
import { useState } from "react";
import { useTranslation } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { CopyButton } from "../components/ui/copy-btn";
import { ToolPageHeadBuilder } from "../components/head_builder";
import Layout from "../components/layout";
import { showToast } from "../libs/toast";
import { findTool, ToolData } from "../libs/tools";
import { StyledTextarea } from "../components/ui/input";
import { StyledInput } from "../components/ui/input";
import { StyledSelect } from "../components/ui/input";
import { StyledCheckbox } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ChevronsDown, ChevronsUp, X } from "lucide-react";

const CryptoJS = require("crypto-js");

type Algorithms = "AES" | "DES" | "Triple DES" | "Rabbit" | "RC4" | "RC4Drop";
type BlockMode = "CBC" | "CFB" | "CTR" | "OFB" | "ECB";
type PaddingScheme = "Pkcs7" | "Iso97971" | "AnsiX923" | "Iso10126" | "ZeroPadding" | "NoPadding";

function Conversion() {
  const { t } = useTranslation(["cipher", "common"]);
  const [rawContent, setRawContent] = useState<string>("");
  const [isTrimRaw, setIsTrimRaw] = useState<boolean>(true);
  const [passphrase, setPassphrase] = useState<string>("");
  const [encryptedContent, setEncryptedContent] = useState<string>("");

  const [algorithm, setAlgorithm] = useState<Algorithms>("AES");
  const [mode, setMode] = useState<BlockMode>("CBC");
  const [paddingScheme, setPaddingScheme] = useState<PaddingScheme>("Pkcs7");
  const [droppedWords, setDroppedWords] = useState<number>(192);

  function getRawContent() {
    return isTrimRaw ? rawContent.trim() : rawContent;
  }

  function isDisabledEncrypt(): boolean {
    const raw = getRawContent();
    const phrase = passphrase.trim();
    return !raw || !phrase;
  }

  function isDisabledDecrypt(): boolean {
    const encrypted = encryptedContent.trim();
    const phrase = passphrase.trim();
    return !encrypted || !phrase;
  }

  function isDisabledClear(): boolean {
    const raw = getRawContent();
    const encrypted = encryptedContent.trim();
    const phrase = passphrase.trim();
    return !raw && !encrypted && !phrase;
  }

  function getMode() {
    switch (mode) {
      case "CBC":
        return CryptoJS.mode.CBC;
      case "CFB":
        return CryptoJS.mode.CFB;
      case "CTR":
        return CryptoJS.mode.CTR;
      case "ECB":
        return CryptoJS.mode.ECB;
      case "OFB":
        return CryptoJS.mode.OFB;
    }
  }

  function getPaddingScheme() {
    switch (paddingScheme) {
      case "AnsiX923":
        return CryptoJS.pad.AnsiX923;
      case "Iso10126":
        return CryptoJS.pad.Iso10126;
      case "Iso97971":
        return CryptoJS.pad.Iso97971;
      case "NoPadding":
        return CryptoJS.pad.NoPadding;
      case "ZeroPadding":
        return CryptoJS.pad.ZeroPadding;
      case "Pkcs7":
        return CryptoJS.pad.Pkcs7;
    }
  }

  function doEncrypt() {
    const raw = isTrimRaw ? rawContent.trim() : rawContent;
    const phrase = passphrase.trim();
    if (raw && phrase) {
      let encrypted;
      switch (algorithm) {
        case "AES":
          encrypted = CryptoJS.AES.encrypt(raw, phrase, {
            mode: getMode(),
            padding: getPaddingScheme(),
          });
          break;
        case "DES":
          encrypted = CryptoJS.DES.encrypt(raw, phrase, {
            mode: getMode(),
            padding: getPaddingScheme(),
          });
          break;
        case "Triple DES":
          encrypted = CryptoJS.TripleDES.encrypt(raw, phrase, {
            mode: getMode(),
            padding: getPaddingScheme(),
          });
          break;
        case "RC4":
          encrypted = CryptoJS.RC4.encrypt(raw, phrase, {
            mode: getMode(),
            padding: getPaddingScheme(),
          });
          break;
        case "RC4Drop":
          encrypted = CryptoJS.RC4Drop.encrypt(raw, phrase, {
            mode: getMode(),
            padding: getPaddingScheme(),
            drop: droppedWords,
          });
          break;
        case "Rabbit":
          encrypted = CryptoJS.Rabbit.encrypt(raw, phrase, {
            mode: getMode(),
            padding: getPaddingScheme(),
          });
          break;
      }
      setPassphrase(phrase);
      setRawContent(raw);
      setEncryptedContent(encrypted.toString());
      showToast(t("common:common.encrypted"), "success", 3000);
    }
  }

  function doDecrypt() {
    const encrypted = encryptedContent.trim();
    const phrase = passphrase.trim();
    if (encrypted && phrase) {
      let decrypted;
      switch (algorithm) {
        case "AES":
          decrypted = CryptoJS.AES.decrypt(encrypted, phrase, {
            mode: getMode(),
            padding: getPaddingScheme(),
          });
          break;
        case "DES":
          decrypted = CryptoJS.DES.decrypt(encrypted, phrase, {
            mode: getMode(),
            padding: getPaddingScheme(),
          });
          break;
        case "Triple DES":
          decrypted = CryptoJS.TripleDES.decrypt(encrypted, phrase, {
            mode: getMode(),
            padding: getPaddingScheme(),
          });
          break;
        case "RC4":
          decrypted = CryptoJS.RC4.decrypt(encrypted, phrase, {
            mode: getMode(),
            padding: getPaddingScheme(),
          });
          break;
        case "RC4Drop":
          decrypted = CryptoJS.RC4Drop.decrypt(encrypted, phrase, {
            mode: getMode(),
            padding: getPaddingScheme(),
            drop: droppedWords,
          });
          break;
        case "Rabbit":
          decrypted = CryptoJS.Rabbit.decrypt(encrypted, phrase, {
            mode: getMode(),
            padding: getPaddingScheme(),
          });
          break;
      }
      setEncryptedContent(encrypted);
      setPassphrase(phrase);
      try {
        setRawContent(decrypted.toString(CryptoJS.enc.Utf8));
        showToast(t("common:common.decrypted"), "success", 3000);
      } catch (e) {
        showToast(t("common:alert.invalidCipher"), "danger", 3000);
      }
    }
  }

  return (
    <section id="conversion">
      <div>
        <div className="flex flex-wrap justify-between items-center">
          <label htmlFor="rawContentTextarea" className="col-auto">
            <span className="font-bold text-accent-cyan">{t("cipher:plaintext")}</span>
            <a
              href="#"
              className="text-danger text-xs ms-2"
              onClick={(e) => {
                e.preventDefault();
                setRawContent("");
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
            placeholder={t("cipher:plaintextPlaceholder")}
            rows={5}
            value={rawContent}
            onChange={(e) => {
              setRawContent(e.target.value);
            }}
          />
          <CopyButton className="absolute end-0 top-0" getContent={() => rawContent} />
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor="passphraseTextarea" className="block mb-1">
          <span className="font-bold text-accent-cyan">{t("cipher:secretPassphrase")}</span>
          <a
            href="#"
            className="text-danger text-xs ms-2"
            onClick={(e) => {
              e.preventDefault();
              setPassphrase("");
              showToast(t("common:common.cleared"), "danger", 2000);
            }}
          >
            {t("common:common.clear")}
          </a>
        </label>
        <div className="relative">
          <StyledTextarea
            id="passphraseTextarea"
            placeholder={t("cipher:passphrasePlaceholder")}
            rows={3}
            value={passphrase}
            onChange={(e) => {
              setPassphrase(e.target.value);
            }}
          />
          <CopyButton className="absolute end-0 top-0" getContent={() => passphrase.trim()} />
        </div>
      </div>
      <div className="flex flex-wrap">
        <div className="w-1/2 lg:w-1/4 mt-3 pe-2">
          <label className="block text-sm text-fg-secondary mb-1">{t("cipher:algorithms")}</label>
          <StyledSelect
            aria-label="Cipher Algorithms"
            value={algorithm}
            onChange={(e) => {
              setAlgorithm(e.target.value as Algorithms);
              if ((e.target.value as Algorithms) == "RC4Drop") {
                setDroppedWords(192);
              }
            }}
          >
            <option value="AES">AES</option>
            <option value="DES">DES</option>
            <option value="Triple DES">Triple DES</option>
            <option value="Rabbit">Rabbit</option>
            <option value="RC4">RC4</option>
            <option value="RC4Drop">RC4Drop</option>
          </StyledSelect>
        </div>
        <div className="w-1/2 lg:w-1/4 mt-3 pe-2">
          <label className="block text-sm text-fg-secondary mb-1">{t("cipher:blockMode")}</label>
          <StyledSelect
            aria-label="Block Mode"
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as BlockMode);
            }}
          >
            <option value="CBC">CBC</option>
            <option value="CFB">CFB</option>
            <option value="CTR">CTR</option>
            <option value="OFB">OFB</option>
            <option value="ECB">ECB</option>
          </StyledSelect>
        </div>
        <div className="w-1/2 lg:w-1/4 mt-3 pe-2">
          <label className="block text-sm text-fg-secondary mb-1">
            {t("cipher:paddingScheme")}
          </label>
          <StyledSelect
            aria-label="Padding Scheme"
            value={paddingScheme}
            onChange={(e) => {
              setPaddingScheme(e.target.value as PaddingScheme);
            }}
          >
            <option value="Pkcs7">Pkcs7</option>
            <option value="Iso97971">Iso97971</option>
            <option value="AnsiX923">AnsiX923</option>
            <option value="Iso10126">Iso10126</option>
            <option value="ZeroPadding">ZeroPadding</option>
            <option value="NoPadding">NoPadding</option>
          </StyledSelect>
        </div>
        {algorithm == "RC4Drop" && (
          <div className="w-1/2 lg:w-1/4 mt-3 pe-2">
            <label htmlFor="droppedWords" className="block text-sm text-fg-secondary mb-1">
              {t("cipher:droppedWords")}
            </label>
            <StyledInput
              type="number"
              id="droppedWords"
              min={1}
              value={droppedWords}
              onChange={(e) => {
                setDroppedWords(parseInt(e.target.value));
              }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap px-2 mt-3">
        <Button
          variant="primary"
          size="sm"
          disabled={isDisabledEncrypt()}
          onClick={doEncrypt}
          className="ms-1"
        >
          {t("common:common.encrypted")}
          <ChevronsDown size={16} className="ms-1" />
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={isDisabledDecrypt()}
          onClick={doDecrypt}
          className="ms-1"
        >
          {t("common:common.decrypted")}
          <ChevronsUp size={16} className="ms-1" />
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={isDisabledClear()}
          onClick={() => {
            setRawContent("");
            setEncryptedContent("");
            setPassphrase("");
            showToast(t("common:common.allCleared"), "danger", 2000);
          }}
          className="ms-1"
        >
          {t("common:common.clearAll")}
          <X size={16} className="ms-1" />
        </Button>
      </div>
      <div className="mt-3">
        <label htmlFor="encryptedContentTextarea" className="block mb-1">
          <span className="font-bold text-accent-cyan">{t("cipher:ciphertext")}</span>
          <a
            href="#"
            className="text-danger text-xs ms-2"
            onClick={(e) => {
              e.preventDefault();
              setEncryptedContent("");
              showToast(t("common:common.cleared"), "danger", 2000);
            }}
          >
            {t("common:common.clear")}
          </a>
        </label>
        <div className="relative">
          <StyledTextarea
            id="encryptedContentTextarea"
            placeholder={t("cipher:ciphertextOutput")}
            rows={5}
            value={encryptedContent}
            onChange={(e) => {
              setEncryptedContent(e.target.value);
            }}
          />
          <CopyButton className="absolute end-0 top-0" getContent={() => encryptedContent.trim()} />
        </div>
      </div>
    </section>
  );
}

function Description() {
  const { t } = useTranslation("cipher");
  return (
    <section id="description" className="mt-4">
      <div className="mb-4">
        <h5 className="font-semibold text-fg-primary">{t("descriptions.aesTitle")}</h5>
        <p className="text-fg-secondary mt-1">{t("descriptions.aes")}</p>
      </div>
      <div className="mb-4">
        <h5 className="font-semibold text-fg-primary">{t("descriptions.desTitle")}</h5>
        <p className="text-fg-secondary mt-1">{t("descriptions.des")}</p>
        <p className="text-fg-secondary mt-1">{t("descriptions.tripleDes")}</p>
      </div>
      <div className="mb-4">
        <h5 className="font-semibold text-fg-primary">{t("descriptions.rabbitTitle")}</h5>
        <p className="text-fg-secondary mt-1">{t("descriptions.rabbit")}</p>
      </div>
      <div className="mb-4">
        <h5 className="font-semibold text-fg-primary">{t("descriptions.rc4Title")}</h5>
        <p className="text-fg-secondary mt-1">{t("descriptions.rc4")}</p>
        <p className="text-fg-secondary mt-1">{t("descriptions.rc4drop")}</p>
        <p className="text-fg-secondary mt-1">{t("descriptions.rc4dropConfig")}</p>
      </div>
    </section>
  );
}

function CipherPage({ toolData }: InferGetStaticPropsType<typeof getStaticProps>) {
  const { t } = useTranslation("common");
  return (
    <>
      <ToolPageHeadBuilder toolPath="/cipher" />
      <Layout title={toolData.title}>
        <div className="container mx-auto px-4 pt-4">
          <div className="bg-accent-cyan-dim/20 border border-accent-cyan/30 rounded-xl p-3 text-fg-secondary text-sm my-4">
            {t("alert.notTransferred")}
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
  const path = "/cipher";
  const toolData: ToolData = findTool(path);
  return {
    props: {
      toolData,
      ...(await serverSideTranslations(locale, ["common", "cipher"])),
    },
  };
};

export default CipherPage;
