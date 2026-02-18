import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakkında — GeoForce",
  description: "GeoForce geoteknik hesaplama platformu hakkında bilgi. Metodoloji, referanslar ve teknik altyapı.",
};

const references = [
  { author: "Terzaghi, K.", year: 1943, title: "Theoretical Soil Mechanics", publisher: "John Wiley & Sons" },
  { author: "Meyerhof, G.G.", year: 1963, title: "Some Recent Research on the Bearing Capacity of Foundations", publisher: "Canadian Geotechnical Journal, 1(1)" },
  { author: "Hansen, J.B.", year: 1970, title: "A Revised and Extended Formula for Bearing Capacity", publisher: "Danish Geotechnical Institute, Bulletin No. 28" },
  { author: "Vesic, A.S.", year: 1973, title: "Analysis of Ultimate Loads of Shallow Foundations", publisher: "JSMFD, ASCE, 99(SM1)" },
  { author: "Boulanger, R.W. & Idriss, I.M.", year: 2014, title: "CPT and SPT Based Liquefaction Triggering Procedures", publisher: "UC Davis, Report No. UCD/CGM-14/01" },
  { author: "Bishop, A.W.", year: 1955, title: "The Use of the Slip Circle in the Stability Analysis of Slopes", publisher: "Géotechnique, 5(1)" },
  { author: "Das, B.M.", year: 2019, title: "Principles of Foundation Engineering, 9th Ed.", publisher: "Cengage Learning" },
  { author: "TBDY", year: 2018, title: "Türkiye Bina Deprem Yönetmeliği", publisher: "T.C. Çevre ve Şehircilik Bakanlığı" },
  { author: "Eurocode 7", year: 2004, title: "EN 1997-1: Geotechnical Design — General Rules", publisher: "CEN" },
];

const techStack = [
  { name: "Next.js 14", desc: "React tabanlı full-stack framework" },
  { name: "TypeScript", desc: "Tip güvenli geliştirme" },
  { name: "Tailwind CSS", desc: "Utility-first CSS framework" },
  { name: "Turborepo", desc: "Monorepo build sistemi" },
  { name: "Recharts", desc: "React grafik kütüphanesi" },
  { name: "jsPDF", desc: "İstemci taraflı PDF oluşturma" },
  { name: "KaTeX", desc: "Matematiksel formül gösterimi" },
  { name: "Zustand", desc: "Hafif state yönetimi" },
];

export default function HakkindaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Hakkında</h1>
      <p className="mt-2 text-[var(--muted)]">GeoForce geoteknik hesaplama platformu</p>

      {/* Proje Tanıtımı */}
      <section className="mt-8">
        <div className="card p-6 bg-gradient-to-r from-brand-50 to-earth-50 dark:from-brand-900/20 dark:to-neutral-900 border-brand-200 dark:border-brand-800">
          <h2 className="text-xl font-semibold mb-3">🌍 GeoForce Nedir?</h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            GeoForce, geoteknik mühendisler için geliştirilmiş açık kaynaklı bir web tabanlı hesaplama platformudur.
            Taşıma kapasitesi, oturma analizi, sıvılaşma değerlendirmesi, şev stabilitesi, kazık tasarımı ve daha birçok
            geoteknik hesaplamayı modern bir arayüzle sunar. Tüm hesaplamalar tarayıcıda çalışır — verileriniz
            sunucuya gönderilmez.
          </p>
          <p className="text-sm text-[var(--muted)] leading-relaxed mt-3">
            Platform, TBDY 2018 (Türkiye Bina Deprem Yönetmeliği) ve Eurocode 7 referanslarıyla uyumludur.
            26 hesap modülü, profesyonel PDF rapor oluşturma ve interaktif grafikler içerir.
          </p>
        </div>
      </section>

      {/* Metodoloji */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">📐 Metodoloji</h2>
        <div className="space-y-4 text-sm text-[var(--muted)] leading-relaxed">
          <div className="card p-5">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Hesaplama Yaklaşımı</h3>
            <p>
              Tüm hesap modülleri, uluslararası kabul görmüş analitik yöntemlere dayanır. Her modülde kullanılan
              formüller, kabuller ve sınırlamalar açıkça belirtilir. Hesaplamalar istemci tarafında (tarayıcıda)
              TypeScript ile gerçekleştirilir ve 110+ birim test ile doğrulanmıştır.
            </p>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Doğrulama</h3>
            <p>
              Hesap motoru (<code className="text-xs bg-earth-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">@geoforce/engine</code>),
              ders kitaplarındaki çözülmüş örnekler ve referans yazılım çıktıları ile karşılaştırılarak doğrulanmıştır.
              Her yöntem için birim testler mevcuttur.
            </p>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Sınırlamalar</h3>
            <p>
              GeoForce bir ön tasarım ve eğitim aracıdır. Nihai mühendislik kararları için detaylı zemin etüdü,
              laboratuvar deneyleri ve uzman mühendis değerlendirmesi gereklidir. Sonuçlar, girdi parametrelerinin
              doğruluğuna bağlıdır.
            </p>
          </div>
        </div>
      </section>

      {/* Teknik Altyapı */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">⚙️ Teknik Altyapı</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {techStack.map(t => (
            <div key={t.name} className="card p-4 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-[var(--muted)]">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Referanslar */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">📚 Referanslar</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--card-border)] bg-earth-50 dark:bg-neutral-800">
                  <th className="text-left py-2.5 px-4">Yazar</th>
                  <th className="text-left py-2.5 px-4">Yıl</th>
                  <th className="text-left py-2.5 px-4">Başlık</th>
                </tr>
              </thead>
              <tbody>
                {references.map((r, i) => (
                  <tr key={i} className="border-b border-[var(--card-border)] last:border-0">
                    <td className="py-2 px-4 font-medium whitespace-nowrap">{r.author}</td>
                    <td className="py-2 px-4 text-[var(--muted)]">{r.year}</td>
                    <td className="py-2 px-4 text-[var(--muted)]">{r.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Lisans */}
      <section className="mt-10 mb-4">
        <h2 className="text-xl font-semibold mb-4">📄 Lisans</h2>
        <div className="card p-5">
          <p className="text-sm text-[var(--muted)]">
            GeoForce, <span className="font-medium text-[var(--foreground)]">MIT Lisansı</span> ile dağıtılmaktadır.
            Kaynak kodu açıktır ve özgürce kullanılabilir, değiştirilebilir ve dağıtılabilir.
          </p>
          <div className="mt-4">
            <Link href="https://github.com/geoforce/geoforce" target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
              GitHub&apos;da Görüntüle →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
