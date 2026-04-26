"use client";

import {
  forwardRef,
  useRef,
  useEffect,
  type TextareaHTMLAttributes,
  type ReactNode,
  type UIEvent,
} from "react";

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "wrap"> & {
  label?: ReactNode;
  showLineNumbers: boolean;
  autoGrow?: boolean;
};

export const LineNumberedTextarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, className = "", showLineNumbers, autoGrow = false, value, onScroll, ...rest }, ref) => {
    const gutterRef = useRef<HTMLDivElement | null>(null);
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    function setRef(node: HTMLTextAreaElement | null) {
      innerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      }
    }

    useEffect(() => {
      if (!autoGrow || !innerRef.current) return;
      const ta = innerRef.current;
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    }, [autoGrow, value]);

    const outerClass = autoGrow ? "flex flex-col w-full" : "flex flex-col w-full h-full";

    if (!showLineNumbers) {
      const taClass = autoGrow
        ? `w-full bg-bg-input border border-border-default rounded-lg px-3 py-2 text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan focus:shadow-input-focus transition-all duration-200 resize-none scrollbar-thin ${className}`
        : `w-full flex-1 min-h-0 bg-bg-input border border-border-default rounded-lg px-3 py-2 text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan focus:shadow-input-focus transition-all duration-200 resize-none scrollbar-thin ${className}`;

      return (
        <div className={outerClass}>
          {label && (
            <label className="block text-sm font-medium text-fg-secondary mb-1 flex-shrink-0">
              {label}
            </label>
          )}
          <textarea ref={setRef} value={value} onScroll={onScroll} className={taClass} {...rest} />
        </div>
      );
    }

    const text = typeof value === "string" ? value : Array.isArray(value) ? value.join("") : "";
    const lineCount = Math.max(1, text.split("\n").length);

    function handleScroll(e: UIEvent<HTMLTextAreaElement>) {
      if (gutterRef.current) {
        gutterRef.current.scrollTop = e.currentTarget.scrollTop;
      }
      if (onScroll) onScroll(e);
    }

    const wrapperClass = autoGrow
      ? "flex w-full bg-bg-input border border-border-default rounded-lg overflow-hidden focus-within:border-accent-cyan focus-within:shadow-input-focus transition-all duration-200"
      : "flex w-full flex-1 min-h-0 bg-bg-input border border-border-default rounded-lg overflow-hidden focus-within:border-accent-cyan focus-within:shadow-input-focus transition-all duration-200";

    const taClass = autoGrow
      ? `flex-1 min-w-0 bg-bg-input px-3 py-2 text-fg-primary placeholder:text-fg-muted focus:outline-none resize-none font-mono text-sm leading-5 overflow-auto scrollbar-thin ${className}`
      : `flex-1 min-w-0 h-full bg-bg-input px-3 py-2 text-fg-primary placeholder:text-fg-muted focus:outline-none resize-none font-mono text-sm leading-5 overflow-auto scrollbar-thin ${className}`;

    const gutterClass = autoGrow
      ? "w-12 flex-shrink-0 border-r border-border-default text-end pr-2 pl-2 select-none text-fg-muted text-sm font-mono leading-5 py-2"
      : "w-12 flex-shrink-0 h-full overflow-hidden border-r border-border-default text-end pr-2 pl-2 select-none text-fg-muted text-sm font-mono leading-5 py-2";

    return (
      <div className={outerClass}>
        {label && (
          <label className="block text-sm font-medium text-fg-secondary mb-1 flex-shrink-0">
            {label}
          </label>
        )}
        <div className={wrapperClass}>
          <div ref={gutterRef} aria-hidden="true" className={gutterClass}>
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i + 1}>{i + 1}</div>
            ))}
          </div>
          <textarea
            ref={setRef}
            wrap="off"
            value={value}
            onScroll={handleScroll}
            className={taClass}
            {...rest}
          />
        </div>
      </div>
    );
  }
);

LineNumberedTextarea.displayName = "LineNumberedTextarea";
