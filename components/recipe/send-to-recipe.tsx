"use client";

import { useRouter, usePathname } from "../../i18n/navigation";
import { useTranslations } from "next-intl";
import { FlaskConical } from "lucide-react";
import { Button } from "../ui/button";
import { resolveStepId } from "../../libs/recipe/tool-step-map";
import { STORAGE_KEYS } from "../../libs/storage-keys";
import { showToast } from "../../libs/toast";

interface SendToRecipeProps {
  output: string;
  toolState: Record<string, unknown>;
}

export default function SendToRecipe({ output, toolState }: SendToRecipeProps) {
  const t = useTranslations("recipe");
  const router = useRouter();
  const pathname = usePathname();

  function handleSend() {
    const stepId = resolveStepId(pathname, toolState);
    if (!stepId) return;

    const draft = {
      input: output,
      stepId,
      params: {} as Record<string, string>,
      sourceTool: pathname,
    };

    localStorage.setItem(STORAGE_KEYS.recipeDraft, JSON.stringify(draft));
    showToast(t("sendToRecipe"), "success", 2000);
    router.push("/recipe");
  }

  if (!output) return null;

  return (
    <Button variant="outline" size="sm" onClick={handleSend} className="gap-1.5">
      <FlaskConical size={14} />
      {t("sendToRecipe")}
    </Button>
  );
}
