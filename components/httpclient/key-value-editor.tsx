"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";
import type { KeyValue } from "../../libs/httpclient/types";

interface KeyValueEditorProps {
  pairs: KeyValue[];
  onChange: (pairs: KeyValue[]) => void;
  suggestions?: string[];
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export function KeyValueEditor({
  pairs,
  onChange,
  suggestions,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
}: KeyValueEditorProps) {
  const rows =
    pairs.length === 0 || pairs[pairs.length - 1].key !== "" || pairs[pairs.length - 1].value !== ""
      ? [...pairs, { key: "", value: "", enabled: true }]
      : pairs;

  function updateRow(index: number, field: keyof KeyValue, value: string | boolean) {
    const next = [...rows];
    next[index] = { ...next[index], [field]: value };
    onChange(next.filter((r, i) => i < next.length - 1 || r.key !== "" || r.value !== ""));
  }

  function removeRow(index: number) {
    const next = rows.filter((_, i) => i !== index);
    onChange(next.filter((r, i) => i < next.length - 1 || r.key !== "" || r.value !== ""));
  }

  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <KVRow
          key={index}
          row={row}
          index={index}
          suggestions={suggestions}
          keyPlaceholder={keyPlaceholder}
          valuePlaceholder={valuePlaceholder}
          onUpdate={updateRow}
          onRemove={removeRow}
          isLast={index === rows.length - 1}
        />
      ))}
    </div>
  );
}

function KVRow({
  row,
  index,
  suggestions,
  keyPlaceholder,
  valuePlaceholder,
  onUpdate,
  onRemove,
  isLast,
}: {
  row: KeyValue;
  index: number;
  suggestions?: string[];
  keyPlaceholder: string;
  valuePlaceholder: string;
  onUpdate: (index: number, field: keyof KeyValue, value: string | boolean) => void;
  onRemove: (index: number) => void;
  isLast: boolean;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSuggestions) return;
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showSuggestions]);

  function handleKeyChange(value: string) {
    onUpdate(index, "key", value);
    if (suggestions && value) {
      const lower = value.toLowerCase();
      setFiltered(suggestions.filter((s) => s.toLowerCase().includes(lower)));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }

  function selectSuggestion(suggestion: string) {
    onUpdate(index, "key", suggestion);
    setShowSuggestions(false);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={row.enabled}
        onChange={(e) => onUpdate(index, "enabled", e.target.checked)}
        className="w-4 h-4 rounded accent-[#06D6A0] bg-bg-input border-border-default cursor-pointer shrink-0"
      />
      <div ref={wrapRef} className="relative flex-1 min-w-0">
        <input
          type="text"
          value={row.key}
          onChange={(e) => handleKeyChange(e.target.value)}
          placeholder={keyPlaceholder}
          className="w-full bg-bg-input border border-border-default rounded-lg px-3 py-1.5 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan transition-colors"
          onFocus={() => {
            if (suggestions && row.key) {
              const lower = row.key.toLowerCase();
              setFiltered(suggestions.filter((s) => s.toLowerCase().includes(lower)));
              setShowSuggestions(true);
            }
          }}
        />
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute top-full left-0 mt-1 min-w-[200px] max-h-40 overflow-y-auto bg-bg-elevated border border-border-default rounded-lg shadow-lg z-50">
            {filtered.map((s) => (
              <button
                key={s}
                type="button"
                className="w-full text-left px-3 py-1.5 text-sm text-fg-primary hover:bg-accent-cyan-dim transition-colors"
                onClick={() => selectSuggestion(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <input
        type="text"
        value={row.value}
        onChange={(e) => onUpdate(index, "value", e.target.value)}
        placeholder={valuePlaceholder}
        className="flex-1 min-w-0 bg-bg-input border border-border-default rounded-lg px-3 py-1.5 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-accent-cyan transition-colors"
      />
      {!isLast && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-fg-muted hover:text-danger transition-colors shrink-0 cursor-pointer"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
