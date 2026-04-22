"use client";

import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ReactNode } from "react";

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

export function Dropdown({ trigger, items, className = "" }: DropdownProps) {
  return (
    <Menu as="div" className={`relative inline-block ${className}`}>
      <MenuButton as="div">{trigger}</MenuButton>
      <MenuItems className="absolute right-0 mt-2 min-w-[180px] bg-bg-elevated border border-border-default rounded-xl shadow-lg overflow-hidden z-50 focus:outline-none">
        {items.map((item, index) => (
          <MenuItem key={index} disabled={item.disabled}>
            {({ focus }) => (
              <button
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${focus ? "bg-accent-cyan-dim text-accent-cyan" : "text-fg-primary"} ${item.active ? "text-accent-cyan font-medium" : ""} ${item.disabled ? "opacity-40 pointer-events-none" : ""}`}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
