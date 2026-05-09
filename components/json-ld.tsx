import { SITE_URL } from "../libs/site";

function WebsiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OmniKit",
    url: SITE_URL,
    description:
      "A collection of free, browser-based developer tools. Base64 encoder, password generator, hash generator, encryption, checksum, and more.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "OmniKit",
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512x512.png`,
    sameAs: ["https://github.com/nickvore"],
    description: "A collection of free, browser-based developer tools.",
  };
}

export function buildToolSchemas(options: {
  name: string;
  description: string;
  path: string;
  faqItems?: { q: string; a: string }[];
  howToSteps?: { name: string; text: string }[];
}): object[] {
  const { name, description, path, faqItems, howToSteps } = options;
  const url = `${SITE_URL}${path}`;

  const schemas: object[] = [];

  schemas.push({
    "@context": "https://schema.org",
    "@type": ["WebApplication", "SoftwareApplication"],
    name,
    description,
    url,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    browserRequirements: "Requires JavaScript. Requires HTML5.",
  });

  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "OmniKit", item: SITE_URL },
      { "@type": "ListItem", position: 2, name, item: url },
    ],
  });

  if (faqItems && faqItems.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }

  if (howToSteps && howToSteps.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name,
      description,
      step: howToSteps.map((step, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: step.name,
        text: step.text,
      })),
    });
  }

  return schemas;
}

export { WebsiteJsonLd };
