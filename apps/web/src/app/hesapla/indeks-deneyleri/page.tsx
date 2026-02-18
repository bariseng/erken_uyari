"use client";
import ExportPDFButton from "@/components/ExportPDFButton";
import MethodologySection from "@/components/MethodologySection";
import type { MethodologyData } from "@/components/MethodologySection";
import { useState, useMemo } from "react";
import { atterbergLimits, grainSizeAnalysis } from "@geoforce/engine";
import type { GrainSizePoint } from "@geoforce/engine";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line } from "recharts";

const methodology: MethodologyData = {
  title: "İndeks Deneyleri — Atterberg Limitleri ve Dane Dağılımı",
  overview: "İndeks deneyleri, zemin sınıflandırması ve mühendislik davranışının ön değerlendirmesi için kullanılan temel laboratuvar deneyleridir. Atterberg limitleri ince daneli zeminlerin kıvam durumunu, dane dağılımı analizi ise dane boyutu dağılımını belirler.",
  methods: [
    {
      name: "Atterberg Limitleri (ASTM D4318)",
      description: "İnce daneli zeminlerin su muhtevası değişimine bağlı davranış sınırlarını tanımlar. Likit limit (LL), plastik limit (PL) ve büzülme limiti (SL) olmak üzere üç sınır değer belirlenir.",
      formulas: [
        { name: "Plastisite indeksi", formula: "PI = LL − PL", description: "Zeminin plastik davranış aralığı" },
        { name: "Likidite indeksi", formula: "LI = (w − PL) / PI", description: "LI<0: katı, 0<LI<1: plastik, LI>1: sıvı" },
        { name: "Kıvam indeksi", formula: "CI = (LL − w) / PI = 1 − LI" },
        { name: "Aktivite", formula: "A = PI / (kil yüzdesi)", description: "A<0.75: inaktif, 0.75-1.25: normal, >1.25: aktif" },
        { name: "A-çizgisi (Casagrande)", formula: "PI = 0.73 × (LL − 20)", description: "Plastisite kartında kil-silt ayrımı" },
        { name: "U-çizgisi", formula: "PI = 0.9 × (LL − 8)", description: "Doğal zeminlerin üst sınırı" },
      ],
      steps: [
        { step: 1, title: "Likit limit deneyi", description: "Casagrande kabı veya düşen koni yöntemi ile LL belirlenir" },
        { step: 2, title: "Plastik limit deneyi", description: "3 mm çapında fitil çatlayana kadar yuvarlanır" },
        { step: 3, title: "PI hesabı", description: "PI = LL − PL" },
        { step: 4, title: "Plastisite kartı", description: "LL ve PI değerleri Casagrande kartında konumlandırılır" },
      ],
      limitations: ["Yalnızca No.40 eleğinden geçen malzeme üzerinde yapılır", "Organik zeminlerde fırın kurutma sıcaklığı 60°C olmalıdır"],
    },
    {
      name: "Dane Dağılımı Analizi (ASTM D6913 / D7928)",
      description: "Elek analizi (iri daneler) ve hidrometre analizi (ince daneler) ile zemin danelerinin boyut dağılımı belirlenir. Derecelenme katsayıları zemin sınıflandırmasında kullanılır.",
      formulas: [
        { name: "Üniformluk katsayısı", formula: "Cu = D60 / D10", description: "Dağılımın genişliği; Cu>4 (çakıl) veya Cu>6 (kum) iyi derecelenmiş" },
        { name: "Derecelenme katsayısı", formula: "Cc = (D30)² / (D10 × D60)", description: "1 ≤ Cc ≤ 3 ise iyi derecelenmiş" },
        { name: "Efektif dane çapı", formula: "D10: %10 geçen dane çapı", description: "Permeabilite tahmini için önemli (Hazen: k ≈ D10²)" },
        { name: "Dane fraksiyonları", formula: "Çakıl: >4.75mm, Kum: 0.075-4.75mm, Silt: 0.002-0.075mm, Kil: <0.002mm" },
      ],
      steps: [
        { step: 1, title: "Kuru elek analizi", description: "Yıkanmış numune standart eleklerden geçirilir" },
        { step: 2, title: "Hidrometre analizi", description: "No.200 eleğinden geçen malzeme için Stokes yasası uygulanır" },
        { step: 3, title: "Eğri çizimi", description: "Dane çapı (log) vs geçen yüzde grafiği çizilir" },
        { step: 4, title: "D10, D30, D60 belirleme", description: "Eğriden interpolasyonla okunur" },
      ],
      limitations: ["Hidrometre analizi küresel dane varsayımı yapar", "Flokülasyon önlenmeli (sodyum heksametafosfat)"],
    },
  ],
  references: [
    "ASTM D4318 — Standard Test Methods for Liquid Limit, Plastic Limit, and Plasticity Index of Soils.",
    "ASTM D6913 — Standard Test Methods for Particle-Size Distribution (Gradation) of Soils Using Sieve Analysis.",
    "ASTM D7928 — Standard Test Method for Particle-Size Distribution (Gradation) of Fine-Grained Soils Using the Sedimentation (Hydrometer) Analysis.",
    "Casagrande, A. (1948). Classification and Identification of Soils. ASCE Transactions.",
    "Das, B.M. (2019). Principles of Geotechnical Engineering, 9th Ed.",
  ],
  standards: ["ASTM D4318", "ASTM D6913", "ASTM D7928", "TS 1900-1", "TS EN ISO 17892"],
  notes: [
    "Plastisite kartı, USCS sınıflandırmasının temelini oluşturur.",
    "İyi derecelenmiş zeminler kompaksiyona daha uygun ve daha dayanıklıdır.",
    "Aktivite değeri kil mineralojisi hakkında bilgi verir (kaolinit ~0.4, illit ~0.9, montmorillonit >4).",
  ],
};

type Tab = "atterberg" | "grain";

export default function IndeksPage() {
  const [tab, setTab] = useState<Tab>("atterberg");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">📊 İndeks Deneyleri</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Atterberg limitleri, plastisite kartı ve dane dağılımı eğrisi</p>
      <div className="mt-2"><ExportPDFButton moduleName="İndeks Deneyleri" method="Atterberg / Dane Dağılımı" inputs={{ "Hesap tipi": tab }} results={{}} /></div>
      <MethodologySection data={methodology} />
      <div className="mt-6 flex gap-2">
        {([["atterberg", "Atterberg Limitleri"], ["grain", "Dane Dağılımı"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === k ? "bg-brand-600 text-white" : "bg-[var(--card)] border border-[var(--card-border)]"}`}>{l}</button>
        ))}
      </div>
      <div className="mt-6">{tab === "atterberg" ? <AtterbergForm /> : <GrainForm />}</div>
    </div>
  );
}

function AtterbergForm() {
  const [LL, setLL] = useState(45);
  const [PL, setPL] = useState(22);
  const [w, setW] = useState(35);
  const [clayPct, setClayPct] = useState(30);

  const result = useMemo(() => atterbergLimits({ liquidLimit: LL, plasticLimit: PL, naturalWaterContent: w, clayPercent: clayPct }), [LL, PL, w, clayPct]);

  // Plastisite kartı: A-line PI = 0.73*(LL-20), U-line PI = 0.9*(LL-8)
  const chartW = 520, chartH = 260, ox = 60, oy = 20;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi</h2>
        <Field label="Likit Limit LL (%)" value={LL} onChange={setLL} min={10} max={120} />
        <Field label="Plastik Limit PL (%)" value={PL} onChange={setPL} min={5} max={80} />
        <Field label="Doğal su muhtevası w (%)" value={w} onChange={setW} min={0} max={150} />
        <Field label="Kil yüzdesi (%)" value={clayPct} onChange={setClayPct} min={0} max={100} />
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Sonuçlar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <RBox label="PI" value={`%${result.PI}`} color="blue" />
            <RBox label="USCS" value={result.uscsGroup.split(" ")[0]} color="green" />
            {result.LI !== undefined && <RBox label="LI" value={result.LI.toString()} color="orange" />}
            {result.CI !== undefined && <RBox label="CI" value={result.CI.toString()} color="orange" />}
            {result.activity !== undefined && <RBox label="Aktivite" value={result.activity.toString()} color="gray" />}
            {result.consistencyState && <RBox label="Kıvam" value={result.consistencyState} color="gray" />}
          </div>
          <p className="mt-3 text-sm">{result.uscsGroup} — {result.chartPosition === "A-line above" ? "A çizgisi üstü" : result.chartPosition === "A-line below" ? "A çizgisi altı" : "A çizgisi üzerinde"}</p>
        </div>

        {/* Recharts - Atterberg Limitleri Karşılaştırma */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Atterberg Limitleri Karşılaştırma</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { name: "PL", value: PL },
              { name: "w (doğal)", value: w },
              { name: "LL", value: LL },
              { name: "PI", value: result.PI },
            ]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} label={{ value: "%", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="value" name="Değer (%)" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Casagrande Plastisite Kartı */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Casagrande Plastisite Kartı</h2>
          <svg viewBox={`0 0 ${ox + chartW + 20} ${oy + chartH + 40}`} className="w-full" style={{ maxHeight: 340 }}>
            {/* Axes */}
            <line x1={ox} y1={oy} x2={ox} y2={oy + chartH} stroke="currentColor" strokeWidth={1} />
            <line x1={ox} y1={oy + chartH} x2={ox + chartW} y2={oy + chartH} stroke="currentColor" strokeWidth={1} />
            <text x={ox + chartW / 2} y={oy + chartH + 35} textAnchor="middle" fontSize={10} fill="currentColor">Likit Limit LL (%)</text>
            <text x={15} y={oy + chartH / 2} textAnchor="middle" fontSize={10} fill="currentColor" transform={`rotate(-90,15,${oy + chartH / 2})`}>Plastisite İndisi PI (%)</text>

            {/* Grid */}
            {[20, 40, 60, 80, 100].map(ll => {
              const x = ox + (ll / 120) * chartW;
              return (<g key={ll}><line x1={x} y1={oy} x2={x} y2={oy + chartH} stroke="var(--card-border)" strokeWidth={0.5} /><text x={x} y={oy + chartH + 14} textAnchor="middle" fontSize={8} fill="var(--muted)">{ll}</text></g>);
            })}
            {[10, 20, 30, 40, 50, 60].map(pi => {
              const y = oy + chartH - (pi / 70) * chartH;
              return (<g key={pi}><line x1={ox} y1={y} x2={ox + chartW} y2={y} stroke="var(--card-border)" strokeWidth={0.5} /><text x={ox - 5} y={y + 3} textAnchor="end" fontSize={8} fill="var(--muted)">{pi}</text></g>);
            })}

            {/* A-line: PI = 0.73*(LL-20) */}
            <line
              x1={ox + (20 / 120) * chartW} y1={oy + chartH}
              x2={ox + (110 / 120) * chartW} y2={oy + chartH - (0.73 * 90 / 70) * chartH}
              stroke="rgb(239,68,68)" strokeWidth={2}
            />
            <text x={ox + (100 / 120) * chartW} y={oy + chartH - (0.73 * 80 / 70) * chartH - 5} fontSize={9} fill="rgb(239,68,68)">A çizgisi</text>

            {/* U-line: PI = 0.9*(LL-8) */}
            <line
              x1={ox + (8 / 120) * chartW} y1={oy + chartH}
              x2={ox + (85 / 120) * chartW} y2={oy + chartH - (0.9 * 77 / 70) * chartH}
              stroke="rgb(156,163,175)" strokeWidth={1.5} strokeDasharray="6 3"
            />
            <text x={ox + (75 / 120) * chartW} y={oy + chartH - (0.9 * 67 / 70) * chartH - 5} fontSize={9} fill="rgb(156,163,175)">U çizgisi</text>

            {/* LL=50 line */}
            <line x1={ox + (50 / 120) * chartW} y1={oy} x2={ox + (50 / 120) * chartW} y2={oy + chartH} stroke="var(--card-border)" strokeWidth={1} strokeDasharray="4 4" />
            <text x={ox + (50 / 120) * chartW + 3} y={oy + 12} fontSize={8} fill="var(--muted)">LL=50</text>

            {/* Zone labels */}
            <text x={ox + (35 / 120) * chartW} y={oy + chartH - (15 / 70) * chartH} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.4}>CL</text>
            <text x={ox + (35 / 120) * chartW} y={oy + chartH - (3 / 70) * chartH} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.4}>ML</text>
            <text x={ox + (75 / 120) * chartW} y={oy + chartH - (35 / 70) * chartH} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.4}>CH</text>
            <text x={ox + (75 / 120) * chartW} y={oy + chartH - (10 / 70) * chartH} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.4}>MH</text>

            {/* Current point */}
            <circle
              cx={ox + (LL / 120) * chartW}
              cy={oy + chartH - (result.PI / 70) * chartH}
              r={6} fill="rgb(59,130,246)" stroke="white" strokeWidth={2}
            />
            <text x={ox + (LL / 120) * chartW + 10} y={oy + chartH - (result.PI / 70) * chartH + 4} fontSize={9} fill="rgb(59,130,246)" fontWeight="bold">({LL}, {result.PI})</text>
          </svg>
        </div>
      </div>
    </div>
  );
}

function GrainForm() {
  const [points, setPoints] = useState<(GrainSizePoint & { id: number })[]>([
    { id: 1, sieveSize: 75, percentPassing: 100 },
    { id: 2, sieveSize: 19, percentPassing: 95 },
    { id: 3, sieveSize: 4.75, percentPassing: 80 },
    { id: 4, sieveSize: 2, percentPassing: 65 },
    { id: 5, sieveSize: 0.425, percentPassing: 40 },
    { id: 6, sieveSize: 0.15, percentPassing: 20 },
    { id: 7, sieveSize: 0.075, percentPassing: 12 },
    { id: 8, sieveSize: 0.002, percentPassing: 3 },
  ]);

  const addPoint = () => setPoints([...points, { id: Date.now(), sieveSize: 0.01, percentPassing: 0 }]);
  const removePoint = (id: number) => setPoints(points.filter(p => p.id !== id));
  const updatePoint = (id: number, key: string, val: number) => setPoints(points.map(p => p.id === id ? { ...p, [key]: val } : p));

  const result = useMemo(() => grainSizeAnalysis({ data: points }), [points]);

  // Log scale chart
  const sorted = [...points].sort((a, b) => a.sieveSize - b.sieveSize);
  const minLog = -3, maxLog = 2; // 0.001 to 100 mm

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Elek Analizi Verileri</h2>
        <div className="space-y-2">
          {points.map((p, i) => (
            <div key={p.id} className="flex gap-2 items-end">
              <MiniField label={i === 0 ? "Elek (mm)" : ""} value={p.sieveSize} onChange={v => updatePoint(p.id, "sieveSize", v)} />
              <MiniField label={i === 0 ? "Geçen (%)" : ""} value={p.percentPassing} onChange={v => updatePoint(p.id, "percentPassing", v)} />
              <button onClick={() => removePoint(p.id)} className="text-xs text-red-500 pb-2">✕</button>
            </div>
          ))}
        </div>
        <button onClick={addPoint} className="btn-secondary w-full text-xs">+ Nokta Ekle</button>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Sonuçlar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <RBox label="D10" value={result.D10 !== null ? `${result.D10} mm` : "-"} color="blue" />
            <RBox label="D30" value={result.D30 !== null ? `${result.D30} mm` : "-"} color="blue" />
            <RBox label="D50" value={result.D50 !== null ? `${result.D50} mm` : "-"} color="blue" />
            <RBox label="D60" value={result.D60 !== null ? `${result.D60} mm` : "-"} color="blue" />
            <RBox label="Cu" value={result.Cu !== null ? result.Cu.toString() : "-"} color="orange" />
            <RBox label="Cc" value={result.Cc !== null ? result.Cc.toString() : "-"} color="orange" />
            <RBox label="Derecelenme" value={result.gradingDescription} color={result.wellGraded ? "green" : "gray"} />
          </div>
        </div>

        {/* Fraksiyonlar */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-3">Dane Fraksiyonları</h2>
          <div className="flex h-8 rounded-lg overflow-hidden">
            {result.fractions.gravel > 0 && <div style={{ width: `${result.fractions.gravel}%` }} className="bg-amber-600 flex items-center justify-center text-[10px] text-white font-medium">{result.fractions.gravel > 8 ? `Çakıl ${result.fractions.gravel}%` : ""}</div>}
            {result.fractions.sand > 0 && <div style={{ width: `${result.fractions.sand}%` }} className="bg-yellow-400 flex items-center justify-center text-[10px] text-amber-900 font-medium">{result.fractions.sand > 8 ? `Kum ${result.fractions.sand}%` : ""}</div>}
            {result.fractions.silt > 0 && <div style={{ width: `${result.fractions.silt}%` }} className="bg-blue-300 flex items-center justify-center text-[10px] text-blue-900 font-medium">{result.fractions.silt > 8 ? `Silt ${result.fractions.silt}%` : ""}</div>}
            {result.fractions.clay > 0 && <div style={{ width: `${result.fractions.clay}%` }} className="bg-red-400 flex items-center justify-center text-[10px] text-white font-medium">{result.fractions.clay > 8 ? `Kil ${result.fractions.clay}%` : ""}</div>}
          </div>
        </div>

        {/* Dane dağılımı eğrisi (log scale) */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Dane Dağılımı Eğrisi</h2>
          <svg viewBox="0 0 620 320" className="w-full" style={{ maxHeight: 320 }}>
            <line x1={60} y1={20} x2={60} y2={270} stroke="currentColor" strokeWidth={1} />
            <line x1={60} y1={270} x2={590} y2={270} stroke="currentColor" strokeWidth={1} />
            <text x={325} y={305} textAnchor="middle" fontSize={10} fill="currentColor">Dane çapı (mm) — log ölçek</text>
            <text x={15} y={145} textAnchor="middle" fontSize={10} fill="currentColor" transform="rotate(-90,15,145)">Geçen (%)</text>

            {/* Y grid */}
            {[25, 50, 75, 100].map(p => {
              const y = 270 - (p / 100) * 250;
              return (<g key={p}><line x1={60} y1={y} x2={590} y2={y} stroke="var(--card-border)" strokeWidth={0.5} /><text x={55} y={y + 3} textAnchor="end" fontSize={8} fill="var(--muted)">{p}</text></g>);
            })}

            {/* X grid (log) */}
            {[0.001, 0.01, 0.075, 0.1, 1, 4.75, 10, 100].map(s => {
              const logS = Math.log10(s);
              const x = 60 + ((logS - minLog) / (maxLog - minLog)) * 530;
              if (x < 60 || x > 590) return null;
              return (<g key={s}><line x1={x} y1={20} x2={x} y2={270} stroke="var(--card-border)" strokeWidth={0.5} /><text x={x} y={284} textAnchor="middle" fontSize={7} fill="var(--muted)">{s}</text></g>);
            })}

            {/* Sınır çizgileri */}
            {[0.002, 0.075, 4.75].map(s => {
              const x = 60 + ((Math.log10(s) - minLog) / (maxLog - minLog)) * 530;
              return <line key={s} x1={x} y1={20} x2={x} y2={270} stroke="rgb(239,68,68)" strokeWidth={0.5} strokeDasharray="4 4" />;
            })}
            <text x={60 + ((Math.log10(0.002) - minLog) / (maxLog - minLog)) * 530} y={16} textAnchor="middle" fontSize={7} fill="rgb(239,68,68)">Kil</text>
            <text x={60 + ((Math.log10(0.02) - minLog) / (maxLog - minLog)) * 530} y={16} textAnchor="middle" fontSize={7} fill="rgb(239,68,68)">Silt</text>
            <text x={60 + ((Math.log10(0.5) - minLog) / (maxLog - minLog)) * 530} y={16} textAnchor="middle" fontSize={7} fill="rgb(239,68,68)">Kum</text>
            <text x={60 + ((Math.log10(20) - minLog) / (maxLog - minLog)) * 530} y={16} textAnchor="middle" fontSize={7} fill="rgb(239,68,68)">Çakıl</text>

            {/* Eğri */}
            <polyline
              points={sorted.filter(p => p.sieveSize > 0).map(p => {
                const x = 60 + ((Math.log10(p.sieveSize) - minLog) / (maxLog - minLog)) * 530;
                const y = 270 - (p.percentPassing / 100) * 250;
                return `${Math.max(60, Math.min(590, x))},${y}`;
              }).join(" ")}
              fill="none" stroke="rgb(59,130,246)" strokeWidth={2}
            />

            {/* Noktalar */}
            {sorted.filter(p => p.sieveSize > 0).map((p, i) => {
              const x = 60 + ((Math.log10(p.sieveSize) - minLog) / (maxLog - minLog)) * 530;
              const y = 270 - (p.percentPassing / 100) * 250;
              return <circle key={i} cx={Math.max(60, Math.min(590, x))} cy={y} r={3.5} fill="rgb(59,130,246)" stroke="white" strokeWidth={1.5} />;
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (<div><label className="block text-sm font-medium mb-1">{label}</label><input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step ?? 1} className="input-field" /></div>);
}
function MiniField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (<div className="flex-1"><label className="block text-[10px] text-[var(--muted)]">{label}</label><input type="number" value={value} onChange={e => onChange(Number(e.target.value))} className="input-field text-xs py-1" /></div>);
}
function RBox({ label, value, color }: { label: string; value: string; color: string }) {
  const c: Record<string, string> = { green: "bg-green-50 dark:bg-green-900/20 text-green-700", blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700", orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-700", red: "bg-red-50 dark:bg-red-900/20 text-red-700", gray: "bg-earth-50 dark:bg-neutral-800" };
  return (<div className={`rounded-lg p-3 text-center ${c[color] || c.gray}`}><p className="text-[10px] text-[var(--muted)]">{label}</p><p className="text-lg font-bold">{value}</p></div>);
}
