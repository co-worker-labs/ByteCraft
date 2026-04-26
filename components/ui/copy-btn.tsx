"use client";

import { useState } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import { showToast } from "../../libs/toast";
import { Button } from "./button";

interface CopyButtonProps {
  getContent: () => string;
  className?: string;
  toast?: boolean;
  timeout?: number;
  /** When true, always render the button — disabled state when content is empty */
  alwaysShow?: boolean;
  /** When provided, renders as a labeled Button component matching toolbar style */
  label?: string;
}

export function CopyButton({
  getContent,
  className = "",
  toast = true,
  timeout = 3000,
  alwaysShow = false,
  label,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const content = getContent();

  if (!alwaysShow && !content) return null;

  const disabled = alwaysShow && !content;

  function handleCopy() {
    if (disabled) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), timeout);
    if (toast) {
      showToast("Copied", "success", timeout);
    }
  }

  const icon = copied ? (
    <ClipboardCheck size={label ? 14 : 18} className="text-accent-cyan" />
  ) : (
    <Clipboard size={label ? 14 : 18} />
  );

  if (label) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCopy}
        disabled={disabled}
        className={className}
      >
        {icon}
        {label}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled}
      className={`text-fg-muted hover:text-accent-cyan transition-colors duration-200 ${disabled ? "opacity-30 cursor-not-allowed" : ""} ${className}`}
      title="Copy"
    >
      {icon}
    </button>
  );
}
