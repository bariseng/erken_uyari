"use client";
import ExportPDFButton from "@/components/ExportPDFButton";
import MethodologySection from "@/components/MethodologySection";
import type { MethodologyData } from "@/components/MethodologySection";
import { useState } from "react";
import { evaluateLiquefaction } from "@geoforce/engine";
import type { LiquefactionLayer } from "@geoforce/engine";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line, ReferenceLine, Cell } from "recharts";

const methodology: MethodologyData = {
  title: "Sıvılaşma Değerlendirmesi",
  overview: "Sıvılaşma, gevşek doygun granüler zeminlerde deprem sırasında boşluk suyu basıncının artarak efektif gerilmenin sıfıra düşmesi ve zeminin sıvı gibi davranmasıdır. Değerlendirme, tekrarlı gerilme oranı (CSR) ile tekrarlı dayanım oranının (CRR) karşılaştırılmasına dayanır.",
  methods: [
    {
      name: "Boulanger & Idriss (2014) — SPT Bazlı",
      description: "En güncel ve yaygın kabul gören SPT bazlı sıvılaşma değerlendirme yöntemidir. Seed & Idriss (1971) çerçevesini güncelleyerek düzeltilmiş SPT darbe sayısı (N1)60cs ile CRR ilişkisini tanımlar.",
      formulas: [
        { name: "Tekrarlı Gerilme Oranı (CSR)", formula: "CSR = 0.65 · (amax/g) · (σv/σv') · rd", description: "amax: maks. yer ivmesi, σv: toplam düşey gerilme, σv': efektif düşey gerilme, rd: gerilme azaltma katsayısı" },
        { name: "Gerilme azaltma katsayısı rd", formula: "rd = exp(α(z) + β(z)·M)", description: "z: derinlik (m), M: deprem büyüklüğü" },
        { name: "SPT düzeltmeleri", formula: "(N1)60 = Nm · CN · CE · CB · CR · CS", description: "CN: derinlik, CE: enerji (%60), CB: kuyu çapı, CR: çubuk boyu, CS: numune alıcı düzeltmeleri" },
        { name: "Derinlik düzeltmesi CN", formula: "CN = (Pa/σv')^0.784 − 0.0768·√((N1)60) ≤ 1.7", description: "Pa = 100 kPa (atmosfer basıncı)" },
        { name: "İnce dane düzeltmesi", formula: "(N1)60cs = (N1)60 + Δ(N1)60", description: "FC (ince dane oranı) etkisini hesaba katar" },
        { name: "Tekrarlı Dayanım Oranı (CRR)", formula: "CRR7.5 = exp((N1)60cs/14.1 + ((N1)60cs/126)² − ((N1)60cs/23.6)³ + ((N1)60cs/25.4)⁴ − 2.8)", description: "M=7.5 ve σv'=1 atm için referans CRR" },
        { name: "Büyüklük ölçekleme faktörü", formula: "MSF = 6.9·exp(−M/4) − 0.058 (≤ 1.8)", description: "M≠7.5 depremler için düzeltme" },
        { name: "Derinlik düzeltme faktörü", formula: "Kσ = 1 − Cσ·ln(σv'/Pa) ≤ 1.1", description: "Yüksek gerilme düzeltmesi" },
        { name: "Güvenlik katsayısı", formula: "FS = (CRR7.5 · MSF · Kσ) / CSR", description: "FS < 1.0: sıvılaşma riski var" },
      ],
      steps: [
        { step: 1, title: "CSR hesabı", description: "Saha ivmesi ve zemin profili ile CSR hesaplanır" },
        { step: 2, title: "SPT düzeltmeleri", description: "Ham SPT N değeri (N1)60 ve (N1)60cs'ye düzeltilir" },
        { step: 3, title: "CRR hesabı", description: "Düzeltilmiş SPT değeri ile CRR7.5 hesaplanır" },
        { step: 4, title: "Düzeltme faktörleri", description: "MSF ve Kσ uygulanır" },
        { step: 5, title: "FS kontrolü", description: "FS = CRR·MSF·Kσ / CSR, FS<1 ise sıvılaşma beklenir" },
      ],
      limitations: ["Yalnızca kum ve siltli kumlar için geçerlidir (PI < 7)", "Derinlik genellikle 20 m ile sınırlıdır", "Kil içeriği yüksek zeminlerde farklı kriterler gerekir"],
    },
    {
      name: "Sıvılaşma Potansiyel İndeksi (LPI) — Iwasaki et al. (1982)",
      description: "Üst 20 m boyunca sıvılaşma şiddetini tek bir sayısal değerle ifade eder. Sıvılaşma hasarı potansiyelini değerlendirmek için kullanılır.",
      formulas: [
        { name: "LPI", formula: "LPI = ∫₀²⁰ F(z)·w(z)·dz", description: "0–20 m derinlik aralığında integrasyon" },
        { name: "Ağırlık fonksiyonu", formula: "w(z) = 10 − 0.5z", description: "Yüzeye yakın tabakalara daha fazla ağırlık verir" },
        { name: "Şiddet fonksiyonu", formula: "F(z) = 1 − FS  (FS < 1 ise), F(z) = 0  (FS ≥ 1 ise)" },
        { name: "Risk sınıfları", formula: "LPI=0: Yok, 0<LPI≤5: Düşük, 5<LPI≤15: Yüksek, LPI>15: Çok yüksek" },
      ],
      limitations: ["Yalnızca üst 20 m'yi değerlendirir", "Zemin tipi ve yapı tipine göre hasar korelasyonu değişir"],
    },
  ],
  references: [
    "Boulanger, R.W. & Idriss, I.M. (2014). CPT and SPT Based Liquefaction Triggering Procedures. Report UCD/CGM-14/01.",
    "Seed, H.B. & Idriss, I.M. (1971). Simplified Procedure for Evaluating Soil Liquefaction Potential. JSMFD, ASCE.",
    "Iwasaki, T. et al. (1982). A Practical Method for Assessing Soil Liquefaction Potential. Proc. 2nd Int. Conf. Microzonation.",
    "Youd, T.L. et al. (2001). Liquefaction Resistance of Soils: Summary Report. JGED, ASCE, 127(10).",
    "TBDY 2018 — Türkiye Bina Deprem Yönetmeliği, Bölüm 16.5.",
  ],
  standards: ["TBDY 2018 Bölüm 16.5", "Eurocode 8 Part 5"],
  notes: [
    "Sıvılaşma genellikle gevşek, doygun, üniform kumlu zeminlerde oluşur.",
    "Yeraltı suyu seviyesi yüzeye yakınsa risk artar.",
    "PI > 7 ve wn/LL < 0.85 olan zeminler sıvılaşmaya duyarlı değildir (Boulanger & Idriss kriteri).",
    "TBDY 2018'e göre ZD ve ZE sınıfı zeminlerde sıvılaşma değerlendirmesi zorunludur.",
  ],
};

export default function SivilasmaPage() {
  const [magnitude, setMagnitude] = useState(7.5);
  const [amax, setAmax] = useState(0.4);
  const [gwt, setGwt] = useState(2);
  const [gamma, setGamma] = useState(18);
  const [gammaSat, setGammaSat] = useState(20);
  const [layers, setLayers] = useState<(LiquefactionLayer & { id: number })[]>([
    { id: 1, depth: 3, N: 10, finesContent: 15 },
    { id: 2, depth: 6, N: 15, finesContent: 10 },
    { id: 3, depth: 9, N: 25, finesContent: 5 },
    { id: 4, depth: 12, N: 8, finesContent: 20 },
  ]);

  const addLayer = () => setLayers([...layers, { id: Date.now(), depth: layers.length > 0 ? layers[layers.length - 1].depth + 3 : 3, N: 15, finesContent: 10 }]);
  const removeLayer = (id: number) => setLayers(layers.filter(l => l.id !== id));
  const updateLayer = (id: number, key: string, val: number) => setLayers(layers.map(l => l.id === id ? { ...l, [key]: val } : l));

  const result = evaluateLiquefaction({ magnitude, amax, waterTableDepth: gwt, gamma, gammaSat, layers });

  const riskColors: Record<string, string> = { low: "bg-green-100 text-green-800", moderate: "bg-yellow-100 text-yellow-800", high: "bg-orange-100 text-orange-800", very_high: "bg-red-100 text-red-800" };
  const statusColors: Record<string, string> = { safe: "text-green-600", marginal: "text-yellow-600", liquefiable: "text-red-600 font-bold" };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">💧 Sıvılaşma Değerlendirmesi</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Boulanger & Idriss (2014) — SPT bazlı, TBDY 2018 uyumlu</p>
      <div className="mt-2"><ExportPDFButton moduleName="Sıvılaşma Değerlendirmesi" method="Boulanger & Idriss 2014" inputs={{}} results={{}} /></div>
      <MethodologySection data={methodology} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Deprem Parametreleri</h2>
          <Field label="Deprem büyüklüğü Mw" value={magnitude} onChange={setMagnitude} min={5} max={9} step={0.1} />
          <Field label="Maks. yer ivmesi amax (g)" value={amax} onChange={setAmax} min={0.05} max={1} step={0.01} />
          <Field label="Yeraltı su seviyesi (m)" value={gwt} onChange={setGwt} min={0} max={30} step={0.5} />
          <Field label="γ (kN/m³)" value={gamma} onChange={setGamma} min={14} max={22} step={0.5} />
          <Field label="γsat (kN/m³)" value={gammaSat} onChange={setGammaSat} min={16} max={24} step={0.5} />

          <h2 className="font-semibold text-lg pt-2">Tabakalar</h2>
          {layers.map(l => (
            <div key={l.id} className="p-3 rounded-lg bg-earth-50 dark:bg-neutral-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Derinlik: {l.depth}m</span>
                <button onClick={() => removeLayer(l.id)} className="text-xs text-red-500 hover:text-red-700">✕</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <MiniField label="z (m)" value={l.depth} onChange={v => updateLayer(l.id, "depth", v)} />
                <MiniField label="N (SPT)" value={l.N ?? 0} onChange={v => updateLayer(l.id, "N", v)} />
                <MiniField label="FC (%)" value={l.finesContent ?? 0} onChange={v => updateLayer(l.id, "finesContent", v)} />
              </div>
            </div>
          ))}
          <button onClick={addLayer} className="btn-secondary w-full text-xs">+ Tabaka Ekle</button>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* LPI */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Sıvılaşma Potansiyel İndeksi (LPI)</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${riskColors[result.riskLevel]}`}>{result.riskLevelTR}</span>
            </div>
            <div className="text-center py-4">
              <p className="text-5xl font-bold">{result.LPI}</p>
              <p className="text-sm text-[var(--muted)] mt-1">LPI (Iwasaki et al., 1982)</p>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-xs text-center">
              <div className="p-2 rounded bg-green-50 dark:bg-green-900/20"><p className="font-bold">0-2</p><p>Düşük</p></div>
              <div className="p-2 rounded bg-yellow-50 dark:bg-yellow-900/20"><p className="font-bold">2-5</p><p>Orta</p></div>
              <div className="p-2 rounded bg-orange-50 dark:bg-orange-900/20"><p className="font-bold">5-15</p><p>Yüksek</p></div>
              <div className="p-2 rounded bg-red-50 dark:bg-red-900/20"><p className="font-bold">&gt;15</p><p>Çok Yüksek</p></div>
            </div>
          </div>

          {/* CRR vs CSR Grafiği */}
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">CSR — CRR Karşılaştırması</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" dataKey="CSR" name="CSR" tick={{ fontSize: 10 }} label={{ value: "CSR (Tekrarlı Gerilme Oranı)", position: "insideBottom", offset: -2, fontSize: 11 }} domain={[0, 'auto']} />
                <YAxis type="number" dataKey="CRR" name="CRR" tick={{ fontSize: 10 }} label={{ value: "CRR (Tekrarlı Dayanım Oranı)", angle: -90, position: "insideLeft", fontSize: 11 }} domain={[0, 'auto']} />
                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(value: number) => [value.toFixed(3), ""]} />
                <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="#dc2626" strokeDasharray="6 3" strokeWidth={2} label={{ value: "FS=1.0", position: "end", fontSize: 10, fill: "#dc2626" }} />
                <Scatter
                  name="Tabakalar"
                  data={result.layers.map(l => ({ CSR: Number(l.CSR), CRR: Number(l.CRR), depth: l.depth, FS: l.FS }))}
                  fill="#2563eb"
                >
                  {result.layers.map((l, i) => (
                    <Cell key={i} fill={l.FS < 1 ? "#dc2626" : l.FS < 1.2 ? "#d97706" : "#059669"} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-xs text-[var(--muted)] mt-2 text-center">🔴 Sıvılaşır (FS&lt;1) · 🟡 Sınırda (1≤FS&lt;1.2) · 🟢 Güvenli (FS≥1.2) — Çizgi üstü: güvenli bölge</p>
          </div>

          {/* FS Derinlik Profili */}
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">Derinlik — Güvenlik Katsayısı Profili</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={result.layers.map(l => ({ derinlik: l.depth, FS: Number(l.FS) }))}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 10 }} domain={[0, 'auto']} label={{ value: "FS", position: "insideBottom", offset: -2, fontSize: 11 }} />
                <YAxis type="number" dataKey="derinlik" reversed tick={{ fontSize: 10 }} label={{ value: "Derinlik (m)", angle: -90, position: "insideLeft", fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <ReferenceLine x={1.0} stroke="#dc2626" strokeDasharray="6 3" strokeWidth={2} label={{ value: "FS=1.0", position: "top", fontSize: 10, fill: "#dc2626" }} />
                <Line type="monotone" dataKey="FS" name="Güvenlik Katsayısı" stroke="#2563eb" strokeWidth={2} dot={{ r: 5, fill: "#2563eb" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tablo */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-3">Tabaka Detayları</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--card-border)] text-xs">
                    <th className="text-left py-2">z (m)</th>
                    <th className="text-right py-2">(N1)60cs</th>
                    <th className="text-right py-2">σv</th>
                    <th className="text-right py-2">σ&apos;v</th>
                    <th className="text-right py-2">rd</th>
                    <th className="text-right py-2">CSR</th>
                    <th className="text-right py-2">CRR</th>
                    <th className="text-right py-2">MSF</th>
                    <th className="text-right py-2 font-bold">FS</th>
                    <th className="text-right py-2">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {result.layers.map((l, i) => (
                    <tr key={i} className="border-b border-[var(--card-border)]">
                      <td className="py-2">{l.depth}</td>
                      <td className="text-right">{l.N160cs ?? "-"}</td>
                      <td className="text-right">{l.sigmaV}</td>
                      <td className="text-right">{l.sigmaVeff}</td>
                      <td className="text-right">{l.rd}</td>
                      <td className="text-right">{l.CSR}</td>
                      <td className="text-right">{l.CRR}</td>
                      <td className="text-right">{l.MSF}</td>
                      <td className={`text-right font-bold ${l.FS < 1 ? "text-red-600" : l.FS < 1.2 ? "text-yellow-600" : "text-green-600"}`}>{l.FS}</td>
                      <td className={`text-right text-xs ${statusColors[l.status]}`}>
                        {l.status === "safe" ? "✓ Güvenli" : l.status === "marginal" ? "⚠ Sınırda" : "✗ Sıvılaşır"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
