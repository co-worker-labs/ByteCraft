import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = "", hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-bg-surface border border-border-default rounded-xl p-4
        transition-all duration-200
        ${hover ? "hover:-translate-y-0.5 hover:shadow-card-hover hover:border-glow cursor-pointer" : "shadow-card"}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
