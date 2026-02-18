"use client";
import ExportPDFButton from "@/components/ExportPDFButton";
import MethodologySection from "@/components/MethodologySection";
import type { MethodologyData } from "@/components/MethodologySection";
import { useState } from "react";
import { rankine, coulomb, mononobeOkabe } from "@geoforce/engine";
import type { LateralPressureResult } from "@geoforce/engine";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

const methodology: MethodologyData = {
  title: "Yanal Toprak Basıncı Teorileri",
  overview: "Yanal toprak basıncı, istinat yapıları (duvarlar, perdeler, kazıklar) üzerinde etkiyen yatay zemin basıncının hesaplanmasıdır. Üç temel durum vardır: aktif basınç (duvar zeminden uzaklaşır), pasif basınç (duvar zemine doğru hareket eder) ve sükunet basıncı (hareket yok).",
  methods: [
    {
      name: "Rankine Teorisi (1857)",
      description: "Pürüzsüz (sürtünmesiz) duvar varsayımına dayanır. Zemin yüzeyinin yatay veya eğimli olduğu durumlar için geçerlidir. Duvar-zemin sürtünmesini ihmal eder.",
      formulas: [
        { name: "Aktif basınç katsayısı", formula: "Ka = tan²(45° − φ/2) = (1 − sinφ) / (1 + sinφ)" },
        { name: "Pasif basınç katsayısı", formula: "Kp = tan²(45° + φ/2) = (1 + sinφ) / (1 − sinφ)" },
        { name: "Sükunet basınç katsayısı", formula: "K0 = 1 − sinφ (Jaky, 1944)" },
        { name: "Aktif basınç (kohezyonlu)", formula: "σa = Ka·γ·z − 2c·√Ka", description: "z: derinlik, c: kohezyon" },
        { name: "Pasif basınç (kohezyonlu)", formula: "σp = Kp·γ·z + 2c·√Kp" },
        { name: "Toplam aktif kuvvet", formula: "Pa = 0.5·Ka·γ·H² − 2c·H·√Ka + Ka·q·H", description: "q: sürşarj yükü" },
        { name: "Eğimli zemin yüzeyi", formula: "Ka = cosβ · (cosβ − √(cos²β − cos²φ)) / (cosβ + √(cos²β − cos²φ))", description: "β: zemin yüzeyi eğim açısı" },
      ],
      steps: [
        { step: 1, title: "Basınç katsayısı hesabı", description: "Ka, Kp veya K0 hesaplanır" },
        { step: 2, title: "Basınç dağılımı", description: "Derinliğe bağlı basınç profili çizilir" },
        { step: 3, title: "Toplam kuvvet", description: "Basınç diyagramının alanı = toplam kuvvet" },
        { step: 4, title: "Etki noktası", description: "Üçgen dağılım için H/3, sürşarj varsa bileşke nokta hesaplanır" },
      ],
      limitations: ["Duvar-zemin sürtünmesi ihmal edilir (δ = 0)", "Düz kayma yüzeyi varsayılır", "Pürüzsüz duvar varsayımı konservatif sonuç verir"],
    },
    {
      name: "Coulomb Teorisi (1776)",
      description: "Duvar-zemin sürtünme açısını (δ) dikkate alır. Düz kayma yüzeyi varsayımı ile kama analizi yapar. Aktif basınç için güvenilir, pasif basınç için yüksek φ ve δ değerlerinde hatalı olabilir.",
      formulas: [
        { name: "Aktif basınç katsayısı", formula: "Ka = sin²(α+φ) / [sin²α · sin(α−δ) · (1 + √(sin(φ+δ)·sin(φ−β) / sin(α−δ)·sin(α+β)))²]", description: "α: duvar eğimi (düşey=90°), β: zemin yüzeyi eğimi, δ: duvar sürtünme açısı" },
        { name: "Pasif basınç katsayısı", formula: "Kp = sin²(α−φ) / [sin²α · sin(α+δ) · (1 − √(sin(φ+δ)·sin(φ+β) / sin(α+δ)·sin(α+β)))²]" },
        { name: "Toplam aktif kuvvet", formula: "Pa = 0.5·Ka·γ·H²" },
        { name: "Duvar sürtünme açısı", formula: "δ = (2/3)·φ (tipik değer)", description: "Beton-zemin arayüzü için yaygın kabul" },
      ],
      steps: [
        { step: 1, title: "Geometri tanımı", description: "Duvar eğimi (α), zemin eğimi (β), sürtünme açısı (δ) belirlenir" },
        { step: 2, title: "Ka veya Kp hesabı", description: "Coulomb formülü ile basınç katsayısı hesaplanır" },
        { step: 3, title: "Toplam kuvvet ve etki noktası", description: "Pa = 0.5·Ka·γ·H², etki noktası H/3" },
      ],
      limitations: ["Düz kayma yüzeyi varsayımı pasif durumda hatalı olabilir (φ>15° ve δ>φ/3)", "Kohezyonlu zeminler için doğrudan uygulanamaz"],
    },
    {
      name: "Mononobe-Okabe Yöntemi (1926/1929)",
      description: "Coulomb teorisinin deprem durumuna genişletilmesidir. Yatay (kh) ve düşey (kv) sismik katsayıları kullanarak deprem etkisindeki yanal basıncı hesaplar.",
      formulas: [
        { name: "Sismik açı", formula: "θ = arctan(kh / (1 − kv))", description: "kh: yatay sismik katsayı, kv: düşey sismik katsayı" },
        { name: "Aktif basınç katsayısı (depremli)", formula: "KAE = sin²(α+φ−θ) / [cosθ · sin²α · sin(α−θ−δ) · (1 + √(sin(φ+δ)·sin(φ−β−θ) / sin(α−δ−θ)·sin(α+β)))²]" },
        { name: "Toplam depremli kuvvet", formula: "PAE = 0.5·KAE·γ·H²·(1−kv)" },
        { name: "Dinamik artış", formula: "ΔPAE = PAE − PA (statik)", description: "Depremden kaynaklanan ek kuvvet, 0.6H'den etki eder" },
      ],
      steps: [
        { step: 1, title: "Sismik katsayılar", description: "kh ve kv belirlenir (TBDY 2018: kh = SDS/2.5, kv = 2/3·kh)" },
        { step: 2, title: "Sismik açı θ hesabı", description: "θ = arctan(kh/(1−kv))" },
        { step: 3, title: "KAE hesabı", description: "Mononobe-Okabe formülü ile depremli aktif basınç katsayısı" },
        { step: 4, title: "Toplam ve dinamik artış kuvveti", description: "PAE ve ΔPAE hesaplanır" },
      ],
      limitations: ["Yalnızca kuru, granüler zeminler için türetilmiştir", "φ − β − θ > 0 koşulu sağlanmalıdır", "Yüksek sismik katsayılarda (kh > 0.4) güvenilirliği azalır"],
    },
  ],
  references: [
    "Rankine, W.J.M. (1857). On the Stability of Loose Earth. Phil. Trans. Royal Society, London.",
    "Coulomb, C.A. (1776). Essai sur une Application des Règles de Maximis et Minimis.",
    "Mononobe, N. & Matsuo, H. (1929). On the Determination of Earth Pressures During Earthquakes. Proc. World Engineering Congress.",
    "Okabe, S. (1926). General Theory of Earth Pressure. Journal of JSCE, 12(1).",
    "TBDY 2018 — Türkiye Bina Deprem Yönetmeliği.",
    "Das, B.M. (2019). Principles of Foundation Engineering, 9th Ed.",
  ],
  standards: ["TBDY 2018", "Eurocode 7", "Eurocode 8 (Deprem)"],
  notes: [
    "Aktif basınç < Sükunet basıncı < Pasif basınç sıralaması her zaman geçerlidir.",
    "Duvar hareketi aktif durum için H/200–H/500, pasif durum için H/50–H/100 mertebesindedir.",
    "Deprem durumunda Mononobe-Okabe yöntemi TBDY 2018 ile uyumludur.",
  ],
};

type Method = "rankine" | "coulomb" | "mononobe";

export default function YanalBasincPage() {
  const [method, setMethod] = useState<Method>("rankine");
  const [wallHeight, setWallHeight] = useState(6);
  const [gamma, setGamma] = useState(18);
  const [cohesion, setCohesion] = useState(0);
  const [frictionAngle, setFrictionAngle] = useState(30);
  const [surcharge, setSurcharge] = useState(0);
  const [wallFriction, setWallFriction] = useState(20);
  const [backfillSlope, setBackfillSlope] = useState(0);
  const [kh, setKh] = useState(0.2);
  const [kv, setKv] = useState(0);

  const input = { wallHeight, gamma, cohesion, frictionAngle, surcharge, wallFriction, backfillSlope, kh, kv };

  let result: LateralPressureResult;
  if (method === "coulomb") result = coulomb(input);
  else if (method === "mononobe") result = mononobeOkabe(input);
  else result = rankine(input);

  const maxP = Math.max(...result.activeProfile.pressures, 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">🧱 Yanal Toprak Basıncı</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Rankine, Coulomb ve Mononobe-Okabe yöntemleri</p>
      <div className="mt-2"><ExportPDFButton moduleName="Yanal Toprak Basıncı" method="Rankine / Coulomb / M-O" inputs={{}} results={{}} /></div>
      <MethodologySection data={methodology} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Girdi */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Girdi Parametreleri</h2>

          <div className="flex gap-2">
            {([["rankine", "Rankine"], ["coulomb", "Coulomb"], ["mononobe", "M-O (Deprem)"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setMethod(k)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${method === k ? "bg-brand-600 text-white" : "bg-[var(--card)] border border-[var(--card-border)]"}`}>
                {l}
              </button>
            ))}
          </div>

          <Field label="Duvar yüksekliği, H (m)" value={wallHeight} onChange={setWallHeight} min={0.5} step={0.5} />
          <Field label="Birim hacim ağırlık, γ (kN/m³)" value={gamma} onChange={setGamma} min={10} max={25} step={0.5} />
          <Field label="Kohezyon, c (kPa)" value={cohesion} onChange={setCohesion} min={0} />
          <Field label="Sürtünme açısı, φ (°)" value={frictionAngle} onChange={setFrictionAngle} min={0} max={50} />
          <Field label="Sürşarj, q (kPa)" value={surcharge} onChange={setSurcharge} min={0} />

          {(method === "coulomb" || method === "mononobe") && (
            <>
              <hr className="border-[var(--card-border)]" />
              <Field label="Duvar sürtünme açısı, δ (°)" value={wallFriction} onChange={setWallFriction} min={0} max={45} />
              <Field label="Dolgu eğimi, β (°)" value={backfillSlope} onChange={setBackfillSlope} min={0} max={45} />
            </>
          )}

          {method === "mononobe" && (
            <>
              <hr className="border-[var(--card-border)]" />
              <h3 className="text-xs font-semibold text-[var(--muted)] uppercase">Sismik Katsayılar</h3>
              <Field label="Yatay sismik katsayı, kh" value={kh} onChange={setKh} min={0} max={0.5} step={0.01} />
              <Field label="Düşey sismik katsayı, kv" value={kv} onChange={setKv} min={0} max={0.3} step={0.01} />
            </>
          )}
        </div>

        {/* Sonuçlar */}
        <div className="lg:col-span-2 space-y-4">
          {/* Katsayılar */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">{result.method} — Sonuçlar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-center">
                <p className="text-xs text-[var(--muted)]">Aktif (Ka)</p>
                <p className="text-2xl font-bold text-red-600">{result.Ka}</p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-neutral-800 p-4 text-center">
                <p className="text-xs text-[var(--muted)]">Sükûnet (K0)</p>
                <p className="text-2xl font-bold">{result.K0}</p>
              </div>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 text-center">
                <p className="text-xs text-[var(--muted)]">Pasif (Kp)</p>
                <p className="text-2xl font-bold text-blue-600">{result.Kp}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-brand-50 dark:bg-brand-900/20 p-4 text-center">
                <p className="text-xs text-[var(--muted)]">Aktif Kuvvet (Pa)</p>
                <p className="text-xl font-bold text-brand-700">{result.activeForcePa} <span className="text-sm font-normal">kN/m</span></p>
              </div>
              <div className="rounded-lg bg-earth-50 dark:bg-neutral-800 p-4 text-center">
                <p className="text-xs text-[var(--muted)]">Uygulama Noktası</p>
                <p className="text-xl font-bold">{result.activeForceLocation} <span className="text-sm font-normal">m (tabandan)</span></p>
              </div>
            </div>
          </div>

          {/* Recharts Basınç Katsayıları */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Basınç Katsayıları Karşılaştırması</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[
                { name: "Ka (Aktif)", value: Number(result.Ka) },
                { name: "K0 (Sükûnet)", value: Number(result.K0) },
                { name: "Kp (Pasif)", value: Number(result.Kp) },
              ]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="value" name="Basınç Katsayısı" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recharts Basınç Profili */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Aktif Basınç Profili (Recharts)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={result.activeProfile.depths.map((d, i) => ({ "Derinlik (m)": d, "σa (kPa)": result.activeProfile.pressures[i] }))} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" label={{ value: "σa (kPa)", position: "insideBottom", offset: -2, fontSize: 11 }} tick={{ fontSize: 10 }} />
                <YAxis type="number" dataKey="Derinlik (m)" reversed label={{ value: "Derinlik (m)", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="σa (kPa)" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} name="Aktif basınç" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Basınç Diyagramı */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Aktif Basınç Diyagramı</h2>
            <div className="flex gap-4">
              {/* Duvar */}
              <div className="relative w-8 flex-shrink-0">
                <div className="absolute inset-0 bg-earth-300 dark:bg-earth-700 rounded" />
                <div className="absolute -left-1 top-0 text-xs text-[var(--muted)]">0</div>
                <div className="absolute -left-6 bottom-0 text-xs text-[var(--muted)]">{wallHeight}m</div>
              </div>
              {/* Basınç profili */}
              <div className="flex-1 relative" style={{ height: `${Math.max(200, wallHeight * 30)}px` }}>
                <svg viewBox={`0 0 200 ${wallHeight * 30}`} className="w-full h-full" preserveAspectRatio="none">
                  {/* Grid */}
                  {[0.25, 0.5, 0.75].map((f) => (
                    <line key={f} x1={f * 200} y1={0} x2={f * 200} y2={wallHeight * 30} stroke="var(--card-border)" strokeWidth={0.5} strokeDasharray="4 4" />
                  ))}
                  {/* Pressure polygon */}
                  <polygon
                    points={[
                      "0,0",
                      ...result.activeProfile.depths.map((d, i) =>
                        `${(result.activeProfile.pressures[i] / maxP) * 190},${(d / wallHeight) * wallHeight * 30}`
                      ),
                      `0,${wallHeight * 30}`,
                    ].join(" ")}
                    fill="rgba(239,68,68,0.15)"
                    stroke="rgb(239,68,68)"
                    strokeWidth={1.5}
                  />
                </svg>
                <div className="absolute top-0 right-0 text-xs text-[var(--muted)]">{maxP.toFixed(1)} kPa</div>
              </div>
            </div>
          </div>
          {/* Basınç Dağılımı Diyagramı — Recharts */}
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">Basınç Dağılımı Diyagramı</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={result.activeProfile.depths.map((d, i) => ({
                  derinlik: d,
                  aktif: Number(result.activeProfile.pressures[i].toFixed(1)),
                  pasif: Number((result.Kp * gamma * d + (cohesion > 0 ? 2 * cohesion * Math.sqrt(result.Kp) : 0)).toFixed(1)),
                  sükûnet: Number((result.K0 * gamma * d).toFixed(1)),
                }))}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 10 }} label={{ value: "Basınç (kPa)", position: "insideBottom", offset: -2, fontSize: 11 }} />
                <YAxis type="number" dataKey="derinlik" reversed tick={{ fontSize: 10 }} label={{ value: "Derinlik (m)", angle: -90, position: "insideLeft", fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(value: number) => [`${value} kPa`, ""]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="aktif" name="Aktif Basınç" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="sükûnet" name="Sükûnet Basıncı" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="6 3" />
                <Line type="monotone" dataKey="pasif" name="Pasif Basınç" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-[var(--muted)] mt-2 text-center">🔴 Aktif · 🟡 Sükûnet · 🔵 Pasif — Derinliğe bağlı basınç dağılımı ({result.method})</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} min={min} max={max} step={step ?? 1} className="input-field" />
    </div>
  );
}
