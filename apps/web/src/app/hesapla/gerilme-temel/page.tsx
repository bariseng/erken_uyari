"use client";
import ExportPDFButton from "@/components/ExportPDFButton";
import MethodologySection from "@/components/MethodologySection";
import type { MethodologyData } from "@/components/MethodologySection";
import { useState, useMemo } from "react";
import { mohrCircle, shallowFoundationDesign } from "@geoforce/engine";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line } from "recharts";

const methodology: MethodologyData = {
  title: "Gerilme Analizi ve Sığ Temel Boyutlandırma",
  overview: "Mohr dairesi, bir noktadaki gerilme durumunu grafik olarak temsil eder ve kayma dayanımı analizinin temelini oluşturur. Sığ temel boyutlandırma ise kolon yükü, moment ve izin verilebilir taşıma kapasitesine göre temel boyutlarını belirler.",
  methods: [
    {
      name: "Mohr Dairesi ve Mohr-Coulomb Yenilme Kriteri",
      description: "Mohr dairesi, σ₁ (büyük asal gerilme) ve σ₃ (küçük asal gerilme) ile tanımlanan gerilme durumunu σ-τ düzleminde gösterir. Mohr-Coulomb yenilme zarfı ile kesişimi yenilme durumunu belirler.",
      formulas: [
        { name: "Daire merkezi", formula: "σavg = (σ₁ + σ₃) / 2" },
        { name: "Daire yarıçapı", formula: "R = (σ₁ − σ₃) / 2" },
        { name: "Maksimum kayma gerilmesi", formula: "τmax = R = (σ₁ − σ₃) / 2" },
        { name: "Deviatorik gerilme", formula: "q = σ₁ − σ₃" },
        { name: "Mohr-Coulomb yenilme zarfı", formula: "τf = c + σ' × tan(φ)", description: "c: kohezyon, φ: sürtünme açısı" },
        { name: "Yenilme düzlemi açısı", formula: "θf = 45° + φ/2", description: "Büyük asal gerilme düzlemi ile yenilme düzlemi arasındaki açı" },
        { name: "Güvenlik katsayısı", formula: "FS = τf(available) / τ(applied)", description: "Yenilme zarfına olan mesafe oranı" },
      ],
      steps: [
        { step: 1, title: "Asal gerilmeler", description: "σ₁ ve σ₃ belirlenir (üç eksenli deney veya hesap)" },
        { step: 2, title: "Mohr dairesi çizimi", description: "Merkez ve yarıçap hesaplanarak daire çizilir" },
        { step: 3, title: "Yenilme zarfı", description: "c ve φ ile Mohr-Coulomb doğrusu çizilir" },
        { step: 4, title: "Güvenlik değerlendirmesi", description: "Daire zarfa temas ediyorsa yenilme, içindeyse güvenli" },
      ],
      limitations: ["Ara asal gerilme (σ₂) dikkate alınmaz", "Lineer yenilme zarfı varsayımı yüksek gerilmelerde hatalı olabilir"],
    },
    {
      name: "Sığ Temel Ön Boyutlandırma",
      description: "Kolon yükü ve momentine göre temel boyutları belirlenir. Eksantrik yükleme durumunda kern kontrolü yapılır ve taban basıncı dağılımı hesaplanır.",
      formulas: [
        { name: "Gerekli alan", formula: "A = P / qa(net)", description: "P: kolon yükü, qa: izin verilebilir taşıma kapasitesi" },
        { name: "Eksantrisite", formula: "e = M / P", description: "Moment / yük oranı" },
        { name: "Kern sınırı", formula: "e ≤ B/6 (dikdörtgen), e ≤ D/8 (dairesel)", description: "Kern içinde ise tüm taban basınçta" },
        { name: "Taban basıncı (kern içi)", formula: "q = P/A × (1 ± 6e/B)", description: "qmax ve qmin hesabı" },
        { name: "Efektif alan", formula: "B' = B − 2ex, L' = L − 2ey", description: "Meyerhof efektif alan yaklaşımı" },
      ],
      steps: [
        { step: 1, title: "Yük analizi", description: "P, Mx, My belirlenir" },
        { step: 2, title: "Ön boyut", description: "A = P/qa ile gerekli alan hesaplanır" },
        { step: 3, title: "Kern kontrolü", description: "e ≤ B/6 kontrolü yapılır" },
        { step: 4, title: "Basınç dağılımı", description: "qmax ve qmin hesaplanır, qmax ≤ qa kontrolü" },
      ],
      limitations: ["Ön boyutlandırma yaklaşımıdır, detaylı analiz gerekir", "Dinamik yükler ayrıca değerlendirilmelidir"],
    },
  ],
  references: [
    "Mohr, O. (1900). Welche Umstände bedingen die Elastizitätsgrenze und den Bruch eines Materials?",
    "Coulomb, C.A. (1776). Essai sur une Application des Règles de Maximis et Minimis.",
    "Meyerhof, G.G. (1953). The Bearing Capacity of Foundations Under Eccentric and Inclined Loads. Proc. 3rd ICSMFE.",
    "Das, B.M. (2019). Principles of Foundation Engineering, 9th Ed.",
  ],
  standards: ["TS 500", "TBDY 2018", "Eurocode 7"],
  notes: [
    "Mohr-Coulomb kriteri, geoteknikte en yaygın kullanılan yenilme kriteridir.",
    "Kern dışı yükleme durumunda temel tabanında çekme gerilmesi oluşur — zemin çekme taşıyamaz.",
    "Eksantrik yükleme taşıma kapasitesini önemli ölçüde azaltır.",
  ],
};

type Tab = "mohr" | "foundation";

export default function GerilmeTemelPage() {
  const [tab, setTab] = useState<Tab>("mohr");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">🎯 Gerilme Analizi & Temel Boyutlandırma</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Mohr dairesi ve sığ temel ön boyutlandırma</p>
      <div className="mt-2"><ExportPDFButton moduleName="Gerilme & Temel" method="Mohr Dairesi / Sığ Temel" inputs={{ "Hesap tipi": tab }} results={{}} /></div>
      <MethodologySection data={methodology} />
      <div className="mt-6 flex gap-2">
        {([["mohr", "Mohr Dairesi"], ["foundation", "Sığ Temel Boyutlandırma"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === k ? "bg-brand-600 text-white" : "bg-[var(--card)] border border-[var(--card-border)]"}`}>{l}</button>
        ))}
      </div>
      <div className="mt-6">{tab === "mohr" ? <MohrForm /> : <FoundationForm />}</div>
    </div>
  );
}

function MohrForm() {
  const [sigma1, setSigma1] = useState(300);
  const [sigma3, setSigma3] = useState(100);
  const [c, setC] = useState(20);
  const [phi, setPhi] = useState(30);

  const result = useMemo(() => mohrCircle({ sigma1, sigma3, cohesion: c, frictionAngle: phi }), [sigma1, sigma3, c, phi]);

  const maxSigma = sigma1 * 1.2;
  const maxTau = result.radius * 1.5;
  const scale = Math.max(maxSigma, maxTau * 2, 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi</h2>
        <Field label="σ₁ — Büyük asal gerilme (kPa)" value={sigma1} onChange={setSigma1} min={0} />
        <Field label="σ₃ — Küçük asal gerilme (kPa)" value={sigma3} onChange={setSigma3} min={0} />
        <hr className="border-[var(--card-border)]" />
        <p className="text-xs text-[var(--muted)]">Mohr-Coulomb Yenilme Zarfı</p>
        <Field label="Kohezyon c (kPa)" value={c} onChange={setC} min={0} />
        <Field label="Sürtünme açısı φ (°)" value={phi} onChange={setPhi} min={0} max={50} />
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Sonuçlar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <RBox label="Merkez σavg" value={`${result.center} kPa`} color="blue" />
            <RBox label="Yarıçap R" value={`${result.radius} kPa`} color="blue" />
            <RBox label="τmax" value={`${result.tauMax} kPa`} color="orange" />
            <RBox label="q (deviatorik)" value={`${result.q} kPa`} color="gray" />
            {result.failurePlaneAngle !== undefined && <RBox label="θf (yenilme düzlemi)" value={`${result.failurePlaneAngle}°`} color="gray" />}
            {result.FS !== undefined && <RBox label="FS (güvenlik)" value={result.FS.toString()} color={result.FS >= 1.5 ? "green" : result.FS >= 1 ? "orange" : "red"} />}
          </div>
        </div>

        {/* Mohr Dairesi - Recharts */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Mohr Dairesi — Gerilme Bileşenleri</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { name: "σ₃", value: sigma3 },
              { name: "σavg", value: result.center },
              { name: "σ₁", value: sigma1 },
              { name: "τmax", value: result.tauMax },
              { name: "q (dev.)", value: result.q },
            ]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} label={{ value: "kPa", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="value" name="Gerilme (kPa)" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mohr Dairesi - Recharts ScatterChart */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Mohr Dairesi (Recharts)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" dataKey="sigma" name="σ (kPa)" label={{ value: "σ (kPa)", position: "insideBottom", offset: -10, fontSize: 11 }} tick={{ fontSize: 10 }} domain={[0, "auto"]} />
              <YAxis type="number" dataKey="tau" name="τ (kPa)" label={{ value: "τ (kPa)", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} formatter={(val: number) => `${val.toFixed(1)} kPa`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Scatter
                name="Mohr Dairesi"
                data={Array.from({ length: 73 }, (_, i) => {
                  const angle = (i * 5 * Math.PI) / 180;
                  return {
                    sigma: Number((result.center + result.radius * Math.cos(angle)).toFixed(1)),
                    tau: Number((result.radius * Math.sin(angle)).toFixed(1)),
                  };
                })}
                fill="#2563eb"
                line={{ stroke: "#2563eb", strokeWidth: 2 }}
                legendType="line"
                r={0}
              />
              <Scatter
                name="M-C Yenilme Zarfı"
                data={[
                  { sigma: 0, tau: Number(c.toFixed(1)) },
                  { sigma: Number((sigma1 * 1.1).toFixed(1)), tau: Number((c + sigma1 * 1.1 * Math.tan((phi * Math.PI) / 180)).toFixed(1)) },
                ]}
                fill="#dc2626"
                line={{ stroke: "#dc2626", strokeWidth: 2, strokeDasharray: "6 3" }}
                legendType="line"
                r={0}
              />
              <Scatter
                name="Asal Gerilmeler"
                data={[
                  { sigma: sigma3, tau: 0 },
                  { sigma: sigma1, tau: 0 },
                  { sigma: result.center, tau: result.tauMax },
                ]}
                fill="#059669"
                r={5}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Mohr Dairesi Grafiği - SVG */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Mohr Dairesi</h2>
          <svg viewBox="0 0 600 400" className="w-full" style={{ maxHeight: 400 }}>
            {/* Axes */}
            <line x1={50} y1={200} x2={570} y2={200} stroke="currentColor" strokeWidth={1} />
            <line x1={50} y1={380} x2={50} y2={20} stroke="currentColor" strokeWidth={1} />
            <text x={560} y={195} fontSize={10} fill="currentColor">σ (kPa)</text>
            <text x={55} y={30} fontSize={10} fill="currentColor">τ (kPa)</text>

            {/* Grid */}
            {[0.25, 0.5, 0.75, 1].map(f => {
              const x = 50 + f * 520;
              const val = Math.round(f * scale);
              return (<g key={`x${f}`}><line x1={x} y1={20} x2={x} y2={380} stroke="var(--card-border)" strokeWidth={0.3} /><text x={x} y={215} textAnchor="middle" fontSize={8} fill="var(--muted)">{val}</text></g>);
            })}
            {[-0.5, -0.25, 0.25, 0.5].map(f => {
              const y = 200 - f * 360;
              const val = Math.round(f * scale / 2);
              return (<g key={`y${f}`}><line x1={50} y1={y} x2={570} y2={y} stroke="var(--card-border)" strokeWidth={0.3} /><text x={45} y={y + 3} textAnchor="end" fontSize={8} fill="var(--muted)">{val}</text></g>);
            })}

            {/* Mohr-Coulomb failure envelope */}
            {(() => {
              const phiRad = (phi * Math.PI) / 180;
              const x1e = 50;
              const y1e = 200 - ((c) / (scale / 2)) * 180;
              const x2e = 50 + (scale / scale) * 520;
              const tauEnd = c + scale * Math.tan(phiRad);
              const y2e = 200 - (tauEnd / (scale / 2)) * 180;
              return (
                <>
                  <line x1={x1e} y1={y1e} x2={x2e} y2={y2e} stroke="rgb(239,68,68)" strokeWidth={1.5} strokeDasharray="6 3" />
                  <line x1={x1e} y1={400 - y1e} x2={x2e} y2={400 - y2e} stroke="rgb(239,68,68)" strokeWidth={1.5} strokeDasharray="6 3" />
                </>
              );
            })()}

            {/* Circle */}
            <circle
              cx={50 + (result.center / scale) * 520}
              cy={200}
              r={(result.radius / (scale / 2)) * 180}
              fill="rgba(59,130,246,0.1)" stroke="rgb(59,130,246)" strokeWidth={2}
            />

            {/* σ1, σ3 points */}
            <circle cx={50 + (sigma3 / scale) * 520} cy={200} r={4} fill="rgb(34,197,94)" />
            <text x={50 + (sigma3 / scale) * 520} y={225} textAnchor="middle" fontSize={8} fill="rgb(34,197,94)">σ₃={sigma3}</text>
            <circle cx={50 + (sigma1 / scale) * 520} cy={200} r={4} fill="rgb(34,197,94)" />
            <text x={50 + (sigma1 / scale) * 520} y={225} textAnchor="middle" fontSize={8} fill="rgb(34,197,94)">σ₁={sigma1}</text>

            {/* τmax point */}
            <circle cx={50 + (result.center / scale) * 520} cy={200 - (result.tauMax / (scale / 2)) * 180} r={4} fill="rgb(249,115,22)" />
            <text x={55 + (result.center / scale) * 520} y={195 - (result.tauMax / (scale / 2)) * 180} fontSize={8} fill="rgb(249,115,22)">τmax={result.tauMax}</text>

            {/* Legend */}
            <circle cx={420} cy={25} r={4} fill="rgb(59,130,246)" />
            <text x={428} y={29} fontSize={9} fill="currentColor">Mohr Dairesi</text>
            <line x1={490} y1={25} x2={510} y2={25} stroke="rgb(239,68,68)" strokeWidth={1.5} strokeDasharray="6 3" />
            <text x={515} y={29} fontSize={9} fill="currentColor">M-C Zarfı</text>
          </svg>
        </div>
      </div>
    </div>
  );
}

function FoundationForm() {
  const [load, setLoad] = useState(800);
  const [momentX, setMomentX] = useState(50);
  const [momentY, setMomentY] = useState(0);
  const [depth, setDepth] = useState(1.5);
  const [qa, setQa] = useState(200);
  const [gamma, setGamma] = useState(18);
  const [type, setType] = useState<"square" | "rectangular" | "circular" | "strip">("square");
  const [ar, setAr] = useState(1.5);

  const result = useMemo(() => shallowFoundationDesign({ load, momentX, momentY, depth, allowableBearing: qa, gamma, type, aspectRatio: ar }), [load, momentX, momentY, depth, qa, gamma, type, ar]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi</h2>
        <Field label="Kolon yükü P (kN)" value={load} onChange={setLoad} min={10} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Moment Mx (kN·m)" value={momentX} onChange={setMomentX} min={0} />
          <Field label="Moment My (kN·m)" value={momentY} onChange={setMomentY} min={0} />
        </div>
        <Field label="Temel derinliği Df (m)" value={depth} onChange={setDepth} min={0.5} max={5} step={0.1} />
        <Field label="İzin verilebilir qa (kPa)" value={qa} onChange={setQa} min={50} />
        <Field label="Zemin γ (kN/m³)" value={gamma} onChange={setGamma} min={14} max={22} step={0.5} />
        <div>
          <label className="block text-sm font-medium mb-1">Temel tipi</label>
          <select value={type} onChange={e => setType(e.target.value as any)} className="input-field">
            <option value="square">Kare</option>
            <option value="rectangular">Dikdörtgen</option>
            <option value="circular">Dairesel</option>
            <option value="strip">Sürekli (Şerit)</option>
          </select>
        </div>
        {type === "rectangular" && <Field label="L/B oranı" value={ar} onChange={setAr} min={1} max={5} step={0.1} />}
      </div>

      <div className="space-y-4">
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">{result.method}</h2>
          <div className="grid grid-cols-2 gap-3">
            <RBox label="Temel Boyutu" value={type === "circular" ? `D=${result.B}m` : `${result.B}×${result.L}m`} color="blue" />
            <RBox label="Gerekli Alan" value={`${result.requiredArea} m²`} color="gray" />
            <RBox label="qnet (ortalama)" value={`${result.netPressure} kPa`} color="orange" />
            <RBox label="qmax" value={`${result.pressureDistribution.qMax} kPa`} color={result.safe ? "green" : "red"} />
            <RBox label="qmin" value={`${result.pressureDistribution.qMin} kPa`} color={result.pressureDistribution.qMin > 0 ? "green" : "red"} />
            <RBox label="Kern kontrolü" value={result.withinKern ? "✅ Kern içi" : "⚠️ Kern dışı"} color={result.withinKern ? "green" : "red"} />
          </div>
          {result.ex > 0 && (
            <div className="mt-3 text-sm">
              <p>Eksantrisite: ex = {result.ex}m (B/6 = {(result.B / 6).toFixed(3)}m), ey = {result.ey}m (L/6 = {(result.L / 6).toFixed(3)}m)</p>
            </div>
          )}
          {!result.safe && <p className="mt-2 text-sm text-red-600">⚠️ qmax &gt; qa — Temel boyutlarını artırın veya yükü azaltın.</p>}
        </div>

        {/* Temel çizimi */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Taban Basıncı Dağılımı</h2>
          <svg viewBox="0 0 400 200" className="w-full" style={{ maxHeight: 200 }}>
            {/* Temel */}
            <rect x={100} y={40} width={200} height={20} fill="rgb(150,150,150)" rx={2} />
            <text x={200} y={35} textAnchor="middle" fontSize={10} fill="currentColor">P={load}kN</text>
            <line x1={200} y1={15} x2={200} y2={38} stroke="currentColor" strokeWidth={2} markerEnd="url(#arrowD)" />
            <defs><marker id="arrowD" markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor" /></marker></defs>

            {/* Basınç dağılımı (trapez) */}
            {(() => {
              const maxQ = Math.max(result.pressureDistribution.qMax, 1);
              const hMax = (result.pressureDistribution.qMax / maxQ) * 100;
              const hMin = (result.pressureDistribution.qMin / maxQ) * 100;
              return (
                <polygon
                  points={`100,60 300,60 300,${60 + hMax} 100,${60 + hMin}`}
                  fill="rgba(59,130,246,0.2)" stroke="rgb(59,130,246)" strokeWidth={1.5}
                />
              );
            })()}
            <text x={95} y={60 + (result.pressureDistribution.qMin / Math.max(result.pressureDistribution.qMax, 1)) * 100 + 12} textAnchor="end" fontSize={9} fill="rgb(59,130,246)">{result.pressureDistribution.qMin} kPa</text>
            <text x={305} y={60 + 100 + 12} fontSize={9} fill="rgb(59,130,246)">{result.pressureDistribution.qMax} kPa</text>

            {/* Boyut */}
            <line x1={100} y1={185} x2={300} y2={185} stroke="currentColor" strokeWidth={1} />
            <text x={200} y={198} textAnchor="middle" fontSize={9} fill="currentColor">{result.B}m × {result.L}m</text>
          </svg>
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
