import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--card-border)] bg-[var(--card)]/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-bold text-lg">
              <span className="text-brand-600">Geo</span>Force
            </Link>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Açık kaynak geoteknik hesaplama platformu. TBDY 2018 uyumlu.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <a href="https://github.com/geoforce" target="_blank" rel="noopener noreferrer" className="text-[var(--muted)] hover:text-brand-600 transition-colors" aria-label="GitHub">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
            </div>
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

          {/* Bilgi */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Bilgi</h4>
            <ul className="space-y-1.5 text-sm text-[var(--muted)]">
              <li><Link href="/hakkinda" className="hover:text-brand-600 transition-colors">Hakkında</Link></li>
              <li><Link href="/yardim" className="hover:text-brand-600 transition-colors">Yardım / SSS</Link></li>
              <li><span>MIT Lisans</span></li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="text-sm font-semibold mb-3">İletişim</h4>
            <ul className="space-y-1.5 text-sm text-[var(--muted)]">
              <li><a href="https://github.com/geoforce/geoforce/issues" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition-colors">GitHub Issues</a></li>
              <li><a href="mailto:info@geoforce.dev" className="hover:text-brand-600 transition-colors">info@geoforce.dev</a></li>
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
