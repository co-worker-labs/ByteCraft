import { GetStaticProps, InferGetStaticPropsType } from "next";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { ToolPageHeadBuilder } from "../components/head_builder";
import Layout from "../components/layout";
import { showToast } from "../libs/toast";
import { findTool, ToolData } from "../libs/tools";
import { fromEvent } from "file-selector";
import { formatBytes } from "../utils/storage";
import { CopyButton } from "../components/ui/copy-btn";
import { StyledTextarea } from "../components/ui/input";
import { StyledSelect } from "../components/ui/input";
import { StyledCheckbox } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Accordion } from "../components/ui/accordion";
import { Plus } from "lucide-react";

const CryptoJS = require("crypto-js");

interface HashResult {
  title: string;
  size: string;

  md5: string;
  sha1: string;

  sha224: string;
  sha256: string;
  sha384: string;
  sha512: string;

  sha3_224: string;
  sha3_256: string;
  sha3_384: string;
  sha3_512: string;

  RIPEMD160: string;
}

function ChecksumDisplay({ data, types }: { data: HashResult; types: string[] }) {
  const { t } = useTranslation(["checksum", "common"]);
  const [testChecksum, setTestChecksum] = useState<string>("");

  return (
    <>
      <div className="relative">
        <StyledTextarea
          placeholder={t("checksum:compareToChecksum")}
          rows={3}
          value={testChecksum}
          onChange={(e) => {
            setTestChecksum(e.target.value);
          }}
        />
        <button
          type="button"
          className="text-danger font-bold text-sm absolute end-0 top-0 bg-transparent border-none cursor-pointer"
          title={t("common:common.clear")}
          onClick={() => {
            setTestChecksum("");
          }}
        >
          {t("common:common.clear")}
        </button>
      </div>
      <table className="w-full mt-2">
        <tbody>
          <tr className="border-b border-border-default even:bg-bg-elevated/50">
            <th className="py-2 pr-4 text-fg-secondary text-sm text-left whitespace-nowrap">
              {t("common:common.size")}
            </th>
            <td className="py-2 text-sm">{data.size}</td>
          </tr>
          {types.includes("md5") && (
            <tr
              className={`border-b border-border-default even:bg-bg-elevated/50 ${data.md5 == testChecksum ? "bg-accent-cyan-dim text-accent-cyan font-semibold" : ""}`}
            >
              <th className="py-2 pr-4 text-fg-secondary text-sm text-left whitespace-nowrap">
                MD5
              </th>
              <td className="py-2 font-mono text-sm break-all">
                {data.md5}
                <CopyButton getContent={() => data.md5} className="ms-1" />
              </td>
            </tr>
          )}
          {types.includes("sha1") && (
            <tr
              className={`border-b border-border-default even:bg-bg-elevated/50 ${data.sha1 == testChecksum ? "bg-accent-cyan-dim text-accent-cyan font-semibold" : ""}`}
            >
              <th className="py-2 pr-4 text-fg-secondary text-sm text-left whitespace-nowrap">
                SHA-1
              </th>
              <td className="py-2 font-mono text-sm break-all">
                {data.sha1}
                <CopyButton getContent={() => data.sha1} className="ms-1" />
              </td>
            </tr>
          )}
          {types.includes("sha224") && (
            <tr
              className={`border-b border-border-default even:bg-bg-elevated/50 ${data.sha224 == testChecksum ? "bg-accent-cyan-dim text-accent-cyan font-semibold" : ""}`}
            >
              <th className="py-2 pr-4 text-fg-secondary text-sm text-left whitespace-nowrap">
                SHA-224
              </th>
              <td className="py-2 font-mono text-sm break-all">
                {data.sha224}
                <CopyButton getContent={() => data.sha224} className="ms-1" />
              </td>
            </tr>
          )}
          {types.includes("sha256") && (
            <tr
              className={`border-b border-border-default even:bg-bg-elevated/50 ${data.sha256 == testChecksum ? "bg-accent-cyan-dim text-accent-cyan font-semibold" : ""}`}
            >
              <th className="py-2 pr-4 text-fg-secondary text-sm text-left whitespace-nowrap">
                SHA-256
              </th>
              <td className="py-2 font-mono text-sm break-all">
                {data.sha256}
                <CopyButton getContent={() => data.sha256} className="ms-1" />
              </td>
            </tr>
          )}
          {types.includes("sha384") && (
            <tr
              className={`border-b border-border-default even:bg-bg-elevated/50 ${data.sha384 == testChecksum ? "bg-accent-cyan-dim text-accent-cyan font-semibold" : ""}`}
            >
              <th className="py-2 pr-4 text-fg-secondary text-sm text-left whitespace-nowrap">
                SHA-384
              </th>
              <td className="py-2 font-mono text-sm break-all">
                {data.sha384}
                <CopyButton getContent={() => data.sha384} className="ms-1" />
              </td>
            </tr>
          )}
          {types.includes("sha512") && (
            <tr
              className={`border-b border-border-default even:bg-bg-elevated/50 ${data.sha512 == testChecksum ? "bg-accent-cyan-dim text-accent-cyan font-semibold" : ""}`}
            >
              <th className="py-2 pr-4 text-fg-secondary text-sm text-left whitespace-nowrap">
                SHA-512
              </th>
              <td className="py-2 font-mono text-sm break-all">
                {data.sha512}
                <CopyButton getContent={() => data.sha512} className="ms-1" />
              </td>
            </tr>
          )}
          {types.includes("sha3-224") && (
            <tr
              className={`border-b border-border-default even:bg-bg-elevated/50 ${data.sha3_224 == testChecksum ? "bg-accent-cyan-dim text-accent-cyan font-semibold" : ""}`}
            >
              <th className="py-2 pr-4 text-fg-secondary text-sm text-left whitespace-nowrap">
                SHA3-224
              </th>
              <td className="py-2 font-mono text-sm break-all">
                {data.sha3_224}
                <CopyButton getContent={() => data.sha3_224} className="ms-1" />
              </td>
            </tr>
          )}
          {types.includes("sha3-256") && (
            <tr
              className={`border-b border-border-default even:bg-bg-elevated/50 ${data.sha3_256 == testChecksum ? "bg-accent-cyan-dim text-accent-cyan font-semibold" : ""}`}
            >
              <th className="py-2 pr-4 text-fg-secondary text-sm text-left whitespace-nowrap">
                SHA3-256
              </th>
              <td className="py-2 font-mono text-sm break-all">
                {data.sha3_256}
                <CopyButton getContent={() => data.sha3_256} className="ms-1" />
              </td>
            </tr>
          )}
          {types.includes("sha3-384") && (
            <tr
              className={`border-b border-border-default even:bg-bg-elevated/50 ${data.sha3_384 == testChecksum ? "bg-accent-cyan-dim text-accent-cyan font-semibold" : ""}`}
            >
              <th className="py-2 pr-4 text-fg-secondary text-sm text-left whitespace-nowrap">
                SHA3-384
              </th>
              <td className="py-2 font-mono text-sm break-all">
                {data.sha3_384}
                <CopyButton getContent={() => data.sha3_384} className="ms-1" />
              </td>
            </tr>
          )}
          {types.includes("sha3-512") && (
            <tr
              className={`border-b border-border-default even:bg-bg-elevated/50 ${data.sha3_512 == testChecksum ? "bg-accent-cyan-dim text-accent-cyan font-semibold" : ""}`}
            >
              <th className="py-2 pr-4 text-fg-secondary text-sm text-left whitespace-nowrap">
                SHA3-512
              </th>
              <td className="py-2 font-mono text-sm break-all">
                {data.sha3_512}
                <CopyButton getContent={() => data.sha3_512} className="ms-1" />
              </td>
            </tr>
          )}
          {types.includes("RIPEMD160") && (
            <tr
              className={`border-b border-border-default even:bg-bg-elevated/50 ${data.RIPEMD160 == testChecksum ? "bg-accent-cyan-dim text-accent-cyan font-semibold" : ""}`}
            >
              <th className="py-2 pr-4 text-fg-secondary text-sm text-left whitespace-nowrap">
                RIPEMD-160
              </th>
              <td className="py-2 font-mono text-sm break-all">
                {data.RIPEMD160}
                <CopyButton getContent={() => data.RIPEMD160} className="ms-1" />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

function FileCalculator() {
  const { t } = useTranslation(["checksum", "common"]);
  const fileRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [hashResList, setHashResList] = useState<HashResult[]>([]);
  const [types, setTypes] = useState<string[]>(["md5", "sha1", "sha256", "sha512"]);
  const [storageUnit, setStorageUnit] = useState<1000 | 1024>(1000);
  const calculating = selectedFiles.length > 0 && hashResList.length === 0;

  function onToggleCheck(event: ChangeEvent<HTMLInputElement>) {
    const checked = event.target.checked;
    const value = event.target.value;
    if (checked) {
      const newTypes = [...types];
      newTypes.push(value);
      setTypes(newTypes);
    } else {
      setTypes(types.filter((it) => it != value));
    }
    setHashResList([]);
  }

  function filenames(files: File[]): string {
    return files.map((f) => f.name).join(", ");
  }

  useEffect(() => {
    if (selectedFiles && selectedFiles.length > 0) {
      const length = selectedFiles.length;
      const resArr: HashResult[] = [];
      selectedFiles.forEach((f) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          var bin = e.target?.result;
          resArr.push({
            title: f.name,
            size: "(" + f.type + ") - " + formatBytes(f.size, storageUnit),
            md5: types.includes("md5") ? CryptoJS.MD5(bin).toString() : "",
            sha1: types.includes("sha1") ? CryptoJS.SHA1(bin).toString() : "",
            sha224: types.includes("sha224") ? CryptoJS.SHA224(bin).toString() : "",
            sha256: types.includes("sha256") ? CryptoJS.SHA256(bin).toString() : "",
            sha384: types.includes("sha384") ? CryptoJS.SHA384(bin).toString() : "",
            sha512: types.includes("sha512") ? CryptoJS.SHA512(bin).toString() : "",
            sha3_224: types.includes("sha3-224")
              ? CryptoJS.SHA3(bin, { outputLength: 224 }).toString()
              : "",
            sha3_256: types.includes("sha3-256")
              ? CryptoJS.SHA3(bin, { outputLength: 256 }).toString()
              : "",
            sha3_384: types.includes("sha3-384")
              ? CryptoJS.SHA3(bin, { outputLength: 384 }).toString()
              : "",
            sha3_512: types.includes("sha3-512")
              ? CryptoJS.SHA3(bin, { outputLength: 512 }).toString()
              : "",
            RIPEMD160: types.includes("RIPEMD160") ? CryptoJS.RIPEMD160(bin).toString() : "",
          });
          if (resArr.length == length) {
            setHashResList(resArr);
          }
        };
        reader.readAsBinaryString(f);
      });
    }
  }, [selectedFiles, storageUnit, types]);

  useEffect(() => {
    const input = document.getElementById("fileSelector");
    input?.addEventListener("drop", async (evt) => {
      const files = await fromEvent(evt);
    });
  }, []);

  const hashTypeOptions = [
    { value: "md5", label: "MD5", id: "md5Check" },
    { value: "sha1", label: "SHA-1", id: "sha1Check" },
    { value: "sha224", label: "SHA-224", id: "sha224Check" },
    { value: "sha256", label: "SHA-256", id: "sha256Check" },
    { value: "sha384", label: "SHA-384", id: "sha384Check" },
    { value: "sha512", label: "SHA-512", id: "sha512Check" },
    { value: "sha3-224", label: "SHA3-224", id: "sha3-224Check" },
    { value: "sha3-256", label: "SHA3-256", id: "sha3-256Check" },
    { value: "sha3-384", label: "SHA3-384", id: "sha3-384Check" },
    { value: "sha3-512", label: "SHA3-512", id: "sha3-512Check" },
    { value: "RIPEMD160", label: "RIPEMD-160", id: "RIPEMD160Check" },
  ];

  return (
    <section id="calculator" className="mt-4">
      <div
        className="relative text-xl rounded-lg border-2 border-dashed border-accent-cyan/30 bg-accent-cyan-dim/10 text-accent-cyan"
        style={{ width: "100%", height: "10rem" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center w-full w-lg-3/4 justify-center px-4">
          {selectedFiles && selectedFiles.length > 0 ? (
            <span className="truncate">{filenames(selectedFiles)}</span>
          ) : (
            <>
              <Plus size={20} className="me-1" />
              <span className="font-bold">{t("checksum:dropFilesHere")}</span>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          id="fileSelector"
          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          style={{ zIndex: -1 }}
          onClick={() => {
            if (fileRef.current) {
              const input = fileRef.current as any;
              input.value = null;
            }
          }}
          onChange={(e) => {
            setHashResList([]);
            if (e.target.files && e.target.files.length > 0) {
              const files: File[] = [];
              for (var i = 0; i < e.target.files?.length; i++) {
                files.push(e.target.files.item(i)!);
              }
              setSelectedFiles(files);
              showToast(
                t("checksum:selectedFiles", {
                  count: files.length,
                  files: files.length > 1 ? " files" : " file",
                }),
                "info",
                3000
              );
            } else {
              setSelectedFiles([]);
            }
          }}
          multiple={true}
        />
      </div>
      <div className="mt-3 text-center">
        <Button
          variant="danger"
          size="sm"
          disabled={selectedFiles.length == 0}
          onClick={() => {
            setSelectedFiles([]);
            setHashResList([]);
            if (fileRef.current) {
              const input = fileRef.current as any;
              input.value = null;
            }
            showToast(t("common:common.deselected"), "danger", 2000);
          }}
          className="w-3/4 lg:w-1/4 rounded-full uppercase"
        >
          {selectedFiles.length > 0
            ? t("checksum:deselect", { count: selectedFiles.length })
            : t("checksum:noFileChosen")}
        </Button>
      </div>
      <div className="flex justify-start mt-3">
        <div className="w-auto">
          <StyledSelect
            aria-label="Storage Unit"
            value={storageUnit}
            onChange={(e) => {
              setStorageUnit(parseInt(e.target.value) as 1000 | 1024);
              setHashResList([]);
            }}
          >
            <option value="1000">{t("checksum:storageUnit1000")}</option>
            <option value="1024">{t("checksum:storageUnit1024")}</option>
          </StyledSelect>
        </div>
      </div>
      <div className="flex flex-wrap mt-3 px-3">
        {hashTypeOptions.map((opt) => (
          <div key={opt.id} className="me-4 mt-2">
            <StyledCheckbox
              label={opt.label}
              value={opt.value}
              id={opt.id}
              checked={types.includes(opt.value)}
              onChange={onToggleCheck}
            />
          </div>
        ))}
      </div>
      {calculating && (
        <div className="flex justify-center mt-4">
          <div className="w-6 h-6 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          <span className="ms-3 text-fg-secondary">{t("common:common.calculating")}</span>
        </div>
      )}
      {hashResList.length == 0 ? (
        <div
          className="border border-border-default rounded-xl w-full flex justify-center items-center mt-4 text-lg text-fg-muted font-bold bg-bg-surface"
          style={{ height: "8rem" }}
        >
          {t("checksum:checksumOutput")}
        </div>
      ) : (
        <div className="mt-4">
          <Accordion
            items={hashResList.map((data, index) => ({
              title: <span className="text-sm font-mono">{data.title}</span>,
              content: <ChecksumDisplay data={data} types={types} />,
              defaultOpen: index === 0,
            }))}
          />
        </div>
      )}
    </section>
  );
}

function Description() {
  const { t } = useTranslation("checksum");
  return (
    <section id="description" className="mt-5">
      <div className="mb-4">
        <h5 className="font-semibold text-fg-primary">{t("descriptions.md5Title")}</h5>
        <p className="text-fg-secondary mt-1">{t("descriptions.md5")}</p>
      </div>
      <div className="mb-4">
        <h5 className="font-semibold text-fg-primary">{t("descriptions.sha1Title")}</h5>
        <p className="text-fg-secondary mt-1">{t("descriptions.sha1")}</p>
      </div>
      <div className="mb-4">
        <h5 className="font-semibold text-fg-primary">{t("descriptions.sha2Title")}</h5>
        <p className="text-fg-secondary mt-1">{t("descriptions.sha2")}</p>
        <p className="text-fg-secondary mt-1">{t("descriptions.sha2extra")}</p>
      </div>
      <div className="mb-4">
        <h5 className="font-semibold text-fg-primary">{t("descriptions.sha3Title")}</h5>
        <p className="text-fg-secondary mt-1">{t("descriptions.sha3")}</p>
      </div>
    </section>
  );
}

function HashCalculatorPage({ toolData }: InferGetStaticPropsType<typeof getStaticProps>) {
  const { t } = useTranslation("common");
  return (
    <>
      <ToolPageHeadBuilder toolPath="/checksum" />
      <Layout title={toolData.title}>
        <div className="container mx-auto px-4 py-3">
          <div className="bg-accent-cyan-dim/20 border border-accent-cyan/30 rounded-xl p-3 text-fg-secondary text-sm my-4">
            {t("alert.filesNotTransferred")}
          </div>
          <div className="bg-accent-purple-dim/20 border border-accent-purple/30 rounded-xl p-3 text-fg-secondary text-sm my-4">
            {t("alert.checksumInfo")}
          </div>
          <FileCalculator />
          <Description />
        </div>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale || "en";
  const path = "/checksum";
  const toolData: ToolData = findTool(path);
  return {
    props: {
      toolData,
      ...(await serverSideTranslations(locale, ["common", "checksum"])),
    },
  };
};

export default HashCalculatorPage;
