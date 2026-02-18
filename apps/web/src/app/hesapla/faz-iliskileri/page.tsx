"use client";
import ExportPDFButton from "@/components/ExportPDFButton";
import MethodologySection from "@/components/MethodologySection";
import type { MethodologyData } from "@/components/MethodologySection";
import { useState, useMemo } from "react";
import { soilPhaseRelations, proctorAnalysis } from "@geoforce/engine";
import type { ProctorPoint } from "@geoforce/engine";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

const methodology: MethodologyData = {
  title: "Zemin Faz İlişkileri ve Kompaksiyon",
  overview: "Zemin üç fazdan oluşur: katı daneler, su ve hava. Faz ilişkileri bu bileşenlerin hacim ve ağırlık oranlarını tanımlar. Kompaksiyon ise mekanik enerji ile zeminin sıkıştırılarak kuru birim hacim ağırlığının artırılmasıdır.",
  methods: [
    {
      name: "Faz İlişkileri — Hacim-Ağırlık Bağıntıları",
      description: "Zemin faz diyagramı kullanılarak boşluk oranı, porozite, doygunluk derecesi, su muhtevası ve çeşitli birim hacim ağırlıklar hesaplanır.",
      formulas: [
        { name: "Boşluk oranı", formula: "e = Vv / Vs", description: "Boşluk hacminin katı hacmine oranı" },
        { name: "Porozite", formula: "n = Vv / Vt = e / (1 + e)", description: "Boşluk hacminin toplam hacme oranı" },
        { name: "Doygunluk derecesi", formula: "S = Vw / Vv × 100 (%)", description: "Su ile dolu boşluk oranı" },
        { name: "Su muhtevası", formula: "w = Ww / Ws × 100 (%)", description: "Su ağırlığının katı ağırlığa oranı" },
        { name: "Temel bağıntı", formula: "S × e = Gs × w", description: "Doygunluk, boşluk oranı ve su muhtevası ilişkisi" },
        { name: "Doğal birim hacim ağırlık", formula: "γ = Gs × γw × (1 + w) / (1 + e)", description: "γw = 9.81 kN/m³" },
        { name: "Kuru birim hacim ağırlık", formula: "γd = Gs × γw / (1 + e) = γ / (1 + w)" },
        { name: "Doygun birim hacim ağırlık", formula: "γsat = (Gs + e) × γw / (1 + e)" },
        { name: "Batık birim hacim ağırlık", formula: "γ' = γsat − γw = (Gs − 1) × γw / (1 + e)" },
      ],
      steps: [
        { step: 1, title: "Bilinen değerler", description: "Gs, e (veya n), S (veya w) gibi en az 2-3 parametre bilinmelidir" },
        { step: 2, title: "Temel bağıntı", description: "S·e = Gs·w ile bilinmeyenler hesaplanır" },
        { step: 3, title: "Birim hacim ağırlıklar", description: "γ, γd, γsat, γ' hesaplanır" },
      ],
      limitations: ["Gs genellikle 2.60-2.75 arasındadır (mineral bileşimine bağlı)", "Organik zeminlerde Gs daha düşük olabilir"],
    },
    {
      name: "Proctor Kompaksiyon Deneyi",
      description: "Belirli bir kompaksiyon enerjisi ile farklı su muhtevasında sıkıştırılan zemin numunelerinin kuru birim hacim ağırlıkları ölçülerek optimum su muhtevası (wopt) ve maksimum kuru birim hacim ağırlık (γd,max) belirlenir.",
      formulas: [
        { name: "Standart Proctor enerjisi", formula: "E = 600 kN·m/m³ (ASTM D698)", description: "2.5 kg tokmak, 30.5 cm düşme, 3 tabaka, 25 darbe" },
        { name: "Modifiye Proctor enerjisi", formula: "E = 2700 kN·m/m³ (ASTM D1557)", description: "4.54 kg tokmak, 45.7 cm düşme, 5 tabaka, 25 darbe" },
        { name: "Sıfır hava boşluğu (ZAV)", formula: "γd(ZAV) = Gs × γw / (1 + Gs × w)", description: "S = %100 durumundaki teorik üst sınır" },
        { name: "%95 kompaksiyon", formula: "γd,95 = 0.95 × γd,max", description: "Saha kabul kriteri" },
      ],
      steps: [
        { step: 1, title: "Numune hazırlama", description: "Farklı su muhtevasında (en az 5) numuneler hazırlanır" },
        { step: 2, title: "Kompaksiyon", description: "Her numune standart enerji ile sıkıştırılır" },
        { step: 3, title: "γd hesabı", description: "Her numune için γd = γ / (1 + w) hesaplanır" },
        { step: 4, title: "Eğri çizimi", description: "w - γd eğrisi çizilir, tepe noktası wopt ve γd,max verir" },
      ],
      limitations: ["Laboratuvar koşulları saha koşullarını tam yansıtmayabilir", "Çakıllı zeminlerde büyük kalıp gerekir"],
    },
  ],
  references: [
    "ASTM D698 — Standard Test Methods for Laboratory Compaction (Standard Proctor).",
    "ASTM D1557 — Standard Test Methods for Laboratory Compaction (Modified Proctor).",
    "Das, B.M. (2019). Principles of Geotechnical Engineering, 9th Ed.",
    "Holtz, R.D. et al. (2011). An Introduction to Geotechnical Engineering, 2nd Ed.",
  ],
  standards: ["ASTM D698", "ASTM D1557", "TS 1900-1", "TS EN 13286-2"],
  notes: [
    "Modifiye Proctor enerjisi standart Proctor'un yaklaşık 4.5 katıdır.",
    "Optimum su muhtevası genellikle plastik limitin biraz altındadır.",
    "Saha kompaksiyonu genellikle %95 Proctor kriteri ile kontrol edilir.",
  ],
};

type Tab = "phase" | "proctor";

export default function FazIliskileriPage() {
  const [tab, setTab] = useState<Tab>("phase");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">🔬 Zemin Faz İlişkileri & Kompaksiyon</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Boşluk oranı, birim hacim ağırlıklar, Proctor eğrisi</p>
      <div className="mt-2"><ExportPDFButton moduleName="Faz İlişkileri" method="Faz Diyagramı / Proctor" inputs={{ "Hesap tipi": tab }} results={{}} /></div>
      <MethodologySection data={methodology} />
      <div className="mt-6 flex gap-2">
        {([["phase", "Faz İlişkileri"], ["proctor", "Proctor Kompaksiyon"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === k ? "bg-brand-600 text-white" : "bg-[var(--card)] border border-[var(--card-border)]"}`}>{l}</button>
        ))}
      </div>
      <div className="mt-6">{tab === "phase" ? <PhaseForm /> : <ProctorForm />}</div>
    </div>
  );
}

function PhaseForm() {
  const [mode, setMode] = useState<"from_ratios" | "from_weights">("from_ratios");
  const [Gs, setGs] = useState(2.65);
  const [voidRatio, setVoidRatio] = useState(0.7);
  const [saturation, setSaturation] = useState(60);
  const [totalWeight, setTotalWeight] = useState(20);
  const [solidWeight, setSolidWeight] = useState(16);
  const [waterWeight, setWaterWeight] = useState(4);
  const [totalVolume, setTotalVolume] = useState(1);

  const result = useMemo(() => soilPhaseRelations(
    mode === "from_ratios"
      ? { mode, Gs, voidRatio, saturation }
      : { mode, Gs, totalWeight, solidWeight, waterWeight, totalVolume }
  ), [mode, Gs, voidRatio, saturation, totalWeight, solidWeight, waterWeight, totalVolume]);

  const maxV = result.phases.Vt;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Hesap modu</label>
          <select value={mode} onChange={e => setMode(e.target.value as any)} className="input-field">
            <option value="from_ratios">Oranlardan (e, S)</option>
            <option value="from_weights">Ağırlık/Hacimden</option>
          </select>
        </div>
        <Field label="Gs (dane özgül ağırlığı)" value={Gs} onChange={setGs} min={2.4} max={2.9} step={0.01} />
        {mode === "from_ratios" ? (
          <>
            <Field label="Boşluk oranı e" value={voidRatio} onChange={setVoidRatio} min={0.1} max={3} step={0.05} />
            <Field label="Doygunluk S (%)" value={saturation} onChange={setSaturation} min={0} max={100} />
          </>
        ) : (
          <>
            <Field label="Toplam ağırlık Wt (kN)" value={totalWeight} onChange={setTotalWeight} min={0.1} step={0.1} />
            <Field label="Katı ağırlık Ws (kN)" value={solidWeight} onChange={setSolidWeight} min={0.1} step={0.1} />
            <Field label="Su ağırlık Ww (kN)" value={waterWeight} onChange={setWaterWeight} min={0} step={0.1} />
            <Field label="Toplam hacim Vt (m³)" value={totalVolume} onChange={setTotalVolume} min={0.01} step={0.01} />
          </>
        )}
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Sonuçlar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <RBox label="Boşluk oranı e" value={result.voidRatio.toString()} color="blue" />
            <RBox label="Porozite n" value={`%${result.porosity}`} color="blue" />
            <RBox label="Doygunluk S" value={`%${result.saturation}`} color="blue" />
            <RBox label="Su muhtevası w" value={`%${result.waterContent}`} color="blue" />
            <RBox label="γ (doğal)" value={`${result.gammaNat} kN/m³`} color="orange" />
            <RBox label="γd (kuru)" value={`${result.gammaDry} kN/m³`} color="orange" />
            <RBox label="γsat (doygun)" value={`${result.gammaSat} kN/m³`} color="orange" />
            <RBox label="γ' (batık)" value={`${result.gammaSub} kN/m³`} color="orange" />
          </div>
        </div>

        {/* Recharts Faz Oranları */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Faz Oranları (Hacim & Ağırlık)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: "Hacim", Katı: Number(result.phases.Vs), Su: Number(result.phases.Vw), Hava: Number(result.phases.Va) },
              { name: "Ağırlık", Katı: Number(result.weights.Ws), Su: Number(result.weights.Ww), Hava: 0 },
            ]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Katı" stackId="a" fill="#a3764a" name="Katı" />
              <Bar dataKey="Su" stackId="a" fill="#3b82f6" name="Su" />
              <Bar dataKey="Hava" stackId="a" fill="#cbd5e1" name="Hava" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Birim Hacim Ağırlıklar Grafiği */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Birim Hacim Ağırlıklar</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { name: "γ (doğal)", value: Number(result.gammaNat) },
              { name: "γd (kuru)", value: Number(result.gammaDry) },
              { name: "γsat (doygun)", value: Number(result.gammaSat) },
              { name: "γ' (batık)", value: Number(result.gammaSub) },
            ]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} label={{ value: "kN/m³", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="value" name="γ (kN/m³)" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Faz diyagramı */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Faz Diyagramı</h2>
          <div className="flex gap-8 items-center justify-center">
            <svg viewBox="0 0 320 260" className="w-full" style={{ maxWidth: 400, maxHeight: 260 }}>
              {/* Hacim tarafı (sol) */}
              {(() => {
                const h = 200;
                const x0 = 80, w = 120;
                const hSolid = (result.phases.Vs / maxV) * h;
                const hWater = (result.phases.Vw / maxV) * h;
                const hAir = (result.phases.Va / maxV) * h;
                const y0 = 30;

                return (
                  <>
                    {/* Hava */}
                    <rect x={x0} y={y0} width={w} height={hAir} fill="rgba(200,220,255,0.3)" stroke="var(--card-border)" strokeWidth={1} />
                    {hAir > 15 && <text x={x0 + w / 2} y={y0 + hAir / 2 + 4} textAnchor="middle" fontSize={10} fill="var(--muted)">Hava</text>}

                    {/* Su */}
                    <rect x={x0} y={y0 + hAir} width={w} height={hWater} fill="rgba(59,130,246,0.3)" stroke="rgb(59,130,246)" strokeWidth={1} />
                    {hWater > 15 && <text x={x0 + w / 2} y={y0 + hAir + hWater / 2 + 4} textAnchor="middle" fontSize={10} fill="rgb(59,130,246)">Su</text>}

                    {/* Katı */}
                    <rect x={x0} y={y0 + hAir + hWater} width={w} height={hSolid} fill="rgba(180,140,100,0.5)" stroke="rgb(140,100,60)" strokeWidth={1} />
                    {hSolid > 15 && <text x={x0 + w / 2} y={y0 + hAir + hWater + hSolid / 2 + 4} textAnchor="middle" fontSize={10} fill="rgb(100,70,30)">Katı</text>}

                    {/* Hacim etiketleri (sol) */}
                    <text x={x0 - 5} y={y0 + hAir / 2 + 4} textAnchor="end" fontSize={9} fill="var(--muted)">Va={result.phases.Va}</text>
                    <text x={x0 - 5} y={y0 + hAir + hWater / 2 + 4} textAnchor="end" fontSize={9} fill="rgb(59,130,246)">Vw={result.phases.Vw}</text>
                    <text x={x0 - 5} y={y0 + hAir + hWater + hSolid / 2 + 4} textAnchor="end" fontSize={9} fill="rgb(140,100,60)">Vs={result.phases.Vs}</text>

                    {/* Ağırlık etiketleri (sağ) */}
                    <text x={x0 + w + 5} y={y0 + (hAir + hWater) / 2 + 4} fontSize={9} fill="rgb(59,130,246)">Ww={result.weights.Ww}</text>
                    <text x={x0 + w + 5} y={y0 + hAir + hWater + hSolid / 2 + 4} fontSize={9} fill="rgb(140,100,60)">Ws={result.weights.Ws}</text>

                    {/* Vv bracket */}
                    <line x1={x0 - 35} y1={y0} x2={x0 - 30} y2={y0} stroke="var(--muted)" strokeWidth={1} />
                    <line x1={x0 - 35} y1={y0} x2={x0 - 35} y2={y0 + hAir + hWater} stroke="var(--muted)" strokeWidth={1} />
                    <line x1={x0 - 35} y1={y0 + hAir + hWater} x2={x0 - 30} y2={y0 + hAir + hWater} stroke="var(--muted)" strokeWidth={1} />
                    <text x={x0 - 38} y={y0 + (hAir + hWater) / 2 + 4} textAnchor="end" fontSize={9} fill="var(--muted)">Vv</text>

                    {/* Başlıklar */}
                    <text x={x0 - 5} y={y0 - 8} textAnchor="end" fontSize={10} fill="currentColor">Hacim</text>
                    <text x={x0 + w + 5} y={y0 - 8} fontSize={10} fill="currentColor">Ağırlık</text>
                    <text x={x0 + w / 2} y={y0 + h + 20} textAnchor="middle" fontSize={10} fill="currentColor">Vt = {result.phases.Vt}</text>
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProctorForm() {
  const [testType, setTestType] = useState<"standard" | "modified">("standard");
  const [Gs, setGs] = useState(2.65);
  const [points, setPoints] = useState<(ProctorPoint & { id: number })[]>([
    { id: 1, waterContent: 8, dryDensity: 17.2 },
    { id: 2, waterContent: 10, dryDensity: 18.1 },
    { id: 3, waterContent: 12, dryDensity: 18.8 },
    { id: 4, waterContent: 14, dryDensity: 18.5 },
    { id: 5, waterContent: 16, dryDensity: 17.9 },
  ]);

  const addPoint = () => setPoints([...points, { id: Date.now(), waterContent: 0, dryDensity: 0 }]);
  const removePoint = (id: number) => setPoints(points.filter(p => p.id !== id));
  const updatePoint = (id: number, key: string, val: number) => setPoints(points.map(p => p.id === id ? { ...p, [key]: val } : p));

  const result = useMemo(() => proctorAnalysis({ points, Gs, testType }), [points, Gs, testType]);

  const allGammas = [...result.fitCurve.map(p => p.gammaD), ...result.zavCurve.map(p => p.gammaDZav)].filter(v => v > 0 && v < 30);
  const minG = Math.min(...allGammas, ...points.map(p => p.dryDensity)) - 1;
  const maxG = Math.max(...allGammas, ...points.map(p => p.dryDensity)) + 1;
  const minW = Math.min(...points.map(p => p.waterContent)) - 3;
  const maxW = Math.max(...points.map(p => p.waterContent)) + 3;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Deney Verileri</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Test tipi</label>
          <select value={testType} onChange={e => setTestType(e.target.value as any)} className="input-field">
            <option value="standard">Standart Proctor (ASTM D698)</option>
            <option value="modified">Modifiye Proctor (ASTM D1557)</option>
          </select>
        </div>
        <Field label="Gs" value={Gs} onChange={setGs} min={2.4} max={2.9} step={0.01} />
        {points.map((p, i) => (
          <div key={p.id} className="flex gap-2 items-end">
            <MiniField label={i === 0 ? "w (%)" : ""} value={p.waterContent} onChange={v => updatePoint(p.id, "waterContent", v)} />
            <MiniField label={i === 0 ? "γd (kN/m³)" : ""} value={p.dryDensity} onChange={v => updatePoint(p.id, "dryDensity", v)} />
            <button onClick={() => removePoint(p.id)} className="text-xs text-red-500 pb-2">✕</button>
          </div>
        ))}
        <button onClick={addPoint} className="btn-secondary w-full text-xs">+ Nokta Ekle</button>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">{result.method}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <RBox label="wopt" value={`%${result.optimumWaterContent}`} color="blue" />
            <RBox label="γd,max" value={`${result.maxDryDensity} kN/m³`} color="green" />
            <RBox label="%95 γd" value={`${result.range95.gammaD95} kN/m³`} color="orange" />
            <RBox label="%95 w aralığı" value={`${result.range95.wMin}-${result.range95.wMax}%`} color="gray" />
          </div>
        </div>

        {/* Proctor eğrisi - Recharts */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Proctor Eğrisi (Recharts)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={result.fitCurve.filter(p => p.gammaD > 0 && p.gammaD < 30).map(p => ({ w: p.w, "γd (fit)": Number(p.gammaD) }))} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="w" type="number" label={{ value: "Su muhtevası w (%)", position: "insideBottom", offset: -10, fontSize: 11 }} tick={{ fontSize: 10 }} />
              <YAxis label={{ value: "γd (kN/m³)", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="γd (fit)" stroke="#3b82f6" strokeWidth={2} dot={false} name="Proctor Eğrisi" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Proctor eğrisi - SVG */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Proctor Eğrisi (Detay)</h2>
          <svg viewBox="0 0 600 320" className="w-full" style={{ maxHeight: 320 }}>
            {/* Axes */}
            <line x1={60} y1={20} x2={60} y2={270} stroke="currentColor" strokeWidth={1} />
            <line x1={60} y1={270} x2={580} y2={270} stroke="currentColor" strokeWidth={1} />
            <text x={315} y={300} textAnchor="middle" fontSize={10} fill="currentColor">Su muhtevası w (%)</text>
            <text x={15} y={145} textAnchor="middle" fontSize={10} fill="currentColor" transform="rotate(-90,15,145)">γd (kN/m³)</text>

            {/* Grid */}
            {[0.25, 0.5, 0.75, 1].map(f => {
              const g = minG + f * (maxG - minG);
              const y = 270 - ((g - minG) / (maxG - minG)) * 250;
              return (
                <g key={f}>
                  <line x1={60} y1={y} x2={580} y2={y} stroke="var(--card-border)" strokeWidth={0.5} />
                  <text x={55} y={y + 4} textAnchor="end" fontSize={9} fill="var(--muted)">{g.toFixed(1)}</text>
                </g>
              );
            })}

            {/* ZAV eğrisi */}
            <polyline
              points={result.zavCurve.filter(p => p.gammaDZav >= minG && p.gammaDZav <= maxG).map(p => {
                const x = 60 + ((p.w - minW) / (maxW - minW)) * 520;
                const y = 270 - ((p.gammaDZav - minG) / (maxG - minG)) * 250;
                return `${x},${y}`;
              }).join(" ")}
              fill="none" stroke="rgb(156,163,175)" strokeWidth={1.5} strokeDasharray="6 3"
            />

            {/* Fit eğrisi */}
            <polyline
              points={result.fitCurve.filter(p => p.gammaD > minG && p.gammaD < maxG).map(p => {
                const x = 60 + ((p.w - minW) / (maxW - minW)) * 520;
                const y = 270 - ((p.gammaD - minG) / (maxG - minG)) * 250;
                return `${x},${y}`;
              }).join(" ")}
              fill="none" stroke="rgb(59,130,246)" strokeWidth={2}
            />

            {/* %95 çizgisi */}
            {result.range95.gammaD95 > minG && (
              <line
                x1={60} y1={270 - ((result.range95.gammaD95 - minG) / (maxG - minG)) * 250}
                x2={580} y2={270 - ((result.range95.gammaD95 - minG) / (maxG - minG)) * 250}
                stroke="rgb(249,115,22)" strokeWidth={1} strokeDasharray="4 4"
              />
            )}

            {/* Optimum nokta */}
            {result.maxDryDensity > 0 && (
              <>
                <circle
                  cx={60 + ((result.optimumWaterContent - minW) / (maxW - minW)) * 520}
                  cy={270 - ((result.maxDryDensity - minG) / (maxG - minG)) * 250}
                  r={5} fill="rgb(239,68,68)"
                />
                <text
                  x={65 + ((result.optimumWaterContent - minW) / (maxW - minW)) * 520}
                  y={265 - ((result.maxDryDensity - minG) / (maxG - minG)) * 250}
                  fontSize={9} fill="rgb(239,68,68)"
                >wopt={result.optimumWaterContent}%</text>
              </>
            )}

            {/* Deney noktaları */}
            {points.map((p, i) => {
              const x = 60 + ((p.waterContent - minW) / (maxW - minW)) * 520;
              const y = 270 - ((p.dryDensity - minG) / (maxG - minG)) * 250;
              return <circle key={i} cx={x} cy={y} r={4} fill="rgb(59,130,246)" stroke="white" strokeWidth={1.5} />;
            })}

            {/* Legend */}
            <line x1={400} y1={15} x2={420} y2={15} stroke="rgb(59,130,246)" strokeWidth={2} />
            <text x={425} y={19} fontSize={9} fill="currentColor">Proctor</text>
            <line x1={470} y1={15} x2={490} y2={15} stroke="rgb(156,163,175)" strokeWidth={1.5} strokeDasharray="6 3" />
            <text x={495} y={19} fontSize={9} fill="currentColor">ZAV</text>
          </svg>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (<div><label className="block text-sm font-medium mb-1">{label}</label><input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step ?? 1} className="input-field" /></div>);
}
function MiniField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (<div className="flex-1"><label className="block text-[10px] text-[var(--muted)]">{label}</label><input type="number" value={value} onChange={e => onChange(Number(e.target.value))} className="input-field text-xs py-1" /></div>);
}
function RBox({ label, value, color }: { label: string; value: string; color: string }) {
  const c: Record<string, string> = { green: "bg-green-50 dark:bg-green-900/20 text-green-700", blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700", orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-700", red: "bg-red-50 dark:bg-red-900/20 text-red-700", gray: "bg-earth-50 dark:bg-neutral-800" };
  return (<div className={`rounded-lg p-3 text-center ${c[color] || c.gray}`}><p className="text-[10px] text-[var(--muted)]">{label}</p><p className="text-lg font-bold">{value}</p></div>);
}
