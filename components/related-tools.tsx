"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { TOOLS, TOOL_RELATIONS, getToolIconColor } from "../libs/tools";

interface RelatedToolsProps {
  currentTool: string;
}

export default function RelatedTools({ currentTool }: RelatedToolsProps) {
  const t = useTranslations("tools");
  const locale = useLocale();
  const relatedKeys = TOOL_RELATIONS[currentTool];
  if (!relatedKeys || relatedKeys.length === 0) return null;

  const relatedTools = relatedKeys
    .map((key) => TOOLS.find((tool) => tool.key === key))
    .filter((tool): tool is (typeof TOOLS)[number] => tool !== undefined);

  if (relatedTools.length === 0) return null;

  const prefix = locale === "en" ? "" : `/${locale}`;

  return (
    <section className="mt-8">
      <h2 className="text-sm font-medium text-fg-muted uppercase tracking-wider mb-3">
        {t("relatedTools")}
      </h2>
      <div className="flex flex-wrap gap-2">
        {relatedTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.key}
              href={`${prefix}${tool.path}`}
              className="group flex items-center gap-2 rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-sm text-fg-secondary transition-all hover:border-accent-cyan/40 hover:bg-bg-elevated hover:text-fg-primary"
            >
              <Icon
                size={14}
                style={{ color: getToolIconColor(tool.path) }}
                className="shrink-0"
                aria-hidden="true"
              />
              <span>{t(`${tool.key}.shortTitle`)}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
