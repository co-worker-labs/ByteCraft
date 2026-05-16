"use client";

import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ReactNode, useState, useLayoutEffect, useRef } from "react";

interface DropdownItem {
  label: ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  className?: string;
}

function useAutoAlign(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [align, setAlign] = useState<"left" | "right">("left");

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setAlign(rect.right + 180 > window.innerWidth ? "right" : "left");
  }, [containerRef]);

  return align;
}

export function Dropdown({ trigger, items, className = "" }: DropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const align = useAutoAlign(containerRef);

  return (
    <Menu as="div" className={`relative inline-block ${className}`} ref={containerRef}>
      <MenuButton as="div">{trigger}</MenuButton>
      <MenuItems
        className={`absolute ${align === "right" ? "right-0" : "left-0"} mt-2 min-w-[180px] max-h-[280px] overflow-y-auto scrollbar-thin bg-bg-elevated border border-border-default rounded-xl shadow-lg z-50 focus:outline-none`}
      >
        <div className="relative">
          {items.map((item, index) => (
            <MenuItem key={index} disabled={item.disabled}>
              {({ focus }) => (
                <button
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-l-2 ${item.active ? "border-accent-cyan text-accent-cyan font-medium" : "border-transparent"} ${focus && item.active ? "bg-accent-cyan-dim" : ""} ${focus && !item.active ? "bg-accent-cyan-dim text-accent-cyan" : ""} ${!focus && item.active ? "bg-accent-cyan/10" : ""} ${!focus && !item.active ? "text-fg-primary" : ""} ${item.disabled ? "opacity-40 pointer-events-none" : ""}`}
                  onClick={item.onClick}
                >
                  {item.label}
                </button>
              )}
            </MenuItem>
          ))}
          <div className="sticky bottom-0 h-6 bg-gradient-to-t from-bg-elevated to-transparent pointer-events-none" />
        </div>
      </MenuItems>
    </Menu>
  );
}
