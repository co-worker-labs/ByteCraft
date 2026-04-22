import { ReactNode } from "react";

export type CodeType = "comment" | "keyword" | "punctuation" | "operator" | "string";

const typeStyles: Record<CodeType, string> = {
  comment: "text-[#467790]",
  keyword: "text-accent-cyan",
  operator: "text-accent-purple font-medium",
  punctuation: "text-accent-purple",
  string: "text-[#10B981]",
};

export function CodeItem({
  type,
  data,
  children,
}: {
  type: CodeType;
  data?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <span className={typeStyles[type]}>
      {data}
      {children}
    </span>
  );
}

export function CodeFunc({ name, children }: { name: ReactNode; children?: ReactNode }) {
  return (
    <>
      <span className="text-[#A78BFA]">{name}</span>
      <CodeItem type="punctuation" data="(" />
      {children}
      <CodeItem type="punctuation" data=")" />
    </>
  );
}

export function CodeSnipt({ children }: { children?: ReactNode }) {
  return (
    <pre className="w-full bg-bg-input rounded-lg p-4 overflow-x-auto">
      <code>{children}</code>
    </pre>
  );
}
