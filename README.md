# GeoForce 🌍

Açık kaynak, web tabanlı geoteknik mühendisliği hesap platformu.

## Özellikler

- 🧪 **18 Hesap Modülü** — Taşıma kapasitesi, oturma, sıvılaşma, şev stabilitesi ve daha fazlası
- 📄 **PDF Rapor Oluşturucu** — Profesyonel geoteknik rapor şablonu
- 🌍 **TBDY 2018 Uyumlu** — Türkiye Bina Deprem Yönetmeliği referansları
- ⚡ **Anlık Hesaplama** — Tüm hesaplar tarayıcıda, sunucuya veri gönderilmez
- 📱 **Responsive** — Masaüstü ve mobil uyumlu

## Hesap Modülleri

| # | Modül | Yöntemler |
|---|-------|-----------|
| 1 | Zemin Sınıflandırma | USCS, AASHTO, TBDY 2018 |
| 2 | Taşıma Kapasitesi | Terzaghi, Meyerhof, Hansen, Vesic |
| 3 | Yanal Toprak Basıncı | Rankine, Coulomb, Mononobe-Okabe |
| 4 | Deprem Parametreleri | TBDY 2018 SDS/SD1, spektrum |
| 5 | Oturma Hesabı | Elastik, Konsolidasyon, Schmertmann |
| 6 | Sıvılaşma | Boulanger & Idriss 2014, LPI |
| 7 | Şev Stabilitesi | Bishop, Janbu, Fellenius |
| 8 | Kazık Kapasitesi | α-β, SPT Meyerhof, Broms |
| 9 | İksa Tasarımı | Konsol, tek/çok ankrajlı perde |
| 10 | Saha Tepki | Vs30, büyütme, transfer fonksiyonu |
| 11 | Konsolidasyon | Zaman-oturma, PVD Hansbo |
| 12 | Zemin İyileştirme | Dinamik kompaksiyon, taş kolon, ön yükleme |
| 13 | Faz İlişkileri | Boşluk oranı, birim hacim ağırlıklar, Proctor |
| 14 | Arazi Deneyleri | Efektif gerilme, SPT korelasyonları, Darcy |
| 15 | İndeks Deneyleri | Atterberg, plastisite kartı, dane dağılımı |
| 16 | Gerilme & Temel | Mohr dairesi, sığ temel boyutlandırma |
| 17 | Gerilme Dağılımı | Boussinesq, CBR korelasyonları |
| 18 | İstinat Duvarı | Ağırlık duvarı, donatılı zemin |

## Teknoloji

- **Framework:** Next.js 14 + TypeScript
- **Stil:** Tailwind CSS
- **Monorepo:** Turborepo
- **Hesap Motoru:** `packages/engine` (110 test)
- **PDF:** jsPDF + jspdf-autotable
- **Grafikler:** Recharts

## Kurulum

```bash
git clone https://github.com/user/geoforce.git
cd geoforce
npm install
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

## Proje Yapısı

```
geoforce/
├── apps/web/          # Next.js web uygulaması
│   ├── src/app/       # Sayfalar (24 sayfa)
│   ├── src/components # Paylaşımlı bileşenler
│   └── src/lib/       # Rapor üretici, state yönetimi
├── packages/engine/   # Hesap motoru (TypeScript)
│   ├── src/           # 18 modül
│   └── tests/         # 110 test
├── turbo.json
└── package.json
```

## Lisans

MIT

## Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için önce bir issue açın.
