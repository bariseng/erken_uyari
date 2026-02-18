export default function HesaplaPage() {
  const modules = [
    { href: "/hesapla/siniflandirma", icon: "🧪", title: "Zemin Sınıflandırma", desc: "USCS, AASHTO ve TBDY 2018 zemin sınıfı belirleme", ready: true },
    { href: "/hesapla/tasima-kapasitesi", icon: "🏗️", title: "Taşıma Kapasitesi", desc: "Terzaghi, Meyerhof, Hansen, Vesic yöntemleri", ready: true },
    { href: "/hesapla/yanal-basinc", icon: "🧱", title: "Yanal Toprak Basıncı", desc: "Rankine, Coulomb, Mononobe-Okabe (depremli)", ready: true },
    { href: "/hesapla/deprem-parametreleri", icon: "🌍", title: "TBDY 2018 Deprem Parametreleri", desc: "SDS, SD1, tasarım spektrumu, zemin sınıfı etkisi", ready: true },
    { href: "/hesapla/oturma", icon: "📐", title: "Oturma Hesabı", desc: "Elastik, konsolidasyon, Schmertmann", ready: true },
    { href: "/hesapla/sivilasma", icon: "💧", title: "Sıvılaşma Değerlendirmesi", desc: "TBDY 2018, Boulanger & Idriss (2014)", ready: true },
    { href: "/hesapla/sev-stabilitesi", icon: "⛰️", title: "Şev Stabilitesi", desc: "Bishop, Janbu, Fellenius", ready: true },
    { href: "/hesapla/kazik", icon: "🔩", title: "Kazık Kapasitesi", desc: "α-β yöntemi, SPT, Broms yanal yük", ready: true },
    { href: "/hesapla/iksa", icon: "🏢", title: "İksa Tasarımı", desc: "Konsol, tek/çok ankrajlı perde analizi", ready: true },
    { href: "/hesapla/saha-tepki", icon: "📡", title: "Saha Tepki Analizi", desc: "Vs30, büyütme faktörü, transfer fonksiyonu", ready: true },
    { href: "/hesapla/konsolidasyon", icon: "⏱️", title: "Konsolidasyon Analizi", desc: "Zaman-oturma, PVD (kum dren) analizi", ready: true },
    { href: "/hesapla/zemin-iyilestirme", icon: "🔨", title: "Zemin İyileştirme", desc: "Dinamik kompaksiyon, taş kolon, ön yükleme", ready: true },
    { href: "/hesapla/faz-iliskileri", icon: "🔬", title: "Faz İlişkileri & Kompaksiyon", desc: "Boşluk oranı, birim hacim ağırlıklar, Proctor", ready: true },
    { href: "/hesapla/arazi-deneyleri", icon: "🔍", title: "Arazi Deneyleri & Gerilme", desc: "Efektif gerilme, SPT korelasyonları, Darcy sızma", ready: true },
    { href: "/hesapla/indeks-deneyleri", icon: "📊", title: "İndeks Deneyleri", desc: "Atterberg limitleri, plastisite kartı, dane dağılımı", ready: true },
    { href: "/hesapla/gerilme-temel", icon: "🎯", title: "Gerilme & Temel Boyutlandırma", desc: "Mohr dairesi, sığ temel ön boyutlandırma", ready: true },
    { href: "/hesapla/gerilme-dagilimi", icon: "📐", title: "Gerilme Dağılımı & CBR", desc: "Boussinesq gerilme, CBR korelasyonları", ready: true },
    { href: "/hesapla/istinat-duvari", icon: "🧱", title: "İstinat Duvarı Stabilitesi", desc: "Ağırlık duvarı, donatılı zemin (geogrid)", ready: true },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold">Hesap Araçları</h1>
      <p className="mt-2 text-[var(--muted)]">Geoteknik mühendisliği hesap modülleri — tüm hesaplar anlık ve ücretsiz.</p>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modules.map((m) => (
          <a key={m.title} href={m.href} className="card p-6 hover:border-brand-400 transition-colors group">
            <span className="text-3xl">{m.icon}</span>
            <h2 className="mt-3 text-lg font-semibold group-hover:text-brand-600 transition-colors">{m.title}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{m.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
