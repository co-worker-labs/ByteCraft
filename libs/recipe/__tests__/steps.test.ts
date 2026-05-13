import { describe, it, expect, beforeEach } from "vitest";
import "../steps/index";
import { getStep } from "../registry";

describe("Encoding Steps", () => {
  it("base64-encode encodes text", async () => {
    const step = getStep("base64-encode")!;
    const result = await step.execute("Hello, World!", {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe(btoa(unescape(encodeURIComponent("Hello, World!"))));
  });

  it("base64-decode decodes base64", async () => {
    const step = getStep("base64-decode")!;
    const encoded = btoa(unescape(encodeURIComponent("Hello, World!")));
    const result = await step.execute(encoded, {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe("Hello, World!");
  });

  it("url-encode-component encodes", async () => {
    const step = getStep("url-encode-component")!;
    const result = await step.execute("hello world&foo=bar", {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe("hello%20world%26foo%3Dbar");
  });

  it("url-decode-component decodes", async () => {
    const step = getStep("url-decode-component")!;
    const result = await step.execute("hello%20world%26foo%3Dbar", {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe("hello world&foo=bar");
  });

  it("url-encode-full encodes URL", async () => {
    const step = getStep("url-encode-full")!;
    const result = await step.execute("https://example.com/path with spaces", {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe("https://example.com/path%20with%20spaces");
  });

  it("url-decode-full decodes URL", async () => {
    const step = getStep("url-decode-full")!;
    const result = await step.execute("https://example.com/path%20with%20spaces", {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe("https://example.com/path with spaces");
  });

  it("base64 handles unicode", async () => {
    const encode = getStep("base64-encode")!;
    const decode = getStep("base64-decode")!;
    const r1 = await encode.execute("你好世界", {});
    expect(r1.ok).toBe(true);
    if (r1.ok) {
      const r2 = await decode.execute(r1.output, {});
      expect(r2.ok).toBe(true);
      if (r2.ok) expect(r2.output).toBe("你好世界");
    }
  });

  it("base64-decode fails on invalid input", async () => {
    const step = getStep("base64-decode")!;
    const result = await step.execute("!!!invalid!!!", {});
    expect(result.ok).toBe(false);
  });
});

describe("Crypto Steps", () => {
  it("hash-md5 produces correct hash", async () => {
    const step = getStep("hash-md5")!;
    const result = await step.execute("hello", {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe("5d41402abc4b2a76b9719d911017c592");
  });

  it("hash-sha1 produces correct hash", async () => {
    const step = getStep("hash-sha1")!;
    const result = await step.execute("hello", {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d");
  });

  it("hash-sha256 produces correct hash", async () => {
    const step = getStep("hash-sha256")!;
    const result = await step.execute("hello", {});
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toBe(
        "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
      );
    }
  });

  it("hash-sha512 produces output", async () => {
    const step = getStep("hash-sha512")!;
    const result = await step.execute("hello", {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output.length).toBe(128);
  });

  it("aes-encrypt and aes-decrypt roundtrip", async () => {
    const enc = getStep("aes-encrypt")!;
    const dec = getStep("aes-decrypt")!;
    const r1 = await enc.execute("secret message", { key: "mykey" });
    expect(r1.ok).toBe(true);
    if (r1.ok) {
      const r2 = await dec.execute(r1.output, { key: "mykey" });
      expect(r2.ok).toBe(true);
      if (r2.ok) expect(r2.output).toBe("secret message");
    }
  });

  it("aes-encrypt fails without key", async () => {
    const step = getStep("aes-encrypt")!;
    const result = await step.execute("test", { key: "" });
    expect(result.ok).toBe(false);
  });

  it("aes-decrypt fails with wrong key", async () => {
    const enc = getStep("aes-encrypt")!;
    const dec = getStep("aes-decrypt")!;
    const r1 = await enc.execute("secret message", { key: "correct" });
    expect(r1.ok).toBe(true);
    if (r1.ok) {
      const r2 = await dec.execute(r1.output, { key: "wrong" });
      expect(r2.ok).toBe(false);
    }
  });

  it("hmac-sha256 produces output", async () => {
    const step = getStep("hmac-sha256")!;
    const result = await step.execute("message", { key: "secret" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output.length).toBe(64);
  });

  it("password-gen generates password", async () => {
    const step = getStep("password-gen")!;
    const result = await step.execute("", { length: "20" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output.length).toBe(20);
  });
});

describe("Text Steps", () => {
  it("text-camel converts to camelCase", async () => {
    const step = getStep("text-camel")!;
    const result = await step.execute("hello world", {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe("helloWorld");
  });

  it("text-pascal converts to PascalCase", async () => {
    const step = getStep("text-pascal")!;
    const result = await step.execute("hello world", {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe("HelloWorld");
  });

  it("text-snake converts to snake_case", async () => {
    const step = getStep("text-snake")!;
    const result = await step.execute("hello world", {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe("hello_world");
  });

  it("text-kebab converts to kebab-case", async () => {
    const step = getStep("text-kebab")!;
    const result = await step.execute("hello world", {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe("hello-world");
  });

  it("text-upper converts to uppercase", async () => {
    const step = getStep("text-upper")!;
    const result = await step.execute("hello", {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe("HELLO");
  });

  it("text-lower converts to lowercase", async () => {
    const step = getStep("text-lower")!;
    const result = await step.execute("HELLO", {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe("hello");
  });

  it("regex-replace replaces text", async () => {
    const step = getStep("regex-replace")!;
    const result = await step.execute("hello world", {
      pattern: "world",
      replacement: "there",
      flags: "g",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe("hello there");
  });

  it("regex-replace fails without pattern", async () => {
    const step = getStep("regex-replace")!;
    const result = await step.execute("test", { pattern: "", replacement: "", flags: "g" });
    expect(result.ok).toBe(false);
  });

  it("dedup-lines removes duplicates", async () => {
    const step = getStep("dedup-lines")!;
    const result = await step.execute("a\nb\na\nc", {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe("a\nb\nc");
  });

  it("extract-emails extracts emails", async () => {
    const step = getStep("extract-emails")!;
    const result = await step.execute("Contact alice@example.com and bob@test.org", {});
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toContain("alice@example.com");
      expect(result.output).toContain("bob@test.org");
    }
  });

  it("extract-urls extracts urls", async () => {
    const step = getStep("extract-urls")!;
    const result = await step.execute("Visit https://example.com and http://test.org/path", {});
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toContain("https://example.com");
      expect(result.output).toContain("http://test.org/path");
    }
  });
});

describe("Format Steps", () => {
  it("json-format formats JSON", async () => {
    const step = getStep("json-format")!;
    const result = await step.execute('{"a":1}', { indent: "2" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe('{\n  "a": 1\n}');
  });

  it("json-minify minifies JSON", async () => {
    const step = getStep("json-minify")!;
    const result = await step.execute('{\n  "a": 1\n}', {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe('{"a":1}');
  });

  it("json-yaml converts JSON to YAML", async () => {
    const step = getStep("json-yaml")!;
    const result = await step.execute('{"name":"test","value":42}', {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toContain("name: test");
  });

  it("yaml-json converts YAML to JSON", async () => {
    const step = getStep("yaml-json")!;
    const result = await step.execute("name: test\nvalue: 42", { indent: "2" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.output);
      expect(parsed.name).toBe("test");
      expect(parsed.value).toBe(42);
    }
  });

  it("json-ts converts JSON to TypeScript", async () => {
    const step = getStep("json-ts")!;
    const result = await step.execute('{"name":"test","age":30}', { rootName: "User" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toContain("interface User");
      expect(result.output).toContain("name: string");
      expect(result.output).toContain("age: number");
    }
  });

  it("json-csv converts JSON to CSV", async () => {
    const step = getStep("json-csv")!;
    const result = await step.execute('[{"name":"Alice","age":30},{"name":"Bob","age":25}]', {});
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toContain("Alice");
      expect(result.output).toContain("Bob");
    }
  });

  it("csv-json converts CSV to JSON", async () => {
    const step = getStep("csv-json")!;
    const result = await step.execute("name,age\nAlice,30\nBob,25", {});
    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.output);
      expect(parsed[0].name).toBe("Alice");
      expect(parsed[1].age).toBe(25);
    }
  });

  it("sql-format formats SQL", async () => {
    const step = getStep("sql-format")!;
    const result = await step.execute("select * from users where id = 1", { dialect: "sql" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toContain("SELECT");
  });

  it("sql-minify minifies SQL", async () => {
    const step = getStep("sql-minify")!;
    const result = await step.execute("SELECT   *\nFROM   users", {});
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe("SELECT * FROM users");
  });

  it("json-format fails on invalid JSON", async () => {
    const step = getStep("json-format")!;
    const result = await step.execute("not json", {});
    expect(result.ok).toBe(false);
  });
});

describe("Generator Steps", () => {
  it("uuid-gen generates UUID", async () => {
    const step = getStep("uuid-gen")!;
    const result = await step.execute("", { version: "v4", count: "1" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
    }
  });

  it("uuid-gen generates multiple UUIDs", async () => {
    const step = getStep("uuid-gen")!;
    const result = await step.execute("", { version: "v4", count: "3" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const lines = result.output.split("\n");
      expect(lines.length).toBe(3);
    }
  });

  it("uuid-gen generates v7 UUID", async () => {
    const step = getStep("uuid-gen")!;
    const result = await step.execute("", { version: "v7", count: "1" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
    }
  });
});
