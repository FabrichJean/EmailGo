"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "../I18nProvider";
import { IconGlobe, IconChevronRight } from "../icons";
import type { Locale } from "@/lib/i18n/config";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
];

export default function DocsLanguageToggle() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const current = OPTIONS.find((o) => o.value === locale);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
      >
        <IconGlobe className="h-3.5 w-3.5 text-accent" />
        {current?.label}
        <IconChevronRight className={`h-3 w-3 text-zinc-500 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-20 mt-1 w-36 rounded-lg border border-border bg-surface p-1 shadow-lg">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setLocale(opt.value);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                opt.value === locale
                  ? "bg-accent/15 font-medium text-accent"
                  : "text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              {opt.label}
              {opt.value === locale && <span className="glow-accent h-1.5 w-1.5 rounded-full bg-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
