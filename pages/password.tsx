import "rc-slider/assets/index.css";
import Slider from "rc-slider";
import { ChangeEvent, useMemo, useState } from "react";
import {
  memorable_capitalize_checked,
  memorable_full_words_checked,
  random_uppercase_checked,
  random_lowercase_checked,
  random_numbers_checked,
  random_symbols_checked,
  random_avoid_amibugous_checked,
  printPassword,
  copyPassword,
  generate,
  defaultCharacters,
  defaultLength,
  ComparisonData,
  PasswordLength,
  PasswordType,
} from "../libs/password/main";

import { GetStaticProps, InferGetStaticPropsType } from "next";
import { showToast } from "../libs/toast";
import Layout from "../components/layout";
import { ToolPageHeadBuilder } from "../components/head_builder";
import { useTranslation } from "next-i18next/pages";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { CopyButton } from "../components/ui/copy-btn";
import { Button } from "../components/ui/button";
import { StyledCheckbox } from "../components/ui/input";
import { StyledInput } from "../components/ui/input";
import { Accordion } from "../components/ui/accordion";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Clipboard, RefreshCw, Trash2, BookmarkPlus, ChevronsDown, ChevronsUp } from "lucide-react";

const default_type = "Random";

const alert_copy_timeout = 2000;
const alert_del_timeout = 2000;
const alert_gen_timeout = 1000;
const alert_comparison_timeout = 1000;

function getPasswordLevelStyle(type: PasswordType, password: string[]) {
  let width = undefined;
  let backgroundColor = undefined;
  let len = 0;
  switch (type) {
    case "Random":
      len = password[0].length;
      if (len >= 12) {
        width = "100%";
        backgroundColor = "#06D6A0";
      } else if (len >= 10) {
        width = "75%";
        backgroundColor = "#06D6A0";
      } else if (len >= 8) {
        width = "50%";
        backgroundColor = "orange";
      } else if (len >= 6) {
        width = "25%";
        backgroundColor = "red";
      } else {
        width = "0%";
      }
      break;
    case "Memorable":
      len = password.length;
      if (len >= 6) {
        width = "100%";
        backgroundColor = "#06D6A0";
      } else if (len >= 5) {
        width = "75%";
        backgroundColor = "#06D6A0";
      } else if (len >= 4) {
        width = "50%";
        backgroundColor = "orange";
      } else if (len >= 3) {
        width = "25%";
        backgroundColor = "red";
      } else {
        width = "0%";
      }
      break;
  }

  return {
    width: width,
    backgroundColor: backgroundColor,
  };
}

function ComparisonList({
  list,
  delCallback,
  clearAll,
}: {
  list: Array<ComparisonData>;
  delCallback: (index: number) => void;
  clearAll: () => void;
}) {
  const { t } = useTranslation(["common", "password"]);
  const [isOpen, setIsOpen] = useState(true);

  function onDel(index: number) {
    delCallback(index);
    showToast(t("common:common.deleted"), "danger", alert_del_timeout);
  }

  function onClearAll() {
    clearAll();
    showToast(t("common:common.cleared"), "danger", alert_del_timeout);
  }

  return (
    <div className={`flex flex-wrap mt-3 justify-center`} hidden={list.length == 0}>
      <button
        className="col-auto text-accent-cyan font-bold flex items-center gap-1 bg-transparent border-none cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {t("password:comparison")}
        {isOpen ? <ChevronsUp size={18} /> : <ChevronsDown size={18} />}
      </button>
      {isOpen && (
        <div className="w-full mt-2">
          <div className="text-end me-1">
            <button
              className="text-danger text-sm bg-transparent border-none cursor-pointer"
              onClick={onClearAll}
            >
              {t("password:clearAllWithCount", { count: list.length })}
            </button>
          </div>
          {list.map((record, index) => {
            const { width, backgroundColor } = getPasswordLevelStyle(record.type, record.password);
            const datetime = new Date(record.timestamp).toLocaleString();
            return (
              <Card key={index} className="mt-2 relative overflow-hidden">
                <div className="flex items-start">
                  <div
                    className="flex-1 text-center break-all text-2xl sm:text-3xl font-mono px-4 py-2"
                    dangerouslySetInnerHTML={{
                      __html: printPassword(record.type, record.password),
                    }}
                  />
                  <div className="hidden md:flex items-center gap-2 px-2">
                    <CopyButton getContent={() => copyPassword(record.type, record.password)} />
                    <button
                      type="button"
                      className="text-fg-muted hover:text-danger transition-colors cursor-pointer"
                      title={t("common:common.delete")}
                      onClick={() => onDel(index)}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="h-1 w-full bg-bg-elevated">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: width, backgroundColor: backgroundColor }}
                  />
                </div>
                <div className="flex md:hidden justify-around items-center">
                  <button
                    type="button"
                    className="p-2 text-fg-muted hover:text-accent-cyan transition-colors cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(copyPassword(record.type, record.password));
                      showToast(t("common:common.copied"), "success", alert_copy_timeout);
                    }}
                  >
                    <Clipboard size={20} />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-fg-muted hover:text-danger transition-colors cursor-pointer"
                    onClick={() => onDel(index)}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="absolute -top-1 left-2">
                  <Badge variant="default">{datetime}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Generator() {
  const { t } = useTranslation(["common", "password"]);
  const [passwordType, setPasswordType] = useState<PasswordType>(default_type);
  const [characters, setCharacters] = useState<number>(defaultCharacters(default_type));
  const [passwordLength, setPasswordLength] = useState<PasswordLength>(defaultLength(default_type));

  const [password, setPassword] = useState<string[]>(() =>
    generate(default_type, defaultCharacters(default_type), defaultLength(default_type).current)
  );
  const [comparisons, setComparisons] = useState<ComparisonData[]>([]);
  const [firstSave, setFirstSave] = useState<boolean>(true);

  const levelStyle = useMemo(
    () => getPasswordLevelStyle(passwordType, password),
    [passwordType, password]
  );

  function onTypeChange(event: ChangeEvent<HTMLInputElement>) {
    let type: PasswordType = event.target.checked ? "Memorable" : "Random";
    const newChars = defaultCharacters(type);
    const newLength = defaultLength(type);

    setPasswordType(type);
    setCharacters(newChars);
    setPasswordLength(newLength);
    setPassword(generate(type, newChars, newLength.current));
  }

  function bitOperate(currentValue: number, checked: boolean, checkedValue: number) {
    if (checked) {
      return currentValue | checkedValue;
    } else {
      return currentValue & ~checkedValue;
    }
  }

  function onCheckBoxChange(event: ChangeEvent<HTMLInputElement>) {
    const name = event.target.name;
    const checked = event.target.checked;

    let chars = characters;
    switch (name) {
      case "uppercase":
        chars = bitOperate(chars, checked, random_uppercase_checked);
        break;
      case "lowercase":
        chars = bitOperate(chars, checked, random_lowercase_checked);
        break;
      case "symbols":
        chars = bitOperate(chars, checked, random_symbols_checked);
        break;
      case "numbers":
        chars = bitOperate(chars, checked, random_numbers_checked);
        break;
      case "avoidAmibugous":
        chars = bitOperate(chars, checked, random_avoid_amibugous_checked);
        break;
      case "capitalize":
        chars = bitOperate(chars, checked, memorable_capitalize_checked);
        break;
      case "fullwords":
        chars = bitOperate(chars, checked, memorable_full_words_checked);
        break;
      default:
        console.error("Invalid checkbox name: " + name);
        return;
    }
    if (passwordType == "Memorable" || (chars != 0 && chars != random_avoid_amibugous_checked)) {
      setCharacters(chars);
      setPassword(generate(passwordType, chars, passwordLength.current));
    }
  }

  function copyAction() {
    navigator.clipboard.writeText(copyPassword(passwordType, password));
    showToast(t("common:common.copied"), "success", alert_copy_timeout);
  }

  function generateAction() {
    const password = generate(passwordType, characters, passwordLength.current);
    setPassword(password);
    showToast(t("common:common.generated"), "info", alert_gen_timeout, "generatedAlert");
  }

  function setLength(length: number) {
    setPasswordLength({
      current: length,
      min: passwordLength.min,
      max: passwordLength.max,
    });
    setPassword(generate(passwordType, characters, length));
  }

  function addComparisionAction() {
    if (comparisons.length == 0 || comparisons[0].password != password) {
      const comparisonsTemp = [
        {
          type: passwordType,
          password: password,
          characters: characters,
          timestamp: new Date().getTime(),
        },
      ];
      comparisonsTemp.push(...comparisons);
      setComparisons(comparisonsTemp);
      showToast(t("common:common.savedToComparison"), "success", alert_comparison_timeout);

      if (firstSave) {
        setFirstSave(false);
      }
    }
  }

  return (
    <section id="generator">
      <div className="bg-accent-cyan-dim/20 border border-accent-cyan/30 rounded-xl p-3 text-fg-secondary text-sm">
        {t("password:alertNotTransferred")}
      </div>
      <div className="flex justify-center text-center text-fg-primary mt-4">
        <div className="w-11/12">
          <p className="font-bold text-3xl">{t("password:needRandom")}</p>
          <p className="text-xl font-light italic text-fg-secondary">
            {t("password:generateSubtext")}
          </p>
        </div>
      </div>
      <div className="font-bold text-xl mt-3 px-3 mb-2 text-fg-secondary">
        {t("password:generatedPassword")}
      </div>
      <Card className="relative" hover={false}>
        <div className="flex items-center relative py-4 sm:py-6 px-2 sm:px-6">
          <div
            className="flex-1 text-center break-all text-xl sm:text-4xl font-mono leading-normal"
            dangerouslySetInnerHTML={{ __html: printPassword(passwordType, password) }}
          />
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              className="text-fg-muted hover:text-accent-cyan transition-colors cursor-pointer"
              onClick={copyAction}
              title={t("common:common.copy")}
            >
              <Clipboard size={28} />
            </button>
            <button
              type="button"
              className="text-fg-muted hover:text-accent-cyan transition-colors cursor-pointer"
              onClick={generateAction}
              title={t("common:common.generate")}
            >
              <RefreshCw size={28} />
            </button>
          </div>
          <button
            type="button"
            className="absolute bottom-1 end-2 text-fg-muted hover:text-accent-cyan transition-colors cursor-pointer"
            onClick={addComparisionAction}
            title={t("common:common.compare")}
          >
            <BookmarkPlus size={22} />
          </button>
        </div>
        <div className="h-1.5 w-full bg-bg-elevated rounded-b-xl overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: levelStyle.width, backgroundColor: levelStyle.backgroundColor }}
          />
        </div>
      </Card>
      {}
      <div className="mt-4 flex justify-around items-center md:hidden">
        <Button
          variant="primary"
          size="lg"
          onClick={generateAction}
          className="w-10/12 rounded-full font-bold"
        >
          {t("password:generatePassword")}
        </Button>
      </div>
      <div className="mt-3 flex justify-around items-center md:hidden">
        <Button
          variant="danger"
          size="lg"
          onClick={copyAction}
          className="w-10/12 rounded-full font-bold"
        >
          {t("password:copyPassword")}
        </Button>
      </div>
      {}
      <Card className="mt-4" hover={false}>
        <div className="p-3 md:p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold">{t("password:customizeYourPassword")}</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded accent-[#06D6A0] cursor-pointer"
                id="memorableSwitch"
                checked={passwordType == "Memorable"}
                onChange={onTypeChange}
              />
              <span className="font-bold text-danger">{t("password:memorable")}</span>
            </label>
          </div>
          <div className="w-full h-px bg-border-default" />
          <div className="flex flex-wrap px-3">
            <div className="w-full lg:w-1/2 mt-3">
              <label className="text-lg">{t("password:passwordLength")}</label>
              <div className="flex items-center mt-2 gap-3">
                <div className="w-1/4">
                  <StyledInput
                    type="number"
                    step={1}
                    min={passwordLength.min}
                    max={passwordLength.max}
                    value={passwordLength.current}
                    onChange={(e) => {
                      setLength(parseInt(e.target.value));
                    }}
                  />
                </div>
                <div className="w-3/4">
                  <Slider
                    min={passwordLength.min}
                    max={passwordLength.max}
                    step={1}
                    value={passwordLength.current}
                    railStyle={{ backgroundColor: "#1e1e2e", height: "6px" }}
                    trackStyle={{ backgroundColor: "#06D6A0", height: "6px" }}
                    handleStyle={{
                      backgroundColor: "#06D6A0",
                      height: "30px",
                      width: "30px",
                      marginTop: "-12px",
                      marginLeft: "-12px",
                      border: "0",
                      transform: "none",
                      opacity: "100",
                    }}
                    onChange={(value) => {
                      setLength(value as number);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2 mt-3">
              {passwordType == "Random" && (
                <div className="flex flex-wrap">
                  <div className="w-1/2">
                    <StyledCheckbox
                      label={t("password:uppercase")}
                      checked={(characters & random_uppercase_checked) != 0}
                      id="uppercaseCheck"
                      name="uppercase"
                      onChange={onCheckBoxChange}
                      className="py-2"
                    />
                  </div>
                  <div className="w-1/2">
                    <StyledCheckbox
                      label={t("password:lowercase")}
                      checked={(characters & random_lowercase_checked) != 0}
                      id="lowercaseCheck"
                      name="lowercase"
                      onChange={onCheckBoxChange}
                      className="py-2"
                    />
                  </div>
                  <div className="w-1/2">
                    <StyledCheckbox
                      label={t("password:numbers")}
                      checked={(characters & random_numbers_checked) != 0}
                      id="numbersCheck"
                      name="numbers"
                      onChange={onCheckBoxChange}
                      className="py-2"
                    />
                  </div>
                  <div className="w-1/2">
                    <StyledCheckbox
                      label={t("password:symbols")}
                      checked={(characters & random_symbols_checked) != 0}
                      id="symoblsCheck"
                      name="symbols"
                      onChange={onCheckBoxChange}
                      className="py-2"
                    />
                  </div>
                  <div className="w-auto">
                    <StyledCheckbox
                      label={t("password:avoidAmbiguous")}
                      checked={(characters & random_avoid_amibugous_checked) != 0}
                      id="avoidAmibugousCheck"
                      name="avoidAmibugous"
                      onChange={onCheckBoxChange}
                      className="py-2"
                    />
                  </div>
                </div>
              )}
              {passwordType == "Memorable" && (
                <div className="flex flex-wrap">
                  <div className="w-auto">
                    <StyledCheckbox
                      label={t("password:capitalize")}
                      checked={(characters & memorable_capitalize_checked) != 0}
                      id="capitalizeCheck"
                      name="capitalize"
                      onChange={onCheckBoxChange}
                      className="py-2"
                    />
                  </div>
                  <div className="w-auto">
                    <StyledCheckbox
                      label={t("password:fullWords")}
                      checked={(characters & memorable_full_words_checked) != 0}
                      id="fullwordsCheck"
                      name="fullwords"
                      onChange={onCheckBoxChange}
                      className="py-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
      {}
      <div className="mt-4 justify-center hidden md:flex">
        <Button
          variant="danger"
          size="lg"
          onClick={copyAction}
          className="w-full md:w-7/12 lg:w-1/3 rounded-full font-bold"
        >
          {t("password:copyPassword")}
        </Button>
      </div>
      <div className="mt-4 flex justify-center">
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            navigator.clipboard.writeText("");
            showToast(t("common:common.clearedClipboard"), "danger", 1000);
          }}
          className="w-full md:w-7/12 lg:w-1/3 rounded-full font-bold"
        >
          {t("password:clearClipboard")}
        </Button>
      </div>

      <ComparisonList
        list={comparisons}
        delCallback={(index) => {
          const temp = comparisons.slice(0, index);
          temp.push(...comparisons.slice(index + 1));
          setComparisons(temp);
        }}
        clearAll={() => {
          setComparisons([]);
        }}
      />
    </section>
  );
}

interface QuestionData {
  title: string;
  body: string;
}

function Question() {
  const { t } = useTranslation("password");

  const questions: QuestionData[] = t("questions", { returnObjects: true }) as any;

  return (
    <section className="my-5 text-center">
      <p className="font-bold text-3xl">{t("strongPasswordTitle")}</p>
      <div className="mt-5">
        <Accordion
          items={questions.map((v, index) => ({
            title: v.title,
            content: <p style={{ textIndent: "2rem", lineHeight: "1.8rem" }}>{v.body}</p>,
            defaultOpen: index === 0,
          }))}
        />
      </div>
    </section>
  );
}

function PasswordPage() {
  const { t } = useTranslation("tools");
  const title = t("password.title");

  return (
    <>
      <ToolPageHeadBuilder toolPath="/password" />
      <Layout title={title}>
        <div className="container mx-auto px-4 pt-4">
          <Generator />
          <Question />
        </div>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale || "en";
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "password", "tools"])),
    },
  };
};

export default PasswordPage;
