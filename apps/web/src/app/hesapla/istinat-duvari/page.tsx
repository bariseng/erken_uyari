"use client";
import ExportPDFButton from "@/components/ExportPDFButton";
import MethodologySection from "@/components/MethodologySection";
import type { MethodologyData } from "@/components/MethodologySection";
import { useState, useMemo } from "react";
import { gravityWallStability, reinforcedSoilDesign } from "@geoforce/engine";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, LineChart, Line } from "recharts";

const methodology: MethodologyData = {
  title: "İstinat Duvarı Stabilitesi",
  overview: "İstinat duvarları, farklı kotlardaki zeminleri desteklemek için kullanılan yapılardır. Ağırlık duvarları kendi ağırlıkları ile stabilite sağlarken, donatılı zemin (geogrid) duvarları zemin-donatı etkileşimi ile çalışır. Tasarım; devrilme, kayma, taşıma kapasitesi ve genel stabilite kontrollerini içerir.",
  methods: [
    {
      name: "Ağırlık Duvarı Stabilitesi",
      description: "Beton veya taş ağırlık duvarları, kendi ağırlıkları ile aktif toprak basıncına karşı koyar. Devrilme, kayma ve taşıma kapasitesi kontrolleri yapılır.",
      formulas: [
        { name: "Devrilme güvenliği", formula: "FS_devrilme = ΣM_dirençli / ΣM_devirici ≥ 2.0", description: "Duvar ön ayak ucuna göre moment dengesi" },
        { name: "Kayma güvenliği", formula: "FS_kayma = (W·tanδ + c·B) / Pa ≥ 1.5", description: "δ: taban sürtünme açısı (≈ 2/3·φ)" },
        { name: "Taşıma kapasitesi", formula: "qmax = (W/B)·(1 + 6e/B) ≤ qa", description: "e: eksantrisite, qa: izin verilebilir taşıma kapasitesi" },
        { name: "Eksantrisite", formula: "e = B/2 − (ΣM_net / W)", description: "e ≤ B/6 olmalı (kern içi)" },
        { name: "Aktif kuvvet (Rankine)", formula: "Pa = 0.5·Ka·γ·H² + Ka·q·H", description: "Ka = tan²(45° − φ/2)" },
      ],
      steps: [
        { step: 1, title: "Aktif basınç hesabı", description: "Ka ve Pa hesaplanır" },
        { step: 2, title: "Duvar ağırlığı", description: "W ve ağırlık merkezi hesaplanır" },
        { step: 3, title: "Devrilme kontrolü", description: "FS ≥ 2.0 kontrolü" },
        { step: 4, title: "Kayma kontrolü", description: "FS ≥ 1.5 kontrolü" },
        { step: 5, title: "Taban basıncı", description: "qmax ≤ qa ve e ≤ B/6 kontrolü" },
      ],
      limitations: ["Yüksek duvarlar (>6m) için ekonomik değildir", "Yumuşak zeminlerde taşıma kapasitesi kritik olabilir"],
    },
    {
      name: "Donatılı Zemin (Geogrid) Duvarı — FHWA Yöntemi",
      description: "Geogrid veya çelik şerit donatılar ile güçlendirilmiş zemin kütlesi, istinat yapısı olarak çalışır. İç stabilite (donatı kopması ve sıyrılması) ve dış stabilite (kayma, devrilme) kontrolleri yapılır.",
      formulas: [
        { name: "İzin verilebilir donatı dayanımı", formula: "Ta = Tult / (FS_creep × FS_hasar × FS_kimyasal)", description: "Tipik toplam FS: 2.5–4.0" },
        { name: "Gerekli donatı kuvveti", formula: "Ti = Ka·(γ·zi + q)·Sv", description: "zi: donatı derinliği, Sv: düşey aralık" },
        { name: "Sıyrılma uzunluğu", formula: "Le = Ti / (2·σv'·Ci·tanφ)", description: "Ci: etkileşim katsayısı (0.6–0.9)" },
        { name: "Toplam donatı uzunluğu", formula: "L = La + Le ≥ 0.7H", description: "La: aktif bölge genişliği" },
      ],
      steps: [
        { step: 1, title: "Ka hesabı", description: "Dolgu sürtünme açısına göre Ka belirlenir" },
        { step: 2, title: "Her tabaka için Ti", description: "Gerekli donatı kuvveti hesaplanır" },
        { step: 3, title: "Sıyrılma kontrolü", description: "Le hesaplanır, L = La + Le" },
        { step: 4, title: "Dış stabilite", description: "Kayma ve devrilme kontrolleri yapılır" },
      ],
      limitations: ["Dolgu malzemesi kalitesi kritiktir (PI < 6, Cu > 4)", "Korozyon/bozunma uzun vadeli dayanımı etkiler"],
    },
  ],
  references: [
    "FHWA-NHI-10-024 (2009). Design and Construction of Mechanically Stabilized Earth Walls and Reinforced Soil Slopes.",
    "Rankine, W.J.M. (1857). On the Stability of Loose Earth.",
    "Coulomb, C.A. (1776). Essai sur une Application des Règles de Maximis et Minimis.",
    "Das, B.M. (2019). Principles of Foundation Engineering, 9th Ed.",
    "TBDY 2018 — Türkiye Bina Deprem Yönetmeliği.",
  ],
  standards: ["TBDY 2018", "Eurocode 7", "FHWA-NHI-10-024", "BS 8002"],
  notes: [
    "Drenaj, istinat duvarı tasarımının en kritik bileşenidir — su basıncı aktif basıncı önemli ölçüde artırır.",
    "Deprem durumunda Mononobe-Okabe yöntemi ile ek basınç hesaplanır.",
    "Donatılı zemin duvarları 30 m'ye kadar yüksekliklerde ekonomik çözüm sunar.",
  ],
};

type Tab = "gravity" | "reinforced";

export default function IstinatPage() {
  const [tab, setTab] = useState<Tab>("gravity");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">🧱 İstinat Duvarı Stabilitesi</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Ağırlık duvarı stabilitesi ve donatılı zemin (geogrid) tasarımı</p>
      <div className="mt-2"><ExportPDFButton moduleName="İstinat Duvarı" method="Ağırlık Duvarı / Geogrid" inputs={{ "Hesap tipi": tab }} results={{}} /></div>
      <MethodologySection data={methodology} />
      <div className="mt-6 flex gap-2">
        {([["gravity", "Ağırlık Duvarı"], ["reinforced", "Donatılı Zemin (Geogrid)"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === k ? "bg-brand-600 text-white" : "bg-[var(--card)] border border-[var(--card-border)]"}`}>{l}</button>
        ))}
      </div>
      <div className="mt-6">{tab === "gravity" ? <GravityForm /> : <ReinforcedForm />}</div>
    </div>
  );
}

function GravityForm() {
  const [H, setH] = useState(4);
  const [B, setB] = useState(2.5);
  const [Bt, setBt] = useState(0.5);
  const [gammaW, setGammaW] = useState(24);
  const [gammaF, setGammaF] = useState(18);
  const [phi, setPhi] = useState(30);
  const [c, setC] = useState(0);
  const [qa, setQa] = useState(200);
  const [q, setQ] = useState(0);
  const [kh, setKh] = useState(0);

  const result = useMemo(() => gravityWallStability({ height: H, baseWidth: B, topWidth: Bt, gammaWall: gammaW, gammaFill: gammaF, frictionAngle: phi, cohesion: c, bearingCapacity: qa, surcharge: q, kh }), [H, B, Bt, gammaW, gammaF, phi, c, qa, q, kh]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi</h2>
        <Field label="Duvar yüksekliği H (m)" value={H} onChange={setH} min={1} max={10} step={0.5} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Taban B (m)" value={B} onChange={setB} min={0.5} max={8} step={0.1} />
          <Field label="Tepe Bt (m)" value={Bt} onChange={setBt} min={0.3} max={3} step={0.1} />
        </div>
        <Field label="γ duvar (kN/m³)" value={gammaW} onChange={setGammaW} min={18} max={25} step={0.5} />
        <Field label="γ dolgu (kN/m³)" value={gammaF} onChange={setGammaF} min={14} max={22} step={0.5} />
        <Field label="φ dolgu (°)" value={phi} onChange={setPhi} min={20} max={45} />
        <Field label="c dolgu (kPa)" value={c} onChange={setC} min={0} />
        <Field label="qa zemin (kPa)" value={qa} onChange={setQa} min={50} />
        <Field label="Sürşarj q (kPa)" value={q} onChange={setQ} min={0} />
        <Field label="kh (sismik)" value={kh} onChange={setKh} min={0} max={0.3} step={0.01} />
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Stabilite Kontrolü</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${result.stable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{result.stable ? "✅ Stabil" : "⚠️ Yetersiz"}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <RBox label="Ka" value={result.Ka.toString()} color="gray" />
            <RBox label="Pa (aktif kuvvet)" value={`${result.Pa} kN/m`} color="orange" />
            <RBox label="W (duvar ağırlığı)" value={`${result.wallWeight} kN/m`} color="blue" />
            <RBox label="Eksantrisite e" value={`${result.eccentricity} m`} color="gray" />
          </div>

          {/* Kontrol tablosu */}
          <div className="space-y-2">
            {result.details.map((d, i) => (
              <div key={i} className={`flex justify-between items-center p-3 rounded-lg ${d.ok ? "bg-green-50 dark:bg-green-900/10" : "bg-red-50 dark:bg-red-900/10"}`}>
                <span className="text-sm">{d.ok ? "✅" : "❌"} {d.label}</span>
                <span className="text-sm font-bold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recharts Stabilite Kontrol */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Stabilite Kontrol Grafiği</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={result.details.map(d => ({ name: d.label, FS: parseFloat(d.value) || 0, ok: d.ok }))} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="FS" name="Güvenlik Katsayısı" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <ReferenceLine y={1.5} stroke="#dc2626" strokeDasharray="4 4" label={{ value: "FS=1.5 (Kayma)", position: "right", fontSize: 9, fill: "#dc2626" }} />
              <ReferenceLine y={2.0} stroke="#d97706" strokeDasharray="4 4" label={{ value: "FS=2.0 (Devrilme)", position: "right", fontSize: 9, fill: "#d97706" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Yanal Basınç Dağılımı */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Yanal Basınç Dağılımı</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={Array.from({ length: 11 }, (_, i) => {
                const z = (i / 10) * H;
                const sigma_a = result.Ka * gammaF * z + result.Ka * q;
                return { "Derinlik (m)": z, "σa (kPa)": parseFloat(sigma_a.toFixed(1)) };
              })}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" label={{ value: "Aktif basınç σa (kPa)", position: "insideBottom", offset: -5, fontSize: 11 }} tick={{ fontSize: 10 }} />
              <YAxis dataKey="Derinlik (m)" type="number" reversed label={{ value: "Derinlik (m)", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="σa (kPa)" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} name="Aktif Basınç" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Duvar çizimi */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Duvar Kesiti</h2>
          <svg viewBox="0 0 400 250" className="w-full" style={{ maxHeight: 250 }}>
            {/* Zemin */}
            <rect x={0} y={200} width={400} height={50} fill="rgba(180,140,100,0.2)" />
            {/* Duvar (trapez) */}
            {(() => {
              const scale = 180 / H;
              const bPx = B * scale;
              const btPx = Bt * scale;
              const hPx = H * scale;
              const x0 = 100;
              return (
                <>
                  <polygon points={`${x0},200 ${x0 + bPx},200 ${x0 + bPx - (bPx - btPx)},${200 - hPx} ${x0},${200 - hPx}`} fill="rgba(150,150,150,0.6)" stroke="rgb(100,100,100)" strokeWidth={2} />
                  <text x={x0 + bPx / 2} y={200 - hPx / 2} textAnchor="middle" fontSize={10} fill="white" fontWeight="bold">W={result.wallWeight}</text>
                  {/* Dolgu */}
                  <rect x={x0 + bPx} y={200 - hPx} width={150} height={hPx} fill="rgba(210,180,140,0.3)" stroke="rgb(180,140,100)" strokeWidth={1} strokeDasharray="4 4" />
                  <text x={x0 + bPx + 75} y={200 - hPx / 2} textAnchor="middle" fontSize={9} fill="rgb(140,100,60)">Dolgu</text>
                  {/* Pa oku */}
                  <line x1={x0 + bPx + 5} y1={200 - hPx / 3} x2={x0 + bPx - 30} y2={200 - hPx / 3} stroke="rgb(239,68,68)" strokeWidth={2} markerEnd="url(#arrW)" />
                  <text x={x0 + bPx + 10} y={200 - hPx / 3 - 5} fontSize={9} fill="rgb(239,68,68)">Pa={result.Pa}</text>
                  <defs><marker id="arrW" markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="rgb(239,68,68)" /></marker></defs>
                  {/* Boyutlar */}
                  <text x={x0 + bPx / 2} y={215} textAnchor="middle" fontSize={9} fill="currentColor">B={B}m</text>
                  <text x={x0 - 15} y={200 - hPx / 2} fontSize={9} fill="currentColor" textAnchor="end">H={H}m</text>
                  {/* Taban basıncı */}
                  <text x={x0} y={240} fontSize={8} fill="rgb(59,130,246)">q={result.basePressure.qHeel}kPa</text>
                  <text x={x0 + bPx - 5} y={240} textAnchor="end" fontSize={8} fill="rgb(59,130,246)">q={result.basePressure.qToe}kPa</text>
                </>
              );
            })()}
          </svg>
        </div>
      </div>
    </div>
  );
}

function ReinforcedForm() {
  const [H, setH] = useState(6);
  const [gamma, setGamma] = useState(18);
  const [phi, setPhi] = useState(32);
  const [q, setQ] = useState(10);
  const [Tult, setTult] = useState(50);
  const [FS_gg, setFS_gg] = useState(3);
  const [Sv, setSv] = useState(0.5);
  const [Ci, setCi] = useState(0.8);

  const result = useMemo(() => reinforcedSoilDesign({ height: H, gamma, frictionAngle: phi, surcharge: q, geogridStrength: Tult, geogridFS: FS_gg, verticalSpacing: Sv, interactionCoeff: Ci }), [H, gamma, phi, q, Tult, FS_gg, Sv, Ci]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi</h2>
        <Field label="Duvar yüksekliği H (m)" value={H} onChange={setH} min={2} max={15} step={0.5} />
        <Field label="γ dolgu (kN/m³)" value={gamma} onChange={setGamma} min={14} max={22} step={0.5} />
        <Field label="φ dolgu (°)" value={phi} onChange={setPhi} min={25} max={45} />
        <Field label="Sürşarj q (kPa)" value={q} onChange={setQ} min={0} />
        <hr className="border-[var(--card-border)]" />
        <Field label="Geogrid Tult (kN/m)" value={Tult} onChange={setTult} min={10} max={200} />
        <Field label="Geogrid FS (creep+hasar)" value={FS_gg} onChange={setFS_gg} min={1.5} max={5} step={0.1} />
        <Field label="Düşey aralık Sv (m)" value={Sv} onChange={setSv} min={0.2} max={1} step={0.1} />
        <Field label="Etkileşim katsayısı Ci" value={Ci} onChange={setCi} min={0.5} max={1} step={0.05} />
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">{result.method}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <RBox label="Ta (izin ver.)" value={`${result.allowableStrength} kN/m`} color="blue" />
            <RBox label="Donatı uzunluğu L" value={`${result.totalLength} m`} color="blue" />
            <RBox label="Tabaka sayısı" value={result.numberOfLayers.toString()} color="gray" />
            <RBox label="FS iç stabilite" value={result.FS_internal.toString()} color={result.FS_internal >= 1.5 ? "green" : "red"} />
            <RBox label="FS dış (kayma)" value={result.FS_external.toString()} color={result.FS_external >= 1.5 ? "green" : "red"} />
          </div>
        </div>

        {/* Tabaka tablosu */}
        <div className="card p-6">
          <h3 className="text-sm font-medium mb-2">Donatı Tabakaları</h3>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[var(--card)]"><tr className="border-b border-[var(--card-border)]">
                <th className="text-left py-1">#</th><th className="text-right py-1">z (m)</th><th className="text-right py-1">σh (kPa)</th><th className="text-right py-1">T gerekli (kN/m)</th><th className="text-right py-1">Le (m)</th><th className="text-right py-1">L toplam (m)</th>
              </tr></thead>
              <tbody>{result.layers.map((l, i) => (
                <tr key={i} className="border-b border-[var(--card-border)]">
                  <td className="py-1">{i + 1}</td><td className="text-right">{l.depth}</td><td className="text-right">{l.sigma_h}</td><td className="text-right font-medium">{l.T_required}</td><td className="text-right">{l.Le}</td><td className="text-right">{l.L_total}</td>
                </tr>
              ))}</tbody>
            </table>
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
  const c: Record<string, string> = { green: "bg-green-50 dark:bg-green-900/20 text-green-700", blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700", orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-700", red: "bg-red-50 dark:bg-red-900/20 text-red-700", gray: "bg-earth-50 dark:bg-neutral-800" };
  return (<div className={`rounded-lg p-3 text-center ${c[color] || c.gray}`}><p className="text-[10px] text-[var(--muted)]">{label}</p><p className="text-lg font-bold">{value}</p></div>);
}
