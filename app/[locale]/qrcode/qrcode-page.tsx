"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  QrCode,
  Download,
  Clipboard,
  Upload,
  X,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { renderLinkedText } from "../../../utils/linked-text";
import "rc-slider/assets/index.css";

const Slider = dynamic(() => import("rc-slider"), {
  ssr: false,
  loading: () => <div className="h-6 w-full animate-pulse bg-bg-input rounded" />,
});
import Layout from "../../../components/layout";
import { Button } from "../../../components/ui/button";
import {
  StyledInput,
  StyledTextarea,
  StyledSelect,
  StyledCheckbox,
} from "../../../components/ui/input";
import { showToast } from "../../../libs/toast";
import { NeonTabs } from "../../../components/ui/tabs";
import { STORAGE_KEYS } from "../../../libs/storage-keys";
import { buildContent } from "../../../libs/qrcode/encode";
import { checkCapacity } from "../../../libs/qrcode/capacity";
import { DEFAULT_STYLING, SEED_DATA, buildOptions } from "../../../libs/qrcode/styling";
import type {
  ContentType,
  QrPayload,
  StylingOptions,
  TextPayload,
  WifiPayload,
  VCardPayload,
  EmailPayload,
  SmsPayload,
  WhatsAppPayload,
  PersistedState,
  PersistedStyling,
  DotStyle,
  ErrorCorrection,
} from "../../../libs/qrcode/types";
import RelatedTools from "../../../components/related-tools";
import PrivacyBanner from "../../../components/privacy-banner";
import DescriptionSection from "../../../components/description-section";
const CONTENT_TYPES: ContentType[] = ["text", "wifi", "vcard", "email", "sms", "whatsapp"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_MIN_DIGITS = 3;
const ACCEPTED_LOGO_MIME = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const DOT_STYLES: DotStyle[] = ["square", "rounded", "dots", "classy", "classy-rounded"];
const EC_LEVELS: ErrorCorrection[] = ["L", "M", "Q", "H"];
const SCHEMA_VERSION = 1;

function emptyPayload(type: ContentType): QrPayload {
  switch (type) {
    case "text":
      return { type: "text", content: "" };
    case "wifi":
      return { type: "wifi", ssid: "", password: "", encryption: "WPA", hidden: false };
    case "vcard":
      return {
        type: "vcard",
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        org: "",
        url: "",
        address: "",
      };
    case "email":
      return { type: "email", to: "", subject: "", body: "" };
    case "sms":
      return { type: "sms", phone: "", message: "" };
    case "whatsapp":
      return { type: "whatsapp", phone: "", message: "" };
  }
}

function canCopyImage(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.clipboard?.write &&
    typeof ClipboardItem !== "undefined"
  );
}

async function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function requiredFieldsValid(p: QrPayload): boolean {
  switch (p.type) {
    case "text":
      return p.content.length > 0;
    case "wifi":
      if (p.ssid.length === 0) return false;
      return p.encryption === "nopass" ? true : p.password.length > 0;
    case "vcard":
      return p.firstName.length > 0 || p.lastName.length > 0 || p.org.length > 0;
    case "email":
      return EMAIL_RE.test(p.to);
    case "sms":
      return p.phone.replace(/[^\d]/g, "").length >= PHONE_MIN_DIGITS;
    case "whatsapp":
      return p.phone.replace(/[^\d]/g, "").length >= PHONE_MIN_DIGITS;
  }
}

function loadPersisted(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.qrcode);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (parsed.schemaVersion !== SCHEMA_VERSION) return null;
    return parsed as PersistedState;
  } catch {
    return null;
  }
}

function savePersisted(styling: StylingOptions, lastContentType: ContentType) {
  if (typeof window === "undefined") return;
  try {
    const { logo: _, ...rest } = styling;
    const payload: PersistedState = {
      styling: rest as PersistedStyling,
      lastContentType,
      schemaVersion: SCHEMA_VERSION,
    };
    localStorage.setItem(STORAGE_KEYS.qrcode, JSON.stringify(payload));
  } catch {
    /* quota exceeded */
  }
}

function TextForm({
  payload,
  onChange,
  capacityStatus = "ok",
}: {
  payload: TextPayload;
  onChange: (p: TextPayload) => void;
  capacityStatus?: "ok" | "near" | "over";
}) {
  const t = useTranslations("qrcode");
  const borderColor =
    capacityStatus === "over" ? "#ef4444" : capacityStatus === "near" ? "#eab308" : undefined;
  return (
    <StyledTextarea
      label={t("fields.content")}
      placeholder={t("fields.contentPlaceholder")}
      rows={6}
      value={payload.content}
      onChange={(e) => onChange({ ...payload, content: e.target.value })}
      style={borderColor ? { borderColor } : undefined}
    />
  );
}

function WifiForm({
  payload,
  onChange,
}: {
  payload: WifiPayload;
  onChange: (p: WifiPayload) => void;
}) {
  const t = useTranslations("qrcode");
  const [showPwd, setShowPwd] = useState(false);
  const passwordDisabled = payload.encryption === "nopass";
  return (
    <div className="flex flex-col gap-3">
      <StyledInput
        label={t("fields.ssid")}
        value={payload.ssid}
        onChange={(e) => onChange({ ...payload, ssid: e.target.value })}
      />
      <StyledSelect
        label={t("fields.encryption")}
        value={payload.encryption}
        onChange={(e) => {
          const v = e.target.value as WifiPayload["encryption"];
          onChange({
            ...payload,
            encryption: v,
            password: v === "nopass" ? "" : payload.password,
          });
        }}
      >
        <option value="WPA">WPA / WPA2</option>
        <option value="WEP">WEP</option>
        <option value="nopass">{t("fields.encryption")}: None</option>
      </StyledSelect>
      <div className="relative">
        <StyledInput
          label={t("fields.password")}
          type={showPwd ? "text" : "password"}
          disabled={passwordDisabled}
          value={passwordDisabled ? "" : payload.password}
          onChange={(e) => onChange({ ...payload, password: e.target.value })}
          className="pr-10"
        />
        {!passwordDisabled && (
          <button
            type="button"
            className="absolute right-3 top-[34px] text-fg-muted hover:text-accent-cyan"
            onClick={() => setShowPwd((v) => !v)}
            aria-label={showPwd ? t("styling.hidePassword") : t("styling.showPassword")}
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      <StyledCheckbox
        label={t("fields.hidden")}
        checked={payload.hidden}
        onChange={(e) => onChange({ ...payload, hidden: e.target.checked })}
      />
    </div>
  );
}

function VCardForm({
  payload,
  onChange,
}: {
  payload: VCardPayload;
  onChange: (p: VCardPayload) => void;
}) {
  const t = useTranslations("qrcode");
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <StyledInput
        label={t("fields.firstName")}
        value={payload.firstName}
        onChange={(e) => onChange({ ...payload, firstName: e.target.value })}
      />
      <StyledInput
        label={t("fields.lastName")}
        value={payload.lastName}
        onChange={(e) => onChange({ ...payload, lastName: e.target.value })}
      />
      <StyledInput
        label={t("fields.phone")}
        value={payload.phone}
        onChange={(e) => onChange({ ...payload, phone: e.target.value })}
      />
      <StyledInput
        label={t("fields.email")}
        value={payload.email}
        onChange={(e) => onChange({ ...payload, email: e.target.value })}
      />
      <StyledInput
        label={t("fields.org")}
        value={payload.org}
        onChange={(e) => onChange({ ...payload, org: e.target.value })}
      />
      <StyledInput
        label={t("fields.url")}
        value={payload.url}
        onChange={(e) => onChange({ ...payload, url: e.target.value })}
      />
      <div className="sm:col-span-2">
        <StyledInput
          label={t("fields.address")}
          value={payload.address}
          onChange={(e) => onChange({ ...payload, address: e.target.value })}
        />
      </div>
    </div>
  );
}

function EmailForm({
  payload,
  onChange,
}: {
  payload: EmailPayload;
  onChange: (p: EmailPayload) => void;
}) {
  const t = useTranslations("qrcode");
  const invalid = payload.to.length > 0 && !EMAIL_RE.test(payload.to);
  return (
    <div className="flex flex-col gap-3">
      <div>
        <StyledInput
          label={t("fields.to")}
          value={payload.to}
          onChange={(e) => onChange({ ...payload, to: e.target.value })}
          style={invalid ? { borderColor: "#ef4444" } : undefined}
        />
        {invalid && (
          <span className="text-xs text-red-500 mt-1 block">{t("errors.invalidEmail")}</span>
        )}
      </div>
      <StyledInput
        label={t("fields.subject")}
        value={payload.subject}
        onChange={(e) => onChange({ ...payload, subject: e.target.value })}
      />
      <StyledTextarea
        label={t("fields.body")}
        rows={4}
        value={payload.body}
        onChange={(e) => onChange({ ...payload, body: e.target.value })}
      />
    </div>
  );
}

function SmsForm({
  payload,
  onChange,
}: {
  payload: SmsPayload;
  onChange: (p: SmsPayload) => void;
}) {
  const t = useTranslations("qrcode");
  return (
    <div className="flex flex-col gap-3">
      <StyledInput
        label={t("fields.phone")}
        value={payload.phone}
        onChange={(e) => onChange({ ...payload, phone: e.target.value })}
      />
      <StyledTextarea
        label={t("fields.message")}
        rows={4}
        value={payload.message}
        onChange={(e) => onChange({ ...payload, message: e.target.value })}
      />
    </div>
  );
}

function WhatsAppForm({
  payload,
  onChange,
}: {
  payload: WhatsAppPayload;
  onChange: (p: WhatsAppPayload) => void;
}) {
  const t = useTranslations("qrcode");
  return (
    <div className="flex flex-col gap-3">
      <StyledInput
        label={t("fields.phone")}
        value={payload.phone}
        onChange={(e) => onChange({ ...payload, phone: e.target.value })}
      />
      <StyledTextarea
        label={t("fields.message")}
        rows={4}
        value={payload.message}
        onChange={(e) => onChange({ ...payload, message: e.target.value })}
      />
    </div>
  );
}

function LogoControls({
  styling,
  onChange,
}: {
  styling: StylingOptions;
  onChange: (s: StylingOptions) => void;
}) {
  const t = useTranslations("qrcode");
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleFile(file: File) {
    if (!ACCEPTED_LOGO_MIME.includes(file.type)) {
      showToast(t("errors.logoNotImage"), "danger", 3000);
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      showToast(t("errors.logoTooLarge"), "danger", 3000);
      return;
    }
    const dataUrl = await readAsDataUrl(file);
    const next: StylingOptions = {
      ...styling,
      logo: {
        dataUrl,
        size: styling.logo?.size ?? 0.4,
        margin: styling.logo?.margin ?? 4,
        hideBackgroundDots: styling.logo?.hideBackgroundDots ?? true,
      },
    };
    if (next.errorCorrection === "L" || next.errorCorrection === "M") {
      next.errorCorrection = "H";
      showToast(t("errors.ecBumpedForLogo"), "info", 3000);
    }
    onChange(next);
  }

  function clearLogo() {
    const { logo: _, ...rest } = styling;
    onChange(rest);
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm text-fg-secondary">{t("styling.logo")}</label>
      {!styling.logo ? (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- file drop zone with click fallback
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className="border-2 border-dashed border-border-default rounded-lg p-4 text-center cursor-pointer hover:border-accent-cyan text-sm text-fg-muted flex flex-col items-center gap-2"
        >
          <Upload size={20} />
          <span>{t("styling.logoUpload")}</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={styling.logo.dataUrl}
              alt="logo preview"
              className="h-10 w-10 rounded border border-border-default object-contain bg-bg-input"
            />
            <button
              type="button"
              onClick={clearLogo}
              className="flex items-center gap-1 text-sm text-fg-muted hover:text-danger"
            >
              <X size={14} /> {t("styling.logoRemove")}
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-secondary">{t("styling.logoSize")}</span>
              <span className="font-mono text-sm font-bold text-accent-cyan">
                {styling.logo.size.toFixed(2)}
              </span>
            </div>
            <div className="px-2 mt-2">
              <Slider
                min={0.2}
                max={0.5}
                step={0.05}
                value={styling.logo.size}
                railStyle={{ backgroundColor: "var(--color-bg-elevated)", height: "6px" }}
                trackStyle={{ backgroundColor: "var(--color-accent-cyan)", height: "6px" }}
                handleStyle={{
                  backgroundColor: "var(--color-accent-cyan)",
                  height: "24px",
                  width: "24px",
                  marginTop: "-9px",
                  border: "0",
                  opacity: "100",
                }}
                onChange={(v) =>
                  onChange({
                    ...styling,
                    logo: { ...styling.logo!, size: v as number },
                  })
                }
              />
            </div>
          </div>
          <StyledCheckbox
            label={t("styling.logoHideDots")}
            checked={styling.logo.hideBackgroundDots}
            onChange={(e) =>
              onChange({
                ...styling,
                logo: { ...styling.logo!, hideBackgroundDots: e.target.checked },
              })
            }
          />
        </div>
      )}
    </div>
  );
}

function StyleConfig({
  styling,
  onChange,
}: {
  styling: StylingOptions;
  onChange: (s: StylingOptions) => void;
}) {
  const t = useTranslations("qrcode");
  const [open, setOpen] = useState(false);

  const sliderStyle = {
    railStyle: { backgroundColor: "var(--color-bg-elevated)", height: "6px" },
    trackStyle: { backgroundColor: "var(--color-accent-cyan)", height: "6px" },
    handleStyle: {
      backgroundColor: "var(--color-accent-cyan)",
      height: "24px",
      width: "24px",
      marginTop: "-9px",
      border: "0",
      opacity: "100",
    },
  };

  return (
    <div className="border border-border-default rounded-lg p-4">
      <button
        type="button"
        className="flex items-center justify-between w-full cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-2">
          <h3 className="font-mono text-xs font-semibold text-fg-muted uppercase tracking-wider">
            {t("styling.title")}
          </h3>
          <span
            role="button"
            tabIndex={0}
            title={t("styling.reset")}
            className="flex items-center gap-1 text-[10px] text-fg-muted/40 hover:text-danger transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              const persisted = loadPersisted();
              if (persisted) {
                savePersisted(DEFAULT_STYLING, persisted.lastContentType);
              } else {
                localStorage.removeItem(STORAGE_KEYS.qrcode);
              }
              onChange(DEFAULT_STYLING);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                (e.target as HTMLElement).click();
              }
            }}
          >
            <RotateCcw size={11} />
            <span>{t("styling.resetLabel")}</span>
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`text-fg-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <NeonTabs
          tabs={[
            {
              label: t("styling.tabAppearance"),
              content: (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-sm text-fg-secondary">{t("styling.foreground")}</label>
                    <input
                      type="color"
                      value={styling.foregroundColor}
                      onChange={(e) => onChange({ ...styling, foregroundColor: e.target.value })}
                      className="h-8 w-16 cursor-pointer rounded border border-border-default bg-bg-input"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-sm text-fg-secondary">{t("styling.background")}</label>
                    <input
                      type="color"
                      value={styling.backgroundColor}
                      onChange={(e) => onChange({ ...styling, backgroundColor: e.target.value })}
                      className="h-8 w-16 cursor-pointer rounded border border-border-default bg-bg-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-fg-secondary block mb-2">
                      {t("styling.dotStyle")}
                    </label>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-semibold">
                      {DOT_STYLES.map((d) => (
                        <button
                          key={d}
                          type="button"
                          className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                            styling.dotStyle === d
                              ? "bg-accent-cyan text-bg-base shadow-glow"
                              : "border border-border-default text-fg-muted hover:text-fg-secondary hover:border-fg-muted"
                          }`}
                          onClick={() => onChange({ ...styling, dotStyle: d })}
                        >
                          {t(`styling.dotStyle_${d}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              label: t("styling.tabSize"),
              content: (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm text-fg-secondary block mb-2">
                      {t("styling.resolution")}
                    </label>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-semibold">
                      {([300, 600, 1024] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                            styling.size === r
                              ? "bg-accent-cyan text-bg-base shadow-glow"
                              : "border border-border-default text-fg-muted hover:text-fg-secondary hover:border-fg-muted"
                          }`}
                          onClick={() => onChange({ ...styling, size: r })}
                        >
                          {t(`styling.resolution${r}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-fg-secondary">{t("styling.margin")}</label>
                      <span className="font-mono text-sm font-bold text-accent-cyan">
                        {styling.margin}
                      </span>
                    </div>
                    <div className="px-2 mt-2">
                      <Slider
                        min={0}
                        max={40}
                        step={2}
                        value={styling.margin}
                        {...sliderStyle}
                        onChange={(v) => onChange({ ...styling, margin: v as number })}
                      />
                    </div>
                  </div>
                </div>
              ),
            },
            {
              label: t("styling.tabAdvanced"),
              content: (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm text-fg-secondary block mb-2">
                      {t("styling.errorCorrection")}
                    </label>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-semibold">
                      {EC_LEVELS.map((ec) => {
                        const hasLogo = !!styling.logo;
                        const isActive = hasLogo ? ec === "H" : styling.errorCorrection === ec;
                        const isDisabled = hasLogo && ec !== "H";
                        return (
                          <button
                            key={ec}
                            type="button"
                            disabled={isDisabled}
                            className={`px-3 py-1 rounded-full transition-all duration-200 ${
                              isActive
                                ? "bg-accent-cyan text-bg-base shadow-glow"
                                : isDisabled
                                  ? "border border-border-default text-fg-muted/40 cursor-not-allowed"
                                  : "border border-border-default text-fg-muted hover:text-fg-secondary hover:border-fg-muted cursor-pointer"
                            }`}
                            onClick={() => onChange({ ...styling, errorCorrection: ec })}
                          >
                            {ec}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <LogoControls styling={styling} onChange={onChange} />
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}

type QrInstance = {
  append: (el: HTMLElement) => void;
  update: (opts: ReturnType<typeof buildOptions>) => void;
  download: (opts: { name: string; extension: "svg" | "png" }) => void;
  getRawData: (ext: "png") => Promise<Blob | null>;
};

export default function QrCodePage() {
  const t = useTranslations("qrcode");
  const tc = useTranslations("common");
  const tTools = useTranslations("tools");
  const title = tTools("qrcode.shortTitle");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const qrRef = useRef<QrInstance | null>(null);
  const updateRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overWarnedRef = useRef(false);
  const nearWarnedRef = useRef(false);
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [hydrated, setHydrated] = useState(false);
  const [clipboardSupported, setClipboardSupported] = useState(false);
  const [contentType, setContentType] = useState<ContentType>("text");
  const [payload, setPayload] = useState<QrPayload>(emptyPayload("text"));
  const [styling, setStyling] = useState<StylingOptions>(DEFAULT_STYLING);
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- mount-only hydration from localStorage; safe pattern for SSR */
    const persisted = loadPersisted();
    if (persisted) {
      setStyling(persisted.styling);
      setContentType(persisted.lastContentType);
      setPayload(emptyPayload(persisted.lastContentType));
    }
    setClipboardSupported(canCopyImage());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => savePersisted(styling, contentType), 500);
    return () => {
      if (saveRef.current) clearTimeout(saveRef.current);
    };
  }, [styling, contentType, hydrated]);

  const requiredOk = requiredFieldsValid(payload);
  const userContent = userHasInteracted && requiredOk ? buildContent(payload) : "";
  const data = userContent || SEED_DATA;
  const capacity = checkCapacity(data, styling.errorCorrection);
  const overCapacity = capacity.status === "over";
  const nearCapacity = capacity.status === "near";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("qr-code-styling");
        const QRCodeStyling = mod.default;
        if (cancelled || !containerRef.current) return;
        const qr = new QRCodeStyling(buildOptions(data, styling)) as unknown as QrInstance;
        qr.append(containerRef.current);
        qrRef.current = qr;
      } catch {
        showToast(t("errors.libraryLoadFailed"), "danger", 5000);
      }
    })();
    return () => {
      cancelled = true;
      qrRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!qrRef.current) return;
    if (overCapacity) {
      if (!overWarnedRef.current) {
        overWarnedRef.current = true;
        showToast(t("errors.contentTooLong"), "danger", 5000);
      }
      return;
    }
    overWarnedRef.current = false;
    if (updateRef.current) clearTimeout(updateRef.current);
    updateRef.current = setTimeout(() => {
      try {
        qrRef.current?.update(buildOptions(data, styling));
      } catch {
        showToast(t("errors.generateFailed"), "danger", 3000);
      }
    }, 150);
    return () => {
      if (updateRef.current) clearTimeout(updateRef.current);
    };
  }, [data, styling, overCapacity, t]);

  useEffect(() => {
    if (nearCapacity && !nearWarnedRef.current) {
      nearWarnedRef.current = true;
      showToast(t("errors.contentNearLimit"), "warning", 3000);
    }
    if (!nearCapacity && !overCapacity) nearWarnedRef.current = false;
  }, [nearCapacity, overCapacity, t]);

  function downloadSvg() {
    qrRef.current?.download({ name: "qrcode", extension: "svg" });
  }
  function downloadPng() {
    qrRef.current?.download({ name: "qrcode", extension: "png" });
  }
  async function copyPng() {
    try {
      const canvas = containerRef.current?.querySelector("canvas");
      if (!canvas) throw new Error("no canvas");
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
      });
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      showToast(t("export.copied"), "success", 1500);
    } catch {
      showToast(tc("copyFailed"), "danger", 1500);
    }
  }

  const handlePayloadChange = (p: QrPayload) => {
    setUserHasInteracted(true);
    setPayload(p);
  };

  return (
    <Layout title={title} categoryLabel={tTools("categories.generators")} categorySlug="generators">
      <div className="container mx-auto px-4 pt-3 pb-6">
        <PrivacyBanner />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-semibold self-start">
              {CONTENT_TYPES.map((tp) => (
                <button
                  key={tp}
                  type="button"
                  className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                    contentType === tp
                      ? "bg-accent-cyan text-bg-base shadow-glow"
                      : "border border-border-default text-fg-muted hover:text-fg-secondary hover:border-fg-muted"
                  }`}
                  onClick={() => {
                    setContentType(tp);
                    setPayload(emptyPayload(tp));
                    setUserHasInteracted(false);
                  }}
                >
                  {t(`contentTypes.${tp}`)}
                </button>
              ))}
            </div>

            {contentType === "text" && (
              <TextForm
                payload={payload as TextPayload}
                onChange={(p) => handlePayloadChange(p)}
                capacityStatus={capacity.status}
              />
            )}
            {contentType === "wifi" && (
              <WifiForm payload={payload as WifiPayload} onChange={(p) => handlePayloadChange(p)} />
            )}
            {contentType === "vcard" && (
              <VCardForm
                payload={payload as VCardPayload}
                onChange={(p) => handlePayloadChange(p)}
              />
            )}
            {contentType === "email" && (
              <EmailForm
                payload={payload as EmailPayload}
                onChange={(p) => handlePayloadChange(p)}
              />
            )}
            {contentType === "sms" && (
              <SmsForm payload={payload as SmsPayload} onChange={(p) => handlePayloadChange(p)} />
            )}
            {contentType === "whatsapp" && (
              <WhatsAppForm
                payload={payload as WhatsAppPayload}
                onChange={(p) => handlePayloadChange(p)}
              />
            )}

            <StyleConfig styling={styling} onChange={setStyling} />
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative bg-bg-surface rounded-lg p-4 border border-border-default flex items-center justify-center h-[300px] w-full max-w-[360px] overflow-hidden">
              <div
                ref={containerRef}
                className={`w-full h-full flex items-center justify-center [&_canvas]:max-w-full [&_canvas]:max-h-full [&_canvas]:object-contain ${userHasInteracted && !requiredOk ? "hidden" : ""}`}
              />
              {userHasInteracted && !requiredOk && (
                <div className="flex flex-col items-center gap-2 text-fg-muted text-sm text-center px-4">
                  <QrCode size={48} className="opacity-40" />
                  <span>{t("preview.empty")}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 w-full max-w-[360px]">
              <Button
                variant="outline-cyan"
                size="md"
                onClick={downloadSvg}
                disabled={userHasInteracted && !requiredOk}
              >
                <Download size={14} />
                {t("export.svg")}
              </Button>
              <Button
                variant="outline-purple"
                size="md"
                onClick={downloadPng}
                disabled={userHasInteracted && !requiredOk}
              >
                <Download size={14} />
                {t("export.png")}
              </Button>
              {clipboardSupported && (
                <Button
                  variant="outline-blue"
                  size="md"
                  onClick={copyPng}
                  disabled={userHasInteracted && !requiredOk}
                >
                  <Clipboard size={14} />
                  {t("export.clipboard")}
                </Button>
              )}
            </div>
          </div>
        </div>

        <DescriptionSection namespace="qrcode" />
        <RelatedTools currentTool="qrcode" />
      </div>
    </Layout>
  );
}
