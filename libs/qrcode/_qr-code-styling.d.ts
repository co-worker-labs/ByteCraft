declare module "qr-code-styling" {
  export interface Options {
    width?: number;
    height?: number;
    type?: "svg" | "canvas";
    data?: string;
    margin?: number;
    image?: string;
    dotsOptions?: { color?: string; type?: string };
    backgroundOptions?: { color?: string };
    cornersSquareOptions?: { color?: string; type?: string };
    cornersDotOptions?: { color?: string; type?: string };
    qrOptions?: { errorCorrectionLevel?: string };
    imageOptions?: {
      crossOrigin?: string;
      margin?: number;
      imageSize?: number;
      hideBackgroundDots?: boolean;
    };
  }
  export default class QRCodeStyling {
    constructor(options: Options);
    append(container: HTMLElement): void;
    update(options: Options): void;
    download(options: { name: string; extension: "svg" | "png" }): void;
    getRawData(extension: "png"): Promise<Blob | null>;
  }
}
