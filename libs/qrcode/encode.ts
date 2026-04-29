import type {
  QrPayload,
  WifiPayload,
  VCardPayload,
  EmailPayload,
  SmsPayload,
  WhatsAppPayload,
} from "./types";

export function escapeWifi(s: string): string {
  return s.replace(/([\\;,":])/g, "\\$1");
}

export function escapeVcard(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function sanitizePhone(s: string): string {
  return s.replace(/[^+\d]/g, "");
}

function buildWifi(p: WifiPayload): string {
  const ssid = escapeWifi(p.ssid);
  const parts: string[] = [`WIFI:T:${p.encryption}`, `S:${ssid}`];
  if (p.encryption !== "nopass") {
    parts.push(`P:${escapeWifi(p.password)}`);
  }
  if (p.hidden) {
    parts.push("H:true");
  }
  return parts.join(";") + ";;";
}

function buildVcard(p: VCardPayload): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];
  const last = escapeVcard(p.lastName);
  const first = escapeVcard(p.firstName);
  if (last || first) {
    lines.push(`N:${last};${first}`);
    const fnParts = [first, last].filter(Boolean).join(" ");
    if (fnParts) lines.push(`FN:${fnParts}`);
  }
  if (p.phone) lines.push(`TEL:${escapeVcard(p.phone)}`);
  if (p.email) lines.push(`EMAIL:${escapeVcard(p.email)}`);
  if (p.org) lines.push(`ORG:${escapeVcard(p.org)}`);
  if (p.url) lines.push(`URL:${escapeVcard(p.url)}`);
  if (p.address) lines.push(`ADR:;;${escapeVcard(p.address)};;;;`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

function buildEmail(p: EmailPayload): string {
  const params: string[] = [];
  if (p.subject) params.push(`subject=${encodeURIComponent(p.subject)}`);
  if (p.body) params.push(`body=${encodeURIComponent(p.body)}`);
  return params.length === 0 ? `mailto:${p.to}` : `mailto:${p.to}?${params.join("&")}`;
}

function buildSms(p: SmsPayload): string {
  const phone = sanitizePhone(p.phone);
  return p.message ? `SMSTO:${phone}:${encodeURIComponent(p.message)}` : `SMSTO:${phone}:`;
}

function buildWhatsApp(p: WhatsAppPayload): string {
  const phone = sanitizePhone(p.phone);
  const base = `https://wa.me/${phone}`;
  return p.message ? `${base}?text=${encodeURIComponent(p.message)}` : base;
}

export function buildContent(payload: QrPayload): string {
  switch (payload.type) {
    case "text":
      return payload.content;
    case "wifi":
      return buildWifi(payload);
    case "vcard":
      return buildVcard(payload);
    case "email":
      return buildEmail(payload);
    case "sms":
      return buildSms(payload);
    case "whatsapp":
      return buildWhatsApp(payload);
  }
}
