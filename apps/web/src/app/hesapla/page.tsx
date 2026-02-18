import Link from "next/link";

const categories = [
  {
    title: "Temel Modüller",
    desc: "Zemin mekaniğinin temel hesaplamaları",
    modules: [
      { href: "/hesapla/siniflandirma", icon: "🧪", title: "Zemin Sınıflandırma", desc: "USCS, AASHTO ve TBDY 2018 zemin sınıfı belirleme", methods: ["USCS", "AASHTO", "TBDY 2018"] },
      { href: "/hesapla/tasima-kapasitesi", icon: "🏗️", title: "Taşıma Kapasitesi", desc: "Sığ temel nihai ve izin verilebilir taşıma kapasitesi", methods: ["Terzaghi", "Meyerhof", "Hansen", "Vesic"] },
      { href: "/hesapla/yanal-basinc", icon: "🧱", title: "Yanal Toprak Basıncı", desc: "Aktif, pasif ve sükûnet basınç katsayıları", methods: ["Rankine", "Coulomb", "Mononobe-Okabe"] },
      { href: "/hesapla/deprem-parametreleri", icon: "🌍", title: "Deprem Parametreleri", desc: "TBDY 2018 SDS, SD1, tasarım spektrumu", methods: ["TBDY 2018"] },
    ],
  },
  {
    title: "İleri Modüller",
    desc: "Detaylı geoteknik analizler",
    modules: [
      { href: "/hesapla/oturma", icon: "📐", title: "Oturma Hesabı", desc: "Elastik, konsolidasyon ve Schmertmann oturma analizi", methods: ["Elastik", "1D Konsolidasyon", "Schmertmann"] },
      { href: "/hesapla/sivilasma", icon: "💧", title: "Sıvılaşma", desc: "SPT bazlı sıvılaşma potansiyeli değerlendirmesi", methods: ["Boulanger & Idriss 2014"] },
      { href: "/hesapla/sev-stabilitesi", icon: "⛰️", title: "Şev Stabilitesi", desc: "Dairesel kayma yüzeyi güvenlik katsayısı", methods: ["Bishop", "Janbu", "Fellenius"] },
      { href: "/hesapla/kazik", icon: "🔩", title: "Kazık Kapasitesi", desc: "Tekil kazık eksenel ve yanal yük kapasitesi", methods: ["α-β", "SPT Meyerhof", "Broms"] },
    ],
  },
  {
    title: "Yapısal Modüller",
    desc: "İksa, iyileştirme ve yapısal analiz",
    modules: [
      { href: "/hesapla/iksa", icon: "🏢", title: "İksa Tasarımı", desc: "Derin kazı perde analizi ve ankraj kuvvetleri", methods: ["Konsol", "Tek Ankrajlı", "Çok Ankrajlı"] },
      { href: "/hesapla/saha-tepki", icon: "📡", title: "Saha Tepki", desc: "Zemin büyütme faktörü ve transfer fonksiyonu", methods: ["Vs30", "Transfer Fonk."] },
      { href: "/hesapla/konsolidasyon", icon: "⏱️", title: "Konsolidasyon", desc: "Zaman-oturma ilişkisi ve PVD analizi", methods: ["Terzaghi", "PVD Hansbo"] },
      { href: "/hesapla/zemin-iyilestirme", icon: "🔨", title: "Zemin İyileştirme", desc: "Dinamik kompaksiyon, taş kolon, ön yükleme", methods: ["Menard", "Priebe", "Ön Yükleme"] },
      { href: "/hesapla/istinat-duvari", icon: "🧱", title: "İstinat Duvarı", desc: "Ağırlık duvarı ve donatılı zemin stabilitesi", methods: ["Ağırlık Duvarı", "Geogrid"] },
    ],
  },
  {
    title: "Laboratuvar & Arazi",
    desc: "Deney sonuçları ve korelasyonlar",
    modules: [
      { href: "/hesapla/faz-iliskileri", icon: "🔬", title: "Faz İlişkileri", desc: "Boşluk oranı, birim hacim ağırlıklar, Proctor", methods: ["Faz Hesabı", "Proctor"] },
      { href: "/hesapla/arazi-deneyleri", icon: "🔍", title: "Arazi Deneyleri", desc: "Efektif gerilme profili, SPT korelasyonları", methods: ["Efektif Gerilme", "SPT", "Darcy"] },
      { href: "/hesapla/indeks-deneyleri", icon: "📊", title: "İndeks Deneyleri", desc: "Atterberg limitleri, plastisite kartı, dane dağılımı", methods: ["Atterberg", "Dane Dağılımı"] },
      { href: "/hesapla/gerilme-temel", icon: "🎯", title: "Gerilme & Temel", desc: "Mohr dairesi, sığ temel ön boyutlandırma", methods: ["Mohr", "Boyutlandırma"] },
      { href: "/hesapla/gerilme-dagilimi", icon: "📐", title: "Gerilme Dağılımı", desc: "Boussinesq gerilme ve CBR korelasyonları", methods: ["Boussinesq", "CBR"] },
    ],
  },
];

export default function HesaplaPage() {
  const totalModules = categories.reduce((s, c) => s + c.modules.length, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hesap Araçları</h1>
          <p className="mt-1 text-[var(--muted)]">{totalModules} modül — tüm hesaplar anlık ve ücretsiz</p>
        </div>
        <Link href="/rapor" className="btn-primary text-sm shrink-0">📄 Rapor Oluştur</Link>
      </div>

      {categories.map(cat => (
        <div key={cat.title} className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{cat.title}</h2>
            <p className="text-sm text-[var(--muted)]">{cat.desc}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cat.modules.map(m => (
              <Link key={m.href} href={m.href} className="card-hover p-5 group">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">{m.icon}</span>
                  <div className="min-w-0">
                    <h3 className="font-semibold group-hover:text-brand-600 transition-colors">{m.title}</h3>
                    <p className="text-sm text-[var(--muted)] mt-1">{m.desc}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.methods.map(method => (
                        <span key={method} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Bilgi */}
      <div className="card p-6 bg-gradient-to-r from-brand-50 to-earth-50 dark:from-brand-900/20 dark:to-neutral-800 border-brand-200 dark:border-brand-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold">📄 Profesyonel Rapor Oluşturun</h3>
            <p className="text-sm text-[var(--muted)] mt-1">
              Hesap sonuçlarınızı zemin profili, girdi parametreleri ve değerlendirme içeren PDF rapor olarak indirin.
            </p>
          </div>
          <Link href="/rapor" className="btn-primary shrink-0">Rapor Oluştur →</Link>
        </div>
      </div>
    </div>
  );
}
