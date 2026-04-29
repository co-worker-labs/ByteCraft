export type ContentType = "text" | "wifi" | "vcard" | "email" | "sms" | "whatsapp";

export interface TextPayload {
  type: "text";
  content: string;
}

export interface WifiPayload {
  type: "wifi";
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}

export interface VCardPayload {
  type: "vcard";
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  org: string;
  url: string;
  address: string;
}

export interface EmailPayload {
  type: "email";
  to: string;
  subject: string;
  body: string;
}

export interface SmsPayload {
  type: "sms";
  phone: string;
  message: string;
}

export interface WhatsAppPayload {
  type: "whatsapp";
  phone: string;
  message: string;
}

export type QrPayload =
  | TextPayload
  | WifiPayload
  | VCardPayload
  | EmailPayload
  | SmsPayload
  | WhatsAppPayload;

export type DotStyle = "square" | "rounded" | "dots" | "classy" | "classy-rounded";
export type ErrorCorrection = "L" | "M" | "Q" | "H";

export interface LogoOptions {
  /** base64 data URL */
  dataUrl: string;
  /** fraction of QR size, 0.2–0.5 */
  size: number;
  /** px around logo */
  margin: number;
  /** clear background dots behind logo */
  hideBackgroundDots: boolean;
}

export interface StylingOptions {
  foregroundColor: string;
  backgroundColor: string;
  dotStyle: DotStyle;
  errorCorrection: ErrorCorrection;
  /** width/height in px, 128–512 */
  size: number;
  /** quiet-zone padding in px */
  margin: number;
  logo?: LogoOptions;
}

export type PersistedStyling = Omit<StylingOptions, "logo">;

export interface PersistedState {
  styling: PersistedStyling;
  lastContentType: ContentType;
  schemaVersion: 1;
}
