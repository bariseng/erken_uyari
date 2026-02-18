"use client";
import ExportPDFButton from "@/components/ExportPDFButton";
import MethodologySection from "@/components/MethodologySection";
import type { MethodologyData } from "@/components/MethodologySection";
import { useState, useMemo } from "react";
import { consolidationTime, pvdAnalysis } from "@geoforce/engine";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, ReferenceLine } from "recharts";

const methodology: MethodologyData = {
  title: "Konsolidasyon Analizi",
  overview: "Konsolidasyon, doygun ince daneli zeminlerde yük artışı sonucu boşluk suyu basıncının dissipasyonu ile zamana bağlı hacim azalmasıdır. Terzaghi 1D konsolidasyon teorisi, zaman-oturma ilişkisini tanımlar. PVD (prefabrik düşey dren) uygulaması ile konsolidasyon süresi önemli ölçüde kısaltılabilir.",
  methods: [
    {
      name: "Terzaghi 1D Konsolidasyon Teorisi",
      description: "Tek boyutlu konsolidasyon diferansiyel denkleminin çözümüne dayanır. Konsolidasyon derecesi (U) ve zaman faktörü (Tv) ilişkisi ile herhangi bir zamandaki oturma hesaplanır.",
      formulas: [
        { name: "Zaman faktörü", formula: "Tv = cv × t / Hdr²", description: "cv: konsolidasyon katsayısı, t: zaman, Hdr: drenaj yolu" },
        { name: "U < %60 için", formula: "Tv = (π/4) × (U/100)²", description: "Yaklaşık formül" },
        { name: "U > %60 için", formula: "Tv = −0.9332 × log(1 − U/100) − 0.0851" },
        { name: "Oturma", formula: "St = U × Sc", description: "St: t anındaki oturma, Sc: toplam birincil oturma" },
        { name: "Drenaj yolu", formula: "Hdr = H/2 (çift yönlü), Hdr = H (tek yönlü)", description: "H: sıkışabilir tabaka kalınlığı" },
      ],
      steps: [
        { step: 1, title: "cv belirleme", description: "Ödometre deneyinden √t veya log(t) yöntemi ile cv hesaplanır" },
        { step: 2, title: "Drenaj koşulu", description: "Tek veya çift yönlü drenaj belirlenir" },
        { step: 3, title: "Hedef U veya t", description: "İstenen konsolidasyon derecesi veya süre belirlenir" },
        { step: 4, title: "Tv ve hesap", description: "Tv hesaplanarak t veya U bulunur" },
      ],
      limitations: ["1D varsayım (yanal deformasyon yok)", "cv sabit kabul edilir", "İkincil konsolidasyon dahil değildir"],
    },
    {
      name: "PVD (Prefabrik Düşey Dren) Analizi — Barron-Hansbo",
      description: "Düşey drenler, yatay drenaj mesafesini kısaltarak konsolidasyonu hızlandırır. Barron (1948) ve Hansbo (1981) teorileri radyal konsolidasyonu tanımlar.",
      formulas: [
        { name: "Etki çapı (üçgen)", formula: "De = 1.05 × s", description: "s: dren aralığı" },
        { name: "Etki çapı (kare)", formula: "De = 1.13 × s" },
        { name: "Radyal konsolidasyon", formula: "Ur = 1 − exp(−8·ch·t / (De²·F(n)))", description: "ch: yatay konsolidasyon katsayısı" },
        { name: "F(n) fonksiyonu", formula: "F(n) = ln(n) − 0.75 + s_factor", description: "n = De/dw, smear etkisi dahil" },
        { name: "Kombine konsolidasyon", formula: "U = 1 − (1−Uv)·(1−Ur)", description: "Düşey ve radyal konsolidasyonun birleşimi" },
      ],
      steps: [
        { step: 1, title: "Dren parametreleri", description: "Aralık, çap, düzen (üçgen/kare) belirlenir" },
        { step: 2, title: "De ve n hesabı", description: "Etki çapı ve n oranı hesaplanır" },
        { step: 3, title: "Radyal konsolidasyon", description: "Ur zamana bağlı hesaplanır" },
        { step: 4, title: "Karşılaştırma", description: "PVD'li ve PVD'siz süreler karşılaştırılır" },
      ],
      limitations: ["Smear etkisi konsolidasyonu yavaşlatır", "Well resistance uzun drenlerde etkili olabilir", "ch/cv oranı genellikle 2-5 arasındadır"],
    },
  ],
  references: [
    "Terzaghi, K. (1925). Erdbaumechanik auf Bodenphysikalischer Grundlage.",
    "Barron, R.A. (1948). Consolidation of Fine-Grained Soils by Drain Wells. ASCE Transactions.",
    "Hansbo, S. (1981). Consolidation of Fine-Grained Soils by Prefabricated Drains. Proc. 10th ICSMFE.",
    "Das, B.M. (2019). Principles of Geotechnical Engineering, 9th Ed.",
  ],
  standards: ["ASTM D2435 (Ödometre)", "TS 1900-2", "BS 1377-5"],
  notes: [
    "cv değeri genellikle 1-10 m²/yıl arasındadır (killer için).",
    "PVD uygulaması konsolidasyon süresini 5-20 kat kısaltabilir.",
    "%90 konsolidasyon, mühendislik pratiğinde genellikle yeterli kabul edilir.",
    "İkincil konsolidasyon (creep), birincil konsolidasyon tamamlandıktan sonra devam eder.",
  ],
};

type Tab = "time" | "pvd";

export default function KonsolidasyonPage() {
  const [tab, setTab] = useState<Tab>("time");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">⏱️ Konsolidasyon Analizi</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Zaman-oturma ilişkisi ve PVD (prefabrik düşey dren) analizi</p>
      <div className="mt-2"><ExportPDFButton moduleName="Konsolidasyon Analizi" method="Zaman-Oturma / PVD" inputs={{ "Hesap tipi": tab }} results={{}} /></div>
      <MethodologySection data={methodology} />
      <div className="mt-6 flex gap-2">
        {([["time", "Zaman-Oturma"], ["pvd", "PVD (Kum Dren)"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === k ? "bg-brand-600 text-white" : "bg-[var(--card)] border border-[var(--card-border)]"}`}>{l}</button>
        ))}
      </div>
      <div className="mt-6">{tab === "time" ? <TimeForm /> : <PVDForm />}</div>
    </div>
  );
}

function TimeForm() {
  const [cv, setCv] = useState(3);
  const [drainagePath, setDrainagePath] = useState(5);
  const [mode, setMode] = useState<"degree" | "time">("degree");
  const [targetDegree, setTargetDegree] = useState(90);
  const [targetTime, setTargetTime] = useState(2);
  const [totalSettlement, setTotalSettlement] = useState(0.3);

  const result = useMemo(() => consolidationTime({
    cv, drainagePath,
    targetDegree: mode === "degree" ? targetDegree : undefined,
    targetTime: mode === "time" ? targetTime : undefined,
    totalSettlement,
  }), [cv, drainagePath, mode, targetDegree, targetTime, totalSettlement]);

  const maxT = result.timeCurve.length > 0 ? result.timeCurve[result.timeCurve.length - 1].time : 10;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi</h2>
        <Field label="Cv (m²/yıl)" value={cv} onChange={setCv} min={0.1} step={0.1} />
        <Field label="Drenaj yolu Hdr (m)" value={drainagePath} onChange={setDrainagePath} min={0.5} step={0.5} />
        <Field label="Toplam oturma Sc (m)" value={totalSettlement} onChange={setTotalSettlement} min={0.01} step={0.01} />
        <div>
          <label className="block text-sm font-medium mb-1">Hesap modu</label>
          <select value={mode} onChange={e => setMode(e.target.value as any)} className="input-field">
            <option value="degree">Hedef U% → Süre bul</option>
            <option value="time">Hedef süre → U% bul</option>
          </select>
        </div>
        {mode === "degree" && <Field label="Hedef U (%)" value={targetDegree} onChange={setTargetDegree} min={10} max={99} />}
        {mode === "time" && <Field label="Hedef süre (yıl)" value={targetTime} onChange={setTargetTime} min={0.1} step={0.1} />}
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Sonuç</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {result.requiredTime !== undefined && <RBox label="Gerekli Süre" value={`${result.requiredTime} yıl`} color="blue" />}
            {result.degreeOfConsolidation !== undefined && <RBox label="Konsolidasyon U" value={`%${result.degreeOfConsolidation}`} color="blue" />}
            <RBox label="Tv" value={result.Tv.toString()} color="gray" />
            {result.currentSettlement !== undefined && <RBox label="Oturma" value={`${result.currentSettlement} m`} color="orange" />}
            <RBox label="Artık Oturma" value={`${round(totalSettlement - (result.currentSettlement ?? 0), 4)} m`} color="red" />
          </div>
        </div>

        {/* Recharts Zaman-Konsolidasyon */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Zaman — Konsolidasyon (Recharts)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={result.timeCurve.map(p => ({ "Süre (yıl)": p.time, "U (%)": p.U }))} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="Süre (yıl)" type="number" label={{ value: "Süre (yıl)", position: "insideBottom", offset: -10, fontSize: 11 }} tick={{ fontSize: 10 }} />
              <YAxis label={{ value: "U (%)", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="U (%)" stroke="#2563eb" fill="rgba(37,99,235,0.15)" strokeWidth={2} name="Konsolidasyon Derecesi" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Zaman-oturma grafiği */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Zaman — Konsolidasyon Derecesi</h2>
          <svg viewBox="0 0 600 280" className="w-full" style={{ maxHeight: 280 }}>
            <line x1={60} y1={20} x2={60} y2={240} stroke="currentColor" strokeWidth={1} />
            <line x1={60} y1={240} x2={580} y2={240} stroke="currentColor" strokeWidth={1} />
            <text x={315} y={270} textAnchor="middle" fontSize={10} fill="currentColor">Süre (yıl)</text>
            <text x={15} y={130} textAnchor="middle" fontSize={10} fill="currentColor" transform="rotate(-90,15,130)">U (%)</text>

            {[25, 50, 75, 100].map(u => (
              <g key={u}>
                <line x1={60} y1={240 - (u / 100) * 210} x2={580} y2={240 - (u / 100) * 210} stroke="var(--card-border)" strokeWidth={0.5} />
                <text x={55} y={244 - (u / 100) * 210} textAnchor="end" fontSize={9} fill="var(--muted)">%{u}</text>
              </g>
            ))}

            <polyline
              points={result.timeCurve.map(p => {
                const x = 60 + (p.time / maxT) * 520;
                const y = 240 - (p.U / 100) * 210;
                return `${x},${y}`;
              }).join(" ")}
              fill="none" stroke="rgb(59,130,246)" strokeWidth={2}
            />

            {/* Hedef çizgisi */}
            {mode === "degree" && (
              <line x1={60} y1={240 - (targetDegree / 100) * 210} x2={580} y2={240 - (targetDegree / 100) * 210} stroke="rgb(239,68,68)" strokeWidth={1} strokeDasharray="4 4" />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}

function PVDForm() {
  const [cv, setCv] = useState(2);
  const [ch, setCh] = useState(6);
  const [layerThickness, setLayerThickness] = useState(10);
  const [spacing, setSpacing] = useState(1.5);
  const [pattern, setPattern] = useState<"square" | "triangular">("triangular");
  const [drainDiameter, setDrainDiameter] = useState(0.05);
  const [targetDegree, setTargetDegree] = useState(90);

  const result = useMemo(() => pvdAnalysis({ cv, ch, layerThickness, spacing, pattern, drainDiameter, targetDegree }), [cv, ch, layerThickness, spacing, pattern, drainDiameter, targetDegree]);

  const maxT = result.comparison.length > 0 ? result.comparison[result.comparison.length - 1].time : 10;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi</h2>
        <Field label="Cv (m²/yıl)" value={cv} onChange={setCv} min={0.1} step={0.1} />
        <Field label="Ch (m²/yıl)" value={ch} onChange={setCh} min={0.1} step={0.1} />
        <Field label="Tabaka kalınlığı H (m)" value={layerThickness} onChange={setLayerThickness} min={1} />
        <Field label="Dren aralığı s (m)" value={spacing} onChange={setSpacing} min={0.5} max={5} step={0.1} />
        <div>
          <label className="block text-sm font-medium mb-1">Dren düzeni</label>
          <select value={pattern} onChange={e => setPattern(e.target.value as any)} className="input-field">
            <option value="triangular">Üçgen</option>
            <option value="square">Kare</option>
          </select>
        </div>
        <Field label="Dren çapı dw (m)" value={drainDiameter} onChange={setDrainDiameter} min={0.01} max={0.2} step={0.01} />
        <Field label="Hedef U (%)" value={targetDegree} onChange={setTargetDegree} min={50} max={99} />
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">PVD Sonuçları — {result.method}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <RBox label="Drensiz Süre" value={`${result.timeWithoutPVD} yıl`} color="red" />
            <RBox label="PVD ile Süre" value={`${result.timeWithPVD} yıl`} color="green" />
            <RBox label="Hızlanma" value={`${result.speedupFactor}x`} color="blue" />
            <RBox label="De" value={`${result.influenceDiameter} m`} color="gray" />
            <RBox label="n = De/dw" value={result.n.toString()} color="gray" />
            <RBox label="Smear oranı" value={result.smearRatio.toString()} color="gray" />
          </div>
        </div>

        {/* Recharts PVD Karşılaştırma */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Karşılaştırma Grafiği</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={result.comparison.map(p => ({ "Süre (yıl)": p.time, "Drensiz U (%)": p.U_noPVD, "PVD U (%)": p.U_PVD }))} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="Süre (yıl)" type="number" label={{ value: "Süre (yıl)", position: "insideBottom", offset: -10, fontSize: 11 }} tick={{ fontSize: 10 }} />
              <YAxis label={{ value: "U (%)", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Drensiz U (%)" stroke="#dc2626" strokeWidth={2} dot={false} name="Drensiz" />
              <Line type="monotone" dataKey="PVD U (%)" stroke="#059669" strokeWidth={2} dot={false} name="PVD ile" />
              <ReferenceLine y={targetDegree} stroke="#d97706" strokeDasharray="4 4" label={{ value: `Hedef %${targetDegree}`, position: "right", fontSize: 10, fill: "#d97706" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

function Field({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (<div><label className="block text-sm font-medium mb-1">{label}</label><input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step ?? 1} className="input-field" /></div>);
}
function RBox({ label, value, color }: { label: string; value: string; color: string }) {
  const c: Record<string, string> = { green: "bg-green-50 dark:bg-green-900/20 text-green-700", blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700", orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-700", red: "bg-red-50 dark:bg-red-900/20 text-red-700", gray: "bg-earth-50 dark:bg-neutral-800" };
  return (<div className={`rounded-lg p-3 text-center ${c[color] || c.gray}`}><p className="text-[10px] text-[var(--muted)]">{label}</p><p className="text-lg font-bold">{value}</p></div>);
}
