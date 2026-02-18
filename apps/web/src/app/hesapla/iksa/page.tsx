"use client";
import ExportPDFButton from "@/components/ExportPDFButton";
import MethodologySection from "@/components/MethodologySection";
import type { MethodologyData } from "@/components/MethodologySection";
import { useState } from "react";
import { analyzeRetainingWall } from "@geoforce/engine";
import type { RetainingWallResult } from "@geoforce/engine";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

const methodology: MethodologyData = {
  title: "İksa (Derin Kazı) Tasarımı",
  overview: "İksa sistemleri, derin kazıların güvenli yapılabilmesi için kazı çevresindeki zemini destekleyen yapılardır. Konsol perde, tek ankrajlı ve çok ankrajlı perde sistemleri en yaygın kullanılan yöntemlerdir. Tasarım, aktif ve pasif toprak basınçlarının dengesine dayanır.",
  methods: [
    {
      name: "Konsol Perde Analizi",
      description: "Ankraj veya destek kullanılmadan, yalnızca gömme derinliğindeki pasif dirençle stabilite sağlanan perde sistemidir. Genellikle 5-6 m'ye kadar kazı derinlikleri için uygundur.",
      formulas: [
        { name: "Aktif basınç katsayısı", formula: "Ka = tan²(45° − φ/2)", description: "Rankine aktif basınç katsayısı" },
        { name: "Pasif basınç katsayısı", formula: "Kp = tan²(45° + φ/2)", description: "Rankine pasif basınç katsayısı" },
        { name: "Net basınç", formula: "p(z) = Ka·γ·z + Ka·q − Kp·γ·(z−H) − 2c·√Ka + 2c·√Kp", description: "Kazı tabanı altında net basınç" },
        { name: "Gömme derinliği", formula: "D hesabı: Moment dengesi (kazı tabanı etrafında)", description: "Güvenlik için D × 1.2–1.4 uygulanır" },
        { name: "Maksimum moment", formula: "Mmax = Kesme kuvvetinin sıfır olduğu noktada", description: "Perde kesit tasarımı için kritik" },
      ],
      steps: [
        { step: 1, title: "Basınç diyagramı", description: "Aktif ve pasif basınç profilleri çizilir" },
        { step: 2, title: "Dönme noktası", description: "Net basıncın sıfır olduğu nokta bulunur" },
        { step: 3, title: "Gömme derinliği D", description: "Moment dengesi ile D hesaplanır" },
        { step: 4, title: "Moment ve kesme", description: "Mmax ve Vmax hesaplanarak kesit boyutlandırılır" },
      ],
      limitations: ["Sınırlı kazı derinliği (genellikle ≤6 m)", "Büyük deformasyonlara neden olabilir", "Yumuşak zeminlerde uygulanamaz"],
    },
    {
      name: "Ankrajlı Perde Analizi",
      description: "Bir veya birden fazla ankraj/strut ile desteklenen perde sistemidir. Serbest toprak desteği veya sabit toprak desteği yöntemleri ile analiz edilir.",
      formulas: [
        { name: "Serbest toprak desteği", formula: "Ankraj kuvveti: T = Pa − Pp (yatay denge)", description: "Perde alt ucunun serbest dönebildiği varsayılır" },
        { name: "Sabit toprak desteği", formula: "Perde alt ucu ankastre kabul edilir", description: "Daha kısa gömme derinliği verir" },
        { name: "Görünür basınç zarfı (Peck)", formula: "Kum: p = 0.65·Ka·γ·H, Kil: p = γ·H − 4·cu (veya 0.2–0.4·γ·H)", description: "Çok ankrajlı sistemlerde ampirik basınç dağılımı" },
      ],
      steps: [
        { step: 1, title: "Basınç dağılımı", description: "Aktif basınç veya Peck zarfı belirlenir" },
        { step: 2, title: "Ankraj kuvvetleri", description: "Her ankraj seviyesinde kuvvet hesaplanır" },
        { step: 3, title: "Gömme derinliği", description: "Pasif direnç ile stabilite sağlanır" },
        { step: 4, title: "Moment diyagramı", description: "Perde boyunca moment ve kesme kuvveti hesaplanır" },
      ],
      limitations: ["Peck zarfı ampirik olup her koşulda geçerli değildir", "Ankraj ön gerilme kaybı dikkate alınmalıdır"],
    },
    {
      name: "Deprem Etkisi — Mononobe-Okabe",
      description: "Deprem durumunda aktif basınç artışı Mononobe-Okabe yöntemi ile hesaplanır. TBDY 2018'e göre kh = SDS/2.5 alınır.",
      formulas: [
        { name: "Sismik aktif basınç", formula: "PAE = 0.5·KAE·γ·H²·(1−kv)", description: "KAE: depremli aktif basınç katsayısı" },
        { name: "Dinamik artış", formula: "ΔPAE = PAE − PA", description: "0.6H yüksekliğinden etki eder" },
      ],
      limitations: ["Yüksek kh değerlerinde (>0.4) güvenilirliği azalır"],
    },
  ],
  references: [
    "Peck, R.B. (1969). Deep Excavations and Tunneling in Soft Ground. Proc. 7th ICSMFE.",
    "Terzaghi, K. (1943). Theoretical Soil Mechanics. John Wiley & Sons.",
    "FHWA (1999). Ground Anchors and Anchored Systems. FHWA-IF-99-015.",
    "TBDY 2018 — Türkiye Bina Deprem Yönetmeliği.",
    "Das, B.M. (2019). Principles of Foundation Engineering, 9th Ed.",
  ],
  standards: ["TBDY 2018", "Eurocode 7", "FHWA-IF-99-015", "BS 8002"],
  notes: [
    "Kazı derinliği arttıkça ankraj sayısı artırılmalıdır.",
    "Komşu yapılara olan mesafe, deformasyon kontrolü açısından kritiktir.",
    "Yeraltı suyu kontrolü (wellpoint, derin kuyu) iksa tasarımının ayrılmaz parçasıdır.",
    "İnklinometre ile yatay deformasyon izlenmesi zorunludur.",
  ],
};

type Condition = "cantilever" | "single_anchor" | "multi_anchor";

export default function IksaPage() {
  const [excavationDepth, setExcavationDepth] = useState(8);
  const [gamma, setGamma] = useState(18);
  const [cohesion, setCohesion] = useState(5);
  const [frictionAngle, setFrictionAngle] = useState(28);
  const [surcharge, setSurcharge] = useState(10);
  const [condition, setCondition] = useState<Condition>("single_anchor");
  const [kh, setKh] = useState(0);
  const [supports, setSupports] = useState("2,5");

  const supportLevels = supports.split(",").map(Number).filter(n => !isNaN(n) && n > 0);

  const result: RetainingWallResult = analyzeRetainingWall({
    excavationDepth, gamma, cohesion, frictionAngle, surcharge, condition, kh,
    supportLevels: condition !== "cantilever" ? supportLevels : undefined,
  });

  const maxP = Math.max(...result.pressureDiagram.map(d => Math.max(d.active, d.passive)), 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">🏢 İksa (Derin Kazı) Tasarımı</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Konsol perde, tek ankrajlı ve çok ankrajlı perde analizi</p>
      <div className="mt-2"><ExportPDFButton moduleName="İksa Tasarımı" method="Konsol / Ankrajlı Perde" inputs={{ "Kazı derinliği H (m)": excavationDepth, "γ (kN/m³)": gamma, "c (kPa)": cohesion, "φ (°)": frictionAngle, "Sürşarj q (kPa)": surcharge, "kh": kh, "Perde tipi": condition }} results={{ "Yöntem": result.method, "Gömme derinliği D (m)": result.embedmentDepth, "Toplam uzunluk (m)": result.totalLength, "Maks. moment (kN·m/m)": result.maxMoment, "Ka": result.Ka, "Kp": result.Kp, "FS": result.FS }} /></div>
      <MethodologySection data={methodology} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Girdi Parametreleri</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Perde tipi</label>
            <select value={condition} onChange={e => setCondition(e.target.value as Condition)} className="input-field">
              <option value="cantilever">Konsol Perde</option>
              <option value="single_anchor">Tek Ankrajlı</option>
              <option value="multi_anchor">Çok Ankrajlı</option>
            </select>
          </div>
          <Field label="Kazı derinliği H (m)" value={excavationDepth} onChange={setExcavationDepth} min={1} max={30} step={0.5} />
          <Field label="γ (kN/m³)" value={gamma} onChange={setGamma} min={10} max={25} step={0.5} />
          <Field label="Kohezyon c (kPa)" value={cohesion} onChange={setCohesion} min={0} />
          <Field label="Sürtünme açısı φ (°)" value={frictionAngle} onChange={setFrictionAngle} min={0} max={45} />
          <Field label="Sürşarj q (kPa)" value={surcharge} onChange={setSurcharge} min={0} />
          <Field label="Sismik katsayı kh" value={kh} onChange={setKh} min={0} max={0.5} step={0.01} />
          {condition !== "cantilever" && (
            <div>
              <label className="block text-sm font-medium mb-1">Ankraj seviyeleri (m, virgülle)</label>
              <input type="text" value={supports} onChange={e => setSupports(e.target.value)} className="input-field" placeholder="2,5,8" />
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">{result.method}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <RBox label="Gömme Derinliği D" value={`${result.embedmentDepth} m`} color="blue" />
              <RBox label="Toplam Uzunluk" value={`${result.totalLength} m`} color="gray" />
              <RBox label="Maks. Moment" value={`${result.maxMoment} kN·m/m`} color="orange" />
              <RBox label="Ka / Kp" value={`${result.Ka} / ${result.Kp}`} color="gray" />
            </div>

            {result.anchorForces.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Ankraj Kuvvetleri</h3>
                <div className="flex gap-3">
                  {result.anchorForces.map((f, i) => (
                    <div key={i} className="rounded-lg bg-brand-50 dark:bg-brand-900/20 p-3 text-center flex-1">
                      <p className="text-xs text-[var(--muted)]">Ankraj {i + 1}</p>
                      <p className="text-lg font-bold text-brand-700">{f} <span className="text-xs font-normal">kN/m</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recharts Basınç Profili */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Basınç Profili (Recharts)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={result.pressureDiagram.map(d => ({ depth: d.depth, "Aktif (kPa)": Number(d.active), "Pasif (kPa)": Number(d.passive) }))} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" label={{ value: "Basınç (kPa)", position: "insideBottom", offset: -2, fontSize: 11 }} tick={{ fontSize: 10 }} />
                <YAxis type="number" dataKey="depth" reversed label={{ value: "Derinlik (m)", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Aktif (kPa)" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} name="Aktif basınç" />
                <Line type="monotone" dataKey="Pasif (kPa)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} name="Pasif basınç" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {result.anchorForces.length > 0 && (
            <div className="card p-6">
              <h2 className="font-semibold text-lg mb-4">Ankraj Kuvvetleri</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={result.anchorForces.map((f, i) => ({ name: `Ankraj ${i + 1}`, "Kuvvet (kN/m)": f }))} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: "kN/m", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Kuvvet (kN/m)" fill="#2563eb" radius={[4, 4, 0, 0]} name="Ankraj Kuvveti" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Moment Diyagramı (Recharts) */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Yaklaşık Moment Diyagramı</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={(() => {
                  const diag = result.pressureDiagram;
                  let moment = 0;
                  return diag.map((d, i) => {
                    if (i > 0) {
                      const dz = d.depth - diag[i - 1].depth;
                      const netP = diag[i - 1].active - diag[i - 1].passive;
                      moment += netP * dz;
                    }
                    return { depth: d.depth, "Moment (kN·m/m)": Number(moment.toFixed(1)) };
                  });
                })()}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" label={{ value: "Moment (kN·m/m)", position: "insideBottom", offset: -2, fontSize: 11 }} tick={{ fontSize: 10 }} />
                <YAxis type="number" dataKey="depth" reversed label={{ value: "Derinlik (m)", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Moment (kN·m/m)" stroke="#d97706" strokeWidth={2} dot={{ r: 2 }} name="Moment" />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-[var(--muted)] mt-2">Maks. moment: {result.maxMoment} kN·m/m (engine hesabı)</p>
          </div>

          {/* Basınç diyagramı */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Basınç Diyagramı</h2>
            <div className="flex gap-6">
              <div className="flex-1 relative" style={{ height: 300 }}>
                <svg viewBox="0 0 300 300" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  {/* Kazı seviyesi */}
                  <line x1={150} y1={0} x2={150} y2={300} stroke="var(--card-border)" strokeWidth={0.5} strokeDasharray="4 4" />
                  <line x1={0} y1={(excavationDepth / result.totalLength) * 280 + 10} x2={300} y2={(excavationDepth / result.totalLength) * 280 + 10} stroke="rgb(59,130,246)" strokeWidth={1} strokeDasharray="4 4" />
                  <text x={155} y={(excavationDepth / result.totalLength) * 280 + 8} fontSize={8} fill="rgb(59,130,246)">Kazı tabanı</text>

                  {/* Perde */}
                  <rect x={147} y={10} width={6} height={280} fill="rgb(100,100,100)" rx={1} />

                  {/* Aktif basınç (sol) */}
                  <polygon
                    points={[
                      "150,10",
                      ...result.pressureDiagram.map(d => {
                        const y = 10 + (d.depth / result.totalLength) * 280;
                        const x = 150 - (d.active / maxP) * 130;
                        return `${x},${y}`;
                      }),
                      "150," + (10 + 280),
                    ].join(" ")}
                    fill="rgba(239,68,68,0.15)" stroke="rgb(239,68,68)" strokeWidth={1.5}
                  />

                  {/* Pasif basınç (sağ) */}
                  <polygon
                    points={[
                      "150," + ((excavationDepth / result.totalLength) * 280 + 10),
                      ...result.pressureDiagram.filter(d => d.passive > 0).map(d => {
                        const y = 10 + (d.depth / result.totalLength) * 280;
                        const x = 150 + (d.passive / maxP) * 130;
                        return `${x},${y}`;
                      }),
                      "150," + (10 + 280),
                    ].join(" ")}
                    fill="rgba(59,130,246,0.15)" stroke="rgb(59,130,246)" strokeWidth={1.5}
                  />

                  {/* Ankraj noktaları */}
                  {supportLevels.map((s, i) => {
                    const y = 10 + (s / result.totalLength) * 280;
                    return (
                      <g key={i}>
                        <circle cx={150} cy={y} r={4} fill="rgb(34,197,94)" />
                        <line x1={150} y1={y} x2={120} y2={y - 10} stroke="rgb(34,197,94)" strokeWidth={2} />
                        <text x={105} y={y - 6} fontSize={8} fill="rgb(34,197,94)">A{i + 1}</text>
                      </g>
                    );
                  })}

                  {/* Legend */}
                  <rect x={5} y={270} width={10} height={10} fill="rgba(239,68,68,0.3)" stroke="rgb(239,68,68)" strokeWidth={1} />
                  <text x={18} y={279} fontSize={8} fill="currentColor">Aktif</text>
                  <rect x={55} y={270} width={10} height={10} fill="rgba(59,130,246,0.3)" stroke="rgb(59,130,246)" strokeWidth={1} />
                  <text x={68} y={279} fontSize={8} fill="currentColor">Pasif</text>
                </svg>
              </div>
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
function RBox({ label, value, color }: { label: string; value: string; color: string }) {
  const c: Record<string, string> = { blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700", orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-700", gray: "bg-earth-50 dark:bg-neutral-800" };
  return (<div className={`rounded-lg p-3 text-center ${c[color] || c.gray}`}><p className="text-[10px] text-[var(--muted)]">{label}</p><p className="text-lg font-bold">{value}</p></div>);
}
