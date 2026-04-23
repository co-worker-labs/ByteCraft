import type { useTranslations } from "next-intl";

export interface ToolData {
  path: string;
  title: string;
  description: string;
}

function pathToToolKey(path: string): string {
  return path.replace("/", "").replace(/-/g, "");
}

export function getTranslatedTools(t: ReturnType<typeof useTranslations>): ToolData[] {
  return toolsList.map((tool) => {
    const key = pathToToolKey(tool.path);
    return {
      ...tool,
      title: t(`${key}.title`),
      description: t(`${key}.description`),
    };
  });
}

export function findTool(path: string): ToolData {
  const result = toolsList.find((v) => v.path === path);
  if (!result) {
    throw "Invalid page path: " + path;
  }
  return result;
}

export const toolsList: ToolData[] = [
  {
    path: "/base64",
    title: "Base64 Encode/Decode",
    description: "Base64 Encode or Decode, Basic Authentication",
  },
  {
    path: "/password",
    title: "Password Generator",
    description: "Generate secure, random, memorable passwords to stay safe online.",
  },
  {
    path: "/hashing",
    title: "Text Hashing",
    description:
      "Algorithms: MD5, SHA1, SHA-224, SHA256, SHA348, SHA512, SHA3-224, SHA3-256, SHA3-384, SHA3-512, keccak, ripemd-160",
  },
  {
    path: "/cipher",
    title: "Text Encrypt/Decrypt",
    description: "AES, DES, Triple DES, Rabbit, RC4, RC4Drop",
  },
  {
    path: "/checksum",
    title: "File Checksum",
    description: "Supports an unlimited number of files and unlimited file size",
  },
  {
    path: "/ascii",
    title: "ASCII Table",
    description:
      "Ascii character table - What is ascii - Complete tables including hex, octal, html, decimal conversions",
  },
  {
    path: "/htmlcode",
    title: "Html Code",
    description: "HTML codes and HTML special characters",
  },
  {
    path: "/storageunit",
    title: "Storage Unit Conversion",
    description:
      "Make conversions between a great number of various data units like byte, kilobyte, megabyte, terabyte, petabyte, and many other",
  },
];
