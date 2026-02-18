"use client";
import ExportPDFButton from "@/components/ExportPDFButton";
import MethodologySection from "@/components/MethodologySection";
import type { MethodologyData } from "@/components/MethodologySection";
import { useState, useMemo } from "react";
import { dynamicCompaction, stoneColumn, preloading } from "@geoforce/engine";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ReferenceLine } from "recharts";

const methodology: MethodologyData = {
  title: "Zemin İyileştirme Yöntemleri",
  overview: "Zemin iyileştirme, mühendislik yapıları için yetersiz olan zemin özelliklerinin çeşitli tekniklerle geliştirilmesidir. Dinamik kompaksiyon gevşek granüler zeminleri sıkıştırır, taş kolon yumuşak zeminlerin taşıma kapasitesini artırır, ön yükleme ise konsolidasyon oturmasını yapım öncesinde tamamlar.",
  methods: [
    {
      name: "Dinamik Kompaksiyon — Menard Yöntemi",
      description: "Ağır bir tokmağın (10-40 ton) yüksekten (10-40 m) serbest düşürülmesiyle zemin sıkıştırılır. Menard (1975) tarafından geliştirilen ampirik formül ile etki derinliği tahmin edilir.",
      formulas: [
        { name: "Etki derinliği", formula: "D = n × √(W × h)", description: "W: tokmak ağırlığı (ton), h: düşme yüksekliği (m), n: zemin katsayısı" },
        { name: "n katsayısı", formula: "n = 0.5 (granüler), 0.4 (karışık), 0.35 (kohezyonlu)", description: "Zemin tipine bağlı ampirik katsayı" },
        { name: "Enerji", formula: "E = W × h (ton·m)", description: "Darbe başına enerji" },
        { name: "Grid aralığı", formula: "s ≈ 1.5–2.5 × D", description: "Darbe noktaları arası mesafe" },
      ],
      steps: [
        { step: 1, title: "Enerji hesabı", description: "W ve h belirlenerek darbe enerjisi hesaplanır" },
        { step: 2, title: "Etki derinliği", description: "D = n × √(W×h) ile iyileştirme derinliği tahmin edilir" },
        { step: 3, title: "Grid tasarımı", description: "Darbe noktaları ve pas sayısı belirlenir" },
        { step: 4, title: "Kontrol deneyleri", description: "SPT, CPT veya presiyometre ile iyileştirme doğrulanır" },
      ],
      limitations: ["Doygun ince daneli zeminlerde etkisizdir", "Titreşim ve gürültü komşu yapıları etkileyebilir", "Yeraltı suyu seviyesi yüksekse drenaj gerekir"],
    },
    {
      name: "Taş Kolon — Priebe (1995)",
      description: "Yumuşak zemin içine çakıl kolonları oluşturularak taşıma kapasitesi artırılır ve oturma azaltılır. Priebe yöntemi, alan oranı ve gerilme konsantrasyonuna dayalı analiz sunar.",
      formulas: [
        { name: "Alan oranı", formula: "ar = Ac / A = (π/4)·d² / A_etki", description: "Ac: kolon alanı, A: etki alanı" },
        { name: "Gerilme konsantrasyonu", formula: "n = σc / σs", description: "Kolon ve zemin gerilme oranı (tipik 2-5)" },
        { name: "Oturma azaltma faktörü", formula: "β = 1 / (1 + ar·(n−1))", description: "İyileştirilmiş oturma / iyileştirilmemiş oturma" },
        { name: "Kolon kapasitesi", formula: "qult = σr·Kp + 4·cu", description: "σr: radyal gerilme, Kp: pasif basınç katsayısı" },
      ],
      steps: [
        { step: 1, title: "Kolon geometrisi", description: "Çap, aralık ve düzen belirlenir" },
        { step: 2, title: "Alan oranı", description: "ar hesaplanır" },
        { step: 3, title: "Oturma azaltma", description: "β faktörü ile iyileştirilmiş oturma hesaplanır" },
        { step: 4, title: "Kapasite kontrolü", description: "Kolon ve grup kapasitesi kontrol edilir" },
      ],
      limitations: ["cu < 15 kPa olan çok yumuşak zeminlerde yanal destek yetersiz olabilir", "Organik zeminlerde etkisi sınırlıdır"],
    },
    {
      name: "Ön Yükleme (Preloading)",
      description: "Yapım öncesinde dolgu ile ek yük uygulanarak konsolidasyon oturmasının önceden tamamlanması sağlanır. PVD ile birlikte uygulandığında süre önemli ölçüde kısalır.",
      formulas: [
        { name: "Gerekli ön yük", formula: "Δσ = Cc·(1+e0)·σ0' / (H·log((σ0'+Δσ)/σ0')) × Sc_hedef", description: "Hedef oturmayı sağlayacak ek gerilme" },
        { name: "Dolgu yüksekliği", formula: "h_fill = Δσ / γ_fill", description: "γ_fill ≈ 18 kN/m³ varsayımı" },
        { name: "Konsolidasyon süresi", formula: "t = Tv × Hdr² / cv", description: "Hedef U% için gerekli süre" },
      ],
      steps: [
        { step: 1, title: "Hedef oturma", description: "Yapı için izin verilebilir artık oturma belirlenir" },
        { step: 2, title: "Ön yük hesabı", description: "Gerekli dolgu yüksekliği hesaplanır" },
        { step: 3, title: "Süre tahmini", description: "Hedef U% için gerekli bekleme süresi hesaplanır" },
        { step: 4, title: "İzleme", description: "Oturma plakaları ve piezometre ile izlenir" },
      ],
      limitations: ["Uzun bekleme süresi gerektirebilir", "Dolgu malzemesi temini ve nakliyesi maliyetli olabilir", "Komşu yapılara yanal yük etkisi değerlendirilmelidir"],
    },
  ],
  references: [
    "Menard, L. & Broise, Y. (1975). Theoretical and Practical Aspects of Dynamic Consolidation. Géotechnique.",
    "Priebe, H.J. (1995). The Design of Vibro Replacement. Ground Engineering.",
    "Holtz, R.D. et al. (2011). An Introduction to Geotechnical Engineering, 2nd Ed.",
    "FHWA-SA-98-086 (2001). Ground Improvement Technical Summaries.",
    "Das, B.M. (2019). Principles of Geotechnical Engineering, 9th Ed.",
  ],
  standards: ["FHWA-SA-98-086", "BS EN 14731 (Vibro)", "TBDY 2018"],
  notes: [
    "Dinamik kompaksiyon en ekonomik iyileştirme yöntemidir ancak titreşim sınırlaması vardır.",
    "Taş kolon, yumuşak kil zeminlerde hem taşıma kapasitesini artırır hem drenaj sağlar.",
    "Ön yükleme + PVD kombinasyonu, yumuşak zeminlerde en yaygın kullanılan yöntemdir.",
    "İyileştirme sonrası kontrol deneyleri (SPT, CPT, yükleme deneyi) zorunludur.",
  ],
};

type Tab = "dynamic" | "stone" | "preload";

export default function ZeminIyilestirmePage() {
  const [tab, setTab] = useState<Tab>("dynamic");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">🔨 Zemin İyileştirme</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Dinamik kompaksiyon, taş kolon ve ön yükleme analizi</p>
      <div className="mt-2"><ExportPDFButton moduleName="Zemin İyileştirme" method="Dinamik Kompaksiyon / Taş Kolon / Ön Yükleme" inputs={{ "Hesap tipi": tab }} results={{}} /></div>
      <MethodologySection data={methodology} />
      <div className="mt-6 flex gap-2 flex-wrap">
        {([["dynamic", "Dinamik Kompaksiyon"], ["stone", "Taş Kolon"], ["preload", "Ön Yükleme"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === k ? "bg-brand-600 text-white" : "bg-[var(--card)] border border-[var(--card-border)]"}`}>{l}</button>
        ))}
      </div>
      <div className="mt-6">
        {tab === "dynamic" && <DynamicForm />}
        {tab === "stone" && <StoneForm />}
        {tab === "preload" && <PreloadForm />}
      </div>
    </div>
  );
}

function DynamicForm() {
  const [weight, setWeight] = useState(15);
  const [dropHeight, setDropHeight] = useState(20);
  const [soilType, setSoilType] = useState<"granular" | "cohesive" | "mixed">("granular");

  const result = useMemo(() => dynamicCompaction({ weight, dropHeight, soilType }), [weight, dropHeight, soilType]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi — Menard Yöntemi</h2>
        <Field label="Tokmak ağırlığı W (ton)" value={weight} onChange={setWeight} min={1} max={40} />
        <Field label="Düşme yüksekliği h (m)" value={dropHeight} onChange={setDropHeight} min={5} max={40} />
        <div>
          <label className="block text-sm font-medium mb-1">Zemin tipi</label>
          <select value={soilType} onChange={e => setSoilType(e.target.value as any)} className="input-field">
            <option value="granular">Granüler (kum, çakıl)</option>
            <option value="mixed">Karışık</option>
            <option value="cohesive">Kohezyonlu (kil, silt)</option>
          </select>
        </div>
        <div className="p-3 rounded-lg bg-earth-50 dark:bg-neutral-800 text-sm font-mono">
          <p>D = n × √(W×h)</p>
          <p>D = {result.nCoefficient} × √({weight}×{dropHeight})</p>
          <p>D = <b>{result.effectiveDepth} m</b></p>
        </div>
      </div>
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Sonuç</h2>
        <div className="grid grid-cols-2 gap-3">
          <RBox label="Etki Derinliği D" value={`${result.effectiveDepth} m`} color="blue" />
          <RBox label="Enerji W×h" value={`${result.energy} ton·m`} color="orange" />
          <RBox label="Grid Aralığı" value={`${result.suggestedSpacing} m`} color="gray" />
          <RBox label="Önerilen Pas" value={`${result.suggestedPasses}`} color="gray" />
        </div>

        {/* Recharts - Dinamik Kompaksiyon Parametreleri */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Kompaksiyon Parametreleri</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { name: "Enerji (ton·m)", value: result.energy },
              { name: "Etki Derinliği (m)", value: result.effectiveDepth },
              { name: "Grid Aralığı (m)", value: result.suggestedSpacing },
            ]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="value" name="Değer" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recharts - Etki Derinliği vs Enerji */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Etki Derinliği — Enerji İlişkisi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={[50, 100, 150, 200, 300, 400, 500, 600, 800, 1000].map(e => ({
                "Enerji (ton·m)": e,
                "Granüler (m)": parseFloat((0.5 * Math.sqrt(e)).toFixed(1)),
                "Karışık (m)": parseFloat((0.4 * Math.sqrt(e)).toFixed(1)),
                "Kohezyonlu (m)": parseFloat((0.35 * Math.sqrt(e)).toFixed(1)),
              }))}
              margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="Enerji (ton·m)" type="number" label={{ value: "Enerji W×h (ton·m)", position: "insideBottom", offset: -10, fontSize: 11 }} tick={{ fontSize: 10 }} />
              <YAxis label={{ value: "Etki Derinliği D (m)", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Granüler (m)" stroke="#2563eb" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Karışık (m)" stroke="#d97706" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Kohezyonlu (m)" stroke="#dc2626" strokeWidth={2} dot={false} />
              <ReferenceLine x={result.energy} stroke="#059669" strokeDasharray="4 4" label={{ value: `Mevcut: ${result.energy}`, position: "top", fontSize: 9, fill: "#059669" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 rounded-lg bg-earth-50 dark:bg-neutral-800 p-4">
          <svg viewBox="0 0 300 200" className="w-full" style={{ maxHeight: 200 }}>
            {/* Zemin */}
            <rect x={0} y={60} width={300} height={140} fill="rgba(180,140,100,0.2)" stroke="rgb(140,100,60)" strokeWidth={1} />
            {/* Tokmak */}
            <rect x={130} y={10} width={40} height={30} fill="rgb(100,100,100)" rx={3} />
            <text x={150} y={30} textAnchor="middle" fontSize={9} fill="white">{weight}t</text>
            {/* Düşme oku */}
            <line x1={150} y1={42} x2={150} y2={58} stroke="rgb(239,68,68)" strokeWidth={2} markerEnd="url(#arrow)" />
            <defs><marker id="arrow" markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="rgb(239,68,68)" /></marker></defs>
            <text x={170} y={55} fontSize={8} fill="rgb(239,68,68)">{dropHeight}m</text>
            {/* Etki derinliği */}
            <line x1={80} y1={60} x2={80} y2={60 + (result.effectiveDepth / 20) * 120} stroke="rgb(59,130,246)" strokeWidth={2} strokeDasharray="4 4" />
            <line x1={70} y1={60 + (result.effectiveDepth / 20) * 120} x2={90} y2={60 + (result.effectiveDepth / 20) * 120} stroke="rgb(59,130,246)" strokeWidth={2} />
            <text x={75} y={60 + (result.effectiveDepth / 20) * 60} fontSize={8} fill="rgb(59,130,246)" textAnchor="end">D={result.effectiveDepth}m</text>
            {/* Etki bölgesi */}
            <ellipse cx={150} cy={60} rx={60} ry={Math.min((result.effectiveDepth / 20) * 120, 120)} fill="rgba(59,130,246,0.1)" stroke="rgb(59,130,246)" strokeWidth={1} strokeDasharray="4 4" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function StoneForm() {
  const [diameter, setDiameter] = useState(0.8);
  const [spacing, setSpacing] = useState(2);
  const [pattern, setPattern] = useState<"square" | "triangular">("triangular");
  const [columnFrictionAngle, setColumnFrictionAngle] = useState(40);
  const [soilCu, setSoilCu] = useState(25);
  const [soilGamma, setSoilGamma] = useState(17);
  const [appliedStress, setAppliedStress] = useState(100);
  const [length, setLength] = useState(10);

  const result = useMemo(() => stoneColumn({ diameter, spacing, pattern, columnFrictionAngle, soilCu, soilGamma, appliedStress, length }), [diameter, spacing, pattern, columnFrictionAngle, soilCu, soilGamma, appliedStress, length]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi — Priebe (1995)</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kolon çapı d (m)" value={diameter} onChange={setDiameter} min={0.3} max={1.5} step={0.1} />
          <Field label="Kolon aralığı s (m)" value={spacing} onChange={setSpacing} min={1} max={5} step={0.1} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Düzen</label>
          <select value={pattern} onChange={e => setPattern(e.target.value as any)} className="input-field">
            <option value="triangular">Üçgen</option>
            <option value="square">Kare</option>
          </select>
        </div>
        <Field label="Kolon φc (°)" value={columnFrictionAngle} onChange={setColumnFrictionAngle} min={35} max={50} />
        <Field label="Zemin cu (kPa)" value={soilCu} onChange={setSoilCu} min={5} />
        <Field label="Zemin γ (kN/m³)" value={soilGamma} onChange={setSoilGamma} min={14} max={22} step={0.5} />
        <Field label="Yükleme q (kPa)" value={appliedStress} onChange={setAppliedStress} min={10} />
        <Field label="Kolon uzunluğu L (m)" value={length} onChange={setLength} min={3} max={25} />
      </div>
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Sonuç</h2>
        <div className="grid grid-cols-2 gap-3">
          <RBox label="Alan Oranı ar" value={result.areaRatio.toString()} color="blue" />
          <RBox label="Gerilme Kons. n" value={result.stressConcentrationRatio.toString()} color="orange" />
          <RBox label="Oturma Azaltma β" value={result.settlementReductionFactor.toString()} color="green" />
          <RBox label="Kolon Kapasitesi" value={`${result.columnCapacity} kPa`} color="gray" />
          <RBox label="Grup Kapasitesi" value={`${result.groupCapacity} kPa`} color="gray" />
          <RBox label="İyileştirilmiş E" value={`${result.improvedModulus} kPa`} color="gray" />
        </div>
        <div className="mt-2 p-3 rounded-lg bg-earth-50 dark:bg-neutral-800 text-sm">
          <p>Oturma azaltma: İyileştirmesiz oturmanın <b>%{(result.settlementReductionFactor * 100).toFixed(0)}</b>&apos;i kadar olacak</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Örn: 100mm oturma → ~{(100 * result.settlementReductionFactor).toFixed(0)}mm</p>
        </div>

        {/* Recharts - İyileştirme Öncesi/Sonrası Karşılaştırma */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">İyileştirme Öncesi / Sonrası Karşılaştırma</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: "Oturma (mm)", "İyileştirmesiz": 100, "Taş Kolon ile": parseFloat((100 * result.settlementReductionFactor).toFixed(0)) },
              { name: "Taşıma Kap. (kPa)", "İyileştirmesiz": parseFloat((appliedStress * 0.6).toFixed(0)), "Taş Kolon ile": result.groupCapacity },
              { name: "Modül (kPa)", "İyileştirmesiz": parseFloat((result.improvedModulus / (1 + result.areaRatio * (result.stressConcentrationRatio - 1))).toFixed(0)), "Taş Kolon ile": result.improvedModulus },
            ]} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="İyileştirmesiz" fill="#dc2626" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Taş Kolon ile" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recharts - İyileştirme Öncesi/Sonrası */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">İyileştirme Öncesi / Sonrası Karşılaştırma</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { name: "Oturma (mm)", Öncesi: 100, Sonrası: Math.round(100 * result.settlementReductionFactor) },
              { name: "Kapasite (kPa)", Öncesi: Math.round(appliedStress * 0.6), Sonrası: result.groupCapacity },
            ]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Öncesi" fill="#ef4444" radius={[4, 4, 0, 0]} name="İyileştirme Öncesi" />
              <Bar dataKey="Sonrası" fill="#22c55e" radius={[4, 4, 0, 0]} name="İyileştirme Sonrası" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function PreloadForm() {
  const [targetSettlement, setTargetSettlement] = useState(0.3);
  const [cv, setCv] = useState(2);
  const [drainagePath, setDrainagePath] = useState(5);
  const [effectiveStress, setEffectiveStress] = useState(100);
  const [Cc, setCc] = useState(0.3);
  const [layerThickness, setLayerThickness] = useState(10);
  const [e0, setE0] = useState(0.8);
  const [targetTime, setTargetTime] = useState(1);

  const result = useMemo(() => preloading({ targetSettlement, cv, drainagePath, effectiveStress, Cc, layerThickness, e0, targetTime }), [targetSettlement, cv, drainagePath, effectiveStress, Cc, layerThickness, e0, targetTime]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Hedef oturma Sc (m)" value={targetSettlement} onChange={setTargetSettlement} min={0.01} step={0.01} />
          <Field label="Cv (m²/yıl)" value={cv} onChange={setCv} min={0.1} step={0.1} />
          <Field label="Drenaj yolu Hdr (m)" value={drainagePath} onChange={setDrainagePath} min={0.5} step={0.5} />
          <Field label="σ'₀ (kPa)" value={effectiveStress} onChange={setEffectiveStress} min={10} />
          <Field label="Cc" value={Cc} onChange={setCc} min={0.05} max={2} step={0.05} />
          <Field label="Tabaka H (m)" value={layerThickness} onChange={setLayerThickness} min={1} />
          <Field label="e₀" value={e0} onChange={setE0} min={0.3} max={3} step={0.1} />
          <Field label="Hedef süre (yıl)" value={targetTime} onChange={setTargetTime} min={0.1} step={0.1} />
        </div>
      </div>
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Sonuç</h2>
        <div className="grid grid-cols-2 gap-3">
          <RBox label="Gerekli Ön Yük Δσ" value={`${result.requiredPreload} kPa`} color="orange" />
          <RBox label="Dolgu Yüksekliği" value={`${result.fillHeight} m`} color="blue" />
          <RBox label={`U @ ${targetTime} yıl`} value={`%${result.degreeAtTargetTime}`} color={result.degreeAtTargetTime >= 90 ? "green" : "red"} />
          <RBox label="t₉₀" value={`${result.time90} yıl`} color="gray" />
          <RBox label="Artık Oturma" value={`${result.residualSettlement} m`} color="gray" />
        </div>
        <div className="mt-2 p-3 rounded-lg bg-earth-50 dark:bg-neutral-800 text-sm">
          <p>γ_fill = 18 kN/m³ varsayımı ile <b>{result.fillHeight} m</b> dolgu gerekli</p>
          {result.degreeAtTargetTime < 90 && <p className="mt-1 text-red-600 text-xs">⚠️ Hedef sürede %90 konsolidasyona ulaşılamıyor. PVD kullanımı veya süre uzatımı önerilir.</p>}
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
