import { describe, it, expect } from "vitest";
import { extract, type ExtractorType } from "../main";

describe("extract — email", () => {
  it("extracts a basic email", () => {
    const results = extract("Contact us at hello@example.com please", ["email"]);
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({ type: "email", value: "hello@example.com", index: 14 });
  });

  it("extracts email with plus tag", () => {
    const results = extract("user+tag@domain.co.uk", ["email"]);
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe("user+tag@domain.co.uk");
  });

  it("extracts email with subdomains", () => {
    const results = extract("first.last@sub.domain.org", ["email"]);
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe("first.last@sub.domain.org");
  });

  it("extracts multiple emails", () => {
    const results = extract("a@b.com and c@d.com", ["email"]);
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.value)).toEqual(["a@b.com", "c@d.com"]);
  });

  it("does not match bare @domain.com", () => {
    const results = extract("@domain.com", ["email"]);
    expect(results).toHaveLength(0);
  });

  it("does not match bare domain.com", () => {
    const results = extract("domain.com", ["email"]);
    expect(results).toHaveLength(0);
  });
});

describe("extract — URL", () => {
  it("extracts https URL", () => {
    const results = extract("Visit https://example.com/page?q=1 for details", ["url"]);
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe("https://example.com/page?q=1");
  });

  it("extracts http URL", () => {
    const results = extract("See http://test.org", ["url"]);
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe("http://test.org");
  });

  it("extracts URL with fragment", () => {
    const results = extract("https://example.com/page#section", ["url"]);
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe("https://example.com/page#section");
  });

  it("extracts multiple URLs", () => {
    const results = extract("https://a.com and https://b.com/path", ["url"]);
    expect(results).toHaveLength(2);
  });

  it("does not match bare domain without scheme", () => {
    const results = extract("example.com", ["url"]);
    expect(results).toHaveLength(0);
  });
});

describe("extract — phone", () => {
  it("extracts US phone with dashes", () => {
    const results = extract("Call 555-987-6543 now", ["phone"]);
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe("555-987-6543");
  });

  it("extracts international phone with country code", () => {
    const results = extract("+1 (555) 123-4567", ["phone"]);
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe("+1 (555) 123-4567");
  });

  it("extracts UK phone format", () => {
    const results = extract("+44 20 7946 0958", ["phone"]);
    expect(results).toHaveLength(1);
  });

  it("extracts phone with dots", () => {
    const results = extract("(555) 123.4567", ["phone"]);
    expect(results).toHaveLength(1);
  });

  it("discards phone-like match with fewer than 7 digits", () => {
    const results = extract("Call 123-456", ["phone"]);
    expect(results).toHaveLength(0);
  });

  it("does not match dates with slashes", () => {
    const results = extract("2024/01/05", ["phone"]);
    expect(results).toHaveLength(0);
  });

  it("does not match version strings", () => {
    const results = extract("version 3.14.159", ["phone"]);
    expect(results).toHaveLength(0);
  });
});

describe("extract — mixed types", () => {
  it("extracts all types from mixed text", () => {
    const text = "Email: hello@world.com, URL: https://example.com, Phone: 555-123-4567";
    const results = extract(text, ["email", "url", "phone"]);
    expect(results).toHaveLength(3);
    const types = results.map((r) => r.type);
    expect(types).toContain("email");
    expect(types).toContain("url");
    expect(types).toContain("phone");
  });

  it("filters by type — email only", () => {
    const text = "hello@world.com https://example.com 555-123-4567";
    const results = extract(text, ["email"]);
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe("email");
  });

  it("filters by type — url only", () => {
    const text = "hello@world.com https://example.com 555-123-4567";
    const results = extract(text, ["url"]);
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe("url");
  });

  it("returns empty for empty input", () => {
    expect(extract("", ["email", "url", "phone"])).toEqual([]);
  });

  it("returns empty for empty types array", () => {
    expect(extract("hello@world.com", [])).toEqual([]);
  });

  it("returns empty when no matches found", () => {
    expect(extract("plain text no matches", ["email", "url", "phone"])).toEqual([]);
  });
});

describe("extract — trailing punctuation stripping", () => {
  it("strips trailing period", () => {
    const results = extract("Email: hello@world.com.", ["email"]);
    expect(results[0].value).toBe("hello@world.com");
  });

  it("strips trailing comma", () => {
    const results = extract("hello@world.com,", ["email"]);
    expect(results[0].value).toBe("hello@world.com");
  });

  it("strips trailing semicolon", () => {
    const results = extract("hello@world.com;", ["email"]);
    expect(results[0].value).toBe("hello@world.com");
  });

  it("strips trailing closing paren", () => {
    const results = extract("(hello@world.com)", ["email"]);
    expect(results[0].value).toBe("hello@world.com");
  });
});

describe("extract — sort order", () => {
  it("returns results sorted by position in input", () => {
    const text = "https://b.com a@b.com 555-123-4567";
    const results = extract(text, ["email", "url", "phone"]);
    expect(results[0].type).toBe("url");
    expect(results[1].type).toBe("email");
    expect(results[2].type).toBe("phone");
  });
});
