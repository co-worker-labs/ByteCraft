"use client";

import { useState, Fragment } from "react";
import { useTranslations } from "next-intl";
import {
  Send,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import dynamic from "next/dynamic";

const JsonView = dynamic(() => import("@uiw/react-json-view"), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse bg-bg-input rounded" />,
});
import Layout from "../../../components/layout";
import { NeonTabs } from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import { CopyButton } from "../../../components/ui/copy-btn";
import { KeyValueEditor } from "../../../components/httpclient/key-value-editor";
import { useHttpClient } from "../../../libs/httpclient/use-http-client";
import { omniKitJsonTheme } from "../../../libs/json-view-theme";
import {
  HTTP_METHODS,
  TIMEOUT_OPTIONS,
  BODY_TYPE_OPTIONS,
  AUTH_TYPE_OPTIONS,
  COMMON_HEADERS,
  DEFAULT_REQUEST_CONFIG,
  emptyKeyValue,
  type HttpMethod,
  type BodyType,
  type AuthType,
  type KeyValue,
  type HistoryEntry,
} from "../../../libs/httpclient/types";
import { useIsMobile } from "../../../hooks/use-is-mobile";
import { formatBytes } from "../../../utils/storage";
import RelatedTools from "../../../components/related-tools";
import { Accordion } from "../../../components/ui/accordion";
import { CircleHelp } from "lucide-react";

const METHOD_COLORS: Record<string, string> = {
  GET: "text-green-500",
  POST: "text-yellow-500",
  PUT: "text-blue-500",
  PATCH: "text-blue-500",
  DELETE: "text-red-500",
  HEAD: "text-fg-muted",
  OPTIONS: "text-fg-muted",
};

const STATUS_COLORS: Record<string, string> = {
  "2": "text-green-500",
  "3": "text-blue-500",
  "4": "text-yellow-500",
  "5": "text-red-500",
};

function statusColor(code: number): string {
  return STATUS_COLORS[String(code)[0]] || "text-fg-primary";
}

function timeAgo(
  timestamp: number,
  t: (key: string, vars?: Record<string, number>) => string
): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return t("ago.seconds", { count: diff });
  if (diff < 3600) return t("ago.minutes", { count: Math.floor(diff / 60) });
  if (diff < 86400) return t("ago.hours", { count: Math.floor(diff / 3600) });
  return t("ago.days", { count: Math.floor(diff / 86400) });
}

function formatSize(bytes: number): string {
  return formatBytes(bytes, 1000, 2);
}

function formatTiming(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function RequestPanel({ store }: { store: ReturnType<typeof useHttpClient> }) {
  const t = useTranslations("httpclient");
  const {
    requestConfig,
    setRequestConfig,
    loading,
    timeout,
    setTimeoutValue,
    sendRequest,
    history,
    restoreFromHistory,
    clearHistory,
  } = store;

  function updateConfig(partial: Partial<typeof requestConfig>) {
    setRequestConfig((prev) => ({ ...prev, ...partial }));
  }

  function syncParamsFromUrl(url: string) {
    try {
      const u = new URL(url);
      const params: KeyValue[] = [];
      u.searchParams.forEach((value, key) => {
        params.push({ key, value, enabled: true });
      });
      updateConfig({
        url: url.split("?")[0],
        params: params.length ? params : requestConfig.params,
      });
    } catch {
      // not a valid URL yet
    }
  }

  function handleSend() {
    sendRequest();
  }

  return (
    <section className="space-y-3">
      <div className="flex items-stretch gap-2">
        <select
          value={requestConfig.method}
          onChange={(e) => updateConfig({ method: e.target.value as HttpMethod })}
          className={`bg-bg-input border border-border-default rounded-lg px-3 py-2 text-sm font-mono font-semibold focus:outline-none focus:border-accent-cyan transition-colors cursor-pointer shrink-0 ${METHOD_COLORS[requestConfig.method]}`}
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={requestConfig.url}
          onChange={(e) => updateConfig({ url: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          onBlur={() => syncParamsFromUrl(requestConfig.url)}
          placeholder={t("url.placeholder")}
          className="flex-1 min-w-0 bg-bg-input border border-border-default rounded-lg px-3 py-2 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan transition-colors font-mono"
        />

        <button
          type="button"
          role="switch"
          aria-checked={requestConfig.useProxy}
          onClick={() => updateConfig({ useProxy: !requestConfig.useProxy })}
          title={t("proxy.tooltip")}
          className={`shrink-0 flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer select-none ${
            requestConfig.useProxy
              ? "border-accent-cyan text-accent-cyan bg-accent-cyan/10"
              : "border-border-default text-fg-muted bg-bg-input hover:text-fg-secondary"
          }`}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: requestConfig.useProxy ? "var(--accent-cyan)" : "var(--fg-muted)",
            }}
          />
          {t("proxy.label")}
        </button>

        <select
          value={timeout ?? ""}
          onChange={(e) => setTimeoutValue(e.target.value ? Number(e.target.value) : null)}
          className="bg-bg-input border border-border-default rounded-lg px-3 py-2 text-sm text-fg-secondary focus:outline-none focus:border-accent-cyan transition-colors cursor-pointer shrink-0"
        >
          {TIMEOUT_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value ?? ""}>
              {opt.label}
            </option>
          ))}
        </select>

        <HistoryDrawer history={history} onRestore={restoreFromHistory} onClear={clearHistory} />

        <Button
          variant="primary"
          onClick={handleSend}
          disabled={loading || !requestConfig.url.trim()}
          className="shrink-0 min-w-[80px]"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {loading ? t("sending") : t("send")}
        </Button>
      </div>

      <NeonTabs
        tabs={[
          {
            label: t("tabs.params"),
            content: (
              <KeyValueEditor
                pairs={requestConfig.params}
                onChange={(params) => updateConfig({ params })}
                keyPlaceholder={t("kv.keyPlaceholder")}
                valuePlaceholder={t("kv.valuePlaceholder")}
              />
            ),
          },
          {
            label: t("tabs.headers"),
            content: (
              <KeyValueEditor
                pairs={requestConfig.headers}
                onChange={(headers) => updateConfig({ headers })}
                suggestions={COMMON_HEADERS}
                keyPlaceholder={t("kv.keyPlaceholder")}
                valuePlaceholder={t("kv.valuePlaceholder")}
              />
            ),
          },
          {
            label: t("tabs.body"),
            content: (
              <BodyEditor
                bodyType={requestConfig.bodyType}
                bodyContent={requestConfig.bodyContent}
                formData={requestConfig.formData}
                onChange={(partial) => updateConfig(partial)}
              />
            ),
          },
          {
            label: t("tabs.auth"),
            content: (
              <AuthEditor
                authType={requestConfig.authType}
                bearerToken={requestConfig.bearerToken}
                basicUser={requestConfig.basicUser}
                basicPass={requestConfig.basicPass}
                onChange={(partial) => updateConfig(partial)}
              />
            ),
          },
        ]}
      />
    </section>
  );
}

function BodyEditor({
  bodyType,
  bodyContent,
  formData,
  onChange,
}: {
  bodyType: BodyType;
  bodyContent: string;
  formData: KeyValue[];
  onChange: (
    partial: Partial<{ bodyType: BodyType; bodyContent: string; formData: KeyValue[] }>
  ) => void;
}) {
  const t = useTranslations("httpclient");

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {BODY_TYPE_OPTIONS.map((bt) => (
          <button
            key={bt}
            type="button"
            onClick={() => onChange({ bodyType: bt })}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
              bodyType === bt
                ? "bg-accent-cyan text-bg-base font-medium"
                : "bg-bg-input text-fg-secondary hover:text-fg-primary border border-border-default"
            }`}
          >
            {t(`bodyType.${bt}`)}
          </button>
        ))}
      </div>

      {bodyType === "json" && (
        <textarea
          value={bodyContent}
          onChange={(e) => onChange({ bodyContent: e.target.value })}
          placeholder={t("bodyPlaceholder")}
          rows={8}
          className="w-full bg-bg-input border border-border-default rounded-lg px-3 py-2 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan transition-colors resize-y font-mono"
        />
      )}

      {(bodyType === "form-data" || bodyType === "urlencoded") && (
        <KeyValueEditor
          pairs={formData}
          onChange={(fd) => onChange({ formData: fd })}
          keyPlaceholder={t("kv.keyPlaceholder")}
          valuePlaceholder={t("kv.valuePlaceholder")}
        />
      )}

      {bodyType === "raw" && (
        <textarea
          value={bodyContent}
          onChange={(e) => onChange({ bodyContent: e.target.value })}
          placeholder={t("bodyPlaceholder")}
          rows={8}
          className="w-full bg-bg-input border border-border-default rounded-lg px-3 py-2 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan transition-colors resize-y font-mono"
        />
      )}
    </div>
  );
}

function AuthEditor({
  authType,
  bearerToken,
  basicUser,
  basicPass,
  onChange,
}: {
  authType: AuthType;
  bearerToken: string;
  basicUser: string;
  basicPass: string;
  onChange: (
    partial: Partial<{
      authType: AuthType;
      bearerToken: string;
      basicUser: string;
      basicPass: string;
    }>
  ) => void;
}) {
  const t = useTranslations("httpclient");

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {AUTH_TYPE_OPTIONS.map((at) => (
          <button
            key={at}
            type="button"
            onClick={() => onChange({ authType: at })}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
              authType === at
                ? "bg-accent-cyan text-bg-base font-medium"
                : "bg-bg-input text-fg-secondary hover:text-fg-primary border border-border-default"
            }`}
          >
            {t(`authType.${at}`)}
          </button>
        ))}
      </div>

      {authType === "bearer" && (
        <input
          type="text"
          value={bearerToken}
          onChange={(e) => onChange({ bearerToken: e.target.value })}
          placeholder={t("bearerToken.placeholder")}
          className="w-full bg-bg-input border border-border-default rounded-lg px-3 py-2 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan transition-colors font-mono"
        />
      )}

      {authType === "basic" && (
        <div className="flex gap-2">
          <input
            type="text"
            value={basicUser}
            onChange={(e) => onChange({ basicUser: e.target.value })}
            placeholder={t("basicAuth.usernamePlaceholder")}
            className="flex-1 bg-bg-input border border-border-default rounded-lg px-3 py-2 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan transition-colors"
          />
          <input
            type="password"
            value={basicPass}
            onChange={(e) => onChange({ basicPass: e.target.value })}
            placeholder={t("basicAuth.passwordPlaceholder")}
            className="flex-1 bg-bg-input border border-border-default rounded-lg px-3 py-2 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan transition-colors"
          />
        </div>
      )}
    </div>
  );
}

function HistoryDrawer({
  history,
  onRestore,
  onClear,
}: {
  history: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
  onClear: () => void;
}) {
  const t = useTranslations("httpclient");
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 bg-bg-input border border-border-default rounded-lg px-3 py-2 text-sm text-fg-muted hover:text-fg-secondary transition-colors cursor-pointer shrink-0"
        title={t("history.title")}
      >
        <Clock size={16} />
      </button>

      <Transition show={open} as={Fragment}>
        <Dialog onClose={() => setOpen(false)} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-x-full"
            enterTo="opacity-100 translate-x-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-x-0"
            leaveTo="opacity-0 translate-x-full"
          >
            <Dialog.Panel
              className={`fixed right-0 top-0 bottom-0 bg-bg-surface border-l border-border-default shadow-xl flex flex-col ${
                isMobile ? "w-full" : "w-96"
              }`}
            >
              <div className="flex items-center justify-between p-4 border-b border-border-default">
                <Dialog.Title className="text-sm font-semibold text-fg-primary">
                  {t("history.title")}
                </Dialog.Title>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-fg-muted hover:text-fg-primary transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {history.length === 0 && (
                  <p className="text-sm text-fg-muted text-center py-8">{t("history.empty")}</p>
                )}
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      onRestore(entry);
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent-cyan-dim transition-colors cursor-pointer mb-1"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-semibold shrink-0 ${METHOD_COLORS[entry.request.method]}`}
                      >
                        {entry.request.method}
                      </span>
                      <span className="text-sm text-fg-primary truncate flex-1 font-mono">
                        {entry.request.url}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${statusColor(entry.responseStatus)}`}>
                        {entry.responseStatus} {entry.responseStatusText}
                      </span>
                      <span className="text-xs text-fg-muted">
                        {timeAgo(entry.createdAt, (key: string, vars?: Record<string, number>) =>
                          t(`history.${key}`, vars as unknown as Record<string, string>)
                        )}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {history.length > 0 && (
                <div className="p-3 border-t border-border-default">
                  <Button variant="danger" size="sm" onClick={onClear} className="w-full">
                    <Trash2 size={14} />
                    {t("history.clear")}
                  </Button>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}

function ResponsePanel({ store }: { store: ReturnType<typeof useHttpClient> }) {
  const t = useTranslations("httpclient");
  const { response, error, loading, timeout } = store;
  const [bodyView, setBodyView] = useState<"pretty" | "raw">("pretty");

  if (loading) {
    return (
      <section className="mt-6 border border-border-default rounded-xl p-8 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-accent-cyan" />
        <span className="ml-3 text-fg-secondary text-sm">{t("sending")}</span>
      </section>
    );
  }

  if (error) {
    const message = error.isCors
      ? t("error.cors")
      : error.isTimeout
        ? t("error.timeout", {
            timeout: String(Math.round((timeout ?? 30000) / 1000)),
          })
        : t("error.generic");

    return (
      <section className="mt-6 border border-danger/30 rounded-xl p-6 bg-danger/5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-danger shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-danger font-medium">{message}</p>
            {!error.isCors && !error.isTimeout && (
              <p className="text-xs text-fg-muted mt-1 font-mono break-all">{error.message}</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (!response) {
    return (
      <section className="mt-6 border border-border-default rounded-xl p-8 text-center">
        <p className="text-fg-muted text-sm">{t("response.emptyState")}</p>
      </section>
    );
  }

  const responseHeaders = Object.entries(response.headers);

  return (
    <section className="mt-6 space-y-3">
      <div className="flex items-center gap-3 flex-wrap border border-border-default rounded-xl p-3 bg-bg-surface">
        <span className={`text-sm font-mono font-semibold ${statusColor(response.status)}`}>
          {response.status} {response.statusText}
        </span>
        <span className="text-xs text-fg-muted">{formatTiming(response.timing.total)}</span>
        <span className="text-xs text-fg-muted">{formatSize(response.size)}</span>
        <span className="text-xs text-fg-muted uppercase">{response.bodyType}</span>
        <div className="flex-1" />
        <CopyButton getContent={() => response.body} label={t("response.copyBody")} />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            const blob = new Blob([response.body]);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `response.${response.bodyType === "json" ? "json" : response.bodyType === "html" ? "html" : response.bodyType === "xml" ? "xml" : "txt"}`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download size={14} />
          {t("response.download")}
        </Button>
      </div>

      <NeonTabs
        tabs={[
          {
            label: t("response.tabs.body"),
            content: (
              <ResponseBodyTab response={response} bodyView={bodyView} setBodyView={setBodyView} />
            ),
          },
          {
            label: t("response.tabs.headers"),
            content: (
              <div className="space-y-1">
                {responseHeaders.length === 0 && (
                  <p className="text-sm text-fg-muted">{t("response.noHeaders")}</p>
                )}
                {responseHeaders.map(([key, value]) => (
                  <div key={key} className="flex gap-2 text-sm">
                    <span className="text-accent-cyan font-medium shrink-0">{key}:</span>
                    <span className="text-fg-primary break-all font-mono">{value}</span>
                  </div>
                ))}
              </div>
            ),
          },
          {
            label: t("response.tabs.cookies"),
            content: (
              <div className="space-y-2">
                {response.cookies.length === 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-fg-muted">{t("response.noCookies")}</p>
                    <p className="text-xs text-fg-muted">{t("response.cookieNote")}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border-default">
                          <th className="text-left py-1.5 px-2 text-fg-muted font-medium">Name</th>
                          <th className="text-left py-1.5 px-2 text-fg-muted font-medium">Value</th>
                          <th className="text-left py-1.5 px-2 text-fg-muted font-medium">Path</th>
                          <th className="text-left py-1.5 px-2 text-fg-muted font-medium">
                            Expires
                          </th>
                          <th className="text-left py-1.5 px-2 text-fg-muted font-medium">Flags</th>
                        </tr>
                      </thead>
                      <tbody>
                        {response.cookies.map((cookie, i) => (
                          <tr key={i} className="border-b border-border-subtle">
                            <td className="py-1.5 px-2 font-mono text-fg-primary">{cookie.name}</td>
                            <td className="py-1.5 px-2 font-mono text-fg-primary truncate max-w-[200px]">
                              {cookie.value}
                            </td>
                            <td className="py-1.5 px-2 text-fg-secondary">{cookie.path ?? "—"}</td>
                            <td className="py-1.5 px-2 text-fg-secondary text-xs">
                              {cookie.expires ?? "—"}
                            </td>
                            <td className="py-1.5 px-2 text-fg-secondary text-xs">
                              {cookie.httpOnly && (
                                <span className="mr-1 text-yellow-500">HttpOnly</span>
                              )}
                              {cookie.secure && <span className="mr-1 text-green-500">Secure</span>}
                              {cookie.sameSite && (
                                <span className="text-blue-500">{cookie.sameSite}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ),
          },
          {
            label: t("response.tabs.timing"),
            content: (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-mono font-semibold text-accent-cyan">
                      {formatTiming(response.timing.total)}
                    </div>
                    <div className="text-xs text-fg-muted">{t("response.total")}</div>
                  </div>
                  {response.timing.ttfb != null && (
                    <div className="text-center">
                      <div className="text-lg font-mono font-semibold text-accent-purple">
                        {formatTiming(response.timing.ttfb)}
                      </div>
                      <div className="text-xs text-fg-muted">{t("response.ttfb")}</div>
                    </div>
                  )}
                  {response.timing.download != null && (
                    <div className="text-center">
                      <div className="text-lg font-mono font-semibold text-fg-secondary">
                        {formatTiming(response.timing.download)}
                      </div>
                      <div className="text-xs text-fg-muted">{t("response.download")}</div>
                    </div>
                  )}
                </div>

                {response.timing.ttfb == null && response.timing.download == null && (
                  <p className="text-xs text-fg-muted">{t("response.timingNote")}</p>
                )}

                {response.timing.ttfb != null && response.timing.download != null && (
                  <div className="space-y-1">
                    <div className="flex rounded-full overflow-hidden h-3 bg-bg-input">
                      <div
                        className="bg-accent-purple transition-all"
                        style={{
                          width: `${(response.timing.ttfb / response.timing.total) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-accent-cyan transition-all"
                        style={{
                          width: `${(response.timing.download / response.timing.total) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-fg-muted">
                      <span>{t("response.ttfb")}</span>
                      <span>{t("response.download")}</span>
                    </div>
                  </div>
                )}
              </div>
            ),
          },
          {
            label: t("response.tabs.redirects"),
            content: (
              <div className="space-y-2">
                {response.redirected ? (
                  <>
                    <p className="text-sm text-yellow-500">{t("response.redirectOccurred")}</p>
                    <div className="text-sm">
                      <span className="text-fg-muted">{t("response.finalUrl")}:</span>{" "}
                      <span className="font-mono text-fg-primary break-all">
                        {response.finalUrl}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-fg-muted">{t("response.noRedirect")}</p>
                )}
                <p className="text-xs text-fg-muted">{t("response.redirectNote")}</p>
              </div>
            ),
          },
        ]}
      />
    </section>
  );
}

function ResponseBodyTab({
  response,
  bodyView,
  setBodyView,
}: {
  response: { body: string; bodyType: string; size: number };
  bodyView: "pretty" | "raw";
  setBodyView: (v: "pretty" | "raw") => void;
}) {
  const t = useTranslations("httpclient");
  const isLarge = response.size > 1_000_000;
  const displayBody = isLarge ? response.body.substring(0, 100_000) : response.body;
  const isJson = response.bodyType === "json";
  let parsedJson: unknown = null;
  if (isJson && bodyView === "pretty") {
    try {
      parsedJson = JSON.parse(response.body);
    } catch {
      parsedJson = null;
    }
  }

  return (
    <div className="space-y-2">
      {isLarge && (
        <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 rounded-lg px-3 py-2">
          <AlertTriangle size={14} />
          {t("response.largeResponseWarning")}
        </div>
      )}
      {response.bodyType === "binary" && (
        <p className="text-xs text-fg-muted">{t("response.binaryPreview")}</p>
      )}
      {isJson && (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setBodyView("pretty")}
            className={`px-2 py-1 text-xs rounded cursor-pointer ${bodyView === "pretty" ? "bg-accent-cyan text-bg-base" : "text-fg-muted hover:text-fg-primary"}`}
          >
            {t("response.pretty")}
          </button>
          <button
            type="button"
            onClick={() => setBodyView("raw")}
            className={`px-2 py-1 text-xs rounded cursor-pointer ${bodyView === "raw" ? "bg-accent-cyan text-bg-base" : "text-fg-muted hover:text-fg-primary"}`}
          >
            {t("response.raw")}
          </button>
        </div>
      )}
      <div className="max-h-[500px] overflow-auto rounded-lg bg-bg-input border border-border-default">
        {isJson && bodyView === "pretty" && parsedJson ? (
          <JsonView value={parsedJson} style={omniKitJsonTheme} />
        ) : (
          <pre className="p-3 text-sm font-mono text-fg-primary whitespace-pre-wrap break-all">
            {displayBody}
          </pre>
        )}
      </div>
    </div>
  );
}

function DescriptionIntro() {
  const t = useTranslations("httpclient");
  const tc = useTranslations("common");
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="py-3">
      <div className="relative">
        <div
          className={`overflow-hidden transition-all duration-300 ${expanded ? "max-h-[300px]" : "max-h-20"}`}
        >
          <p className="text-fg-secondary text-sm leading-8 indent-12">{t("description.text")}</p>
        </div>
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-bg-base to-transparent pointer-events-none" />
        )}
      </div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-1 flex items-center gap-1 text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors cursor-pointer"
      >
        {expanded ? (
          <>
            <ChevronUp size={14} />
            {tc("showLess")}
          </>
        ) : (
          <>
            <ChevronDown size={14} />
            {tc("showMore")}
          </>
        )}
      </button>
    </section>
  );
}

function DescriptionDetails() {
  const t = useTranslations("httpclient");

  const faqItems = [1, 2, 3].map((i) => ({
    title: t(`descriptions.faq${i}Q`),
    content: <p>{t(`descriptions.faq${i}A`)}</p>,
  }));
  return (
    <section className="py-3">
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-fg-primary mb-2">
          {t("description.features.title")}
        </h3>
        <ul className="space-y-1 text-sm text-fg-secondary">
          <li>• {t("description.features.methods")}</li>
          <li>• {t("description.features.auth")}</li>
          <li>• {t("description.features.body")}</li>
          <li>• {t("description.features.response")}</li>
          <li>• {t("description.features.history")}</li>
          <li>• {t("description.features.proxy")}</li>
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-fg-primary mb-2">
          {t("description.cors.title")}
        </h3>
        <p className="text-sm text-fg-secondary leading-7">{t("description.cors.text")}</p>
      </div>
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <CircleHelp size={16} className="text-accent-cyan shrink-0" aria-hidden="true" />
          <h2 className="font-semibold text-fg-primary text-base text-pretty">
            {t("descriptions.faqTitle")}
          </h2>
        </div>
        <Accordion items={faqItems} />
      </div>
    </section>
  );
}

export default function HttpClientPage() {
  const t = useTranslations("tools");
  const store = useHttpClient();

  return (
    <Layout title={t("httpclient.shortTitle")}>
      <div className="container mx-auto px-4 pt-3 pb-6">
        <DescriptionIntro />
        <RequestPanel store={store} />
        <ResponsePanel store={store} />
        <DescriptionDetails />
        <RelatedTools currentTool="httpclient" />
      </div>
    </Layout>
  );
}
