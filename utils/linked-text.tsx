import React from "react";
import { TOOL_PATHS } from "../libs/tools";

export function renderLinkedText(text: string, locale: string): React.ReactNode[] {
  const prefix = locale === "en" ? "" : `/${locale}`;
  const pattern = /\[([^\]]+)\]\((\/[^)]+)\)/g;

  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    const linkText = match[1];
    const path = match[2];

    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    if (TOOL_PATHS.has(path)) {
      result.push(
        React.createElement(
          "a",
          {
            key: `link-${key++}`,
            href: `${prefix}${path}`,
            className: "text-accent-cyan hover:underline",
          },
          linkText
        )
      );
    } else {
      result.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  if (result.length === 0) {
    result.push(text);
  }

  const hasAnyLink = result.some((r) => React.isValidElement(r));
  if (!hasAnyLink) {
    return [text];
  }

  return result;
}
