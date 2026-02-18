"use client";
import { useEffect, useRef } from "react";
import katex from "katex";

interface FormulaProps {
  tex: string;
  display?: boolean;
  className?: string;
}

export default function Formula({ tex, display = false, className }: FormulaProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(tex, ref.current, {
          displayMode: display,
          throwOnError: false,
          trust: true,
        });
      } catch {
        ref.current.textContent = tex;
      }
    }
  }, [tex, display]);

  return <span ref={ref} className={className} />;
}

/** Birden fazla formülü blok olarak gösterir */
export function FormulaBlock({ formulas, className }: { formulas: { label?: string; tex: string }[]; className?: string }) {
  return (
    <div className={`space-y-3 py-3 px-4 rounded-lg bg-earth-50 dark:bg-neutral-800 ${className ?? ""}`}>
      {formulas.map((f, i) => (
        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          {f.label && <span className="text-xs font-medium text-[var(--muted)] min-w-[120px]">{f.label}:</span>}
          <Formula tex={f.tex} display className="overflow-x-auto" />
        </div>
      ))}
    </div>
  );
}
