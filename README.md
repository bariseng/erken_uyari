# GeoForce 🌍

**Açık kaynak, web tabanlı geoteknik mühendisliği hesaplama platformu.**

Open-source, web-based geotechnical engineering calculation platform.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://typescriptlang.org)
[![Tests](https://img.shields.io/badge/Tests-110%2B-brightgreen)]()

---

## 🇹🇷 Türkçe

GeoForce, geoteknik mühendisler için geliştirilmiş ücretsiz ve açık kaynaklı bir hesaplama platformudur. TBDY 2018 uyumlu 26 hesap modülü, profesyonel PDF rapor oluşturma, interaktif grafikler ve modern bir arayüz sunar. Tüm hesaplamalar tarayıcıda çalışır — verileriniz sunucuya gönderilmez.

## 🇬🇧 English

GeoForce is a free, open-source calculation platform for geotechnical engineers. It offers 26 calculation modules compliant with TBDY 2018 (Turkish Building Earthquake Code), professional PDF report generation, interactive charts, and a modern UI. All calculations run in the browser — your data never leaves your device.

---

## ✨ Özellikler / Features

- 📐 **26 Hesap Modülü** — Taşıma kapasitesi, oturma, sıvılaşma, şev stabilitesi, kazık tasarımı ve daha fazlası
- 📄 **PDF Rapor** — Zemin profili, hesap detayları ve değerlendirme içeren profesyonel rapor
- 📊 **İnteraktif Grafikler** — Recharts ile yöntem karşılaştırması, bileşen dağılımı, derinlik profilleri
- 🔓 **Açık Kaynak** — MIT lisansı, GitHub üzerinden katkıda bulunun
- 🌍 **Türkçe / İngilizce** — Çift dil desteği, TBDY 2018 ve Eurocode 7 referansları
- ⚡ **Ücretsiz & Hızlı** — Tüm hesaplar tarayıcıda, sunucuya veri gönderilmez
- 📱 **Responsive** — Masaüstü, tablet ve mobil uyumlu
- 🇹🇷 **TBDY 2018 Uyumlu** — Türkiye Bina Deprem Yönetmeliği referansları

---

## 📋 Hesap Modülleri / Calculation Modules

### Temel Modüller (Basic)

| # | Modül | Yöntemler |
|---|-------|-----------|
| 1 | Zemin Sınıflandırma | USCS, AASHTO, TBDY 2018 |
| 2 | Taşıma Kapasitesi | Terzaghi, Meyerhof, Hansen, Vesic |
| 3 | Yanal Toprak Basıncı | Rankine, Coulomb, Mononobe-Okabe |
| 4 | Deprem Parametreleri | TBDY 2018 SDS/SD1, tasarım spektrumu |

### İleri Modüller (Advanced)

| # | Modül | Yöntemler |
|---|-------|-----------|
| 5 | Oturma Hesabı | Elastik, 1D Konsolidasyon, Schmertmann |
| 6 | Sıvılaşma | Boulanger & Idriss 2014, LPI |
| 7 | Şev Stabilitesi | Bishop, Janbu, Fellenius |
| 8 | Kazık Kapasitesi | α-β, SPT Meyerhof, Broms |

### Yapısal & Tamamlayıcı (Structural & Supplementary)

| # | Modül | Yöntemler |
|---|-------|-----------|
| 9 | İksa Tasarımı | Konsol, tek/çok ankrajlı perde |
| 10 | Saha Tepki | Vs30, büyütme, transfer fonksiyonu |
| 11 | Konsolidasyon | Zaman-oturma, PVD Hansbo |
| 12 | Zemin İyileştirme | Dinamik kompaksiyon, taş kolon, ön yükleme |
| 13 | İstinat Duvarı | Ağırlık duvarı, donatılı zemin (geogrid) |
| 14 | Destekli Kazı | Peck 1969, destek kuvvetleri, taban kabarması |
| 15 | Tekil Temel Tasarımı | ACI 318, TS500 — zımbalama, eğilme, kayma |
| 16 | Kaya Soketi Kazık | Zhang & Einstein, AASHTO |
| 17 | EC7 Kazık Tasarımı | DA1-C1, DA1-C2, DA2 |

### Laboratuvar & Arazi (Laboratory & Field)

| # | Modül | Yöntemler |
|---|-------|-----------|
| 18 | Faz İlişkileri | Boşluk oranı, birim hacim ağırlıklar, Proctor |
| 19 | Arazi Deneyleri | Efektif gerilme profili, SPT korelasyonları, Darcy |
| 20 | İndeks Deneyleri | Atterberg limitleri, plastisite kartı, dane dağılımı |
| 21 | Gerilme & Temel | Mohr dairesi, sığ temel ön boyutlandırma |
| 22 | Gerilme Dağılımı | Boussinesq, CBR korelasyonları |
| 23 | Zemin & Kaya Özellik DB | USCS/SPT korelasyonu, RMR/UCS parametre tahmini |

---

## 🛠️ Teknoloji / Tech Stack

| Teknoloji | Açıklama |
|-----------|----------|
| **Next.js 14** | React tabanlı full-stack framework |
| **TypeScript** | Tip güvenli geliştirme |
| **Tailwind CSS** | Utility-first CSS framework |
| **Turborepo** | Monorepo build sistemi |
| **Recharts** | İnteraktif grafik kütüphanesi |
| **jsPDF** | İstemci taraflı PDF oluşturma |
| **jspdf-autotable** | PDF tablo eklentisi |
| **KaTeX** | Matematiksel formül gösterimi |
| **Zustand** | Hafif state yönetimi |
| **next-intl** | Çoklu dil desteği (i18n) |
| **NextAuth.js** | Kimlik doğrulama |
| **Prisma** | Veritabanı ORM |

---

## 🚀 Kurulum / Installation

```bash
# Repoyu klonlayın
git clone https://github.com/geoforce/geoforce.git
cd geoforce

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

### Build

```bash
npm run build
```

### Test

```bash
cd packages/engine
npm test
```

---

## 📁 Proje Yapısı / Project Structure

```
geoforce/
├── apps/
│   └── web/                    # Next.js web uygulaması
│       ├── src/
│       │   ├── app/            # Sayfalar (App Router)
│       │   │   ├── hesapla/    # 24 hesap modülü sayfası
│       │   │   ├── hakkinda/   # Hakkında sayfası
│       │   │   ├── yardim/     # Yardım & SSS
│       │   │   ├── rapor/      # PDF rapor oluşturucu
│       │   │   ├── projeler/   # Proje yönetimi
│       │   │   ├── giris/      # Giriş sayfası
│       │   │   ├── kayit/      # Kayıt sayfası
│       │   │   └── api/        # API routes
│       │   ├── components/     # Paylaşımlı bileşenler
│       │   └── lib/            # Rapor üretici, state yönetimi
│       └── public/             # Statik dosyalar
├── packages/
│   └── engine/                 # Hesap motoru (TypeScript)
│       ├── src/                # 26 modül kaynak kodu
│       └── tests/              # 110+ birim test
├── turbo.json
├── package.json
└── README.md
```

---

## 📸 Ekran Görüntüleri / Screenshots

> _Ekran görüntüleri yakında eklenecektir._

| Sayfa | Açıklama |
|-------|----------|
| Ana Sayfa | Landing page — hero, özellikler, modül showcase |
| Hesapla | 26 modül listesi, kategorilere göre gruplandırılmış |
| Taşıma Kapasitesi | 4 yöntem karşılaştırması, grafikler, detaylı sonuçlar |
| PDF Rapor | Profesyonel geoteknik rapor çıktısı |

---

## 🤝 Katkıda Bulunma / Contributing

Katkılarınızı memnuniyetle karşılıyoruz!

1. Bu repoyu fork'layın
2. Feature branch oluşturun (`git checkout -b feature/yeni-modul`)
3. Değişikliklerinizi commit'leyin (`git commit -m 'feat: yeni modül eklendi'`)
4. Branch'inizi push'layın (`git push origin feature/yeni-modul`)
5. Pull Request açın

Büyük değişiklikler için önce bir [issue](https://github.com/geoforce/geoforce/issues) açmanızı öneririz.

### Geliştirme Kuralları

- TypeScript strict mode kullanın
- Yeni modüller için birim test yazın
- Tailwind CSS class'larını kullanın (inline style yazmayın)
- Commit mesajlarında [Conventional Commits](https://www.conventionalcommits.org/) formatını takip edin

---

## 📄 Lisans / License

MIT License — detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 📬 İletişim / Contact

- **GitHub Issues:** [github.com/geoforce/geoforce/issues](https://github.com/geoforce/geoforce/issues)
- **E-posta:** info@geoforce.dev

---

<p align="center">
  <strong>GeoForce</strong> ile geoteknik hesaplamalar artık daha kolay. 🌍
</p>
