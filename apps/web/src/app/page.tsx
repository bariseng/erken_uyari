import Link from "next/link";

const modules = [
  { href: "/hesapla/siniflandirma", icon: "🧪", title: "Zemin Sınıflandırma", desc: "USCS, AASHTO ve TBDY 2018", cat: "Temel" },
  { href: "/hesapla/tasima-kapasitesi", icon: "🏗️", title: "Taşıma Kapasitesi", desc: "Terzaghi, Meyerhof, Hansen, Vesic", cat: "Temel" },
  { href: "/hesapla/yanal-basinc", icon: "🧱", title: "Yanal Toprak Basıncı", desc: "Rankine, Coulomb, Mononobe-Okabe", cat: "Temel" },
  { href: "/hesapla/deprem-parametreleri", icon: "🌍", title: "Deprem Parametreleri", desc: "TBDY 2018 SDS/SD1, spektrum", cat: "Temel" },
  { href: "/hesapla/oturma", icon: "📐", title: "Oturma Hesabı", desc: "Elastik, konsolidasyon, Schmertmann", cat: "İleri" },
  { href: "/hesapla/sivilasma", icon: "💧", title: "Sıvılaşma", desc: "Boulanger & Idriss 2014", cat: "İleri" },
  { href: "/hesapla/sev-stabilitesi", icon: "⛰️", title: "Şev Stabilitesi", desc: "Bishop, Janbu, Fellenius", cat: "İleri" },
  { href: "/hesapla/kazik", icon: "🔩", title: "Kazık Kapasitesi", desc: "α-β, SPT Meyerhof, Broms", cat: "İleri" },
  { href: "/hesapla/iksa", icon: "🏢", title: "İksa Tasarımı", desc: "Konsol, ankrajlı perde", cat: "Yapısal" },
  { href: "/hesapla/saha-tepki", icon: "📡", title: "Saha Tepki", desc: "Vs30, büyütme, transfer fonk.", cat: "Yapısal" },
  { href: "/hesapla/konsolidasyon", icon: "⏱️", title: "Konsolidasyon", desc: "Zaman-oturma, PVD Hansbo", cat: "Yapısal" },
  { href: "/hesapla/zemin-iyilestirme", icon: "🔨", title: "Zemin İyileştirme", desc: "Dinamik kompaksiyon, taş kolon", cat: "Yapısal" },
  { href: "/hesapla/faz-iliskileri", icon: "🔬", title: "Faz İlişkileri", desc: "Boşluk oranı, Proctor", cat: "Laboratuvar" },
  { href: "/hesapla/arazi-deneyleri", icon: "🔍", title: "Arazi Deneyleri", desc: "Efektif gerilme, SPT, Darcy", cat: "Laboratuvar" },
  { href: "/hesapla/indeks-deneyleri", icon: "📊", title: "İndeks Deneyleri", desc: "Atterberg, dane dağılımı", cat: "Laboratuvar" },
  { href: "/hesapla/gerilme-temel", icon: "🎯", title: "Gerilme & Temel", desc: "Mohr dairesi, boyutlandırma", cat: "Laboratuvar" },
  { href: "/hesapla/gerilme-dagilimi", icon: "📐", title: "Gerilme Dağılımı", desc: "Boussinesq, CBR", cat: "Laboratuvar" },
  { href: "/hesapla/istinat-duvari", icon: "🧱", title: "İstinat Duvarı", desc: "Ağırlık duvarı, geogrid", cat: "Yapısal" },
];

const stats = [
  { value: "18", label: "Hesap Modülü" },
  { value: "110+", label: "Birim Test" },
  { value: "TBDY", label: "2018 Uyumlu" },
  { value: "∞", label: "Ücretsiz Hesap" },
];

export default function HomePage() {
  return (
    <div className="gradient-bg">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-800 px-4 py-1.5 text-sm text-brand-700 dark:text-brand-400 mb-6 animate-fade-in">
            <span>⚡</span> Açık Kaynak &amp; Ücretsiz
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight animate-slide-up">
            Geoteknik Hesaplar,{" "}
            <span className="gradient-text">Modern Arayüz</span>
          </h1>

          <p className="mt-5 text-lg text-[var(--muted)] max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
            TBDY 2018 uyumlu, anlık hesaplama, formül gösterimi ve profesyonel PDF rapor.
            Taşıma kapasitesinden sıvılaşmaya, tüm geoteknik hesaplar tek platformda.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/hesapla" className="btn-primary text-base px-8 py-3 w-full sm:w-auto">
              Hesaplamaya Başla →
            </Link>
            <Link href="/rapor" className="btn-secondary text-base px-8 py-3 w-full sm:w-auto">
              📄 Rapor Oluştur
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {stats.map(s => (
            <div key={s.label} className="text-center py-4">
              <p className="text-3xl font-bold text-brand-600">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: "🇹🇷", title: "TBDY 2018 Uyumlu", desc: "Türkiye Bina Deprem Yönetmeliği'ne tam uyumlu hesaplar ve deprem parametreleri." },
            { icon: "⚡", title: "Anlık Hesaplama", desc: "Tüm hesaplar tarayıcıda çalışır. Sunucu bekleme yok, sonuçlar anında." },
            { icon: "📄", title: "Profesyonel Rapor", desc: "Zemin profili, hesap detayları ve değerlendirme içeren PDF rapor oluşturun." },
          ].map((f) => (
            <div key={f.title} className="card-hover p-6 group">
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Hesap Modülleri</h2>
          <p className="text-[var(--muted)] mt-2">18 modül, onlarca yöntem — hepsi ücretsiz</p>
        </div>

        {/* Kategori grupları */}
        {["Temel", "İleri", "Yapısal", "Laboratuvar"].map(cat => (
          <div key={cat} className="mb-8">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3 px-1">{cat} Modüller</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {modules.filter(m => m.cat === cat).map(m => (
                <Link key={m.href} href={m.href} className="card-hover p-4 group flex items-start gap-3">
                  <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">{m.icon}</span>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm group-hover:text-brand-600 transition-colors truncate">{m.title}</h4>
                    <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-2">{m.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="card p-8 md:p-12 text-center bg-gradient-to-r from-brand-50 to-earth-50 dark:from-brand-900/30 dark:to-neutral-900 border-brand-200 dark:border-brand-800">
          <h2 className="text-2xl font-bold">Hemen Başlayın</h2>
          <p className="text-[var(--muted)] mt-2 max-w-lg mx-auto">
            Kayıt olun, hesaplamalarınızı kaydedin ve profesyonel raporlar oluşturun.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/kayit" className="btn-primary px-8 py-3">Ücretsiz Kayıt Ol</Link>
            <Link href="/hesapla" className="btn-ghost">veya hesaplamaya başla →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
