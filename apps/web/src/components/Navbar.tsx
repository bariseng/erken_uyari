"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import UserMenu from "./UserMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

const moduleKeys = [
  { href: "/hesapla/siniflandirma", key: "siniflandirma", icon: "🧪" },
  { href: "/hesapla/tasima-kapasitesi", key: "tasima", icon: "🏗️" },
  { href: "/hesapla/yanal-basinc", key: "yanal", icon: "🧱" },
  { href: "/hesapla/deprem-parametreleri", key: "deprem", icon: "🌍" },
  { href: "/hesapla/oturma", key: "oturma", icon: "📐" },
  { href: "/hesapla/sivilasma", key: "sivilasma", icon: "💧" },
  { href: "/hesapla/sev-stabilitesi", key: "sev", icon: "⛰️" },
  { href: "/hesapla/kazik", key: "kazik", icon: "🔩" },
  { href: "/hesapla/iksa", key: "iksa", icon: "🏢" },
  { href: "/hesapla/saha-tepki", key: "saha", icon: "📡" },
  { href: "/hesapla/konsolidasyon", key: "konsolidasyon", icon: "⏱️" },
  { href: "/hesapla/zemin-iyilestirme", key: "iyilestirme", icon: "🔨" },
  { href: "/hesapla/faz-iliskileri", key: "faz", icon: "🔬" },
  { href: "/hesapla/arazi-deneyleri", key: "arazi", icon: "🔍" },
  { href: "/hesapla/indeks-deneyleri", key: "indeks", icon: "📊" },
  { href: "/hesapla/gerilme-temel", key: "gerilme", icon: "🎯" },
  { href: "/hesapla/gerilme-dagilimi", key: "dagilim", icon: "📐" },
  { href: "/hesapla/istinat-duvari", key: "istinat", icon: "🧱" },
  { href: "/hesapla/destekli-kazi", key: "destekliKazi", icon: "⛏️" },
  { href: "/hesapla/tekil-temel", key: "tekilTemel", icon: "🧱" },
  { href: "/hesapla/kaya-kazik", key: "kayaKazik", icon: "🪨" },
  { href: "/hesapla/ec7-kazik", key: "ec7Kazik", icon: "🇪🇺" },
  { href: "/hesapla/zemin-ozellik-db", key: "zeminDb", icon: "📚" },
];

export default function Navbar() {
  const t = useTranslations("common");
  const tNav = useTranslations("nav");
  const tModules = useTranslations("modules");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isCalc = pathname?.startsWith("/hesapla");

  const modules = moduleKeys.map(m => ({
    ...m,
    label: tModules(m.key),
  }));

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-brand-600">Geo</span>Force
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link 
            href="/hesapla" 
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isCalc ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30" : "hover:bg-earth-100 dark:hover:bg-neutral-800"}`}
          >
            {t("calculate")}
          </Link>
          <Link 
            href="/rapor" 
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/rapor" ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30" : "hover:bg-earth-100 dark:hover:bg-neutral-800"}`}
          >
            📄 {t("report")}
          </Link>
          <div className="ml-2 border-l border-[var(--card-border)] pl-3 flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </div>

        {/* Mobile toggle */}
        <button 
          onClick={() => setOpen(!open)} 
          className="md:hidden p-2 rounded-lg hover:bg-earth-100 dark:hover:bg-neutral-800"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Menüyü aç/kapat"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" /></svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-[var(--card-border)] bg-[var(--background)] p-4 space-y-1 max-h-[70vh] overflow-y-auto">
          <Link href="/hesapla" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-earth-100 dark:hover:bg-neutral-800">
            📋 {tNav("allModules")}
          </Link>
          <Link href="/rapor" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-earth-100 dark:hover:bg-neutral-800">
            📄 PDF {t("report")}
          </Link>
          <hr className="border-[var(--card-border)] my-2" />
          {modules.map(m => (
            <Link key={m.href} href={m.href} onClick={() => setOpen(false)} className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${pathname === m.href ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 font-medium" : "hover:bg-earth-100 dark:hover:bg-neutral-800"}`}>
              {m.icon} {m.label}
            </Link>
          ))}
        </div>
      )}

      {/* Desktop sub-nav for /hesapla pages */}
      {isCalc && pathname !== "/hesapla" && (
        <div className="hidden md:block border-t border-[var(--card-border)] bg-[var(--card)]/50">
          <div className="mx-auto max-w-7xl px-4 py-2 flex gap-1 overflow-x-auto scrollbar-thin">
            {modules.map(m => (
              <Link key={m.href} href={m.href} className={`whitespace-nowrap px-2.5 py-1 rounded-md text-xs transition-colors ${pathname === m.href ? "bg-brand-600 text-white" : "hover:bg-earth-100 dark:hover:bg-neutral-800 text-[var(--muted)]"}`}>
                {m.icon} {m.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
