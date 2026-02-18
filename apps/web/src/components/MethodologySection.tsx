"use client";
import { useState } from "react";
import Formula from "./Formula";

export interface FormulaItem {
  name: string;
  formula: string;
  description?: string;
}

export interface MethodStep {
  step: number;
  title: string;
  description: string;
}

export interface MethodologyData {
  title: string;
  overview: string;
  methods: {
    name: string;
    description: string;
    formulas: FormulaItem[];
    steps?: MethodStep[];
    limitations?: string[];
  }[];
  references: string[];
  standards?: string[];
  notes?: string[];
}

/** Basit formül stringini KaTeX'e çevirir */
function toTex(f: string): string {
  return f
    .replace(/\*\*/g, "^")
    .replace(/\*/g, " \\cdot ")
    .replace(/gamma/g, "\\gamma")
    .replace(/phi/g, "\\varphi")
    .replace(/delta/g, "\\delta")
    .replace(/alpha/g, "\\alpha")
    .replace(/beta/g, "\\beta")
    .replace(/sigma/g, "\\sigma")
    .replace(/pi/g, "\\pi")
    .replace(/sqrt\(([^)]+)\)/g, "\\sqrt{$1}")
    .replace(/tan\(/g, "\\tan(")
    .replace(/cos\(/g, "\\cos(")
    .replace(/sin\(/g, "\\sin(")
    .replace(/cot\(/g, "\\cot(")
    .replace(/log10/g, "\\log_{10}")
    .replace(/e\^/g, "e^");
}

export default function MethodologySection({ data }: { data: MethodologyData }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-sm font-medium hover:border-brand-400 transition-colors w-full justify-between"
      >
        <span>📖 Metodoloji & Formüller</span>
        <span className="text-xs text-[var(--muted)]">{open ? "▲ Kapat" : "▼ Aç"}</span>
      </button>

      {open && (
        <div className="mt-3 card p-6 space-y-6 text-sm">
          {/* Genel Bakış */}
          <div>
            <h3 className="font-semibold text-lg mb-2">{data.title}</h3>
            <p className="text-[var(--muted)]">{data.overview}</p>
          </div>

          {/* Yöntemler */}
          {data.methods.map((m, mi) => (
            <div key={mi} className="border-t border-[var(--card-border)] pt-4">
              <h4 className="font-semibold text-base text-brand-600">{m.name}</h4>
              <p className="mt-1 text-[var(--muted)]">{m.description}</p>

              {/* Formüller */}
              {m.formulas.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Formüller</p>
                  {m.formulas.map((f, fi) => (
                    <div key={fi} className="rounded-lg bg-earth-50 dark:bg-neutral-800 p-3">
                      <p className="font-semibold text-xs text-[var(--foreground)]">{f.name}:</p>
                      <div className="mt-1 overflow-x-auto">
                        <Formula tex={toTex(f.formula)} display />
                      </div>
                      {f.description && <p className="mt-1 text-[var(--muted)] text-xs">{f.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Hesap Adımları */}
              {m.steps && m.steps.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)] mb-2">Hesap Adımları</p>
                  <div className="space-y-2">
                    {m.steps.map(s => (
                      <div key={s.step} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 text-xs font-bold flex items-center justify-center">{s.step}</span>
                        <div>
                          <p className="font-medium">{s.title}</p>
                          <p className="text-[var(--muted)] text-xs">{s.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sınırlamalar */}
              {m.limitations && m.limitations.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)] mb-1">Sınırlamalar</p>
                  <ul className="list-disc list-inside text-xs text-[var(--muted)] space-y-0.5">
                    {m.limitations.map((l, li) => <li key={li}>{l}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {/* Standartlar */}
          {data.standards && data.standards.length > 0 && (
            <div className="border-t border-[var(--card-border)] pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)] mb-2">İlgili Standartlar</p>
              <div className="flex flex-wrap gap-2">
                {data.standards.map((s, si) => (
                  <span key={si} className="px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Referanslar */}
          <div className="border-t border-[var(--card-border)] pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)] mb-2">Referanslar</p>
            <ol className="list-decimal list-inside text-xs text-[var(--muted)] space-y-1">
              {data.references.map((r, ri) => <li key={ri}>{r}</li>)}
            </ol>
          </div>

          {/* Notlar */}
          {data.notes && data.notes.length > 0 && (
            <div className="border-t border-[var(--card-border)] pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)] mb-1">Notlar</p>
              {data.notes.map((n, ni) => <p key={ni} className="text-xs text-[var(--muted)]">💡 {n}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
