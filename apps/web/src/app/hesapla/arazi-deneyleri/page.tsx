"use client";
import ExportPDFButton from "@/components/ExportPDFButton";
import MethodologySection from "@/components/MethodologySection";
import type { MethodologyData } from "@/components/MethodologySection";
import { useState, useMemo } from "react";
import { stressProfile, sptCorrelations, darcySeepage } from "@geoforce/engine";
import type { StressLayer } from "@geoforce/engine";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

const methodology: MethodologyData = {
  title: "Arazi Deneyleri ve Efektif Gerilme Analizi",
  overview: "Arazi deneyleri, zemin parametrelerinin yerinde (in-situ) belirlenmesi için kullanılır. SPT (Standart Penetrasyon Deneyi) en yaygın arazi deneyidir. Efektif gerilme profili, zemin tabakalarının ağırlığı ve yeraltı suyu koşullarına bağlı olarak hesaplanır. Darcy yasası ise zeminlerdeki su akışını tanımlar.",
  methods: [
    {
      name: "Efektif Gerilme Profili",
      description: "Zemin içindeki herhangi bir derinlikteki toplam gerilme, boşluk suyu basıncı ve efektif gerilme hesaplanır. Terzaghi'nin efektif gerilme ilkesi temel alınır.",
      formulas: [
        { name: "Toplam düşey gerilme", formula: "σv = Σ(γᵢ × hᵢ) + q", description: "γ: birim hacim ağırlık, h: tabaka kalınlığı, q: sürşarj" },
        { name: "Boşluk suyu basıncı", formula: "u = γw × (z − zw)", description: "γw = 9.81 kN/m³, zw: YASS derinliği" },
        { name: "Efektif gerilme (Terzaghi)", formula: "σ'v = σv − u", description: "Dane iskeletinin taşıdığı gerilme" },
        { name: "YASS altında birim hacim ağırlık", formula: "γ' = γsat − γw", description: "Batık birim hacim ağırlık" },
      ],
      steps: [
        { step: 1, title: "Zemin profili tanımı", description: "Tabaka kalınlıkları, γ ve γsat değerleri belirlenir" },
        { step: 2, title: "YASS belirleme", description: "Yeraltı su seviyesi derinliği tespit edilir" },
        { step: 3, title: "Gerilme hesabı", description: "Her derinlikte σv, u ve σ'v hesaplanır" },
      ],
      limitations: ["Homojen tabaka varsayımı yapılır", "Artezyen basınç durumları ayrıca değerlendirilmelidir"],
    },
    {
      name: "SPT Korelasyonları — Standart Penetrasyon Deneyi",
      description: "63.5 kg ağırlığın 76 cm yükseklikten serbest düşürülmesiyle numune alıcının 30 cm sokulması için gereken darbe sayısı (N) ölçülür. Enerji ve derinlik düzeltmeleri uygulanarak zemin parametreleri tahmin edilir.",
      formulas: [
        { name: "Enerji düzeltmesi", formula: "N60 = N × (ER/60)", description: "ER: enerji oranı (%), Türkiye'de genellikle %60" },
        { name: "Derinlik düzeltmesi (Liao & Whitman)", formula: "CN = √(Pa/σ'v) ≤ 2.0", description: "Pa = 100 kPa (atmosfer basıncı)" },
        { name: "Düzeltilmiş SPT", formula: "(N1)60 = N60 × CN" },
        { name: "Sürtünme açısı (Hatanaka & Uchida)", formula: "φ' = √(20 × (N1)60) + 20 (°)", description: "Kumlar için" },
        { name: "Bağıl sıkılık (Skempton)", formula: "Dr = √((N1)60 / 60) × 100 (%)", description: "Kumlar için" },
        { name: "Drenajsız kayma dayanımı", formula: "cu ≈ 6.25 × N (kPa)", description: "Killer için yaklaşık korelasyon" },
        { name: "Elastisite modülü", formula: "Es ≈ 500 × (N+15) kPa (kil), Es ≈ 2.5–3.5 × N60 MPa (kum)" },
      ],
      steps: [
        { step: 1, title: "Ham N değeri", description: "Sahada ölçülen SPT darbe sayısı kaydedilir" },
        { step: 2, title: "Enerji düzeltmesi", description: "N60 = N × CE (CE = ER/60)" },
        { step: 3, title: "Derinlik düzeltmesi", description: "(N1)60 = N60 × CN" },
        { step: 4, title: "Parametre tahmini", description: "φ', Dr, cu, Es korelasyonlarla hesaplanır" },
      ],
      limitations: ["Korelasyonlar ampirik ve bölgesel farklılık gösterebilir", "Çakıllı zeminlerde N değeri yanıltıcı olabilir", "Enerji oranı ölçümü önemlidir"],
    },
    {
      name: "Darcy Yasası — Sızma Analizi",
      description: "Zeminlerdeki laminer su akışını tanımlayan temel yasa. Permeabilite katsayısı (k) ve hidrolik eğim (i) ile debi hesaplanır.",
      formulas: [
        { name: "Darcy yasası", formula: "Q = k × i × A", description: "Q: debi, k: permeabilite, i: hidrolik eğim, A: kesit alanı" },
        { name: "Hidrolik eğim", formula: "i = Δh / L", description: "Δh: yük farkı, L: akış yolu uzunluğu" },
        { name: "Kritik hidrolik eğim", formula: "ic = (Gs − 1) / (1 + e)", description: "Kabarma (heave) başlangıcı" },
        { name: "Kabarma güvenlik katsayısı", formula: "FS = ic / i ≥ 2.0" },
      ],
      limitations: ["Yalnızca laminer akış için geçerlidir (Re < 1)", "Türbülanslı akışta (çakıl) geçerli değildir"],
    },
  ],
  references: [
    "Terzaghi, K. (1925). Erdbaumechanik auf Bodenphysikalischer Grundlage.",
    "Liao, S.S.C. & Whitman, R.V. (1986). Overburden Correction Factors for SPT in Sand. JGED, ASCE.",
    "Hatanaka, M. & Uchida, A. (1996). Empirical Correlation between Penetration Resistance and Internal Friction Angle of Sandy Soils. Soils and Foundations.",
    "Skempton, A.W. (1986). Standard Penetration Test Procedures. Géotechnique, 36(3).",
    "Das, B.M. (2019). Principles of Geotechnical Engineering, 9th Ed.",
  ],
  standards: ["ASTM D1586 (SPT)", "ASTM D2434 (Permeabilite)", "TS EN ISO 22476-3"],
  notes: [
    "SPT, dünyada en yaygın kullanılan arazi deneyidir ancak sonuçları operatöre bağlıdır.",
    "Enerji düzeltmesi yapılmadan SPT N değerleri karşılaştırılmamalıdır.",
    "YASS altındaki zeminlerde efektif gerilme, toplam gerilmeden önemli ölçüde düşüktür.",
  ],
};

type Tab = "stress" | "spt" | "seepage";

export default function AraziDeneyPage() {
  const [tab, setTab] = useState<Tab>("stress");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">🔍 Arazi Deneyleri & Gerilme</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Efektif gerilme profili, SPT korelasyonları, Darcy sızma analizi</p>
      <div className="mt-2"><ExportPDFButton moduleName="Arazi Deneyleri" method="Efektif Gerilme / SPT / Darcy" inputs={{ "Hesap tipi": tab }} results={{}} /></div>
      <MethodologySection data={methodology} />
      <div className="mt-6 flex gap-2 flex-wrap">
        {([["stress", "Gerilme Profili"], ["spt", "SPT Korelasyonları"], ["seepage", "Sızma (Darcy)"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === k ? "bg-brand-600 text-white" : "bg-[var(--card)] border border-[var(--card-border)]"}`}>{l}</button>
        ))}
      </div>
      <div className="mt-6">
        {tab === "stress" && <StressForm />}
        {tab === "spt" && <SPTForm />}
        {tab === "seepage" && <SeepageForm />}
      </div>
    </div>
  );
}

function StressForm() {
  const [waterTable, setWaterTable] = useState(3);
  const [surcharge, setSurcharge] = useState(0);
  const [layers, setLayers] = useState<(StressLayer & { id: number })[]>([
    { id: 1, thickness: 3, gamma: 17 },
    { id: 2, thickness: 4, gamma: 18, gammaSat: 20 },
    { id: 3, thickness: 6, gamma: 19, gammaSat: 21 },
  ]);

  const addLayer = () => setLayers([...layers, { id: Date.now(), thickness: 3, gamma: 18, gammaSat: 20 }]);
  const removeLayer = (id: number) => setLayers(layers.filter(l => l.id !== id));
  const updateLayer = (id: number, key: string, val: number) => setLayers(layers.map(l => l.id === id ? { ...l, [key]: val } : l));

  const result = useMemo(() => stressProfile({ layers, waterTableDepth: waterTable, surcharge }), [layers, waterTable, surcharge]);

  const maxStress = Math.max(...result.profile.map(p => p.totalStress), 1);
  const maxDepth = result.profile.length > 0 ? result.profile[result.profile.length - 1].depth : 10;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi</h2>
        <Field label="YASS derinliği (m)" value={waterTable} onChange={setWaterTable} min={0} step={0.5} />
        <Field label="Sürşarj q (kPa)" value={surcharge} onChange={setSurcharge} min={0} />
        <h3 className="text-sm font-medium pt-2">Tabakalar</h3>
        {layers.map(l => (
          <div key={l.id} className="p-3 rounded-lg bg-earth-50 dark:bg-neutral-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium">h={l.thickness}m</span>
              <button onClick={() => removeLayer(l.id)} className="text-xs text-red-500">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <MiniField label="h (m)" value={l.thickness} onChange={v => updateLayer(l.id, "thickness", v)} />
              <MiniField label="γ (kN/m³)" value={l.gamma} onChange={v => updateLayer(l.id, "gamma", v)} />
              <MiniField label="γsat" value={l.gammaSat ?? l.gamma} onChange={v => updateLayer(l.id, "gammaSat", v)} />
            </div>
          </div>
        ))}
        <button onClick={addLayer} className="btn-secondary w-full text-xs">+ Tabaka Ekle</button>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Gerilme Profili</h2>
          <svg viewBox="0 0 600 350" className="w-full" style={{ maxHeight: 350 }}>
            <line x1={80} y1={20} x2={80} y2={310} stroke="currentColor" strokeWidth={1} />
            <line x1={80} y1={310} x2={560} y2={310} stroke="currentColor" strokeWidth={1} />
            <text x={320} y={340} textAnchor="middle" fontSize={10} fill="currentColor">Gerilme (kPa)</text>
            <text x={20} y={165} textAnchor="middle" fontSize={10} fill="currentColor" transform="rotate(-90,20,165)">Derinlik (m)</text>

            {/* YASS çizgisi */}
            {waterTable < maxDepth && (
              <>
                <line x1={80} y1={20 + (waterTable / maxDepth) * 290} x2={560} y2={20 + (waterTable / maxDepth) * 290} stroke="rgb(59,130,246)" strokeWidth={1} strokeDasharray="6 3" />
                <text x={565} y={24 + (waterTable / maxDepth) * 290} fontSize={8} fill="rgb(59,130,246)">YASS</text>
              </>
            )}

            {/* Toplam gerilme */}
            <polyline points={result.profile.map(p => `${80 + (p.totalStress / maxStress) * 470},${20 + (p.depth / maxDepth) * 290}`).join(" ")} fill="none" stroke="rgb(239,68,68)" strokeWidth={2} />
            {/* Boşluk suyu basıncı */}
            <polyline points={result.profile.map(p => `${80 + (p.porePressure / maxStress) * 470},${20 + (p.depth / maxDepth) * 290}`).join(" ")} fill="none" stroke="rgb(59,130,246)" strokeWidth={2} />
            {/* Efektif gerilme */}
            <polyline points={result.profile.map(p => `${80 + (p.effectiveStress / maxStress) * 470},${20 + (p.depth / maxDepth) * 290}`).join(" ")} fill="none" stroke="rgb(34,197,94)" strokeWidth={2} />

            {/* Legend */}
            <line x1={100} y1={15} x2={130} y2={15} stroke="rgb(239,68,68)" strokeWidth={2} />
            <text x={135} y={19} fontSize={9} fill="currentColor">σ (toplam)</text>
            <line x1={220} y1={15} x2={250} y2={15} stroke="rgb(59,130,246)" strokeWidth={2} />
            <text x={255} y={19} fontSize={9} fill="currentColor">u (boşluk suyu)</text>
            <line x1={370} y1={15} x2={400} y2={15} stroke="rgb(34,197,94)" strokeWidth={2} />
            <text x={405} y={19} fontSize={9} fill="currentColor">σ&apos; (efektif)</text>
          </svg>
        </div>

        {/* Tablo */}
        <div className="card p-6">
          <h3 className="text-sm font-medium mb-2">Gerilme Tablosu</h3>
          <div className="overflow-x-auto max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[var(--card)]"><tr className="border-b border-[var(--card-border)]">
                <th className="text-left py-1">z (m)</th><th className="text-right py-1">σ (kPa)</th><th className="text-right py-1">u (kPa)</th><th className="text-right py-1">σ&apos; (kPa)</th>
              </tr></thead>
              <tbody>{result.profile.filter((_, i) => i % 2 === 0 || i === result.profile.length - 1).map((p, i) => (
                <tr key={i} className="border-b border-[var(--card-border)]">
                  <td className="py-1">{p.depth}</td><td className="text-right">{p.totalStress}</td><td className="text-right text-blue-600">{p.porePressure}</td><td className="text-right font-medium text-green-600">{p.effectiveStress}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>

        {/* Recharts Gerilme Profili */}
        <div className="card p-6">
          <h3 className="text-sm font-medium mb-3">Gerilme Profili Grafiği (Recharts)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={result.profile.filter((_, i) => i % 2 === 0 || i === result.profile.length - 1).map(p => ({ depth: p.depth, "σv (kPa)": Number(p.totalStress), "u (kPa)": Number(p.porePressure), "σ'v (kPa)": Number(p.effectiveStress) }))} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" label={{ value: "Gerilme (kPa)", position: "insideBottom", offset: -2, fontSize: 11 }} tick={{ fontSize: 10 }} />
              <YAxis type="number" dataKey="depth" reversed label={{ value: "Derinlik (m)", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="σv (kPa)" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="σv (toplam)" />
              <Line type="monotone" dataKey="u (kPa)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="u (boşluk suyu)" />
              <Line type="monotone" dataKey="σ'v (kPa)" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="σ'v (efektif)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SPTForm() {
  const [N, setN] = useState(20);
  const [depth, setDepth] = useState(8);
  const [effectiveStress, setEffectiveStress] = useState(100);
  const [soilType, setSoilType] = useState<"sand" | "clay">("sand");
  const [energyRatio, setEnergyRatio] = useState(60);

  const result = useMemo(() => sptCorrelations({ N, depth, effectiveStress, soilType, energyRatio }), [N, depth, effectiveStress, soilType, energyRatio]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">SPT Girdi</h2>
        <Field label="Ham SPT N değeri" value={N} onChange={setN} min={0} max={100} />
        <Field label="Derinlik (m)" value={depth} onChange={setDepth} min={0.5} step={0.5} />
        <Field label="Efektif gerilme σ'v (kPa)" value={effectiveStress} onChange={setEffectiveStress} min={1} />
        <Field label="Enerji oranı (%)" value={energyRatio} onChange={setEnergyRatio} min={30} max={100} />
        <div>
          <label className="block text-sm font-medium mb-1">Zemin tipi</label>
          <select value={soilType} onChange={e => setSoilType(e.target.value as any)} className="input-field">
            <option value="sand">Kum</option>
            <option value="clay">Kil</option>
          </select>
        </div>
      </div>
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Sonuçlar</h2>
        <div className="grid grid-cols-2 gap-3">
          <RBox label="N60" value={result.N60.toString()} color="blue" />
          <RBox label="(N1)60" value={result.N1_60.toString()} color="blue" />
          <RBox label="CN" value={result.CN.toString()} color="gray" />
          <RBox label="Es (kPa)" value={result.elasticModulus.toString()} color="gray" />
          {result.frictionAngle !== undefined && <RBox label="φ (°)" value={result.frictionAngle.toString()} color="orange" />}
          {result.relativeDensity !== undefined && <RBox label="Dr (%)" value={result.relativeDensity.toString()} color="orange" />}
          {result.cu !== undefined && <RBox label="cu (kPa)" value={result.cu.toString()} color="orange" />}
          {(result.density || result.consistency) && <RBox label="Tanım" value={result.density || result.consistency || ""} color="green" />}
        </div>
        <div className="mt-2 p-3 rounded-lg bg-earth-50 dark:bg-neutral-800 text-xs space-y-1">
          <p>N60 = N × CE × CB × CS × CR = {N} × {(energyRatio / 60).toFixed(2)} × 1 × 1 × CR</p>
          <p>(N1)60 = N60 × CN = {result.N60} × {result.CN} = {result.N1_60}</p>
          <p className="text-[var(--muted)]">Ref: Liao & Whitman (1986), Skempton (1986), Hatanaka & Uchida (1996)</p>
        </div>

        {/* SPT Düzeltme Karşılaştırma Grafiği */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">SPT Düzeltme Karşılaştırması</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[{ name: "N (ham)", value: N }, { name: "N60", value: result.N60 }, { name: "(N1)60", value: result.N1_60 }]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} label={{ value: "Darbe Sayısı", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="value" name="SPT Değeri" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Parametre Özet Grafiği */}
        {soilType === "sand" && result.frictionAngle !== undefined && result.relativeDensity !== undefined && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Tahmin Edilen Parametreler</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[{ name: "φ' (°)", value: result.frictionAngle }, { name: "Dr (%)", value: result.relativeDensity }]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="value" name="Değer" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function SeepageForm() {
  const [k, setK] = useState(0.0001);
  const [i, setI] = useState(0.5);
  const [A, setA] = useState(10);
  const [Gs, setGs] = useState(2.65);
  const [e, setE] = useState(0.7);

  const result = useMemo(() => darcySeepage({ permeability: k, hydraulicGradient: i, area: A, Gs, voidRatio: e }), [k, i, A, Gs, e]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Darcy Sızma</h2>
        <Field label="Permeabilite k (m/s)" value={k} onChange={setK} min={1e-10} max={1} step={0.00001} />
        <Field label="Hidrolik eğim i = Δh/L" value={i} onChange={setI} min={0.01} max={5} step={0.01} />
        <Field label="Kesit alanı A (m²)" value={A} onChange={setA} min={0.1} step={0.1} />
        <Field label="Gs" value={Gs} onChange={setGs} min={2.4} max={2.9} step={0.01} />
        <Field label="Boşluk oranı e" value={e} onChange={setE} min={0.2} max={3} step={0.05} />
      </div>
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Sonuçlar</h2>
        <div className="grid grid-cols-2 gap-3">
          <RBox label="Debi Q" value={`${result.flowRate} m³/s`} color="blue" />
          <RBox label="Debi" value={`${result.flowRateLpm} L/dk`} color="blue" />
          <RBox label="Darcy hızı v" value={`${result.darcyVelocity} m/s`} color="gray" />
          <RBox label="Kritik eğim ic" value={result.criticalGradient?.toString() ?? "-"} color="orange" />
          <RBox label="FS (kabarma)" value={result.FS_heave?.toString() ?? "-"} color={result.FS_heave && result.FS_heave >= 2 ? "green" : "red"} />
        </div>
        <div className="mt-2 p-3 rounded-lg bg-earth-50 dark:bg-neutral-800 text-xs space-y-1">
          <p>Q = k × i × A = {k} × {i} × {A} = {result.flowRate} m³/s</p>
          <p>ic = (Gs - 1) / (1 + e) = ({Gs} - 1) / (1 + {e}) = {result.criticalGradient}</p>
          <p>FS = ic / i = {result.criticalGradient} / {i} = {result.FS_heave}</p>
          {result.FS_heave && result.FS_heave < 2 && <p className="text-red-600">⚠️ FS &lt; 2.0 — Kabarma (heave) riski!</p>}
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
function RBox({ label, value, color }: { label: string; value: string; color: string }) {
  const c: Record<string, string> = { green: "bg-green-50 dark:bg-green-900/20 text-green-700", blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700", orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-700", red: "bg-red-50 dark:bg-red-900/20 text-red-700", gray: "bg-earth-50 dark:bg-neutral-800" };
  return (<div className={`rounded-lg p-3 text-center ${c[color] || c.gray}`}><p className="text-[10px] text-[var(--muted)]">{label}</p><p className="text-lg font-bold">{value}</p></div>);
}
