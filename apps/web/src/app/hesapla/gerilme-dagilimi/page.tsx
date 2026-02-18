"use client";
import ExportPDFButton from "@/components/ExportPDFButton";
import MethodologySection from "@/components/MethodologySection";
import type { MethodologyData } from "@/components/MethodologySection";
import { useState, useMemo } from "react";
import { boussinesqPoint, boussinesqRect, boussinesqProfile, cbrCorrelations } from "@geoforce/engine";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

const methodology: MethodologyData = {
  title: "Gerilme Dağılımı ve CBR Korelasyonları",
  overview: "Yüzey yüklerinin zemin içindeki gerilme artışını hesaplamak, temel tasarımı ve oturma analizinin temelini oluşturur. Boussinesq (1885) elastik yarı-uzay teorisi en yaygın kullanılan yöntemdir. CBR (California Bearing Ratio) ise üstyapı tasarımında zemin dayanımını değerlendirmek için kullanılır.",
  methods: [
    {
      name: "Boussinesq Nokta Yük Çözümü (1885)",
      description: "Homojen, izotrop, lineer elastik yarı-uzay yüzeyine uygulanan nokta yükün herhangi bir derinlik ve yatay mesafedeki gerilme artışını verir.",
      formulas: [
        { name: "Düşey gerilme artışı", formula: "Δσz = (3Q / 2πz²) × [1 / (1 + (r/z)²)^(5/2)]", description: "Q: nokta yük, z: derinlik, r: yatay mesafe" },
        { name: "Etki katsayısı", formula: "Iσ = (3/2π) × [1 / (1 + (r/z)²)^(5/2)]", description: "Δσz = Iσ × Q/z²" },
      ],
      steps: [
        { step: 1, title: "Yük ve geometri", description: "Q, z ve r değerleri belirlenir" },
        { step: 2, title: "Etki katsayısı", description: "Iσ hesaplanır veya tablodan okunur" },
        { step: 3, title: "Gerilme artışı", description: "Δσz = Iσ × Q/z²" },
      ],
      limitations: ["Homojen, izotrop, lineer elastik zemin varsayımı", "Tabakalı zeminlerde yaklaşık sonuç verir"],
    },
    {
      name: "Boussinesq Dikdörtgen Üniform Yük",
      description: "Dikdörtgen alan üzerinde üniform dağılmış yükün (q) altındaki gerilme artışı, Newmark integrasyon yöntemi ile hesaplanır.",
      formulas: [
        { name: "Köşe altı gerilme", formula: "Δσz = q × Iσ(m, n)", description: "m = B/z, n = L/z; Iσ: Newmark etki katsayısı" },
        { name: "Merkez altı gerilme", formula: "Δσz(merkez) = 4 × q × Iσ(m/2, n/2)", description: "Süperpozisyon ile 4 köşe toplamı" },
        { name: "Etki derinliği", formula: "Δσz ≈ 0.1q → z ≈ 2B (kare), z ≈ 4B (şerit)", description: "Gerilme artışının ihmal edilebilir olduğu derinlik" },
      ],
      steps: [
        { step: 1, title: "Temel boyutları", description: "B, L ve q belirlenir" },
        { step: 2, title: "Derinlik profili", description: "Farklı z değerleri için Δσz hesaplanır" },
        { step: 3, title: "Oturma hesabına girdi", description: "Gerilme profili oturma hesabında kullanılır" },
      ],
      limitations: ["Rijit temel için düzeltme gerekir", "Komşu temellerin etkisi süperpozisyonla hesaplanır"],
    },
    {
      name: "CBR Korelasyonları",
      description: "CBR değeri, zemin dayanımının standart kırılmış taş dayanımına oranıdır. Üstyapı kalınlığı tasarımı ve zemin modülü tahmini için kullanılır.",
      formulas: [
        { name: "Resilient modülü", formula: "Mr = 10.3 × CBR (MPa)", description: "AASHTO 1993 korelasyonu" },
        { name: "Yatak katsayısı", formula: "k = 5.4 × CBR^0.64 (MN/m³)", description: "Yaklaşık korelasyon" },
        { name: "Yaklaşık taşıma kapasitesi", formula: "qa ≈ 10 × CBR (kPa)", description: "Çok kaba yaklaşım" },
      ],
      limitations: ["CBR ampirik bir değerdir, temel tasarımı için yeterli değildir", "Korelasyonlar bölgesel farklılık gösterebilir"],
    },
  ],
  references: [
    "Boussinesq, J. (1885). Application des Potentiels à l'Étude de l'Équilibre et du Mouvement des Solides Élastiques.",
    "Newmark, N.M. (1942). Influence Charts for Computation of Stresses in Elastic Foundations. Univ. of Illinois Bulletin.",
    "AASHTO (1993). Guide for Design of Pavement Structures.",
    "Das, B.M. (2019). Principles of Foundation Engineering, 9th Ed.",
  ],
  standards: ["ASTM D1883 (CBR)", "AASHTO T 193", "TS 1900-2"],
  notes: [
    "Boussinesq çözümü, Poisson oranından bağımsızdır (düşey gerilme için).",
    "Gerilme artışı derinlikle hızla azalır — 2B derinlikte yüzey basıncının ~%10'u kalır.",
    "CBR deneyi hem laboratuvarda hem sahada yapılabilir.",
  ],
};

type Tab = "boussinesq" | "cbr";

export default function BoussinesqCBRPage() {
  const [tab, setTab] = useState<Tab>("boussinesq");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">📐 Gerilme Dağılımı & CBR</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Boussinesq gerilme dağılımı ve CBR korelasyonları</p>
      <div className="mt-2"><ExportPDFButton moduleName="Gerilme Dağılımı & CBR" method="Boussinesq / CBR" inputs={{ "Hesap tipi": tab }} results={{}} /></div>
      <MethodologySection data={methodology} />
      <div className="mt-6 flex gap-2">
        {([["boussinesq", "Boussinesq Gerilme"], ["cbr", "CBR Korelasyonları"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === k ? "bg-brand-600 text-white" : "bg-[var(--card)] border border-[var(--card-border)]"}`}>{l}</button>
        ))}
      </div>
      <div className="mt-6">{tab === "boussinesq" ? <BoussinesqForm /> : <CBRForm />}</div>
    </div>
  );
}

function BoussinesqForm() {
  const [mode, setMode] = useState<"point" | "rect">("rect");
  const [Q, setQ] = useState(100);
  const [q, setQ2] = useState(150);
  const [B, setB] = useState(2);
  const [L, setL] = useState(3);
  const [z, setZ] = useState(2);
  const [r, setR] = useState(0);

  const pointResult = useMemo(() => boussinesqPoint({ load: Q, depth: z, radialDistance: r }), [Q, z, r]);
  const rectResult = useMemo(() => boussinesqRect({ pressure: q, B, L, depth: z }), [q, B, L, z]);
  const profile = useMemo(() => boussinesqProfile({ pressure: q, B, L }), [q, B, L]);

  const result = mode === "point" ? pointResult : rectResult;
  const maxStress = profile.length > 0 ? Math.max(...profile.map(p => p.deltaStress)) : 1;
  const maxDepth = profile.length > 0 ? profile[profile.length - 1].depth : 10;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Yük tipi</label>
          <select value={mode} onChange={e => setMode(e.target.value as any)} className="input-field">
            <option value="rect">Dikdörtgen üniform yük</option>
            <option value="point">Nokta yük</option>
          </select>
        </div>
        {mode === "point" ? (
          <>
            <Field label="Nokta yük Q (kN)" value={Q} onChange={setQ} min={1} />
            <Field label="Yatay mesafe r (m)" value={r} onChange={setR} min={0} step={0.1} />
          </>
        ) : (
          <>
            <Field label="Basınç q (kPa)" value={q} onChange={setQ2} min={1} />
            <Field label="Genişlik B (m)" value={B} onChange={setB} min={0.5} step={0.1} />
            <Field label="Uzunluk L (m)" value={L} onChange={setL} min={0.5} step={0.1} />
          </>
        )}
        <Field label="Derinlik z (m)" value={z} onChange={setZ} min={0.1} step={0.1} />
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">{result.method}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <RBox label="Δσz (gerilme artışı)" value={`${result.deltaStress} kPa`} color="blue" />
            <RBox label="Etki katsayısı I" value={result.influenceFactor.toString()} color="gray" />
            {mode === "rect" && <RBox label="Δσz / q" value={`${((result.deltaStress / q) * 100).toFixed(1)}%`} color="orange" />}
          </div>
        </div>

        {mode === "rect" && (
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Gerilme Dağılımı (Recharts)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={profile.map(p => ({ depth: p.depth, "Δσz (kPa)": Number(p.deltaStress) }))} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" label={{ value: "Δσz (kPa)", position: "insideBottom", offset: -2, fontSize: 11 }} tick={{ fontSize: 10 }} />
                <YAxis type="number" dataKey="depth" reversed label={{ value: "Derinlik z (m)", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Δσz (kPa)" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} name="Gerilme artışı" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {mode === "rect" && (
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Gerilme Dağılımı Profili (merkez altı)</h2>
            <svg viewBox="0 0 600 320" className="w-full" style={{ maxHeight: 320 }}>
              <line x1={80} y1={20} x2={80} y2={280} stroke="currentColor" strokeWidth={1} />
              <line x1={80} y1={280} x2={560} y2={280} stroke="currentColor" strokeWidth={1} />
              <text x={320} y={310} textAnchor="middle" fontSize={10} fill="currentColor">Δσz (kPa)</text>
              <text x={20} y={150} textAnchor="middle" fontSize={10} fill="currentColor" transform="rotate(-90,20,150)">Derinlik z (m)</text>

              {/* Grid */}
              {[0.25, 0.5, 0.75, 1].map(f => {
                const x = 80 + f * 480;
                return (<g key={f}><line x1={x} y1={20} x2={x} y2={280} stroke="var(--card-border)" strokeWidth={0.5} /><text x={x} y={295} textAnchor="middle" fontSize={8} fill="var(--muted)">{(f * maxStress).toFixed(0)}</text></g>);
              })}
              {[0.25, 0.5, 0.75].map(f => {
                const y = 20 + f * 260;
                return (<g key={f}><line x1={80} y1={y} x2={560} y2={y} stroke="var(--card-border)" strokeWidth={0.5} /><text x={75} y={y + 3} textAnchor="end" fontSize={8} fill="var(--muted)">{(f * maxDepth).toFixed(1)}</text></g>);
              })}

              {/* Temel */}
              <rect x={80} y={15} width={Math.min((q / maxStress) * 480, 480)} height={8} fill="rgb(150,150,150)" rx={2} />

              {/* Gerilme profili */}
              <polyline
                points={profile.map(p => {
                  const x = 80 + (p.deltaStress / maxStress) * 480;
                  const y = 20 + (p.depth / maxDepth) * 260;
                  return `${x},${y}`;
                }).join(" ")}
                fill="none" stroke="rgb(59,130,246)" strokeWidth={2}
              />

              {/* Dolgu alanı */}
              <polygon
                points={[
                  "80,20",
                  ...profile.map(p => `${80 + (p.deltaStress / maxStress) * 480},${20 + (p.depth / maxDepth) * 260}`),
                  `80,${20 + 260}`,
                ].join(" ")}
                fill="rgba(59,130,246,0.1)"
              />

              {/* 10% çizgisi */}
              <line x1={80 + (0.1 * q / maxStress) * 480} y1={20} x2={80 + (0.1 * q / maxStress) * 480} y2={280} stroke="rgb(239,68,68)" strokeWidth={1} strokeDasharray="4 4" />
              <text x={85 + (0.1 * q / maxStress) * 480} y={30} fontSize={8} fill="rgb(239,68,68)">0.1q</text>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

function CBRForm() {
  const [cbr, setCbr] = useState(10);
  const result = useMemo(() => cbrCorrelations({ cbr }), [cbr]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi</h2>
        <Field label="CBR değeri (%)" value={cbr} onChange={setCbr} min={1} max={100} />
        <div className="p-3 rounded-lg bg-earth-50 dark:bg-neutral-800 text-sm font-mono space-y-1">
          <p>Mr = 10.3 × CBR = 10.3 × {cbr} = <b>{result.resilientModulus} MPa</b></p>
          <p>k = 5.4 × CBR^0.64 = <b>{result.subgradeModulus} MN/m³</b></p>
        </div>
      </div>
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Sonuçlar</h2>
        <div className="grid grid-cols-2 gap-3">
          <RBox label="Mr (Resilient Modülü)" value={`${result.resilientModulus} MPa`} color="blue" />
          <RBox label="k (Yatak Katsayısı)" value={`${result.subgradeModulus} MN/m³`} color="blue" />
          <RBox label="Yaklaşık qa" value={`${result.approxBearing} kPa`} color="orange" />
          <RBox label="Üstyapı Kalınlığı" value={`~${result.pavementThickness} cm`} color="gray" />
        </div>
        <div className="mt-2 p-3 rounded-lg bg-earth-50 dark:bg-neutral-800 text-sm">
          <p>Zemin kalitesi: <b>{result.soilQuality}</b></p>
        </div>
        <div className="text-xs text-[var(--muted)]">
          <p>Ref: AASHTO 1993 Guide, Mr = 10.3 × CBR (MPa)</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (<div><label className="block text-sm font-medium mb-1">{label}</label><input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step ?? 1} className="input-field" /></div>);
}
function RBox({ label, value, color }: { label: string; value: string; color: string }) {
  const c: Record<string, string> = { green: "bg-green-50 dark:bg-green-900/20 text-green-700", blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700", orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-700", red: "bg-red-50 dark:bg-red-900/20 text-red-700", gray: "bg-earth-50 dark:bg-neutral-800" };
  return (<div className={`rounded-lg p-3 text-center ${c[color] || c.gray}`}><p className="text-[10px] text-[var(--muted)]">{label}</p><p className="text-lg font-bold">{value}</p></div>);
}
