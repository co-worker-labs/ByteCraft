"use client";

import { useState } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import { showToast } from "../../libs/toast";

interface CopyButtonProps {
  getContent: () => string;
  className?: string;
  toast?: boolean;
  timeout?: number;
}

export function CopyButton({
  getContent,
  className = "",
  toast = true,
  timeout = 3000,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  if (!getContent()) return null;

  function handleCopy() {
    navigator.clipboard.writeText(getContent());
    setCopied(true);
    setTimeout(() => setCopied(false), timeout);
    if (toast) {
      showToast("Copied", "success", timeout);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`text-fg-muted hover:text-accent-cyan transition-colors duration-200 ${className}`}
      title="Copy"
    >
      {copied ? <ClipboardCheck size={18} className="text-accent-cyan" /> : <Clipboard size={18} />}
    </button>
  );
}
