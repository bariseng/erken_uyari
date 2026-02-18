"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const modules = [
  { href: "/hesapla/siniflandirma", icon: "🧪", label: "Zemin Sınıflandırma" },
  { href: "/hesapla/tasima-kapasitesi", icon: "🏗️", label: "Taşıma Kapasitesi" },
  { href: "/hesapla/yanal-basinc", icon: "🧱", label: "Yanal Toprak Basıncı" },
  { href: "/hesapla/deprem-parametreleri", icon: "🌍", label: "Deprem Parametreleri" },
  { href: "/hesapla/oturma", icon: "📐", label: "Oturma Hesabı" },
  { href: "/hesapla/sivilasma", icon: "💧", label: "Sıvılaşma" },
  { href: "/hesapla/sev-stabilitesi", icon: "⛰️", label: "Şev Stabilitesi" },
  { href: "/hesapla/kazik", icon: "🔩", label: "Kazık Kapasitesi" },
  { href: "/hesapla/iksa", icon: "🏢", label: "İksa Tasarımı" },
  { href: "/hesapla/saha-tepki", icon: "📡", label: "Saha Tepki" },
  { href: "/hesapla/konsolidasyon", icon: "⏱️", label: "Konsolidasyon" },
  { href: "/hesapla/zemin-iyilestirme", icon: "🔨", label: "Zemin İyileştirme" },
  { href: "/hesapla/faz-iliskileri", icon: "🔬", label: "Faz İlişkileri" },
  { href: "/hesapla/arazi-deneyleri", icon: "🔍", label: "Arazi Deneyleri" },
  { href: "/hesapla/indeks-deneyleri", icon: "📊", label: "İndeks Deneyleri" },
  { href: "/hesapla/gerilme-temel", icon: "🎯", label: "Gerilme & Temel" },
  { href: "/hesapla/gerilme-dagilimi", icon: "📐", label: "Gerilme Dağılımı" },
  { href: "/hesapla/istinat-duvari", icon: "🧱", label: "İstinat Duvarı" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isCalc = pathname?.startsWith("/hesapla");

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-brand-600">Geo</span>Force
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link href="/hesapla" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isCalc ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30" : "hover:bg-earth-100 dark:hover:bg-neutral-800"}`}>
            Hesapla
          </Link>
          <Link href="/rapor" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/rapor" ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30" : "hover:bg-earth-100 dark:hover:bg-neutral-800"}`}>
            📄 Rapor
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-earth-100 dark:hover:bg-neutral-800">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" /></svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[var(--card-border)] bg-[var(--background)] p-4 space-y-1 max-h-[70vh] overflow-y-auto">
          <Link href="/hesapla" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-earth-100 dark:hover:bg-neutral-800">
            📋 Tüm Modüller
          </Link>
          <Link href="/rapor" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-earth-100 dark:hover:bg-neutral-800">
            📄 PDF Rapor
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
