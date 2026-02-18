import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GeoForce — Geoteknik Hesaplama Platformu",
  description: "Ücretsiz online geoteknik mühendislik hesaplama araçları. Taşıma kapasitesi, oturma, sıvılaşma, şev stabilitesi, kazık kapasitesi ve daha fazlası. TBDY 2018 uyumlu.",
};

const features = [
  { icon: "📐", title: "26 Hesap Modülü", desc: "Taşıma kapasitesinden sıvılaşmaya, şev stabilitesinden kazık tasarımına kadar kapsamlı geoteknik hesaplamalar." },
  { icon: "📄", title: "PDF Rapor", desc: "Profesyonel geoteknik rapor şablonu. Zemin profili, hesap detayları ve değerlendirme içeren PDF çıktı." },
  { icon: "📊", title: "Gerçek Grafikler", desc: "Recharts ile interaktif grafikler. Yöntem karşılaştırması, bileşen dağılımı ve derinlik profilleri." },
  { icon: "🔓", title: "Açık Kaynak", desc: "MIT lisansı ile tamamen açık kaynak. GitHub üzerinden katkıda bulunun, fork'layın, özelleştirin." },
  { icon: "🌍", title: "Türkçe / İngilizce", desc: "Tam çift dil desteği. TBDY 2018 ve Eurocode 7 referansları ile uluslararası uyumluluk." },
  { icon: "⚡", title: "Ücretsiz", desc: "Tüm hesaplamalar tarayıcıda çalışır. Kayıt gerektirmez, sunucuya veri gönderilmez, sınırsız kullanım." },
];

const moduleCategories = [
  {
    id: "temel",
    title: "Temel Modüller",
    desc: "Zemin mekaniğinin temel hesaplamaları",
    modules: [
      { href: "/hesapla/siniflandirma", icon: "🧪", title: "Zemin Sınıflandırma", methods: "USCS, AASHTO, TBDY 2018" },
      { href: "/hesapla/tasima-kapasitesi", icon: "🏗️", title: "Taşıma Kapasitesi", methods: "Terzaghi, Meyerhof, Hansen, Vesic" },
      { href: "/hesapla/yanal-basinc", icon: "🧱", title: "Yanal Toprak Basıncı", methods: "Rankine, Coulomb, Mononobe-Okabe" },
      { href: "/hesapla/deprem-parametreleri", icon: "🌍", title: "Deprem Parametreleri", methods: "TBDY 2018 SDS/SD1" },
    ],
  },
  {
    id: "ileri",
    title: "İleri Modüller",
    desc: "Detaylı geoteknik analizler",
    modules: [
      { href: "/hesapla/oturma", icon: "📐", title: "Oturma Hesabı", methods: "Elastik, Konsolidasyon, Schmertmann" },
      { href: "/hesapla/sivilasma", icon: "💧", title: "Sıvılaşma", methods: "Boulanger & Idriss 2014" },
      { href: "/hesapla/sev-stabilitesi", icon: "⛰️", title: "Şev Stabilitesi", methods: "Bishop, Janbu, Fellenius" },
      { href: "/hesapla/kazik", icon: "🔩", title: "Kazık Kapasitesi", methods: "α-β, SPT Meyerhof, Broms" },
    ],
  },
  {
    id: "yapisal",
    title: "Yapısal & Tamamlayıcı",
    desc: "İksa, iyileştirme, yapısal analiz ve laboratuvar",
    modules: [
      { href: "/hesapla/iksa", icon: "🏢", title: "İksa Tasarımı", methods: "Konsol, Ankrajlı Perde" },
      { href: "/hesapla/saha-tepki", icon: "📡", title: "Saha Tepki", methods: "Vs30, Transfer Fonk." },
      { href: "/hesapla/konsolidasyon", icon: "⏱️", title: "Konsolidasyon", methods: "Terzaghi, PVD Hansbo" },
      { href: "/hesapla/zemin-iyilestirme", icon: "🔨", title: "Zemin İyileştirme", methods: "Menard, Priebe" },
      { href: "/hesapla/istinat-duvari", icon: "🧱", title: "İstinat Duvarı", methods: "Ağırlık Duvarı, Geogrid" },
      { href: "/hesapla/destekli-kazi", icon: "🏗️", title: "Destekli Kazı", methods: "Peck 1969" },
      { href: "/hesapla/tekil-temel", icon: "🧱", title: "Tekil Temel", methods: "ACI 318, TS500" },
      { href: "/hesapla/kaya-kazik", icon: "🪨", title: "Kaya Soketi Kazık", methods: "Zhang & Einstein" },
      { href: "/hesapla/ec7-kazik", icon: "🇪🇺", title: "EC7 Kazık", methods: "DA1, DA2" },
      { href: "/hesapla/faz-iliskileri", icon: "🔬", title: "Faz İlişkileri", methods: "Boşluk Oranı, Proctor" },
      { href: "/hesapla/arazi-deneyleri", icon: "🔍", title: "Arazi Deneyleri", methods: "SPT, Darcy" },
      { href: "/hesapla/indeks-deneyleri", icon: "📊", title: "İndeks Deneyleri", methods: "Atterberg, Dane Dağılımı" },
      { href: "/hesapla/gerilme-temel", icon: "🎯", title: "Gerilme & Temel", methods: "Mohr Dairesi" },
      { href: "/hesapla/gerilme-dagilimi", icon: "📐", title: "Gerilme Dağılımı", methods: "Boussinesq, CBR" },
      { href: "/hesapla/zemin-ozellik-db", icon: "📚", title: "Zemin & Kaya DB", methods: "USCS, RMR, UCS" },
    ],
  },
];

const stats = [
  { value: "26", label: "Hesap Modülü" },
  { value: "110+", label: "Birim Test" },
  { value: "TBDY", label: "2018 Uyumlu" },
  { value: "∞", label: "Ücretsiz Hesap" },
];

const pricingFeatures = [
  { name: "Tüm hesap modülleri (26)", free: true, pro: true },
  { name: "PDF rapor oluşturma", free: true, pro: true },
  { name: "Grafik ve görselleştirme", free: true, pro: true },
  { name: "Proje kaydetme", free: "3 proje", pro: "Sınırsız" },
  { name: "Toplu hesaplama (batch)", free: false, pro: true },
  { name: "Özel rapor şablonu", free: false, pro: true },
  { name: "API erişimi", free: false, pro: true },
  { name: "Öncelikli destek", free: false, pro: true },
];

export default function HomePage() {
  return (
    <div className="gradient-bg">
      {/* ─── Hero ─── */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-800 px-4 py-1.5 text-sm text-brand-700 dark:text-brand-400 mb-6 animate-fade-in">
            <span>⚡</span> Açık Kaynak &amp; Ücretsiz — 26 Modül
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight animate-slide-up">
            Geoteknik Hesaplar,{" "}
            <span className="gradient-text">Modern Arayüz</span>
          </h1>

          <p className="mt-5 text-lg text-[var(--muted)] max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
            TBDY 2018 uyumlu, anlık hesaplama, formül gösterimi ve profesyonel PDF rapor.
            Taşıma kapasitesinden sıvılaşmaya, kazık tasarımından şev stabilitesine — tüm geoteknik hesaplar tek platformda.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/hesapla" className="btn-primary text-base px-8 py-3 w-full sm:w-auto">
              Hesaplamaya Başla →
            </Link>
            <Link href="/kayit" className="btn-secondary text-base px-8 py-3 w-full sm:w-auto">
              🚀 Ücretsiz Kayıt Ol
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

      {/* ─── 6 Özellik Kartı ─── */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Neden GeoForce?</h2>
          <p className="text-[var(--muted)] mt-2">Geoteknik mühendisler için tasarlandı</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
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

      {/* ─── Hesap Modülleri Showcase ─── */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">26 Hesap Modülü</h2>
          <p className="text-[var(--muted)] mt-2">Temel, ileri ve tamamlayıcı — hepsi ücretsiz</p>
        </div>

        {moduleCategories.map(cat => (
          <div key={cat.id} className="mb-10">
            <div className="mb-4 flex items-baseline gap-3">
              <h3 className="text-lg font-semibold">{cat.title}</h3>
              <span className="text-sm text-[var(--muted)]">{cat.desc}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {cat.modules.map(m => (
                <Link key={m.href} href={m.href} className="card-hover p-4 group flex items-start gap-3">
                  <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">{m.icon}</span>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm group-hover:text-brand-600 transition-colors truncate">{m.title}</h4>
                    <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-2">{m.methods}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center mt-6">
          <Link href="/hesapla" className="btn-secondary px-6 py-2.5">
            Tüm Modülleri Gör →
          </Link>
        </div>
      </section>

      {/* ─── Free vs Pro Karşılaştırma ─── */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Planlar</h2>
          <p className="text-[var(--muted)] mt-2">Temel özellikler herkese ücretsiz</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="card p-6 border-2 border-brand-200 dark:border-brand-800">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold">Free</h3>
              <p className="text-3xl font-bold mt-2">₺0 <span className="text-sm font-normal text-[var(--muted)]">/ sonsuza dek</span></p>
              <p className="text-sm text-[var(--muted)] mt-1">Bireysel kullanım için</p>
            </div>
            <ul className="space-y-3 text-sm">
              {pricingFeatures.map(f => (
                <li key={f.name} className="flex items-center gap-2">
                  <span className={f.free ? "text-green-600" : "text-red-400"}>{f.free ? "✓" : "✗"}</span>
                  <span>{f.name}</span>
                  {typeof f.free === "string" && <span className="ml-auto text-xs text-[var(--muted)]">{f.free}</span>}
                </li>
              ))}
            </ul>
            <Link href="/kayit" className="btn-secondary w-full mt-6 py-2.5">Ücretsiz Başla</Link>
          </div>

          {/* Pro */}
          <div className="card p-6 border-2 border-brand-600 dark:border-brand-500 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-medium px-3 py-1 rounded-full">
              Yakında
            </div>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold">Pro</h3>
              <p className="text-3xl font-bold mt-2">₺— <span className="text-sm font-normal text-[var(--muted)]">/ ay</span></p>
              <p className="text-sm text-[var(--muted)] mt-1">Profesyonel ekipler için</p>
            </div>
            <ul className="space-y-3 text-sm">
              {pricingFeatures.map(f => (
                <li key={f.name} className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{f.name}</span>
                  {typeof f.pro === "string" && <span className="ml-auto text-xs text-[var(--muted)]">{f.pro}</span>}
                </li>
              ))}
            </ul>
            <button disabled className="btn-primary w-full mt-6 py-2.5 opacity-60 cursor-not-allowed">Yakında</button>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
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
