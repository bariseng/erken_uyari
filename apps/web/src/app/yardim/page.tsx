import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yardım & SSS — GeoForce",
  description: "GeoForce geoteknik hesaplama platformu yardım sayfası. Sık sorulan sorular ve kullanım kılavuzu.",
};

const faqs = [
  {
    q: "GeoForce nedir?",
    a: "GeoForce, geoteknik mühendisler için geliştirilmiş açık kaynaklı bir web tabanlı hesaplama platformudur. 26 farklı hesap modülü ile taşıma kapasitesi, oturma, sıvılaşma, şev stabilitesi ve daha birçok analizi yapabilirsiniz.",
  },
  {
    q: "Ücretsiz mi?",
    a: "Evet, tüm hesap modülleri tamamen ücretsizdir. Kayıt olmadan da kullanabilirsiniz. Kayıt olursanız hesaplamalarınızı kaydedebilir ve projelerinizi yönetebilirsiniz.",
  },
  {
    q: "Verilerim güvende mi?",
    a: "Tüm hesaplamalar tarayıcınızda (istemci tarafında) çalışır. Girdi verileriniz sunucuya gönderilmez. Yalnızca kayıt olup proje kaydettiğinizde veriler sunucuda saklanır.",
  },
  {
    q: "TBDY 2018 uyumlu mu?",
    a: "Evet. Deprem parametreleri modülü TBDY 2018 (Türkiye Bina Deprem Yönetmeliği) referanslarını kullanır. Zemin sınıflandırma, sıvılaşma ve taşıma kapasitesi modülleri de TBDY 2018 ile uyumludur.",
  },
  {
    q: "Hangi hesap modülleri mevcut?",
    a: "26 modül mevcuttur: Zemin Sınıflandırma, Taşıma Kapasitesi, Yanal Toprak Basıncı, Deprem Parametreleri, Oturma, Sıvılaşma, Şev Stabilitesi, Kazık Kapasitesi, İksa Tasarımı, Saha Tepki, Konsolidasyon, Zemin İyileştirme, İstinat Duvarı, Destekli Kazı, Tekil Temel, Kaya Soketi Kazık, EC7 Kazık, Faz İlişkileri, Arazi Deneyleri, İndeks Deneyleri, Gerilme & Temel, Gerilme Dağılımı, Zemin & Kaya Özellik DB ve daha fazlası.",
  },
  {
    q: "PDF rapor nasıl oluşturulur?",
    a: "Her hesap modülünde 'PDF İndir' butonu bulunur. Ayrıca Rapor sayfasından birden fazla hesap sonucunu tek bir profesyonel raporda birleştirebilirsiniz. Rapor; zemin profili, girdi parametreleri, hesap sonuçları ve değerlendirme bölümlerini içerir.",
  },
  {
    q: "Mobil cihazlarda çalışır mı?",
    a: "Evet, GeoForce tamamen responsive tasarıma sahiptir. Telefon, tablet ve masaüstü bilgisayarlarda sorunsuz çalışır.",
  },
  {
    q: "Hesap sonuçları ne kadar güvenilir?",
    a: "Hesap motoru 110+ birim test ile doğrulanmıştır. Ancak GeoForce bir ön tasarım ve eğitim aracıdır. Nihai mühendislik kararları için detaylı zemin etüdü ve uzman değerlendirmesi gereklidir.",
  },
  {
    q: "Katkıda bulunabilir miyim?",
    a: "Evet! GeoForce açık kaynaklıdır (MIT lisansı). GitHub üzerinden pull request gönderebilir, hata bildirebilir veya yeni modül önerisinde bulunabilirsiniz.",
  },
  {
    q: "Hangi tarayıcılar destekleniyor?",
    a: "Chrome, Firefox, Safari ve Edge'in güncel sürümleri desteklenmektedir. JavaScript etkin olmalıdır.",
  },
];

const howTo = [
  { step: 1, title: "Modül Seçin", desc: "Ana sayfadan veya Hesapla menüsünden istediğiniz hesap modülünü seçin." },
  { step: 2, title: "Parametreleri Girin", desc: "Zemin parametreleri, temel geometrisi ve diğer girdi değerlerini ilgili alanlara girin." },
  { step: 3, title: "Sonuçları İnceleyin", desc: "Hesap sonuçları anlık olarak güncellenir. Grafikleri ve detaylı çıktıları inceleyin." },
  { step: 4, title: "Rapor Oluşturun", desc: "PDF İndir butonu ile sonuçlarınızı profesyonel rapor olarak kaydedin." },
];

export default function YardimPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Yardım</h1>
      <p className="mt-2 text-[var(--muted)]">Nasıl kullanılır ve sık sorulan sorular</p>

      {/* Nasıl Kullanılır */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">🚀 Nasıl Kullanılır?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {howTo.map(s => (
            <div key={s.step} className="card p-5 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-400 font-bold text-lg shrink-0">
                {s.step}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{s.title}</h3>
                <p className="text-sm text-[var(--muted)] mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/hesapla" className="btn-primary">Hesaplamaya Başla →</Link>
        </div>
      </section>

      {/* SSS */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">❓ Sık Sorulan Sorular</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="card group">
              <summary className="cursor-pointer px-5 py-4 text-sm font-medium flex items-center justify-between list-none">
                <span>{faq.q}</span>
                <svg className="w-4 h-4 text-[var(--muted)] shrink-0 ml-2 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-4 text-sm text-[var(--muted)] leading-relaxed border-t border-[var(--card-border)] pt-3">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Destek */}
      <section className="mt-12 mb-4">
        <div className="card p-6 bg-gradient-to-r from-brand-50 to-earth-50 dark:from-brand-900/20 dark:to-neutral-900 border-brand-200 dark:border-brand-800 text-center">
          <h2 className="text-lg font-semibold">Başka sorunuz mu var?</h2>
          <p className="text-sm text-[var(--muted)] mt-2">GitHub Issues üzerinden bize ulaşabilirsiniz.</p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="https://github.com/geoforce/geoforce/issues" target="_blank" rel="noopener noreferrer" className="btn-primary">
              GitHub Issues →
            </a>
            <Link href="/hakkinda" className="btn-ghost">Hakkında sayfası →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
