import type { Options as QrCodeStylingOptions } from "qr-code-styling";
import type { StylingOptions } from "./types";

export const DEFAULT_STYLING: StylingOptions = {
  foregroundColor: "#000000",
  backgroundColor: "#ffffff",
  dotStyle: "rounded",
  errorCorrection: "Q",
  size: 300,
  margin: 10,
};

export const SEED_DATA = "https://omnikit.run";

export function buildOptions(data: string, styling: StylingOptions): QrCodeStylingOptions {
  const opts: QrCodeStylingOptions = {
    width: styling.size,
    height: styling.size,
    type: "canvas",
    data,
    margin: styling.margin,
    dotsOptions: { color: styling.foregroundColor, type: styling.dotStyle },
    backgroundOptions: { color: styling.backgroundColor },
    cornersSquareOptions: { color: styling.foregroundColor, type: "extra-rounded" },
    cornersDotOptions: { color: styling.foregroundColor, type: "dot" },
    qrOptions: { errorCorrectionLevel: styling.errorCorrection },
  };
  if (styling.logo) {
    opts.image = styling.logo.dataUrl;
    opts.imageOptions = {
      crossOrigin: "anonymous",
      margin: styling.logo.margin,
      hideBackgroundDots: styling.logo.hideBackgroundDots,
      imageSize: styling.logo.size,
    };
  } else {
    opts.image = undefined;
  }
  return opts;
}
