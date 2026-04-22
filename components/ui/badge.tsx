import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "cyan" | "purple" | "danger";
  className?: string;
}

const variantStyles = {
  default: "bg-bg-elevated text-fg-muted",
  cyan: "bg-accent-cyan-dim text-accent-cyan",
  purple: "bg-accent-purple-dim text-accent-purple",
  danger: "bg-red-500/10 text-danger",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
