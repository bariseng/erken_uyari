# GeoForce Web Performans Optimizasyonları

## ✅ Yapılan Optimizasyonlar

### 1. next.config.js Güncellemeleri

```javascript
// Package optimizasyonları - tree-shaking
experimental: {
  optimizePackageImports: [
    "recharts",      // ~200KB -> sadece kullanılanlar
    "lucide-react",  // icon library tree-shaking
    "@geoforce/engine",
  ],
}

// Görsel optimizasyonu
images: {
  formats: ["image/avif", "image/webp"],  // Modern formatlar
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
}

// Production compression
compress: true,
```

**Beklenen iyileştirme:**
- `recharts` bundle: ~200KB → ~50-80KB (kullanılan component'lere göre)
- Gzip compression: ~60-70% boyut azalması

### 2. Dynamic Chart Wrapper

`src/components/charts/DynamicCharts.tsx` oluşturuldu:

```tsx
// Kullanım örneği - eski:
import { BarChart, Bar } from "recharts";

// Yeni - dynamic import:
import { DynamicBarChart, DynamicBar, ChartSkeleton } from "@/components/charts/DynamicCharts";

function MyComponent() {
  return (
    <DynamicBarChart data={data} fallback={<ChartSkeleton height={300} />}>
      <DynamicBar dataKey="value" />
    </DynamicBarChart>
  );
}
```

**Avantajları:**
- Charts sadece ihtiyaç duyulduğunda yüklenir
- İlk sayfa yükü hızlanır
- Skeleton loading ile iyi UX

### 3. next/font (Inter)

`layout.tsx` güncellendi:

```tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",        // FOUT önleme
  variable: "--font-inter",
  preload: true,          // Critical resource
});
```

**Avantajları:**
- Google Fonts CDN yerine self-hosted
- Zero layout shift
- Faster font loading

---

## 📊 Bundle Analizi

### Mevcut Durum Analizi

```bash
# Bundle analyzer çalıştır
cd /root/.openclaw/workspace/geoforce/apps/web
ANALYZE=true npm run build
```

### Önerilen Analiz Script'leri

`package.json`'a ekle:

```json
{
  "scripts": {
    "analyze": "ANALYZE=true next build",
    "analyze:server": "ANALYZE=true BUNDLE_ANALYZE=server next build",
    "analyze:client": "ANALYZE=true BUNDLE_ANALYZE=client next build"
  }
}
```

### Yüksek Riskli Paketler

| Paket | Tahmini Boyut | Öneri |
|-------|---------------|-------|
| `recharts` | ~200KB | ✅ Dynamic import uygulandı |
| `jspdf` | ~150KB | Lazy load PDF export |
| `katex` | ~100KB | CDN'den yüklenebilir (mevcut) |
| `bcryptjs` | ~50KB | Server-side only |

---

## 🔧 Ek Öneriler

### 1. PDF Export Lazy Loading

```tsx
// ExportPDFButton.tsx
const generatePDF = async () => {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  // PDF generation...
};
```

### 2. Code Splitting by Route

```tsx
// app/hesapla/[module]/page.tsx
const ModulePage = dynamic(() => import("./ModuleContent"), {
  loading: () => <ModuleSkeleton />,
});
```

### 3. Server Components

Mümkün olan yerlerde client component'leri server component'e çevir:

```tsx
// ❌ Client component (tüm sayfa)
"use client";
export default function Page() { ... }

// ✅ Hybrid approach
// page.tsx (server)
import ClientCalculator from "./ClientCalculator";
export default function Page() {
  return <ClientCalculator />;
}

// ClientCalculator.tsx (client)
"use client";
export default function ClientCalculator() { ... }
```

### 4. Image Optimization

```tsx
import Image from "next/image";

// ❌ Eski
<img src="/logo.png" alt="Logo" />

// ✅ Yeni
<Image 
  src="/logo.png" 
  alt="Logo" 
  width={200} 
  height={50}
  priority // Above the fold için
/>
```

### 5. Tree Shaking için Named Imports

```tsx
// ❌ Tüm paket yüklenir
import _ from "lodash";

// ✅ Sadece kullanılan fonksiyon
import debounce from "lodash/debounce";
```

---

## 📈 Performans Metrikleri Hedefleri

| Metrik | Önce | Hedef |
|--------|------|-------|
| First Load JS | ~400KB | <250KB |
| LCP | ~2.5s | <2.0s |
| FID | ~100ms | <50ms |
| CLS | ~0.1 | <0.05 |

### Ölçüm Araçları

```bash
# Lighthouse CLI
npx lighthouse https://localhost:3000 --view

# Web Vitals
npx next-web-vitals

# Bundle analyzer
npm run analyze
```

---

## 🚀 Uygulama Önceliği

1. **Yüksek Etki** (hemen uygula)
   - [x] next.config.js optimizasyonları
   - [x] next/font implementation
   - [ ] Dynamic chart import (sayfa bazlı)

2. **Orta Etki** (1-2 hafta)
   - [ ] jspdf lazy loading
   - [ ] Route-based code splitting
   - [ ] Image optimization

3. **Düşük Etki** (uzun vadeli)
   - [ ] Server components migration
   - [ ] Service worker / PWA
   - [ ] Edge runtime consideration

---

## 📝 Dynamic Import Migration

Mevcut sayfaları güncellemek için:

```tsx
// ESKI (src/app/hesapla/indeks-deneyleri/page.tsx)
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// YENI
import { 
  DynamicBarChart, DynamicBar, DynamicXAxis, DynamicYAxis,
  DynamicCartesianGrid, DynamicTooltip, DynamicLegend, 
  DynamicResponsiveContainer, ChartSkeleton 
} from "@/components/charts/DynamicCharts";

// Kullanım
<DynamicResponsiveContainer width="100%" height={300}>
  <DynamicBarChart data={data} fallback={<ChartSkeleton />}>
    <DynamicCartesianGrid strokeDasharray="3 3" />
    <DynamicXAxis dataKey="name" />
    <DynamicYAxis />
    <DynamicTooltip />
    <DynamicLegend />
    <DynamicBar dataKey="value" fill="#16a34a" />
  </DynamicBarChart>
</DynamicResponsiveContainer>
```

Bu pattern'i tüm recharts kullanan sayfalara uygulayın:
- `indeks-deneyleri`
- `konsolidasyon`
- `faz-iliskileri`
- `gerilme-temel`
- `yanal-basinc`
- `oturma`
- `deprem-parametreleri`
- `kazik`
- `istinat-duvari`
- `sivilasma`
- `siniflandirma`
- `tasima-kapasitesi`
- `zemin-iyilestirme`
- `iksa`
- `saha-tepki`
- `sev-stabilitesi`
- `gerilme-dagilimi`
- `arazi-deneyleri`
