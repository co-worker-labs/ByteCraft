"use client";

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { ReactNode } from "react";

interface AccordionItem {
  title: ReactNode;
  content: ReactNode;
  defaultOpen?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export function Accordion({ items, className = "" }: AccordionProps) {
  return (
    <div
      className={`divide-y divide-border-default border border-border-default rounded-xl overflow-hidden ${className}`}
    >
      {items.map((item, index) => (
        <Disclosure key={index} defaultOpen={item.defaultOpen}>
          {({ open }) => (
            <>
              <DisclosureButton className="flex w-full items-center justify-between px-4 py-3 text-left text-fg-primary font-semibold transition-colors hover:bg-bg-elevated/50">
                <span>{item.title}</span>
                <ChevronDown
                  size={18}
                  className={`text-fg-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
              </DisclosureButton>
              <DisclosurePanel className="px-4 pb-3 pt-1 text-fg-secondary text-sm border-l-2 border-accent-cyan ml-2">
                {item.content}
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  );
}
