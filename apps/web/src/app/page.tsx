export default function HomePage() {
  const modules = [
    { href: "/hesapla/siniflandirma", icon: "🧪", title: "Zemin Sınıflandırma", desc: "USCS, AASHTO ve TBDY 2018 zemin sınıfı belirleme", tag: "Faz 1" },
    { href: "/hesapla/tasima-kapasitesi", icon: "🏗️", title: "Taşıma Kapasitesi", desc: "Terzaghi, Meyerhof, Hansen, Vesic yöntemleri", tag: "Faz 1" },
    { href: "/hesapla/yanal-basinc", icon: "🧱", title: "Yanal Toprak Basıncı", desc: "Rankine, Coulomb, Mononobe-Okabe", tag: "Faz 1" },
    { href: "/hesapla/deprem-parametreleri", icon: "🌍", title: "TBDY 2018 Deprem Parametreleri", desc: "SDS, SD1, tasarım spektrumu hesabı", tag: "Faz 1" },
    { href: "/hesapla/oturma", icon: "📐", title: "Oturma Hesabı", desc: "Elastik, konsolidasyon, Schmertmann", tag: "Faz 2" },
    { href: "/hesapla/sivilasma", icon: "💧", title: "Sıvılaşma Değerlendirmesi", desc: "TBDY 2018, Boulanger & Idriss", tag: "Faz 2" },
    { href: "/hesapla/sev-stabilitesi", icon: "⛰️", title: "Şev Stabilitesi", desc: "Bishop, Janbu, Fellenius", tag: "Faz 2" },
    { href: "/hesapla/kazik", icon: "🔩", title: "Kazık Kapasitesi", desc: "α, β yöntemleri, SPT korelasyonları", tag: "Faz 2" },
    { href: "/hesapla/iksa", icon: "🏢", title: "İksa Tasarımı", desc: "Konsol, tek/çok ankrajlı perde analizi", tag: "Faz 3" },
    { href: "/hesapla/saha-tepki", icon: "📡", title: "Saha Tepki Analizi", desc: "Vs30, büyütme faktörü, transfer fonksiyonu", tag: "Faz 3" },
    { href: "/hesapla/konsolidasyon", icon: "⏱️", title: "Konsolidasyon Analizi", desc: "Zaman-oturma, PVD (kum dren) analizi", tag: "Faz 3" },
    { href: "/hesapla/zemin-iyilestirme", icon: "🔨", title: "Zemin İyileştirme", desc: "Dinamik kompaksiyon, taş kolon, ön yükleme", tag: "Faz 3" },
    { href: "/hesapla/faz-iliskileri", icon: "🔬", title: "Faz İlişkileri & Kompaksiyon", desc: "Boşluk oranı, birim hacim ağırlıklar, Proctor", tag: "Faz 3" },
    { href: "/hesapla/arazi-deneyleri", icon: "🔍", title: "Arazi Deneyleri & Gerilme", desc: "Efektif gerilme, SPT korelasyonları, Darcy sızma", tag: "Faz 3" },
    { href: "/hesapla/indeks-deneyleri", icon: "📊", title: "İndeks Deneyleri", desc: "Atterberg limitleri, plastisite kartı, dane dağılımı", tag: "Faz 3" },
    { href: "/hesapla/gerilme-temel", icon: "🎯", title: "Gerilme & Temel Boyutlandırma", desc: "Mohr dairesi, sığ temel ön boyutlandırma", tag: "Faz 3" },
    { href: "/hesapla/gerilme-dagilimi", icon: "📐", title: "Gerilme Dağılımı & CBR", desc: "Boussinesq gerilme, CBR korelasyonları", tag: "Faz 3" },
    { href: "/hesapla/istinat-duvari", icon: "🧱", title: "İstinat Duvarı Stabilitesi", desc: "Ağırlık duvarı, donatılı zemin (geogrid)", tag: "Faz 3" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-800 px-4 py-1.5 text-sm text-brand-700 dark:text-brand-400 mb-6">
          <span>⚡</span> Açık Kaynak &amp; Ücretsiz
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Geoteknik Hesaplar,{" "}
          <span className="text-brand-600">Modern Arayüz</span>
        </h1>
        <p className="mt-4 text-lg text-[var(--muted)] max-w-2xl mx-auto">
          TBDY 2018 uyumlu, anlık hesaplama, formül gösterimi. 
          Taşıma kapasitesinden sıvılaşmaya, tüm geoteknik hesaplar tek platformda.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <a href="/hesapla" className="btn-primary text-base px-6 py-3">
            Hesaplamaya Başla →
          </a>
          <a href="https://github.com/geoforce" target="_blank" rel="noopener" className="btn-secondary text-base px-6 py-3">
            GitHub'da İncele
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🇹🇷", title: "TBDY 2018 Uyumlu", desc: "Türkiye Bina Deprem Yönetmeliği'ne tam uyumlu hesaplar ve deprem parametreleri." },
            { icon: "⚡", title: "Anlık Hesaplama", desc: "Tüm hesaplar tarayıcıda çalışır. Sunucu bekleme yok, sonuçlar anında." },
            { icon: "📊", title: "Formül Gösterimi", desc: "Her hesabın arkasındaki matematik görünür. Adım adım çözüm ve doğrulama." },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <h2 className="text-2xl font-bold text-center mb-8">Hesap Modülleri</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m) => (
            <a
              key={m.title}
              href={m.href}
              className={`card p-5 hover:border-brand-400 transition-colors group ${m.tag === "Yakında" ? "opacity-60 pointer-events-none" : ""}`}
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl">{m.icon}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${m.tag === "Yakında" ? "bg-earth-200 text-earth-600" : "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"}`}>
                  {m.tag}
                </span>
              </div>
              <h3 className="mt-3 font-semibold group-hover:text-brand-600 transition-colors">{m.title}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{m.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
