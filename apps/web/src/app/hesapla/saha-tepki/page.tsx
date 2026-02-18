"use client";
import ExportPDFButton from "@/components/ExportPDFButton";
import MethodologySection from "@/components/MethodologySection";
import type { MethodologyData } from "@/components/MethodologySection";
import { useState, useMemo } from "react";
import { calculateVs30, siteResponseAnalysis } from "@geoforce/engine";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";

const methodology: MethodologyData = {
  title: "Saha Tepki Analizi",
  overview: "Saha tepki analizi, kaya seviyesindeki deprem hareketinin zemin tabakaları içinden geçerken nasıl değiştiğini belirler. Vs30 hesabı zemin sınıflandırması için, transfer fonksiyonu ise zemin büyütme karakteristiklerinin belirlenmesi için kullanılır.",
  methods: [
    {
      name: "Vs30 Hesabı (TBDY 2018)",
      description: "Üst 30 metrenin ağırlıklı ortalama kayma dalgası hızıdır. Zemin sınıflandırması ve deprem tasarım parametrelerinin belirlenmesinde kullanılır.",
      formulas: [
        { name: "Vs30", formula: "Vs30 = 30 / Σ(hi / Vsi)", description: "hi: tabaka kalınlığı, Vsi: tabaka kayma dalgası hızı" },
        { name: "ZA sınıfı", formula: "Vs30 > 1500 m/s — Sağlam kaya" },
        { name: "ZB sınıfı", formula: "760 < Vs30 ≤ 1500 m/s — Kaya" },
        { name: "ZC sınıfı", formula: "360 < Vs30 ≤ 760 m/s — Sıkı zemin" },
        { name: "ZD sınıfı", formula: "180 < Vs30 ≤ 360 m/s — Orta sıkı zemin" },
        { name: "ZE sınıfı", formula: "Vs30 ≤ 180 m/s — Yumuşak zemin" },
      ],
      steps: [
        { step: 1, title: "Tabaka verileri", description: "Her tabakanın kalınlığı ve Vs değeri belirlenir" },
        { step: 2, title: "Seyahat süresi", description: "Her tabaka için hi/Vsi hesaplanır" },
        { step: 3, title: "Vs30 hesabı", description: "Vs30 = 30 / Σ(hi/Vsi)" },
        { step: 4, title: "Zemin sınıfı", description: "TBDY 2018 Tablo 16.1'e göre sınıf belirlenir" },
      ],
      limitations: ["30 m'den sığ profillerde ekstrapolasyon gerekir", "Vs ölçümü MASW, ReMi veya downhole ile yapılmalıdır"],
    },
    {
      name: "Basitleştirilmiş Saha Tepki — Transfer Fonksiyonu",
      description: "1D dalga yayılım teorisine dayalı basitleştirilmiş analiz. Zemin tabakalarının empedans kontrastı ve sönüm özellikleri kullanılarak büyütme fonksiyonu hesaplanır.",
      formulas: [
        { name: "Doğal periyot", formula: "T0 = 4H / Vs(avg)", description: "H: toplam zemin kalınlığı, Vs(avg): ortalama Vs" },
        { name: "Doğal frekans", formula: "f0 = 1 / T0 = Vs(avg) / (4H)" },
        { name: "Empedans oranı", formula: "α = (ρ₁·Vs₁) / (ρ₂·Vs₂)", description: "Tabakalar arası empedans kontrastı" },
        { name: "Büyütme faktörü", formula: "AF = PGA(yüzey) / PGA(kaya)", description: "Zemin büyütme etkisi" },
      ],
      steps: [
        { step: 1, title: "Zemin profili", description: "Tabaka kalınlıkları, Vs, γ ve sönüm oranları belirlenir" },
        { step: 2, title: "Doğal frekans", description: "f0 = Vs/(4H) hesaplanır" },
        { step: 3, title: "Transfer fonksiyonu", description: "Frekansa bağlı büyütme hesaplanır" },
        { step: 4, title: "Yüzey hareketi", description: "Kaya PGA × AF = yüzey PGA" },
      ],
      limitations: ["1D analiz yanal değişimleri dikkate almaz", "Nonlineer zemin davranışı basitleştirilmiş modelde sınırlıdır", "Detaylı analiz için SHAKE, DEEPSOIL gibi yazılımlar kullanılmalıdır"],
    },
  ],
  references: [
    "TBDY 2018 — Türkiye Bina Deprem Yönetmeliği, Bölüm 16.",
    "Kramer, S.L. (1996). Geotechnical Earthquake Engineering. Prentice Hall.",
    "Schnabel, P.B. et al. (1972). SHAKE: A Computer Program for Earthquake Response Analysis. UCB/EERC-72/12.",
    "Idriss, I.M. & Sun, J.I. (1992). User's Manual for SHAKE91.",
  ],
  standards: ["TBDY 2018 Bölüm 16", "Eurocode 8 Part 1", "ASCE 7-22"],
  notes: [
    "Yumuşak zemin tabakaları deprem hareketini önemli ölçüde büyütebilir.",
    "Doğal periyot, yapı periyodu ile çakışırsa rezonans riski oluşur.",
    "Vs30, zemin sınıflandırması için en güvenilir parametredir.",
    "Nonlineer analiz, büyük deprem hareketlerinde daha gerçekçi sonuç verir.",
  ],
};

export default function SahaTepkiPage() {
  const [rockPGA, setRockPGA] = useState(0.3);
  const [layers, setLayers] = useState([
    { id: 1, thickness: 5, vs: 150, gamma: 17, damping: 5 },
    { id: 2, thickness: 10, vs: 250, gamma: 18, damping: 5 },
    { id: 3, thickness: 15, vs: 400, gamma: 19, damping: 3 },
  ]);

  const addLayer = () => setLayers([...layers, { id: Date.now(), thickness: 5, vs: 300, gamma: 18, damping: 5 }]);
  const removeLayer = (id: number) => setLayers(layers.filter(l => l.id !== id));
  const updateLayer = (id: number, key: string, val: number) => setLayers(layers.map(l => l.id === id ? { ...l, [key]: val } : l));

  const vs30Result = useMemo(() => calculateVs30(layers), [layers]);
  const siteResult = useMemo(() => siteResponseAnalysis({ layers, rockPGA }), [layers, rockPGA]);

  const maxAmp = Math.max(...siteResult.transferFunction.map(t => t.amplification), 1);

  const classColors: Record<string, string> = {
    ZA: "bg-green-100 text-green-800", ZB: "bg-emerald-100 text-emerald-800",
    ZC: "bg-yellow-100 text-yellow-800", ZD: "bg-orange-100 text-orange-800",
    ZE: "bg-red-100 text-red-800",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">📡 Saha Tepki Analizi</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Vs30 hesabı, zemin büyütme faktörleri, basitleştirilmiş saha tepki</p>
      <div className="mt-2"><ExportPDFButton moduleName="Saha Tepki Analizi" method="Vs30 / Büyütme / Transfer Fonksiyonu" inputs={{ "Kaya PGA (g)": rockPGA, "Tabaka sayısı": layers.length }} results={{ "Vs30 (m/s)": vs30Result.vs30, "Zemin sınıfı": vs30Result.soilClass, "Zemin tanımı": vs30Result.soilClassTR, "Yüzey PGA (g)": siteResult.surfacePGA, "Büyütme faktörü": siteResult.amplificationFactor, "Doğal periyot T0 (s)": siteResult.naturalPeriod }} /></div>
      <MethodologySection data={methodology} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Girdi</h2>
          <Field label="Kaya PGA (g)" value={rockPGA} onChange={setRockPGA} min={0.01} max={1} step={0.01} />

          <h2 className="font-semibold text-lg pt-2">Zemin Tabakaları (üstten alta)</h2>
          {layers.map((l, i) => (
            <div key={l.id} className="p-3 rounded-lg bg-earth-50 dark:bg-neutral-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Tabaka {i + 1}</span>
                <button onClick={() => removeLayer(l.id)} className="text-xs text-red-500">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <MiniField label="Kalınlık (m)" value={l.thickness} onChange={v => updateLayer(l.id, "thickness", v)} />
                <MiniField label="Vs (m/s)" value={l.vs} onChange={v => updateLayer(l.id, "vs", v)} />
                <MiniField label="γ (kN/m³)" value={l.gamma} onChange={v => updateLayer(l.id, "gamma", v)} />
                <MiniField label="Sönüm (%)" value={l.damping} onChange={v => updateLayer(l.id, "damping", v)} />
              </div>
            </div>
          ))}
          <button onClick={addLayer} className="btn-secondary w-full text-xs">+ Tabaka Ekle</button>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Vs30 + Zemin Sınıfı */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Vs30 ve Zemin Sınıfı</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg bg-brand-50 dark:bg-brand-900/20 p-4 text-center">
                <p className="text-xs text-[var(--muted)]">Vs30</p>
                <p className="text-2xl font-bold text-brand-700">{vs30Result.vs30} <span className="text-sm font-normal">m/s</span></p>
              </div>
              <div className={`rounded-lg p-4 text-center ${classColors[vs30Result.soilClass] || "bg-gray-100"}`}>
                <p className="text-xs opacity-70">TBDY 2018</p>
                <p className="text-2xl font-bold">{vs30Result.soilClass}</p>
                <p className="text-xs">{vs30Result.soilClassTR}</p>
              </div>
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-center">
                <p className="text-xs text-[var(--muted)]">Yüzey PGA</p>
                <p className="text-2xl font-bold text-red-600">{siteResult.surfacePGA}g</p>
              </div>
              <div className="rounded-lg bg-earth-50 dark:bg-neutral-800 p-4 text-center">
                <p className="text-xs text-[var(--muted)]">Büyütme (AF)</p>
                <p className="text-2xl font-bold">{siteResult.amplificationFactor}x</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-earth-50 dark:bg-neutral-800 p-3 text-center">
                <p className="text-xs text-[var(--muted)]">Doğal Periyot T₀</p>
                <p className="text-xl font-bold">{siteResult.naturalPeriod} <span className="text-sm font-normal">s</span></p>
              </div>
              <div className="rounded-lg bg-earth-50 dark:bg-neutral-800 p-3 text-center">
                <p className="text-xs text-[var(--muted)]">Doğal Frekans f₀</p>
                <p className="text-xl font-bold">{siteResult.naturalPeriod > 0 ? (1 / siteResult.naturalPeriod).toFixed(2) : 0} <span className="text-sm font-normal">Hz</span></p>
              </div>
            </div>
          </div>

          {/* Vs30 hesap tablosu */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-3">Vs30 Hesap Detayı</h2>
            <div className="p-3 rounded-lg bg-earth-50 dark:bg-neutral-800 text-sm font-mono mb-3">
              <p>Vs30 = 30 / Σ(hi/Vsi) = 30 / {vs30Result.totalTravelTime} = <b>{vs30Result.vs30} m/s</b></p>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[var(--card-border)]">
                <th className="text-left py-1">Derinlik (m)</th><th className="text-right py-1">Kalınlık (m)</th><th className="text-right py-1">Vs (m/s)</th><th className="text-right py-1">hi/Vsi (s)</th>
              </tr></thead>
              <tbody>{vs30Result.layers.map((l, i) => (
                <tr key={i} className="border-b border-[var(--card-border)]">
                  <td className="py-1">{l.depth}</td><td className="text-right">{l.thickness}</td><td className="text-right">{l.vs}</td><td className="text-right font-medium">{l.travelTime}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>

          {/* Recharts Transfer Fonksiyonu */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Büyütme Fonksiyonu (Recharts)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={siteResult.transferFunction.map(t => ({ "Frekans (Hz)": t.frequency, "Büyütme": t.amplification }))} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="Frekans (Hz)" type="number" label={{ value: "Frekans (Hz)", position: "insideBottom", offset: -10, fontSize: 11 }} tick={{ fontSize: 10 }} />
                <YAxis label={{ value: "Büyütme", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="Büyütme" stroke="#8b5cf6" fill="rgba(139,92,246,0.15)" strokeWidth={2} name="Büyütme Faktörü" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Transfer fonksiyonu */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Basitleştirilmiş Transfer Fonksiyonu</h2>
            <div className="relative" style={{ height: 250 }}>
              <svg viewBox="0 0 600 250" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                {/* Grid */}
                {[0.25, 0.5, 0.75].map(f => (
                  <g key={f}>
                    <line x1={50} y1={20 + (1 - f) * 200} x2={580} y2={20 + (1 - f) * 200} stroke="var(--card-border)" strokeWidth={0.5} />
                    <text x={45} y={25 + (1 - f) * 200} textAnchor="end" fontSize={9} fill="var(--muted)">{(f * maxAmp).toFixed(1)}</text>
                  </g>
                ))}
                {[2, 5, 10, 15, 20].map(f => (
                  <g key={f}>
                    <line x1={50 + (f / 20) * 530} y1={20} x2={50 + (f / 20) * 530} y2={220} stroke="var(--card-border)" strokeWidth={0.5} />
                    <text x={50 + (f / 20) * 530} y={235} textAnchor="middle" fontSize={9} fill="var(--muted)">{f}Hz</text>
                  </g>
                ))}

                <line x1={50} y1={220} x2={580} y2={220} stroke="currentColor" strokeWidth={1} />
                <line x1={50} y1={20} x2={50} y2={220} stroke="currentColor" strokeWidth={1} />
                <text x={315} y={248} textAnchor="middle" fontSize={10} fill="currentColor">Frekans (Hz)</text>

                {/* f0 line */}
                {siteResult.naturalPeriod > 0 && (
                  <>
                    <line x1={50 + ((1 / siteResult.naturalPeriod) / 20) * 530} y1={20} x2={50 + ((1 / siteResult.naturalPeriod) / 20) * 530} y2={220} stroke="rgb(239,68,68)" strokeWidth={1} strokeDasharray="4 4" />
                    <text x={52 + ((1 / siteResult.naturalPeriod) / 20) * 530} y={18} fontSize={8} fill="rgb(239,68,68)">f₀</text>
                  </>
                )}

                {/* Curve */}
                <polyline
                  points={siteResult.transferFunction.map(t => {
                    const x = 50 + (t.frequency / 20) * 530;
                    const y = 220 - (t.amplification / maxAmp) * 200;
                    return `${x},${Math.max(20, y)}`;
                  }).join(" ")}
                  fill="none" stroke="rgb(139,92,246)" strokeWidth={2}
                />
              </svg>
            </div>
          </div>

          {/* Vs profili */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Vs Profili</h2>
            <div className="relative" style={{ height: 200 }}>
              <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                <line x1={60} y1={10} x2={60} y2={180} stroke="currentColor" strokeWidth={1} />
                <line x1={60} y1={180} x2={380} y2={180} stroke="currentColor" strokeWidth={1} />
                <text x={220} y={198} textAnchor="middle" fontSize={10} fill="currentColor">Vs (m/s)</text>
                <text x={10} y={100} textAnchor="middle" fontSize={10} fill="currentColor" transform="rotate(-90,10,100)">Derinlik (m)</text>

                {(() => {
                  const totalD = layers.reduce((s, l) => s + l.thickness, 0);
                  const maxVs = Math.max(...layers.map(l => l.vs), 100);
                  let depth = 0;
                  return layers.map((l, i) => {
                    const y1 = 10 + (depth / totalD) * 170;
                    const y2 = 10 + ((depth + l.thickness) / totalD) * 170;
                    const x = 60 + (l.vs / maxVs) * 300;
                    depth += l.thickness;
                    return (
                      <g key={i}>
                        <rect x={60} y={y1} width={x - 60} height={y2 - y1} fill={`rgba(139,92,246,${0.2 + (l.vs / maxVs) * 0.4})`} stroke="rgb(139,92,246)" strokeWidth={1} />
                        <text x={x + 5} y={(y1 + y2) / 2 + 3} fontSize={9} fill="currentColor">{l.vs} m/s</text>
                        <text x={55} y={(y1 + y2) / 2 + 3} textAnchor="end" fontSize={8} fill="var(--muted)">{depth.toFixed(0)}m</text>
                      </g>
                    );
                  });
                })()}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (<div><label className="block text-sm font-medium mb-1">{label}</label><input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step ?? 1} className="input-field" /></div>);
}
function MiniField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (<div><label className="block text-[10px] text-[var(--muted)]">{label}</label><input type="number" value={value} onChange={e => onChange(Number(e.target.value))} className="input-field text-xs py-1" /></div>);
}
