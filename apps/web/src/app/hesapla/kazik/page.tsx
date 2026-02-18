"use client";
import ExportPDFButton from "@/components/ExportPDFButton";
import MethodologySection from "@/components/MethodologySection";
import type { MethodologyData } from "@/components/MethodologySection";
import { useState } from "react";
import { pileCapacityStatic, pileCapacitySPT, lateralPileBroms } from "@geoforce/engine";
import type { PileSoilLayer, PileCapacityResult } from "@geoforce/engine";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";

const methodology: MethodologyData = {
  title: "Kazık Kapasitesi Hesabı",
  overview: "Derin temellerde kazık kapasitesi, uç direnci (Qp) ve çevre sürtünmesi (Qs) toplamından oluşur. Statik analiz (α-β yöntemi), SPT korelasyonları ve yanal yük kapasitesi (Broms) yöntemleri desteklenmektedir.",
  methods: [
    {
      name: "Statik Analiz — α-β Yöntemi",
      description: "Kohezyonlu zeminlerde α yöntemi (toplam gerilme), granüler zeminlerde β yöntemi (efektif gerilme) kullanılır. Her tabaka için ayrı hesap yapılıp toplanır.",
      formulas: [
        { name: "Toplam kapasite", formula: "Qu = Qp + Qs = qp·Ap + Σ(fs·As)ᵢ", description: "Ap: kazık uç alanı, As: çevre alanı" },
        { name: "α yöntemi (kil)", formula: "fs = α·cu", description: "α: yapışma katsayısı (0.25–1.0), cu: drenajsız kayma dayanımı" },
        { name: "α katsayısı", formula: "α = 1.0 (cu ≤ 25 kPa), α = 0.5 (cu ≥ 70 kPa), arası interpolasyon" },
        { name: "β yöntemi (kum)", formula: "fs = β·σv' = Ks·tanδ·σv'", description: "Ks: yanal toprak basıncı katsayısı, δ: kazık-zemin sürtünme açısı" },
        { name: "Uç direnci (kil)", formula: "qp = 9·cu", description: "Nc = 9 (derin temel)" },
        { name: "Uç direnci (kum)", formula: "qp = σv'·Nq", description: "Nq: sürtünme açısına bağlı (Berezantsev)" },
      ],
      steps: [
        { step: 1, title: "Zemin profili", description: "Tabaka kalınlıkları, cu veya φ', γ değerleri belirlenir" },
        { step: 2, title: "Çevre sürtünmesi", description: "Her tabaka için fs hesaplanır ve Qs = Σ(fs·π·D·Δz)" },
        { step: 3, title: "Uç direnci", description: "Kazık ucu seviyesindeki zemine göre qp hesaplanır" },
        { step: 4, title: "Toplam ve izin verilebilir", description: "Qu = Qp + Qs, Qa = Qu / FS (FS = 2.5–3.0)" },
      ],
      limitations: ["Kritik derinlik kavramı tartışmalıdır", "Grup etkisi ayrıca değerlendirilmelidir", "Negatif sürtünme (downdrag) dikkate alınmalıdır"],
    },
    {
      name: "SPT Bazlı — Meyerhof (1976)",
      description: "SPT N değerlerine dayalı ampirik yöntem. Saha verisi doğrudan kullanılır, laboratuvar deneyi gerektirmez.",
      formulas: [
        { name: "Uç direnci (kum)", formula: "qp = 40·N̄·(L/D) ≤ 400·N̄ (kPa)", description: "N̄: kazık ucu civarında ortalama SPT N değeri" },
        { name: "Uç direnci (kil)", formula: "qp = 9·cu (kPa)", description: "cu, SPT'den: cu ≈ 6.25·N (kPa)" },
        { name: "Çevre sürtünmesi (kum)", formula: "fs = 2·N̄ (kPa) ≤ 100 kPa", description: "N̄: tabaka ortalama SPT N değeri" },
        { name: "Çevre sürtünmesi (kil)", formula: "fs = α·cu (kPa)", description: "α yöntemi ile aynı" },
      ],
      limitations: ["Ampirik korelasyonlar bölgesel farklılık gösterebilir", "SPT enerji düzeltmesi (N60) uygulanmalıdır"],
    },
    {
      name: "Yanal Yük — Broms Yöntemi (1964)",
      description: "Kısa (rijit) ve uzun (esnek) kazıkların yanal yük kapasitesini hesaplar. Kohezyonlu ve granüler zeminler için ayrı çözümler sunar.",
      formulas: [
        { name: "Kısa kazık (kum, serbest baş)", formula: "Hu = 0.5·Kp·γ·D·L³ / (e + L)", description: "Kp: pasif basınç katsayısı, e: yük eksantrisitesi" },
        { name: "Uzun kazık (kum, serbest baş)", formula: "Hu = My / (e + 0.67·f)", description: "My: kazık akma momenti, f: dönme noktası derinliği" },
        { name: "Kısa kazık (kil, serbest baş)", formula: "Hu = 9·cu·D·(L − 1.5D)² / (2·(e + 1.5D + 0.5·f))", description: "Üst 1.5D ihmal edilir" },
        { name: "Uzun kazık (kil, serbest baş)", formula: "Hu = My / (e + 1.5D + 0.5·f)" },
      ],
      steps: [
        { step: 1, title: "Kazık sınıflandırması", description: "Kısa (rijit) veya uzun (esnek) kazık belirlenir" },
        { step: 2, title: "Zemin tipi", description: "Kohezyonlu veya granüler zemin seçilir" },
        { step: 3, title: "Yanal kapasite", description: "Uygun Broms formülü ile Hu hesaplanır" },
      ],
      limitations: ["Tabakalı zeminler için doğrudan uygulanamaz", "p-y eğrisi yöntemi daha detaylı sonuç verir"],
    },
  ],
  references: [
    "Meyerhof, G.G. (1976). Bearing Capacity and Settlement of Pile Foundations. JGED, ASCE, 102(GT3).",
    "Broms, B.B. (1964). Lateral Resistance of Piles in Cohesive Soils. JSMFD, ASCE, 90(SM2).",
    "Tomlinson, M.J. & Woodward, J. (2014). Pile Design and Construction Practice, 6th Ed.",
    "Das, B.M. (2019). Principles of Foundation Engineering, 9th Ed.",
    "TBDY 2018 — Türkiye Bina Deprem Yönetmeliği.",
  ],
  standards: ["TBDY 2018", "Eurocode 7", "FHWA-NHI-16-009"],
  notes: [
    "Kazık yükleme deneyi (statik veya dinamik) tasarımı doğrulamak için önerilir.",
    "Grup etkisi: kazık aralığı < 3D ise grup verimi düşer.",
    "Negatif sürtünme, konsolide olan zeminlerde kazığa ek yük bindirir.",
    "Deprem durumunda yanal yük kapasitesi sıvılaşma riski ile birlikte değerlendirilmelidir.",
  ],
};

type Tab = "static" | "spt" | "lateral";

export default function KazikPage() {
  const [tab, setTab] = useState<Tab>("static");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">🔩 Kazık Kapasitesi</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">α-β yöntemi, SPT korelasyonları ve Broms yanal yük analizi</p>
      <div className="mt-2"><ExportPDFButton moduleName="Kazık Kapasitesi" method="α-β / SPT / Broms" inputs={{}} results={{}} /></div>
      <MethodologySection data={methodology} />
      <div className="mt-6 flex gap-2">
        {([["static", "α-β Statik"], ["spt", "SPT Korelasyonu"], ["lateral", "Yanal Yük (Broms)"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === k ? "bg-brand-600 text-white" : "bg-[var(--card)] border border-[var(--card-border)]"}`}>{l}</button>
        ))}
      </div>
      <div className="mt-6">
        {tab === "static" && <StaticForm />}
        {tab === "spt" && <SPTForm />}
        {tab === "lateral" && <LateralForm />}
      </div>
    </div>
  );
}

function StaticForm() {
  const [diameter, setDiameter] = useState(0.6);
  const [length, setLength] = useState(15);
  const [pileType, setPileType] = useState<"driven" | "bored">("driven");
  const [layers, setLayers] = useState<(PileSoilLayer & { id: number })[]>([
    { id: 1, depthTop: 0, depthBottom: 5, soilType: "clay", cu: 40, gamma: 17 },
    { id: 2, depthTop: 5, depthBottom: 10, soilType: "sand", frictionAngle: 32, gamma: 19, N: 20 },
    { id: 3, depthTop: 10, depthBottom: 20, soilType: "clay", cu: 80, gamma: 18, N: 15 },
  ]);

  const addLayer = () => {
    const last = layers[layers.length - 1];
    setLayers([...layers, { id: Date.now(), depthTop: last?.depthBottom ?? 0, depthBottom: (last?.depthBottom ?? 0) + 5, soilType: "clay", cu: 50, gamma: 18 }]);
  };
  const removeLayer = (id: number) => setLayers(layers.filter(l => l.id !== id));
  const updateLayer = (id: number, key: string, val: any) => setLayers(layers.map(l => l.id === id ? { ...l, [key]: val } : l));

  const result = pileCapacityStatic({ diameter, length, pileType, layers });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Kazık Parametreleri</h2>
        <Field label="Kazık çapı D (m)" value={diameter} onChange={setDiameter} min={0.1} max={3} step={0.1} />
        <Field label="Kazık uzunluğu L (m)" value={length} onChange={setLength} min={1} max={60} step={1} />
        <div>
          <label className="block text-sm font-medium mb-1">Kazık tipi</label>
          <select value={pileType} onChange={e => setPileType(e.target.value as any)} className="input-field">
            <option value="driven">Çakma kazık</option>
            <option value="bored">Fore kazık</option>
          </select>
        </div>

        <h2 className="font-semibold text-lg pt-2">Zemin Tabakaları</h2>
        {layers.map(l => (
          <div key={l.id} className="p-3 rounded-lg bg-earth-50 dark:bg-neutral-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium">{l.depthTop}-{l.depthBottom}m ({l.soilType === "clay" ? "Kil" : "Kum"})</span>
              <button onClick={() => removeLayer(l.id)} className="text-xs text-red-500">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <MiniField label="Üst (m)" value={l.depthTop} onChange={v => updateLayer(l.id, "depthTop", v)} />
              <MiniField label="Alt (m)" value={l.depthBottom} onChange={v => updateLayer(l.id, "depthBottom", v)} />
              <div>
                <label className="block text-[10px] text-[var(--muted)]">Zemin</label>
                <select value={l.soilType} onChange={e => updateLayer(l.id, "soilType", e.target.value)} className="input-field text-xs py-1">
                  <option value="clay">Kil</option>
                  <option value="sand">Kum</option>
                </select>
              </div>
              <MiniField label="γ (kN/m³)" value={l.gamma} onChange={v => updateLayer(l.id, "gamma", v)} />
              {l.soilType === "clay" && <MiniField label="cu (kPa)" value={l.cu ?? 0} onChange={v => updateLayer(l.id, "cu", v)} />}
              {l.soilType === "sand" && <MiniField label="φ (°)" value={l.frictionAngle ?? 0} onChange={v => updateLayer(l.id, "frictionAngle", v)} />}
            </div>
          </div>
        ))}
        <button onClick={addLayer} className="btn-secondary w-full text-xs">+ Tabaka Ekle</button>
      </div>

      <div className="lg:col-span-2">
        <PileResultCard result={result} />
      </div>
    </div>
  );
}

function SPTForm() {
  const [diameter, setDiameter] = useState(0.6);
  const [length, setLength] = useState(15);
  const [pileType, setPileType] = useState<"driven" | "bored">("driven");
  const [layers, setLayers] = useState<(PileSoilLayer & { id: number })[]>([
    { id: 1, depthTop: 0, depthBottom: 5, soilType: "clay", gamma: 17, N: 8 },
    { id: 2, depthTop: 5, depthBottom: 10, soilType: "sand", gamma: 19, N: 20 },
    { id: 3, depthTop: 10, depthBottom: 20, soilType: "sand", gamma: 19, N: 30 },
  ]);

  const addLayer = () => {
    const last = layers[layers.length - 1];
    setLayers([...layers, { id: Date.now(), depthTop: last?.depthBottom ?? 0, depthBottom: (last?.depthBottom ?? 0) + 5, soilType: "sand", gamma: 19, N: 15 }]);
  };
  const removeLayer = (id: number) => setLayers(layers.filter(l => l.id !== id));
  const updateLayer = (id: number, key: string, val: any) => setLayers(layers.map(l => l.id === id ? { ...l, [key]: val } : l));

  const result = pileCapacitySPT({ diameter, length, pileType, layers });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Kazık & Zemin</h2>
        <Field label="Kazık çapı D (m)" value={diameter} onChange={setDiameter} min={0.1} max={3} step={0.1} />
        <Field label="Kazık uzunluğu L (m)" value={length} onChange={setLength} min={1} max={60} />
        <div>
          <label className="block text-sm font-medium mb-1">Kazık tipi</label>
          <select value={pileType} onChange={e => setPileType(e.target.value as any)} className="input-field">
            <option value="driven">Çakma kazık</option>
            <option value="bored">Fore kazık</option>
          </select>
        </div>
        {layers.map(l => (
          <div key={l.id} className="p-3 rounded-lg bg-earth-50 dark:bg-neutral-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium">{l.depthTop}-{l.depthBottom}m</span>
              <button onClick={() => removeLayer(l.id)} className="text-xs text-red-500">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <MiniField label="Üst (m)" value={l.depthTop} onChange={v => updateLayer(l.id, "depthTop", v)} />
              <MiniField label="Alt (m)" value={l.depthBottom} onChange={v => updateLayer(l.id, "depthBottom", v)} />
              <MiniField label="N (SPT)" value={l.N ?? 0} onChange={v => updateLayer(l.id, "N", v)} />
              <div>
                <label className="block text-[10px] text-[var(--muted)]">Zemin</label>
                <select value={l.soilType} onChange={e => updateLayer(l.id, "soilType", e.target.value)} className="input-field text-xs py-1">
                  <option value="clay">Kil</option>
                  <option value="sand">Kum</option>
                </select>
              </div>
              <MiniField label="γ (kN/m³)" value={l.gamma} onChange={v => updateLayer(l.id, "gamma", v)} />
            </div>
          </div>
        ))}
        <button onClick={addLayer} className="btn-secondary w-full text-xs">+ Tabaka Ekle</button>
      </div>
      <div className="lg:col-span-2">
        <PileResultCard result={result} />
      </div>
    </div>
  );
}

function LateralForm() {
  const [diameter, setDiameter] = useState(0.6);
  const [length, setLength] = useState(15);
  const [EI, setEI] = useState(50000);
  const [soilType, setSoilType] = useState<"clay" | "sand">("clay");
  const [cu, setCu] = useState(50);
  const [phi, setPhi] = useState(30);
  const [gamma, setGamma] = useState(18);
  const [head, setHead] = useState<"free" | "fixed">("free");

  const result = lateralPileBroms({ diameter, length, EI, soilType, cu: soilType === "clay" ? cu : undefined, frictionAngle: soilType === "sand" ? phi : undefined, gamma, headCondition: head });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi</h2>
        <Field label="Kazık çapı D (m)" value={diameter} onChange={setDiameter} min={0.1} max={3} step={0.1} />
        <Field label="Kazık uzunluğu L (m)" value={length} onChange={setLength} min={1} max={60} />
        <Field label="Kazık rijitliği EI (kN·m²)" value={EI} onChange={setEI} min={1000} step={1000} />
        <div>
          <label className="block text-sm font-medium mb-1">Zemin tipi</label>
          <select value={soilType} onChange={e => setSoilType(e.target.value as any)} className="input-field">
            <option value="clay">Kil</option>
            <option value="sand">Kum</option>
          </select>
        </div>
        {soilType === "clay" && <Field label="cu (kPa)" value={cu} onChange={setCu} min={5} />}
        {soilType === "sand" && <Field label="φ (°)" value={phi} onChange={setPhi} min={20} max={45} />}
        <Field label="γ (kN/m³)" value={gamma} onChange={setGamma} min={10} max={25} step={0.5} />
        <div>
          <label className="block text-sm font-medium mb-1">Baş koşulu</label>
          <select value={head} onChange={e => setHead(e.target.value as any)} className="input-field">
            <option value="free">Serbest baş</option>
            <option value="fixed">Ankastre baş</option>
          </select>
        </div>
      </div>
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Sonuç — {result.method}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-brand-50 dark:bg-brand-900/20 p-4 text-center">
            <p className="text-xs text-[var(--muted)]">Nihai Yanal Yük (Hu)</p>
            <p className="text-2xl font-bold text-brand-700">{result.ultimateLoad} <span className="text-sm font-normal">kN</span></p>
          </div>
          <div className="rounded-lg bg-earth-50 dark:bg-neutral-800 p-4 text-center">
            <p className="text-xs text-[var(--muted)]">İzin Verilebilir (Ha)</p>
            <p className="text-2xl font-bold">{result.allowableLoad} <span className="text-sm font-normal">kN</span></p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <Row label="Kazık davranışı" value={result.behaviorTR} />
          <Row label="Yöntem" value={result.method} />
        </div>
      </div>
    </div>
  );
}

function PileResultCard({ result }: { result: PileCapacityResult }) {
  return (
    <div className="card p-6 space-y-4">
      <h2 className="font-semibold text-lg">{result.method}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <RBox label="Uç Direnci (Qp)" value={`${result.tipCapacity} kN`} color="blue" />
        <RBox label="Çevre Sürt. (Qs)" value={`${result.shaftCapacity} kN`} color="orange" />
        <RBox label="Nihai (Qu)" value={`${result.ultimate} kN`} color="red" />
        <RBox label={`İzin Ver. (Qa, FS=${result.safetyFactor})`} value={`${result.allowable} kN`} color="green" />
      </div>

      {/* Recharts Kapasite Grafiği */}
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Kapasite Dağılımı (Recharts)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={[
            { name: "Uç (Qp)", value: result.tipCapacity },
            { name: "Çevre (Qs)", value: result.shaftCapacity },
            { name: "Nihai (Qu)", value: result.ultimate },
            { name: `İzin Ver. (Qa)`, value: result.allowable },
          ]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} label={{ value: "kN", angle: -90, position: "insideLeft", fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <Bar dataKey="value" name="Kapasite (kN)" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stacked bar */}
      <div className="mt-4">
        <p className="text-xs text-[var(--muted)] mb-1">Kapasite dağılımı</p>
        <div className="flex h-6 rounded-lg overflow-hidden">
          <div style={{ width: `${(result.tipCapacity / result.ultimate) * 100}%` }} className="bg-blue-400 flex items-center justify-center text-[10px] text-white font-medium">
            {result.ultimate > 0 ? `${((result.tipCapacity / result.ultimate) * 100).toFixed(0)}%` : ""}
          </div>
          <div style={{ width: `${(result.shaftCapacity / result.ultimate) * 100}%` }} className="bg-orange-400 flex items-center justify-center text-[10px] text-white font-medium">
            {result.ultimate > 0 ? `${((result.shaftCapacity / result.ultimate) * 100).toFixed(0)}%` : ""}
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
          <span>🔵 Uç direnci</span><span>🟠 Çevre sürtünmesi</span>
        </div>
      </div>

      {/* Derinlik-Kapasite Profili Grafiği */}
      {result.layerDetails.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Derinlik — Kapasite Profili</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={result.layerDetails.map(l => {
                const depthMatch = l.depth.match(/[\d.]+/g);
                const avgDepth = depthMatch ? (Number(depthMatch[0]) + Number(depthMatch[depthMatch.length - 1])) / 2 : 0;
                return { derinlik: avgDepth, sürtünme: Number(l.contribution), birimSürtünme: Number(l.qs) };
              })}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" tick={{ fontSize: 10 }} label={{ value: "Katkı (kN)", position: "insideBottom", offset: -2, fontSize: 11 }} />
              <YAxis type="number" dataKey="derinlik" reversed tick={{ fontSize: 10 }} label={{ value: "Derinlik (m)", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} formatter={(value: number) => [`${value}`, ""]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="sürtünme" name="Sürtünme Katkısı (kN)" fill="rgba(37,99,235,0.2)" stroke="#2563eb" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabaka detayları */}
      {result.layerDetails.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Tabaka Katkıları</h3>
          <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-[var(--card-border)]">
              <th className="text-left py-1">Derinlik</th><th className="text-left py-1">Zemin</th><th className="text-right py-1">qs (kPa)</th><th className="text-right py-1">Katkı (kN)</th>
            </tr></thead>
            <tbody>{result.layerDetails.map((l, i) => (
              <tr key={i} className="border-b border-[var(--card-border)]">
                <td className="py-1">{l.depth}</td><td>{l.type}</td><td className="text-right">{l.qs}</td><td className="text-right font-medium">{l.contribution}</td>
              </tr>
            ))}</tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (<div><label className="block text-sm font-medium mb-1">{label}</label><input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step ?? 1} className="input-field" /></div>);
}
function MiniField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (<div><label className="block text-[10px] text-[var(--muted)]">{label}</label><input type="number" value={value} onChange={e => onChange(Number(e.target.value))} className="input-field text-xs py-1" /></div>);
}
function Row({ label, value }: { label: string; value: string }) {
  return (<div className="flex justify-between py-1.5 border-b border-[var(--card-border)] last:border-0"><span className="text-[var(--muted)]">{label}</span><span className="font-medium">{value}</span></div>);
}
function RBox({ label, value, color }: { label: string; value: string; color: string }) {
  const c: Record<string, string> = { green: "bg-green-50 dark:bg-green-900/20 text-green-700", blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700", orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-700", red: "bg-red-50 dark:bg-red-900/20 text-red-700", gray: "bg-earth-50 dark:bg-neutral-800" };
  return (<div className={`rounded-lg p-3 text-center ${c[color] || c.gray}`}><p className="text-[10px] text-[var(--muted)]">{label}</p><p className="text-lg font-bold">{value}</p></div>);
}
