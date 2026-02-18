"use client";
import ExportPDFButton from "@/components/ExportPDFButton";
import MethodologySection from "@/components/MethodologySection";
import type { MethodologyData } from "@/components/MethodologySection";
import { useState } from "react";
import { bishop, janbu, fellenius } from "@geoforce/engine";
import type { SlopeResult } from "@geoforce/engine";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

const methodology: MethodologyData = {
  title: "Şev Stabilitesi Analizi",
  overview: "Şev stabilitesi analizi, doğal veya yapay şevlerin kayma güvenliğini değerlendirmek için kullanılır. Limit denge yöntemleri, potansiyel kayma yüzeyi boyunca kaydırıcı ve dirençli kuvvetlerin oranını (güvenlik katsayısı, FS) hesaplar. Dairesel kayma yüzeyi varsayımı ile dilim yöntemleri uygulanır.",
  methods: [
    {
      name: "Bishop Basitleştirilmiş Yöntemi (1955)",
      description: "Dairesel kayma yüzeyi varsayımı ile dilimler arası düşey kuvvetleri dikkate alır, yatay kuvvetleri ihmal eder. Moment dengesi sağlanır. En yaygın kullanılan yöntemdir.",
      formulas: [
        { name: "Güvenlik katsayısı", formula: "FS = Σ[c'·b + (W − u·b)·tanφ'] / mα / Σ[W·sinα]", description: "Dairesel kayma yüzeyi merkezi etrafında moment dengesi" },
        { name: "mα katsayısı", formula: "mα = cosα + (sinα·tanφ') / FS", description: "İteratif çözüm gerektirir (FS her iki tarafta da var)" },
        { name: "Boşluk suyu basıncı oranı", formula: "ru = u / (γ·z)", description: "u: boşluk suyu basıncı, z: dilim yüksekliği" },
        { name: "Depremli durum", formula: "FS = Σ[c'·b + (W − u·b)·tanφ'] / mα / Σ[W·sinα + kh·W·d/R]", description: "kh: yatay sismik katsayı" },
      ],
      steps: [
        { step: 1, title: "Kayma yüzeyi tanımı", description: "Dairesel kayma yüzeyi merkezi ve yarıçapı belirlenir" },
        { step: 2, title: "Dilimlere bölme", description: "Kayma kütlesi düşey dilimlere ayrılır" },
        { step: 3, title: "Her dilim için kuvvetler", description: "W, α, u, c', φ' hesaplanır" },
        { step: 4, title: "İteratif FS çözümü", description: "FS başlangıç değeri ile mα hesaplanır, yakınsayana kadar tekrarlanır" },
      ],
      limitations: ["Yalnızca dairesel kayma yüzeyleri için geçerlidir", "Dilimler arası yatay kuvvetler ihmal edilir", "Kuvvet dengesi tam sağlanmaz"],
    },
    {
      name: "Janbu Basitleştirilmiş Yöntemi (1954)",
      description: "Dairesel olmayan (düzlemsel, poligonal) kayma yüzeyleri için de uygulanabilir. Yatay kuvvet dengesi sağlanır. Düzeltme faktörü (f0) ile sonuç iyileştirilir.",
      formulas: [
        { name: "Güvenlik katsayısı", formula: "FS = f0 · Σ[c'·b + (W − u·b)·tanφ'] / (cosα·mα) / Σ[W·tanα]", description: "Yatay kuvvet dengesi" },
        { name: "Düzeltme faktörü f0", formula: "f0 = 1 + k·(d/L − 1.4·(d/L)²)", description: "k: c-φ zemini için 0.5, saf kohezyon için 0.69, saf sürtünme için 0.31" },
      ],
      steps: [
        { step: 1, title: "Kayma yüzeyi", description: "Herhangi bir şekilde kayma yüzeyi tanımlanır" },
        { step: 2, title: "FS hesabı", description: "Yatay kuvvet dengesi ile FS hesaplanır" },
        { step: 3, title: "f0 düzeltmesi", description: "Geometriye bağlı düzeltme faktörü uygulanır" },
      ],
      limitations: ["Basitleştirilmiş versiyon dilimler arası kayma kuvvetlerini ihmal eder", "Derin kayma yüzeylerinde Bishop'tan daha düşük FS verir"],
    },
    {
      name: "Fellenius (Ordinary Method of Slices, 1927)",
      description: "En basit dilim yöntemidir. Dilimler arası tüm kuvvetleri ihmal eder. Konservatif sonuç verir (düşük FS). Eğitim ve ön değerlendirme amaçlı kullanılır.",
      formulas: [
        { name: "Güvenlik katsayısı", formula: "FS = Σ[c'·l + (W·cosα − u·l)·tanφ'] / Σ[W·sinα]", description: "l: dilim tabanı uzunluğu = b/cosα" },
      ],
      steps: [
        { step: 1, title: "Dilimlere bölme", description: "Kayma kütlesi dilimlere ayrılır" },
        { step: 2, title: "Kuvvet hesabı", description: "Her dilim için W, α, l, u hesaplanır" },
        { step: 3, title: "FS hesabı", description: "Doğrudan (iterasyonsuz) hesaplanır" },
      ],
      limitations: ["Dilimler arası kuvvetler tamamen ihmal edilir", "Ne moment ne kuvvet dengesi tam sağlanır", "Genellikle %10-15 düşük FS verir"],
    },
  ],
  references: [
    "Bishop, A.W. (1955). The Use of the Slip Circle in the Stability Analysis of Slopes. Géotechnique, 5(1), 7-17.",
    "Janbu, N. (1954). Application of Composite Slip Surfaces for Stability Analysis. European Conf. on Stability of Earth Slopes.",
    "Fellenius, W. (1927). Erdstatische Berechnungen. W. Ernst & Sohn, Berlin.",
    "Duncan, J.M. & Wright, S.G. (2005). Soil Strength and Slope Stability. John Wiley & Sons.",
    "TBDY 2018 — Türkiye Bina Deprem Yönetmeliği.",
  ],
  standards: ["TBDY 2018", "Eurocode 7", "FHWA-NHI-11-032"],
  notes: [
    "Minimum FS değerleri: Statik durum FS ≥ 1.5, deprem durumu FS ≥ 1.1 (TBDY 2018).",
    "Bishop yöntemi dairesel yüzeyler için en güvenilir sonucu verir.",
    "Kritik kayma yüzeyi aranmalıdır (minimum FS veren yüzey).",
    "Boşluk suyu basıncı şev stabilitesini önemli ölçüde etkiler — drenaj kritiktir.",
  ],
};

type Method = "bishop" | "janbu" | "fellenius" | "all";

export default function SevStabilitesiPage() {
  const [method, setMethod] = useState<Method>("all");
  const [height, setHeight] = useState(10);
  const [slopeAngle, setSlopeAngle] = useState(30);
  const [gamma, setGamma] = useState(18);
  const [cohesion, setCohesion] = useState(25);
  const [frictionAngle, setFrictionAngle] = useState(25);
  const [ru, setRu] = useState(0);
  const [kh, setKh] = useState(0);

  const input = { height, slopeAngle, gamma, cohesion, frictionAngle, ru, kh };
  const results: SlopeResult[] = [];
  if (method === "all" || method === "bishop") results.push(bishop(input));
  if (method === "all" || method === "janbu") results.push(janbu(input));
  if (method === "all" || method === "fellenius") results.push(fellenius(input));

  const statusColors: Record<string, string> = { stable: "bg-green-100 text-green-800", marginal: "bg-yellow-100 text-yellow-800", unstable: "bg-red-100 text-red-800" };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">⛰️ Şev Stabilitesi</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Bishop, Janbu ve Fellenius yöntemleri ile güvenlik katsayısı hesabı</p>
      <div className="mt-2"><ExportPDFButton moduleName="Şev Stabilitesi" method="Bishop / Janbu / Fellenius" inputs={{ "Şev yüksekliği H (m)": height, "Şev açısı β (°)": slopeAngle, "γ (kN/m³)": gamma, "Kohezyon c (kPa)": cohesion, "φ (°)": frictionAngle, "ru": ru, "kh": kh }} results={Object.fromEntries(results.flatMap(r => [[`${r.method} — FS`, r.FS], [`${r.method} — Durum`, r.statusTR]]))} /></div>
      <MethodologySection data={methodology} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Girdi Parametreleri</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Yöntem</label>
            <select value={method} onChange={e => setMethod(e.target.value as Method)} className="input-field">
              <option value="all">Tümü (Karşılaştırma)</option>
              <option value="bishop">Bishop Basitleştirilmiş</option>
              <option value="janbu">Janbu Basitleştirilmiş</option>
              <option value="fellenius">Fellenius (Ordinary)</option>
            </select>
          </div>
          <Field label="Şev yüksekliği H (m)" value={height} onChange={setHeight} min={1} step={1} />
          <Field label="Şev açısı β (°)" value={slopeAngle} onChange={setSlopeAngle} min={5} max={80} />
          <Field label="γ (kN/m³)" value={gamma} onChange={setGamma} min={10} max={25} step={0.5} />
          <Field label="Kohezyon c (kPa)" value={cohesion} onChange={setCohesion} min={0} />
          <Field label="Sürtünme açısı φ (°)" value={frictionAngle} onChange={setFrictionAngle} min={0} max={50} />
          <Field label="Boşluk suyu basıncı oranı ru" value={ru} onChange={setRu} min={0} max={0.5} step={0.05} />
          <Field label="Sismik katsayı kh (pseudo-statik)" value={kh} onChange={setKh} min={0} max={0.5} step={0.01} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Karşılaştırma */}
          {results.length > 1 && (
            <div className="card p-6">
              <h2 className="font-semibold text-lg mb-4">Karşılaştırma</h2>
              <div className="grid grid-cols-3 gap-4">
                {results.map(r => (
                  <div key={r.method} className="rounded-lg border border-[var(--card-border)] p-4 text-center">
                    <p className="text-xs text-[var(--muted)]">{r.method}</p>
                    <p className={`text-3xl font-bold mt-1 ${r.FS >= 1.5 ? "text-green-600" : r.FS >= 1.0 ? "text-yellow-600" : "text-red-600"}`}>{r.FS}</p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>{r.statusTR}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FS Karşılaştırma Grafiği */}
          {results.length > 1 && (
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">Güvenlik Katsayısı Karşılaştırması</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={results.map(r => ({ Yöntem: r.method, FS: r.FS }))} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="Yöntem" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} label={{ value: "FS", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} formatter={(value: number) => [value.toFixed(2), "FS"]} />
                  <ReferenceLine y={1.0} stroke="#dc2626" strokeDasharray="6 3" strokeWidth={2} label={{ value: "FS=1.0 (Kritik)", position: "right", fontSize: 10, fill: "#dc2626" }} />
                  <ReferenceLine y={1.5} stroke="#059669" strokeDasharray="6 3" strokeWidth={2} label={{ value: "FS=1.5 (Güvenli)", position: "right", fontSize: 10, fill: "#059669" }} />
                  <Bar dataKey="FS" name="Güvenlik Katsayısı" radius={[4, 4, 0, 0]}>
                    {results.map((r, i) => (
                      <Cell key={i} fill={r.FS < 1 ? "#dc2626" : r.FS < 1.5 ? "#d97706" : "#059669"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detay */}
          {results.map(r => (
            <div key={r.method} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">{r.method}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusColors[r.status]}`}>{r.statusTR}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <RBox label="Güvenlik Katsayısı (FS)" value={r.FS.toString()} color={r.FS >= 1.5 ? "green" : r.FS >= 1.0 ? "yellow" : "red"} />
                <RBox label="Kritik Yarıçap R (m)" value={r.criticalRadius.toString()} color="gray" />
                <RBox label="Merkez X (m)" value={r.criticalCenter.x.toString()} color="gray" />
                <RBox label="Merkez Y (m)" value={r.criticalCenter.y.toString()} color="gray" />
              </div>

              {/* Şev çizimi */}
              <div className="mt-4 rounded-lg bg-earth-50 dark:bg-neutral-800 p-4">
                <svg viewBox="-20 -30 200 130" className="w-full" style={{ maxHeight: 200 }}>
                  {/* Grid */}
                  <line x1={0} y1={100} x2={180} y2={100} stroke="var(--card-border)" strokeWidth={0.5} />
                  {/* Slope */}
                  <polygon points={`0,100 ${100 / Math.tan((slopeAngle * Math.PI) / 180)},${100 - (height / height) * 80} ${180},${100 - (height / height) * 80} 180,100`} fill="rgba(180,140,100,0.3)" stroke="rgb(140,100,60)" strokeWidth={1.5} />
                  {/* Slope surface line */}
                  <line x1={0} y1={100} x2={100 / Math.tan((slopeAngle * Math.PI) / 180)} y2={20} stroke="rgb(140,100,60)" strokeWidth={2} />
                  {/* Labels */}
                  <text x={5} y={95} fontSize={8} fill="var(--muted)">Taban</text>
                  <text x={100 / Math.tan((slopeAngle * Math.PI) / 180) + 5} y={18} fontSize={8} fill="var(--muted)">Kret</text>
                  <text x={90} y={115} fontSize={9} fill="currentColor">H={height}m, β={slopeAngle}°</text>
                </svg>
              </div>

              {/* Dilim tablosu */}
              {r.slices.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Dilim Detayları ({r.slices.length} dilim)</h3>
                  <div className="overflow-x-auto max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-[var(--card)]">
                        <tr className="border-b border-[var(--card-border)]">
                          <th className="text-left py-1">#</th>
                          <th className="text-right py-1">x (m)</th>
                          <th className="text-right py-1">b (m)</th>
                          <th className="text-right py-1">W (kN/m)</th>
                          <th className="text-right py-1">α (°)</th>
                          <th className="text-right py-1">l (m)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.slices.map(s => (
                          <tr key={s.index} className="border-b border-[var(--card-border)]">
                            <td className="py-1">{s.index}</td>
                            <td className="text-right">{s.x}</td>
                            <td className="text-right">{s.width}</td>
                            <td className="text-right">{s.weight}</td>
                            <td className="text-right">{s.baseAngle}</td>
                            <td className="text-right">{s.baseLength}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Referans */}
          <div className="card p-4 text-xs text-[var(--muted)]">
            <p>FS ≥ 1.50: Stabil (statik) | FS ≥ 1.10: Stabil (pseudo-statik/deprem) | FS &lt; 1.00: Stabil değil</p>
            <p className="mt-1">Referans: TBDY 2018 Bölüm 16.9, Das (2010) Principles of Geotechnical Engineering</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (<div><label className="block text-sm font-medium mb-1">{label}</label><input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step ?? 1} className="input-field" /></div>);
}
function RBox({ label, value, color }: { label: string; value: string; color: string }) {
  const c: Record<string, string> = { green: "bg-green-50 dark:bg-green-900/20 text-green-700", yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700", red: "bg-red-50 dark:bg-red-900/20 text-red-700", gray: "bg-earth-50 dark:bg-neutral-800" };
  return (<div className={`rounded-lg p-3 text-center ${c[color] || c.gray}`}><p className="text-xs text-[var(--muted)]">{label}</p><p className="text-xl font-bold">{value}</p></div>);
}
