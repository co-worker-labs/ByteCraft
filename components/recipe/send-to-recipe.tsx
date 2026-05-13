"use client";

import { useRouter, usePathname } from "../../i18n/navigation";
import { useTranslations } from "next-intl";
import { FlaskConical } from "lucide-react";
import { resolveStepId } from "../../libs/recipe/tool-step-map";
import { STORAGE_KEYS } from "../../libs/storage-keys";
import { showToast } from "../../libs/toast";

interface SendToRecipeProps {
  getInput: () => string;
  output: string;
  toolState: Record<string, unknown>;
  className?: string;
  hiddenTitle?: boolean;
  hiddenIcon?: boolean;
  hiddenBorder?: boolean;
}

export default function SendToRecipe({
  getInput,
  output,
  toolState,
  className,
  hiddenTitle,
  hiddenIcon,
  hiddenBorder,
}: SendToRecipeProps) {
  const t = useTranslations("recipe");
  const router = useRouter();
  const pathname = usePathname();

  function handleSend() {
    const stepId = resolveStepId(pathname, toolState);
    if (!stepId) return;

    const draft = {
      input: getInput(),
      stepId,
      params: {} as Record<string, string>,
      sourceTool: pathname,
    };

    localStorage.setItem(STORAGE_KEYS.recipeDraft, JSON.stringify(draft));
    showToast(t("sendToRecipe"), "success", 2000);

    if (pathname === "/recipe") {
      window.dispatchEvent(new CustomEvent("recipe:draft"));
    } else {
      router.push("/recipe");
    }
  }

  if (!output) return null;

  const baseClassName = [
    "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-lg transition-colors cursor-pointer",
    hiddenBorder
      ? "text-fg-secondary hover:text-accent-cyan"
      : "border border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 active:scale-95",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button onClick={handleSend} className={baseClassName} title={t("sendToRecipe")}>
      {!hiddenIcon && <FlaskConical size={14} />}
      {!hiddenTitle && t("sendToRecipe")}
    </button>
  );
}
