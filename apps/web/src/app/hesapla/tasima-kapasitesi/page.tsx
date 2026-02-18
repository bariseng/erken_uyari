"use client";
import { useState } from "react";
import { terzaghi, meyerhof, hansen, vesic } from "@geoforce/engine";
import type { BearingCapacityResult } from "@geoforce/engine";
import ExportPDFButton from "@/components/ExportPDFButton";
import MethodologySection from "@/components/MethodologySection";
import type { MethodologyData } from "@/components/MethodologySection";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

const methodology: MethodologyData = {
  title: "Sığ Temel Taşıma Kapasitesi Teorisi",
  overview: "Sığ temellerin nihai taşıma kapasitesi, zemin kayma dayanımı parametreleri (c, φ) ve temel geometrisine bağlı olarak hesaplanır. Genel formül üç bileşenden oluşur: kohezyon terimi, sürşarj terimi ve zemin ağırlık terimi. Her yöntem farklı taşıma kapasitesi faktörleri (Nc, Nq, Nγ) ve düzeltme katsayıları kullanır.",
  methods: [
    {
      name: "Terzaghi (1943)",
      description: "İlk kapsamlı taşıma kapasitesi teorisi. Prandtl kayma yüzeyi modelini temel alır. Yalnızca şerit, kare ve dairesel temeller için şekil faktörleri tanımlar. Derinlik ve eğim faktörleri içermez.",
      formulas: [
        { name: "Şerit temel", formula: "qu = c·Nc + q·Nq + 0.5·γ·B·Nγ", description: "q = γ·Df (temel tabanındaki sürşarj basıncı)" },
        { name: "Kare temel", formula: "qu = 1.3·c·Nc + q·Nq + 0.4·γ·B·Nγ" },
        { name: "Dairesel temel", formula: "qu = 1.3·c·Nc + q·Nq + 0.3·γ·B·Nγ" },
        { name: "Nc", formula: "Nc = (Nq − 1)·cot(φ)", description: "Kohezyon taşıma kapasitesi faktörü" },
        { name: "Nq", formula: "Nq = e^(2π·(3/4 − φ/360)·tan(φ)) / (2·cos²(45 + φ/2))", description: "Sürşarj taşıma kapasitesi faktörü" },
        { name: "Nγ", formula: "Nγ = (Nq − 1)·tan(1.4φ)", description: "Zemin ağırlık taşıma kapasitesi faktörü (yaklaşık)" },
      ],
      steps: [
        { step: 1, title: "Sürşarj basıncı hesabı", description: "q = γ × Df (temel tabanı seviyesindeki düşey gerilme)" },
        { step: 2, title: "Taşıma kapasitesi faktörleri", description: "φ değerine göre Nc, Nq, Nγ hesaplanır" },
        { step: 3, title: "Nihai taşıma kapasitesi", description: "qu = c·Nc + q·Nq + 0.5·γ·B·Nγ (şekil faktörleri dahil)" },
        { step: 4, title: "İzin verilebilir taşıma kapasitesi", description: "qa = qu / FS" },
      ],
      limitations: ["Temel tabanı pürüzsüz kabul edilir", "Zemin homojen ve izotrop varsayılır", "Eğim ve derinlik düzeltmeleri yoktur"],
    },
    {
      name: "Meyerhof (1963)",
      description: "Terzaghi teorisini geliştirerek şekil (s), derinlik (d) ve eğim (i) faktörlerini ekler. Dikdörtgen temeller için genel çözüm sunar.",
      formulas: [
        { name: "Genel formül", formula: "qu = c·Nc·sc·dc·ic + q·Nq·sq·dq·iq + 0.5·γ·B·Nγ·sγ·dγ·iγ" },
        { name: "Nq", formula: "Nq = e^(π·tan(φ)) · tan²(45 + φ/2)" },
        { name: "Nc", formula: "Nc = (Nq − 1)·cot(φ)" },
        { name: "Nγ", formula: "Nγ = (Nq − 1)·tan(1.4φ)" },
        { name: "Şekil faktörleri", formula: "sc = 1 + 0.2·Kp·(B/L), sq = sγ = 1 + 0.1·Kp·(B/L) [φ>10°]", description: "Kp = tan²(45 + φ/2)" },
        { name: "Derinlik faktörleri", formula: "dc = 1 + 0.2·√Kp·(Df/B), dq = dγ = 1 + 0.1·√Kp·(Df/B) [φ>10°]" },
      ],
      steps: [
        { step: 1, title: "Taşıma kapasitesi faktörleri", description: "Nq, Nc, Nγ hesaplanır" },
        { step: 2, title: "Şekil faktörleri", description: "B/L oranına göre sc, sq, sγ hesaplanır" },
        { step: 3, title: "Derinlik faktörleri", description: "Df/B oranına göre dc, dq, dγ hesaplanır" },
        { step: 4, title: "Nihai ve izin verilebilir kapasite", description: "qu hesaplanır, qa = qu / FS" },
      ],
      limitations: ["Eğim faktörleri bu modülde uygulanmamıştır", "Yeraltı suyu düzeltmesi ayrıca yapılmalıdır"],
    },
    {
      name: "Hansen (1970)",
      description: "En kapsamlı klasik yöntem. Şekil, derinlik, eğim, taban eğimi ve zemin yüzeyi eğimi faktörlerini içerir. Derin temeller için de uygulanabilir.",
      formulas: [
        { name: "Genel formül", formula: "qu = c·Nc·sc·dc + q·Nq·sq·dq + 0.5·γ·B'·Nγ·sγ·dγ" },
        { name: "Nq", formula: "Nq = e^(π·tan(φ)) · tan²(45 + φ/2)" },
        { name: "Nc", formula: "Nc = (Nq − 1)·cot(φ)" },
        { name: "Nγ", formula: "Nγ = 1.5·(Nq − 1)·tan(φ)" },
        { name: "Şekil faktörleri", formula: "sc = 1 + (Nq/Nc)·(B/L), sq = 1 + (B/L)·tan(φ), sγ = 1 − 0.4·(B/L)" },
        { name: "Derinlik faktörleri", formula: "dc = 1 + 0.4·(Df/B), dq = 1 + 2·tan(φ)·(1−sin(φ))²·(Df/B), dγ = 1" },
      ],
      limitations: ["Nγ formülü farklı kaynaklarda farklı olabilir", "Eksantrik yükler için efektif alan (B'×L') kullanılmalıdır"],
    },
    {
      name: "Vesic (1973)",
      description: "Hansen yönteminin geliştirilmiş versiyonu. Nγ faktörü için farklı bir ifade kullanır. Kavite genişlemesi teorisini de dikkate alır.",
      formulas: [
        { name: "Genel formül", formula: "qu = c·Nc·sc·dc + q·Nq·sq·dq + 0.5·γ·B'·Nγ·sγ·dγ" },
        { name: "Nγ", formula: "Nγ = 2·(Nq + 1)·tan(φ)", description: "Vesic'in Nγ değeri Hansen'den daha yüksektir" },
        { name: "Şekil ve derinlik", formula: "Hansen ile aynı şekil ve derinlik faktörleri kullanılır" },
      ],
      limitations: ["Nγ değeri diğer yöntemlere göre daha yüksek sonuç verebilir"],
    },
  ],
  references: [
    "Terzaghi, K. (1943). Theoretical Soil Mechanics. John Wiley & Sons.",
    "Meyerhof, G.G. (1963). Some Recent Research on the Bearing Capacity of Foundations. Canadian Geotechnical Journal, 1(1), 16-26.",
    "Hansen, J.B. (1970). A Revised and Extended Formula for Bearing Capacity. Danish Geotechnical Institute, Bulletin No. 28.",
    "Vesic, A.S. (1973). Analysis of Ultimate Loads of Shallow Foundations. JSMFD, ASCE, 99(SM1), 45-73.",
    "Das, B.M. (2019). Principles of Foundation Engineering, 9th Ed. Cengage Learning.",
  ],
  standards: ["TS 500", "TBDY 2018 Bölüm 16", "Eurocode 7 (EN 1997-1)"],
  notes: [
    "Tüm yöntemler Mohr-Coulomb kayma dayanımı kriterini temel alır.",
    "Güvenlik katsayısı (FS) genellikle 2.5–3.0 arasında seçilir.",
    "Yeraltı suyu seviyesi temel tabanının altındaysa γ yerine γ' (batık birim hacim ağırlık) kullanılmalıdır.",
    "Deprem durumunda taşıma kapasitesi azaltma faktörleri uygulanmalıdır (TBDY 2018).",
  ],
};

type Method = "terzaghi" | "meyerhof" | "hansen" | "vesic" | "all";

export default function TasimaKapasitesiPage() {
  const [method, setMethod] = useState<Method>("all");
  const [width, setWidth] = useState(2);
  const [length, setLength] = useState(2);
  const [depth, setDepth] = useState(1.5);
  const [gamma, setGamma] = useState(18);
  const [cohesion, setCohesion] = useState(20);
  const [frictionAngle, setFrictionAngle] = useState(30);
  const [safetyFactor, setSafetyFactor] = useState(3);

  const input = { width, length, depth, gamma, cohesion, frictionAngle, safetyFactor };

  const results: BearingCapacityResult[] = [];
  if (method === "all" || method === "terzaghi") results.push(terzaghi(input));
  if (method === "all" || method === "meyerhof") results.push(meyerhof(input));
  if (method === "all" || method === "hansen") results.push(hansen(input));
  if (method === "all" || method === "vesic") results.push(vesic(input));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">🏗️ Taşıma Kapasitesi</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Terzaghi, Meyerhof, Hansen ve Vesic yöntemleri ile nihai ve izin verilebilir taşıma kapasitesi</p>
      <div className="mt-2">
        <ExportPDFButton
          moduleName="Taşıma Kapasitesi"
          method={results.length === 1 ? results[0].method : "Tüm Yöntemler"}
          inputs={{ "Kohezyon c (kPa)": cohesion, "Sürtünme açısı φ (°)": frictionAngle, "γ (kN/m³)": gamma, "Temel genişliği B (m)": width, "Temel uzunluğu L (m)": length, "Temel derinliği Df (m)": depth, "Güvenlik katsayısı FS": safetyFactor }}
          results={Object.fromEntries(results.flatMap(r => [[`${r.method} — qu (kPa)`, r.ultimate], [`${r.method} — qa (kPa)`, r.allowable]]))}
        />
      </div>
      <MethodologySection data={methodology} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Girdi */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Girdi Parametreleri</h2>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[var(--muted)]">Yöntem</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as Method)} className="input-field">
              <option value="all">Tümü (Karşılaştırma)</option>
              <option value="terzaghi">Terzaghi (1943)</option>
              <option value="meyerhof">Meyerhof (1963)</option>
              <option value="hansen">Hansen (1970)</option>
              <option value="vesic">Vesic (1973)</option>
            </select>
          </div>

          <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide pt-2">Temel Geometrisi</h3>
          <Field label="Temel genişliği, B (m)" value={width} onChange={setWidth} min={0.1} step={0.1} />
          <Field label="Temel uzunluğu, L (m)" value={length} onChange={setLength} min={0.1} step={0.1} />
          <Field label="Temel derinliği, Df (m)" value={depth} onChange={setDepth} min={0} step={0.1} />

          <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide pt-2">Zemin Parametreleri</h3>
          <Field label="Birim hacim ağırlık, γ (kN/m³)" value={gamma} onChange={setGamma} min={10} max={25} step={0.5} />
          <Field label="Kohezyon, c (kPa)" value={cohesion} onChange={setCohesion} min={0} max={500} />
          <Field label="Sürtünme açısı, φ (°)" value={frictionAngle} onChange={setFrictionAngle} min={0} max={50} />
          <Field label="Güvenlik katsayısı, FS" value={safetyFactor} onChange={setSafetyFactor} min={1} max={5} step={0.5} />
        </div>

        {/* Sonuçlar */}
        <div className="lg:col-span-2 space-y-4">
          {/* Karşılaştırma tablosu */}
          {results.length > 1 && (
            <div className="card p-6">
              <h2 className="font-semibold text-lg mb-4">Karşılaştırma</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--card-border)]">
                      <th className="text-left py-2 pr-4">Yöntem</th>
                      <th className="text-right py-2 px-2">Nc</th>
                      <th className="text-right py-2 px-2">Nq</th>
                      <th className="text-right py-2 px-2">Nγ</th>
                      <th className="text-right py-2 px-2 font-bold">qu (kPa)</th>
                      <th className="text-right py-2 pl-2 font-bold text-brand-600">qa (kPa)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.method} className="border-b border-[var(--card-border)] last:border-0">
                        <td className="py-2 pr-4 font-medium">{r.method}</td>
                        <td className="text-right py-2 px-2">{r.factors.Nc}</td>
                        <td className="text-right py-2 px-2">{r.factors.Nq}</td>
                        <td className="text-right py-2 px-2">{r.factors.Ngamma}</td>
                        <td className="text-right py-2 px-2 font-bold">{r.ultimate.toFixed(1)}</td>
                        <td className="text-right py-2 pl-2 font-bold text-brand-600">{r.allowable.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recharts Karşılaştırma Grafiği */}
          {results.length > 1 && (
            <div className="card p-6">
              <h2 className="font-semibold text-lg mb-4">Yöntem Karşılaştırması (Grafik)</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={results.map(r => ({ Yöntem: r.method, "qu (kPa)": Number(r.ultimate.toFixed(1)), "qa (kPa)": Number(r.allowable.toFixed(1)) }))} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="Yöntem" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: "kPa", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine y={Number((results.reduce((s, r) => s + r.allowable, 0) / results.length).toFixed(1))} stroke="#059669" strokeDasharray="6 3" strokeWidth={2} label={{ value: `Ort. qa=${(results.reduce((s, r) => s + r.allowable, 0) / results.length).toFixed(0)} kPa`, position: "right", fontSize: 9, fill: "#059669" }} />
                  <Bar dataKey="qu (kPa)" fill="#ef4444" radius={[4, 4, 0, 0]} name="Nihai qu (kPa)" />
                  <Bar dataKey="qa (kPa)" fill="#2563eb" radius={[4, 4, 0, 0]} name="İzin ver. qa (kPa)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bileşen Dağılımı — StackedBarChart */}
          {results.length > 1 && (
            <div className="card p-6">
              <h2 className="font-semibold text-lg mb-4">Bileşen Dağılımı (Kohezyon / Sürşarj / Ağırlık)</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={results.map(r => ({ Yöntem: r.method, Kohezyon: Number(r.components.cohesionTerm), Sürşarj: Number(r.components.surchargeterm), Ağırlık: Number(r.components.weightTerm) }))} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="Yöntem" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} label={{ value: "kPa", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Kohezyon" stackId="a" fill="#2563eb" name="Kohezyon terimi" />
                  <Bar dataKey="Sürşarj" stackId="a" fill="#d97706" name="Sürşarj terimi" />
                  <Bar dataKey="Ağırlık" stackId="a" fill="#059669" name="Ağırlık terimi" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detaylı sonuçlar */}
          {results.map((r) => (
            <div key={r.method} className="card p-6">
              <h2 className="font-semibold text-lg mb-3">{r.method}</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="rounded-lg bg-brand-50 dark:bg-brand-900/20 p-4 text-center">
                  <p className="text-xs text-[var(--muted)]">Nihai Taşıma Kapasitesi (qu)</p>
                  <p className="text-2xl font-bold text-brand-700 dark:text-brand-400">{r.ultimate.toFixed(1)} <span className="text-sm font-normal">kPa</span></p>
                </div>
                <div className="rounded-lg bg-earth-50 dark:bg-neutral-800 p-4 text-center">
                  <p className="text-xs text-[var(--muted)]">İzin Verilebilir (qa, FS={r.safetyFactor})</p>
                  <p className="text-2xl font-bold">{r.allowable.toFixed(1)} <span className="text-sm font-normal">kPa</span></p>
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <p className="font-medium text-[var(--muted)] text-xs uppercase tracking-wide">Taşıma Kapasitesi Faktörleri</p>
                <Row label="Nc" value={r.factors.Nc.toString()} />
                <Row label="Nq" value={r.factors.Nq.toString()} />
                <Row label="Nγ" value={r.factors.Ngamma.toString()} />
              </div>

              {r.shapeFactors && (
                <div className="mt-3 space-y-1 text-sm">
                  <p className="font-medium text-[var(--muted)] text-xs uppercase tracking-wide">Şekil Faktörleri</p>
                  <Row label="sc" value={r.shapeFactors.sc.toString()} />
                  <Row label="sq" value={r.shapeFactors.sq.toString()} />
                  <Row label="sγ" value={r.shapeFactors.sgamma.toString()} />
                </div>
              )}

              {r.depthFactors && (
                <div className="mt-3 space-y-1 text-sm">
                  <p className="font-medium text-[var(--muted)] text-xs uppercase tracking-wide">Derinlik Faktörleri</p>
                  <Row label="dc" value={r.depthFactors.dc.toString()} />
                  <Row label="dq" value={r.depthFactors.dq.toString()} />
                  <Row label="dγ" value={r.depthFactors.dgamma.toString()} />
                </div>
              )}

              <div className="mt-3 space-y-1 text-sm">
                <p className="font-medium text-[var(--muted)] text-xs uppercase tracking-wide">Bileşenler</p>
                <Row label="Kohezyon terimi (cNc...)" value={`${r.components.cohesionTerm} kPa`} />
                <Row label="Sürşarj terimi (qNq...)" value={`${r.components.surchargeterm} kPa`} />
                <Row label="Ağırlık terimi (½γBNγ...)" value={`${r.components.weightTerm} kPa`} />
              </div>
            </div>
          ))}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-[var(--card-border)] last:border-0">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
