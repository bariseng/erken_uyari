"use client";
import ExportPDFButton from "@/components/ExportPDFButton";
import MethodologySection from "@/components/MethodologySection";
import type { MethodologyData } from "@/components/MethodologySection";
import { useState } from "react";
import { classifyUSCS, classifyAASHTO, classifyTBDY2018 } from "@geoforce/engine";
import type { USCSResult } from "@geoforce/engine";
import type { AASHTOResult } from "@geoforce/engine";
import type { TBDY2018ClassResult } from "@geoforce/engine";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line, ReferenceLine } from "recharts";

const methodology: MethodologyData = {
  title: "Zemin Sınıflandırma Sistemleri",
  overview: "Zemin sınıflandırma, dane boyutu dağılımı ve kıvam limitlerine (Atterberg limitleri) dayalı olarak zeminlerin mühendislik davranışlarına göre gruplandırılmasıdır. Üç farklı sistem desteklenmektedir: USCS (Birleşik Zemin Sınıflandırma Sistemi), AASHTO ve TBDY 2018.",
  methods: [
    {
      name: "USCS — Birleşik Zemin Sınıflandırma Sistemi (ASTM D2487)",
      description: "Casagrande tarafından geliştirilen, dünyada en yaygın kullanılan zemin sınıflandırma sistemidir. Zeminleri iri daneli (G, S) ve ince daneli (M, C, O, Pt) olarak iki ana gruba ayırır.",
      formulas: [
        { name: "Üniformluk katsayısı", formula: "Cu = D60 / D10", description: "Dane boyutu dağılımının genişliğini gösterir" },
        { name: "Derecelenme katsayısı", formula: "Cc = (D30)² / (D10 × D60)", description: "Dane boyutu eğrisinin şeklini gösterir" },
        { name: "İri daneli kriter", formula: "No.200 eleğinden geçen < %50 → İri daneli", description: "No.200 = 0.075 mm" },
        { name: "İnce daneli kriter", formula: "No.200 eleğinden geçen ≥ %50 → İnce daneli" },
        { name: "İyi derecelenmiş çakıl (GW)", formula: "Cu ≥ 4 ve 1 ≤ Cc ≤ 3" },
        { name: "İyi derecelenmiş kum (SW)", formula: "Cu ≥ 6 ve 1 ≤ Cc ≤ 3" },
        { name: "A-çizgisi (Casagrande)", formula: "PI = 0.73 × (LL − 20)", description: "A-çizgisinin üstü: kil (C), altı: silt (M)" },
      ],
      steps: [
        { step: 1, title: "No.200 eleği kontrolü", description: "Geçen oran <%50 ise iri daneli, ≥%50 ise ince daneli" },
        { step: 2, title: "İri daneli: No.4 eleği kontrolü", description: "No.4'te kalan >%50 ise çakıl (G), değilse kum (S)" },
        { step: 3, title: "İnce daneli: Plastisite kartı", description: "LL ve PI değerleri Casagrande plastisite kartında konumlandırılır" },
        { step: 4, title: "Sembol atama", description: "GW, GP, GM, GC, SW, SP, SM, SC, ML, CL, OL, MH, CH, OH, Pt" },
      ],
      limitations: ["Organik zeminler için koku ve renk testi gerekir", "Çift sembol durumları (GW-GM vb.) sınır değerlerde oluşur"],
    },
    {
      name: "AASHTO Sınıflandırma Sistemi (AASHTO M 145)",
      description: "Karayolu mühendisliğinde kullanılan sınıflandırma sistemi. Zeminleri A-1'den A-7'ye kadar gruplara ayırır. Grup indeksi (GI) ile zemin kalitesini sayısal olarak değerlendirir.",
      formulas: [
        { name: "Grup İndeksi (GI)", formula: "GI = (F₂₀₀ − 35)·[0.2 + 0.005·(LL − 40)] + 0.01·(F₂₀₀ − 15)·(PI − 10)", description: "F₂₀₀: No.200 eleğinden geçen yüzde" },
        { name: "Granüler zeminler", formula: "A-1, A-2, A-3: No.200 geçen ≤ %35" },
        { name: "Silt-kil zeminler", formula: "A-4, A-5, A-6, A-7: No.200 geçen > %35" },
      ],
      steps: [
        { step: 1, title: "Elek analizi verileri", description: "No.10, No.40, No.200 geçen yüzdeleri belirlenir" },
        { step: 2, title: "Atterberg limitleri", description: "Likit limit (LL) ve plastisite indeksi (PI) belirlenir" },
        { step: 3, title: "Tablo kontrolü", description: "A-1'den A-7'ye sırayla kontrol edilir, ilk uyan grup seçilir" },
        { step: 4, title: "Grup indeksi hesabı", description: "GI hesaplanır (düşük GI = iyi zemin)" },
      ],
      limitations: ["Karayolu altzemin değerlendirmesi için optimize edilmiştir", "Genel geoteknik uygulamalarda USCS tercih edilir"],
    },
    {
      name: "TBDY 2018 Zemin Sınıfı (Tablo 16.1)",
      description: "Türkiye Bina Deprem Yönetmeliği 2018'e göre zemin sınıflandırması. Vs30 (üst 30 m ortalama kayma dalgası hızı), SPT N60 ve cu değerlerine göre ZA–ZF arası sınıflandırma yapılır.",
      formulas: [
        { name: "Vs30", formula: "Vs30 = 30 / Σ(hi / Vsi)", description: "Üst 30 m'nin ağırlıklı ortalama kayma dalgası hızı" },
        { name: "ZA — Sağlam kaya", formula: "Vs30 > 800 m/s" },
        { name: "ZB — Kaya", formula: "360 < Vs30 ≤ 800 m/s" },
        { name: "ZC — Sıkı zemin", formula: "180 < Vs30 ≤ 360 m/s veya N60 > 50 veya cu > 250 kPa" },
        { name: "ZD — Orta sıkı zemin", formula: "Vs30 < 180 m/s veya N60 < 50 veya cu < 250 kPa" },
        { name: "ZE — Yumuşak zemin", formula: "PI > 20, w > %40, cu < 25 kPa olan tabaka > 3 m" },
        { name: "ZF — Özel araştırma", formula: "Sıvılaşabilir, hassas kil, kolapsif zemin, organik tabaka > 3 m" },
      ],
      limitations: ["ZE ve ZF sınıfları için sahaya özel değerlendirme gerekir", "Vs30 ölçümü tercih edilir, SPT/cu korelasyonları yaklaşıktır"],
    },
  ],
  references: [
    "ASTM D2487 — Standard Practice for Classification of Soils (USCS).",
    "AASHTO M 145 — Classification of Soils and Soil-Aggregate Mixtures.",
    "TBDY 2018 — Türkiye Bina Deprem Yönetmeliği, Tablo 16.1.",
    "Casagrande, A. (1948). Classification and Identification of Soils. ASCE Transactions, 113, 901-930.",
    "Das, B.M. (2019). Principles of Geotechnical Engineering, 9th Ed.",
  ],
  standards: ["ASTM D2487", "AASHTO M 145", "TBDY 2018 Bölüm 16", "TS EN ISO 14688"],
  notes: [
    "USCS dünyada en yaygın kullanılan sistemdir; AASHTO karayolu projelerinde tercih edilir.",
    "TBDY 2018 zemin sınıfı, deprem tasarım spektrumu için gereklidir.",
    "Aynı zemin farklı sistemlerde farklı sınıflara girebilir — bu normaldir.",
  ],
};

type Tab = "uscs" | "aashto" | "tbdy";

export default function SiniflandirmaPage() {
  const [tab, setTab] = useState<Tab>("uscs");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">🧪 Zemin Sınıflandırma</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">USCS, AASHTO ve TBDY 2018 zemin sınıfı belirleme</p>
      <div className="mt-2"><ExportPDFButton moduleName="Zemin Sınıflandırma" method="USCS / AASHTO / TBDY 2018" inputs={{}} results={{}} /></div>
      <MethodologySection data={methodology} />

      <div className="mt-6 flex gap-2">
        {([["uscs", "USCS"], ["aashto", "AASHTO"], ["tbdy", "TBDY 2018"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? "bg-brand-600 text-white" : "bg-[var(--card)] border border-[var(--card-border)] hover:bg-earth-100 dark:hover:bg-neutral-800"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "uscs" && <USCSForm />}
        {tab === "aashto" && <AASHTOForm />}
        {tab === "tbdy" && <TBDY2018Form />}
      </div>
    </div>
  );
}

// ─── USCS ───
function USCSForm() {
  const [fines, setFines] = useState(15);
  const [passing4, setPassing4] = useState(60);
  const [d10, setD10] = useState(0.1);
  const [d30, setD30] = useState(0.5);
  const [d60, setD60] = useState(2.0);
  const [ll, setLL] = useState(35);
  const [pl, setPL] = useState(20);
  const [isOrganic, setIsOrganic] = useState(false);

  const result: USCSResult = classifyUSCS({
    grainSize: { fines, passing4, d10, d30, d60 },
    atterberg: { liquidLimit: ll, plasticLimit: pl },
    isOrganic,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi Parametreleri</h2>
        <Field label="İnce dane oranı (No.200 geçen, %)" value={fines} onChange={setFines} min={0} max={100} />
        <Field label="No.4 elek geçen (%)" value={passing4} onChange={setPassing4} min={0} max={100} />
        <Field label="D10 (mm)" value={d10} onChange={setD10} min={0} step={0.01} />
        <Field label="D30 (mm)" value={d30} onChange={setD30} min={0} step={0.01} />
        <Field label="D60 (mm)" value={d60} onChange={setD60} min={0} step={0.01} />
        <hr className="border-[var(--card-border)]" />
        <h3 className="font-medium text-sm text-[var(--muted)]">Atterberg Limitleri</h3>
        <Field label="Likit Limit, LL (%)" value={ll} onChange={setLL} min={0} max={200} />
        <Field label="Plastik Limit, PL (%)" value={pl} onChange={setPL} min={0} max={100} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isOrganic} onChange={(e) => setIsOrganic(e.target.checked)} className="rounded" />
          Organik zemin
        </label>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-4">Sonuç</h2>
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-brand-100 dark:bg-brand-900/30 text-3xl font-bold text-brand-700 dark:text-brand-400">
            {result.symbol}
          </div>
          <p className="mt-3 text-lg font-semibold">{result.nameTR}</p>
          <p className="text-sm text-[var(--muted)]">{result.name}</p>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <Row label="Sembol" value={result.symbol} />
          <Row label="Açıklama" value={result.descriptionTR} />
          {result.plasticityIndex !== undefined && <Row label="Plastisite İndeksi (PI)" value={`${result.plasticityIndex}`} />}
          {result.cu !== undefined && <Row label="Üniformluk Katsayısı (Cu)" value={`${result.cu}`} />}
          {result.cc !== undefined && <Row label="Derecelenme Katsayısı (Cc)" value={`${result.cc}`} />}
        </div>

        {/* Recharts - Casagrande Plastisite Kartı */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Casagrande Plastisite Kartı</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" dataKey="LL" name="LL" domain={[0, 120]} tick={{ fontSize: 10 }} label={{ value: "Likit Limit, LL (%)", position: "insideBottom", offset: -2, fontSize: 11 }} />
              <YAxis type="number" dataKey="PI" name="PI" domain={[0, 80]} tick={{ fontSize: 10 }} label={{ value: "Plastisite İndeksi, PI (%)", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} formatter={(value: number) => [`${value}`, ""]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {/* A-çizgisi: PI = 0.73*(LL-20) */}
              <Line type="monotone" data={Array.from({ length: 11 }, (_, i) => ({ LL: 20 + i * 10, PI: Math.max(0, 0.73 * (20 + i * 10 - 20)) }))} dataKey="PI" name="A-çizgisi" stroke="#dc2626" strokeWidth={2} strokeDasharray="6 3" dot={false} legendType="line" />
              {/* U-çizgisi: PI = 0.9*(LL-8) */}
              <Line type="monotone" data={Array.from({ length: 11 }, (_, i) => ({ LL: 8 + i * 11, PI: Math.max(0, 0.9 * (8 + i * 11 - 8)) }))} dataKey="PI" name="U-çizgisi" stroke="#7c3aed" strokeWidth={2} strokeDasharray="3 3" dot={false} legendType="line" />
              <ReferenceLine x={50} stroke="#d97706" strokeDasharray="4 4" label={{ value: "LL=50", position: "top", fontSize: 9, fill: "#d97706" }} />
              <Scatter name="Zemin Noktası" data={[{ LL: ll, PI: result.plasticityIndex ?? (ll - pl) }]} fill="#2563eb" shape="star" legendType="star">
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-xs text-[var(--muted)] mt-1 text-center">A-çizgisi üstü: Kil (C) · A-çizgisi altı: Silt (M) · LL=50: Düşük/Yüksek plastisite sınırı</p>
        </div>

        {/* Recharts - Dane Dağılımı & Atterberg */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Sınıflandırma Parametreleri</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { name: "İnce (%)", value: fines },
              { name: "LL (%)", value: ll },
              { name: "PL (%)", value: pl },
              { name: "PI (%)", value: result.plasticityIndex ?? 0 },
              ...(result.cu !== undefined ? [{ name: "Cu", value: result.cu }] : []),
            ]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="value" name="Değer" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── AASHTO ───
function AASHTOForm() {
  const [fines, setFines] = useState(40);
  const [passing40, setPassing40] = useState(60);
  const [passing10, setPassing10] = useState(80);
  const [ll, setLL] = useState(35);
  const [pi, setPI] = useState(12);

  const result: AASHTOResult = classifyAASHTO({ fines, passing40, passing10, liquidLimit: ll, plasticityIndex: pi });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi Parametreleri</h2>
        <Field label="No.200 geçen (%)" value={fines} onChange={setFines} min={0} max={100} />
        <Field label="No.40 geçen (%)" value={passing40} onChange={setPassing40} min={0} max={100} />
        <Field label="No.10 geçen (%)" value={passing10} onChange={setPassing10} min={0} max={100} />
        <Field label="Likit Limit, LL (%)" value={ll} onChange={setLL} min={0} max={200} />
        <Field label="Plastisite İndeksi, PI (%)" value={pi} onChange={setPI} min={0} max={100} />
      </div>
      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-4">Sonuç</h2>
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-brand-100 dark:bg-brand-900/30 text-2xl font-bold text-brand-700 dark:text-brand-400">
            {result.group}
          </div>
          <p className="mt-3 text-lg font-semibold">{result.descriptionTR}</p>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <Row label="Grup" value={result.group} />
          <Row label="Grup İndeksi (GI)" value={`${result.groupIndex}`} />
          <Row label="Yol altzemin değerlendirmesi" value={result.ratingTR} />
          <Row label="Açıklama" value={result.descriptionTR} />
        </div>
      </div>
    </div>
  );
}

// ─── TBDY 2018 ───
function TBDY2018Form() {
  const [method, setMethod] = useState<"vs30" | "n60" | "cu">("vs30");
  const [vs30, setVs30] = useState(300);
  const [n60, setN60] = useState(25);
  const [cu, setCu] = useState(100);

  const input = method === "vs30" ? { vs30 } : method === "n60" ? { n60 } : { cu };
  const result: TBDY2018ClassResult = classifyTBDY2018(input);

  const classColors: Record<string, string> = {
    ZA: "bg-green-100 text-green-800", ZB: "bg-emerald-100 text-emerald-800",
    ZC: "bg-yellow-100 text-yellow-800", ZD: "bg-orange-100 text-orange-800",
    ZE: "bg-red-100 text-red-800", ZF: "bg-red-200 text-red-900",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi Parametreleri</h2>
        <div className="flex gap-2">
          {([["vs30", "Vs30"], ["n60", "N60 (SPT)"], ["cu", "cu (kPa)"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setMethod(k)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${method === k ? "bg-brand-600 text-white" : "bg-[var(--card)] border border-[var(--card-border)]"}`}>
              {l}
            </button>
          ))}
        </div>
        {method === "vs30" && <Field label="Vs30 — Ortalama kayma dalgası hızı (m/s)" value={vs30} onChange={setVs30} min={50} max={2000} />}
        {method === "n60" && <Field label="N60 — Ortalama SPT darbe sayısı" value={n60} onChange={setN60} min={0} max={100} />}
        {method === "cu" && <Field label="cu — Ortalama drenajsız kayma dayanımı (kPa)" value={cu} onChange={setCu} min={0} max={500} />}
      </div>
      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-4">Sonuç</h2>
        <div className="text-center py-6">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl text-3xl font-bold ${classColors[result.soilClass] || "bg-gray-100"}`}>
            {result.soilClass}
          </div>
          <p className="mt-3 text-lg font-semibold">{result.nameTR}</p>
          <p className="text-sm text-[var(--muted)]">{result.name}</p>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <Row label="Zemin Sınıfı" value={result.soilClass} />
          <Row label="Yöntem" value={result.method} />
          <Row label="Açıklama" value={result.descriptionTR} />
        </div>
        <div className="mt-6 p-3 rounded-lg bg-earth-50 dark:bg-neutral-800 text-xs text-[var(--muted)]">
          <p className="font-medium mb-1">TBDY 2018 Zemin Sınıfları:</p>
          <p>ZA: Vs30 &gt; 1500 m/s — Sağlam kaya</p>
          <p>ZB: 760 &lt; Vs30 ≤ 1500 — Kaya</p>
          <p>ZC: 360 &lt; Vs30 ≤ 760 — Sıkı zemin</p>
          <p>ZD: 180 &lt; Vs30 ≤ 360 — Orta sıkı zemin</p>
          <p>ZE: Vs30 ≤ 180 — Yumuşak zemin</p>
        </div>
      </div>
    </div>
  );
}

// ─── Ortak Bileşenler ───
function Field({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} min={min} max={max} step={step ?? 1} className="input-field" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-[var(--card-border)] last:border-0">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
