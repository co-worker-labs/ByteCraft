import { describe, it, expect } from "vitest";
import { buildToolSchemas, buildCategorySchema } from "../../components/json-ld";

describe("buildToolSchemas", () => {
  const base = {
    name: "JSON Formatter",
    description: "Format and validate JSON online",
    path: "/json",
  };

  it("returns WebApplication + BreadcrumbList schemas", () => {
    const schemas = buildToolSchemas(base);
    expect(schemas).toHaveLength(2);

    const webApp = schemas[0] as Record<string, unknown>;
    expect(webApp["@type"]).toEqual(["WebApplication", "SoftwareApplication"]);
    expect(webApp.name).toBe("JSON Formatter");
    expect(webApp.url).toBe("https://omnikit.run/json");
    expect(webApp.applicationCategory).toBe("DeveloperApplication");
    expect(webApp.offers).toEqual({
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    });

    const breadcrumb = schemas[1] as Record<string, unknown>;
    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
    const items = breadcrumb.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe("OmniKit");
    expect(items[1].name).toBe("JSON Formatter");
  });

  it("includes FAQPage schema when faqItems provided", () => {
    const schemas = buildToolSchemas({
      ...base,
      faqItems: [
        { q: "What is JSON?", a: "A data format" },
        { q: "Is it free?", a: "Yes" },
      ],
    });
    expect(schemas).toHaveLength(3);

    const faq = schemas[2] as Record<string, unknown>;
    expect(faq["@type"]).toBe("FAQPage");
    const entities = faq.mainEntity as Record<string, unknown>[];
    expect(entities).toHaveLength(2);
    expect(entities[0].name).toBe("What is JSON?");
  });

  it("includes HowTo schema when howToSteps provided", () => {
    const schemas = buildToolSchemas({
      ...base,
      howToSteps: [
        { name: "Open tool", text: "Navigate to the page" },
        { name: "Paste JSON", text: "Paste your JSON string" },
      ],
    });
    expect(schemas).toHaveLength(3);

    const howTo = schemas[2] as Record<string, unknown>;
    expect(howTo["@type"]).toBe("HowTo");
    const steps = howTo.step as Record<string, unknown>[];
    expect(steps).toHaveLength(2);
    expect(steps[0].position).toBe(1);
    expect(steps[1].position).toBe(2);
  });

  it("includes all 4 schemas when both faq and howTo provided", () => {
    const schemas = buildToolSchemas({
      ...base,
      faqItems: [{ q: "Q1", a: "A1" }],
      howToSteps: [{ name: "Step 1", text: "Do something" }],
    });
    expect(schemas).toHaveLength(4);
    expect((schemas[0] as Record<string, unknown>)["@type"]).toEqual([
      "WebApplication",
      "SoftwareApplication",
    ]);
    expect((schemas[1] as Record<string, unknown>)["@type"]).toBe("BreadcrumbList");
    expect((schemas[2] as Record<string, unknown>)["@type"]).toBe("FAQPage");
    expect((schemas[3] as Record<string, unknown>)["@type"]).toBe("HowTo");
  });

  it("omits FAQPage when faqItems is empty array", () => {
    const schemas = buildToolSchemas({ ...base, faqItems: [] });
    expect(schemas).toHaveLength(2);
  });

  it("uses SITE_URL env or default for absolute URLs", () => {
    const schemas = buildToolSchemas(base);
    const webApp = schemas[0] as Record<string, unknown>;
    expect(webApp.url as string).toContain("omnikit.run/json");
  });
});

describe("buildToolSchemas — 3-level breadcrumb", () => {
  const base = {
    name: "JSON Formatter",
    description: "Format and validate JSON online",
    path: "/json",
    categoryName: "Text Processing",
    categoryPath: "/text-processing",
  };

  it("renders 3-level breadcrumb when categoryName + categoryPath provided", () => {
    const schemas = buildToolSchemas(base);
    const breadcrumb = schemas[1] as Record<string, unknown>;
    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
    const items = breadcrumb.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(3);
    expect(items[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "OmniKit",
      item: "https://omnikit.run",
    });
    expect(items[1]).toEqual({
      "@type": "ListItem",
      position: 2,
      name: "Text Processing",
      item: "https://omnikit.run/text-processing",
    });
    expect(items[2]).toEqual({
      "@type": "ListItem",
      position: 3,
      name: "JSON Formatter",
      item: "https://omnikit.run/json",
    });
  });

  it("falls back to 2-level when no category info", () => {
    const schemas = buildToolSchemas({
      name: "JSON Formatter",
      description: "Format and validate JSON online",
      path: "/json",
    });
    const breadcrumb = schemas[1] as Record<string, unknown>;
    const items = breadcrumb.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(2);
  });
});

describe("buildCategorySchema", () => {
  const base = {
    name: "Text Processing",
    description: "Free online text processing tools.",
    path: "/text-processing",
    tools: [
      { name: "JSON Formatter", url: "https://omnikit.run/json" },
      { name: "Regex Tester", url: "https://omnikit.run/regex" },
    ],
  };

  it("returns CollectionPage + ItemList + BreadcrumbList schemas", () => {
    const schemas = buildCategorySchema(base);
    expect(schemas).toHaveLength(3);
    expect((schemas[0] as Record<string, unknown>)["@type"]).toBe("CollectionPage");
    expect((schemas[1] as Record<string, unknown>)["@type"]).toBe("ItemList");
    expect((schemas[2] as Record<string, unknown>)["@type"]).toBe("BreadcrumbList");
  });

  it("returns FAQPage when faqItems provided", () => {
    const schemas = buildCategorySchema({
      ...base,
      faqItems: [{ q: "What is this?", a: "A collection" }],
    });
    expect(schemas).toHaveLength(4);
    const faq = schemas[3] as Record<string, unknown>;
    expect(faq["@type"]).toBe("FAQPage");
  });

  it("BreadcrumbList is 2-level (OmniKit > Category)", () => {
    const schemas = buildCategorySchema(base);
    const breadcrumb = schemas[2] as Record<string, unknown>;
    const items = breadcrumb.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe("OmniKit");
    expect(items[1].name).toBe("Text Processing");
  });

  it("ItemList has ordered tools", () => {
    const schemas = buildCategorySchema(base);
    const itemList = schemas[1] as Record<string, unknown>;
    const elements = itemList.itemListElement as Record<string, unknown>[];
    expect(elements).toHaveLength(2);
    expect(elements[0].position).toBe(1);
    expect(elements[1].position).toBe(2);
  });
});

describe("buildToolSchemas — sameAs", () => {
  const base = {
    name: "JSON Formatter",
    description: "Format and validate JSON online",
    path: "/json",
  };

  it("injects sameAs into WebApplication schema when provided", () => {
    const schemas = buildToolSchemas({
      ...base,
      sameAs: ["https://www.json.org", "https://datatracker.ietf.org/doc/html/rfc8259"],
    });
    const webApp = schemas[0] as Record<string, unknown>;
    expect(webApp.sameAs).toEqual([
      "https://www.json.org",
      "https://datatracker.ietf.org/doc/html/rfc8259",
    ]);
  });

  it("omits sameAs when not provided", () => {
    const schemas = buildToolSchemas(base);
    const webApp = schemas[0] as Record<string, unknown>;
    expect(webApp.sameAs).toBeUndefined();
  });

  it("omits sameAs when empty array", () => {
    const schemas = buildToolSchemas({ ...base, sameAs: [] });
    const webApp = schemas[0] as Record<string, unknown>;
    expect(webApp.sameAs).toBeUndefined();
  });
});
