import CryptoJS from "crypto-js";
import {
  generate as generatePassword,
  copyPassword,
  random_uppercase_checked,
  random_lowercase_checked,
  random_numbers_checked,
  random_symbols_checked,
} from "../../password/main";
import type { RecipeStepDef } from "../types";

export const cryptoSteps: RecipeStepDef[] = [
  {
    id: "hash-md5",
    name: "MD5 Hash",
    category: "crypto",
    icon: "#️⃣",
    description: "Generate MD5 hash",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      return { ok: true as const, output: CryptoJS.MD5(input).toString() };
    },
  },
  {
    id: "hash-sha1",
    name: "SHA-1 Hash",
    category: "crypto",
    icon: "#️⃣",
    description: "Generate SHA-1 hash",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      return { ok: true as const, output: CryptoJS.SHA1(input).toString() };
    },
  },
  {
    id: "hash-sha256",
    name: "SHA-256 Hash",
    category: "crypto",
    icon: "#️⃣",
    description: "Generate SHA-256 hash",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      return { ok: true as const, output: CryptoJS.SHA256(input).toString() };
    },
  },
  {
    id: "hash-sha512",
    name: "SHA-512 Hash",
    category: "crypto",
    icon: "#️⃣",
    description: "Generate SHA-512 hash",
    inputType: "text",
    outputType: "text",
    parameters: [],
    async execute(input: string) {
      return { ok: true as const, output: CryptoJS.SHA512(input).toString() };
    },
  },
  {
    id: "aes-encrypt",
    name: "AES Encrypt",
    category: "crypto",
    icon: "🔐",
    description: "Encrypt text with AES",
    inputType: "text",
    outputType: "text",
    parameters: [
      {
        id: "key",
        type: "text",
        label: "key",
        defaultValue: "",
        placeholder: "encryptionKey",
      },
    ],
    async execute(input: string, params: Record<string, string>) {
      const key = params.key || "";
      if (!key) return { ok: false as const, error: "keyRequired" };
      try {
        const encrypted = CryptoJS.AES.encrypt(input, key).toString();
        return { ok: true as const, output: encrypted };
      } catch (e) {
        return { ok: false as const, error: String(e) };
      }
    },
  },
  {
    id: "aes-decrypt",
    name: "AES Decrypt",
    category: "crypto",
    icon: "🔓",
    description: "Decrypt AES-encrypted text",
    inputType: "text",
    outputType: "text",
    parameters: [
      {
        id: "key",
        type: "text",
        label: "key",
        defaultValue: "",
        placeholder: "decryptionKey",
      },
    ],
    async execute(input: string, params: Record<string, string>) {
      const key = params.key || "";
      if (!key) return { ok: false as const, error: "keyRequired" };
      try {
        const bytes = CryptoJS.AES.decrypt(input, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) return { ok: false as const, error: "decryptionFailed" };
        return { ok: true as const, output: decrypted };
      } catch (e) {
        return { ok: false as const, error: String(e) };
      }
    },
  },
  {
    id: "hmac-sha256",
    name: "HMAC-SHA256",
    category: "crypto",
    icon: "🔑",
    description: "Generate HMAC-SHA256",
    inputType: "text",
    outputType: "text",
    parameters: [
      {
        id: "key",
        type: "text",
        label: "key",
        defaultValue: "",
        placeholder: "hmacKey",
      },
    ],
    async execute(input: string, params: Record<string, string>) {
      const key = params.key || "";
      if (!key) return { ok: false as const, error: "keyRequired" };
      return { ok: true as const, output: CryptoJS.HmacSHA256(input, key).toString() };
    },
  },
  {
    id: "password-gen",
    name: "Generate Password",
    category: "crypto",
    icon: "🎲",
    description: "Generate a random password",
    inputType: "none",
    outputType: "text",
    parameters: [
      {
        id: "length",
        type: "slider",
        label: "length",
        defaultValue: "16",
        min: 4,
        max: 128,
        step: 1,
      },
      {
        id: "uppercase",
        type: "checkbox",
        label: "uppercase",
        defaultValue: "true",
      },
      {
        id: "lowercase",
        type: "checkbox",
        label: "lowercase",
        defaultValue: "true",
      },
      {
        id: "numbers",
        type: "checkbox",
        label: "numbers",
        defaultValue: "true",
      },
      {
        id: "symbols",
        type: "checkbox",
        label: "symbols",
        defaultValue: "true",
      },
    ],
    async execute(_input: string, params: Record<string, string>) {
      const length = parseInt(params.length || "16", 10) || 16;
      let characters = 0;
      if (params.uppercase !== "false") characters |= random_uppercase_checked;
      if (params.lowercase !== "false") characters |= random_lowercase_checked;
      if (params.numbers !== "false") characters |= random_numbers_checked;
      if (params.symbols !== "false") characters |= random_symbols_checked;
      if (characters === 0) characters = random_lowercase_checked;
      const pwArray = generatePassword("Random", characters, length);
      return { ok: true as const, output: copyPassword("Random", pwArray) };
    },
  },
];
