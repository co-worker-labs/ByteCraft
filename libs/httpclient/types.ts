export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export interface KeyValue {
  key: string;
  value: string;
  enabled: boolean;
}

export type BodyType = "none" | "json" | "form-data" | "urlencoded" | "raw";

export type AuthType = "none" | "bearer" | "basic";

export interface RequestConfig {
  method: HttpMethod;
  url: string;
  params: KeyValue[];
  headers: KeyValue[];
  bodyType: BodyType;
  bodyContent: string;
  formData: KeyValue[];
  authType: AuthType;
  bearerToken: string;
  basicUser: string;
  basicPass: string;
}

export interface TimingInfo {
  ttfb?: number;
  download?: number;
  total: number;
}

export type ResponseBodyType = "json" | "html" | "xml" | "text" | "binary";

export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  bodyType: ResponseBodyType;
  size: number;
  timing: TimingInfo;
  cookies: CookieData[];
  redirected: boolean;
  finalUrl: string;
  timestamp: number;
}

export interface CookieData {
  name: string;
  value: string;
  path?: string;
  expires?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string;
}

export interface RequestError {
  message: string;
  isCors: boolean;
  isTimeout: boolean;
  timestamp: number;
}

export interface HistoryEntry {
  id: string;
  request: RequestConfig;
  responseStatus: number;
  responseStatusText: string;
  createdAt: number;
}

export const DEFAULT_REQUEST_CONFIG: RequestConfig = {
  method: "GET",
  url: "",
  params: [],
  headers: [],
  bodyType: "none",
  bodyContent: "",
  formData: [],
  authType: "none",
  bearerToken: "",
  basicUser: "",
  basicPass: "",
};

export const HTTP_METHODS: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];

export const TIMEOUT_OPTIONS: { label: string; value: number | null }[] = [
  { label: "5s", value: 5000 },
  { label: "10s", value: 10000 },
  { label: "30s", value: 30000 },
  { label: "60s", value: 60000 },
  { label: "120s", value: 120000 },
  { label: "∞", value: null },
];

export const COMMON_HEADERS: string[] = [
  "Content-Type",
  "Accept",
  "Authorization",
  "Cache-Control",
  "User-Agent",
  "Accept-Encoding",
  "Accept-Language",
  "Connection",
  "Host",
  "Origin",
  "Referer",
  "X-Requested-With",
];

export const BODY_TYPE_OPTIONS: BodyType[] = ["none", "json", "form-data", "urlencoded", "raw"];

export const AUTH_TYPE_OPTIONS: AuthType[] = ["none", "bearer", "basic"];

export function emptyKeyValue(): KeyValue {
  return { key: "", value: "", enabled: true };
}
