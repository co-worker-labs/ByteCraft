import { describe, it, expect } from "vitest";
import { buildToolSchemas } from "../../components/json-ld";

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
