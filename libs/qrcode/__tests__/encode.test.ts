import { describe, it, expect } from "vitest";
import { escapeWifi, escapeVcard, sanitizePhone, buildContent } from "../encode";

describe("escapeWifi", () => {
  it("prefixes reserved chars with backslash", () => {
    expect(escapeWifi("foo;bar")).toBe("foo\\;bar");
    expect(escapeWifi("foo,bar")).toBe("foo\\,bar");
    expect(escapeWifi('foo"bar')).toBe('foo\\"bar');
    expect(escapeWifi("foo:bar")).toBe("foo\\:bar");
    expect(escapeWifi("foo\\bar")).toBe("foo\\\\bar");
  });
  it("escapes backslash before other reserved chars (idempotent)", () => {
    expect(escapeWifi("a;b\\c")).toBe("a\\;b\\\\c");
  });
  it("leaves plain text untouched", () => {
    expect(escapeWifi("hello world")).toBe("hello world");
  });
  it("handles empty string", () => {
    expect(escapeWifi("")).toBe("");
  });
});

describe("escapeVcard", () => {
  it("escapes backslash first, then newline/comma/semicolon", () => {
    expect(escapeVcard("a\\b")).toBe("a\\\\b");
    expect(escapeVcard("a\nb")).toBe("a\\nb");
    expect(escapeVcard("a,b")).toBe("a\\,b");
    expect(escapeVcard("a;b")).toBe("a\\;b");
  });
  it("escapes all reserved chars in one string in correct order", () => {
    expect(escapeVcard("a\\b;c,d\ne")).toBe("a\\\\b\\;c\\,d\\ne");
  });
});

describe("sanitizePhone", () => {
  it("strips non-digit / non-plus chars", () => {
    expect(sanitizePhone("+1 (555) 123-4567")).toBe("+15551234567");
    expect(sanitizePhone("abc123def")).toBe("123");
  });
  it("preserves leading plus", () => {
    expect(sanitizePhone("+86 138 0000 0000")).toBe("+8613800000000");
  });
});

describe("buildContent: text", () => {
  it("passes content through verbatim", () => {
    expect(buildContent({ type: "text", content: "https://omnikit.run" })).toBe(
      "https://omnikit.run"
    );
  });
  it("does not escape special chars", () => {
    expect(buildContent({ type: "text", content: "a;b,c\\d" })).toBe("a;b,c\\d");
  });
});

describe("buildContent: wifi", () => {
  it("emits canonical WPA payload", () => {
    expect(
      buildContent({
        type: "wifi",
        ssid: "MyNet",
        password: "secret",
        encryption: "WPA",
        hidden: false,
      })
    ).toBe("WIFI:T:WPA;S:MyNet;P:secret;;");
  });
  it("omits H segment when hidden=false", () => {
    const out = buildContent({
      type: "wifi",
      ssid: "MyNet",
      password: "p",
      encryption: "WPA",
      hidden: false,
    });
    expect(out).not.toMatch(/H:/);
  });
  it("emits H:true when hidden=true", () => {
    expect(
      buildContent({
        type: "wifi",
        ssid: "MyNet",
        password: "p",
        encryption: "WPA",
        hidden: true,
      })
    ).toBe("WIFI:T:WPA;S:MyNet;P:p;H:true;;");
  });
  it("omits P segment when nopass", () => {
    expect(
      buildContent({
        type: "wifi",
        ssid: "Open",
        password: "",
        encryption: "nopass",
        hidden: false,
      })
    ).toBe("WIFI:T:nopass;S:Open;;");
  });
  it("escapes reserved chars in SSID and password", () => {
    expect(
      buildContent({
        type: "wifi",
        ssid: "My;Net,work",
        password: 'p"a:s\\s',
        encryption: "WPA",
        hidden: false,
      })
    ).toBe('WIFI:T:WPA;S:My\\;Net\\,work;P:p\\"a\\:s\\\\s;;');
  });
});

describe("buildContent: vcard", () => {
  it("emits canonical multi-line payload with only filled fields", () => {
    const out = buildContent({
      type: "vcard",
      firstName: "Ada",
      lastName: "Lovelace",
      phone: "+1234",
      email: "ada@example.com",
      org: "",
      url: "",
      address: "",
    });
    expect(out).toBe(
      [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:Lovelace;Ada",
        "FN:Ada Lovelace",
        "TEL:+1234",
        "EMAIL:ada@example.com",
        "END:VCARD",
      ].join("\n")
    );
  });
  it("omits empty optional lines", () => {
    const out = buildContent({
      type: "vcard",
      firstName: "Ada",
      lastName: "",
      phone: "",
      email: "",
      org: "",
      url: "",
      address: "",
    });
    expect(out).not.toMatch(/^TEL:/m);
    expect(out).not.toMatch(/^EMAIL:/m);
    expect(out).not.toMatch(/^ORG:/m);
    expect(out).not.toMatch(/^URL:/m);
    expect(out).not.toMatch(/^ADR:/m);
  });
  it("escapes commas/semicolons in address", () => {
    const out = buildContent({
      type: "vcard",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      org: "",
      url: "",
      address: "1 Main St, Apt; #2",
    });
    expect(out).toContain("ADR:;;1 Main St\\, Apt\\; #2;;;;");
  });
});

describe("buildContent: email", () => {
  it("returns bare mailto when subject and body empty", () => {
    expect(buildContent({ type: "email", to: "a@b.com", subject: "", body: "" })).toBe(
      "mailto:a@b.com"
    );
  });
  it("URL-encodes subject and body", () => {
    expect(
      buildContent({
        type: "email",
        to: "a@b.com",
        subject: "Hi & bye",
        body: "中文 test",
      })
    ).toBe("mailto:a@b.com?subject=Hi%20%26%20bye&body=%E4%B8%AD%E6%96%87%20test");
  });
  it("emits only the populated param", () => {
    expect(buildContent({ type: "email", to: "a@b.com", subject: "Hi", body: "" })).toBe(
      "mailto:a@b.com?subject=Hi"
    );
  });
});

describe("buildContent: sms", () => {
  it("emits SMSTO with empty message", () => {
    expect(buildContent({ type: "sms", phone: "+1 555 123", message: "" })).toBe("SMSTO:+1555123:");
  });
  it("URL-encodes message", () => {
    expect(buildContent({ type: "sms", phone: "+15551234", message: "hi & bye" })).toBe(
      "SMSTO:+15551234:hi%20%26%20bye"
    );
  });
  it("strips non-digit / non-plus from phone", () => {
    expect(buildContent({ type: "sms", phone: "(555) abc-1234", message: "x" })).toBe(
      "SMSTO:5551234:x"
    );
  });
});

describe("buildContent: whatsapp", () => {
  it("builds wa.me URL with phone only", () => {
    expect(buildContent({ type: "whatsapp", phone: "+15551234", message: "" })).toBe(
      "https://wa.me/+15551234"
    );
  });
  it("appends URL-encoded message", () => {
    expect(buildContent({ type: "whatsapp", phone: "15551234", message: "hi & bye" })).toBe(
      "https://wa.me/15551234?text=hi%20%26%20bye"
    );
  });
  it("strips non-digit / non-plus from phone", () => {
    expect(buildContent({ type: "whatsapp", phone: "(555) abc-1234", message: "" })).toBe(
      "https://wa.me/5551234"
    );
  });
});
