import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--card-border)] bg-[var(--card)]/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-bold text-lg">
              <span className="text-brand-600">Geo</span>Force
            </Link>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Açık kaynak geoteknik hesaplama platformu. TBDY 2018 uyumlu.
            </p>
          </div>

          {/* Hesaplar */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Hesaplar</h4>
            <ul className="space-y-1.5 text-sm text-[var(--muted)]">
              <li><Link href="/hesapla/tasima-kapasitesi" className="hover:text-brand-600 transition-colors">Taşıma Kapasitesi</Link></li>
              <li><Link href="/hesapla/oturma" className="hover:text-brand-600 transition-colors">Oturma Hesabı</Link></li>
              <li><Link href="/hesapla/sivilasma" className="hover:text-brand-600 transition-colors">Sıvılaşma</Link></li>
              <li><Link href="/hesapla/kazik" className="hover:text-brand-600 transition-colors">Kazık Kapasitesi</Link></li>
              <li><Link href="/hesapla" className="hover:text-brand-600 transition-colors font-medium">Tüm Modüller →</Link></li>
            </ul>
          </div>

          {/* Araçlar */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Araçlar</h4>
            <ul className="space-y-1.5 text-sm text-[var(--muted)]">
              <li><Link href="/rapor" className="hover:text-brand-600 transition-colors">PDF Rapor</Link></li>
              <li><Link href="/projeler" className="hover:text-brand-600 transition-colors">Projelerim</Link></li>
              <li><Link href="/kayit" className="hover:text-brand-600 transition-colors">Kayıt Ol</Link></li>
            </ul>
          </div>

          {/* Hakkında */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Hakkında</h4>
            <ul className="space-y-1.5 text-sm text-[var(--muted)]">
              <li><span>MIT Lisans</span></li>
              <li><span>v0.1.0</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--card-border)] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--muted)]">
          <p>© 2026 GeoForce. Açık kaynak — MIT lisansı ile dağıtılmaktadır.</p>
          <p>🔒 Tüm hesaplamalar tarayıcınızda çalışır. Verileriniz sunucuya gönderilmez.</p>
        </div>
      </div>
    </footer>
  );
}
