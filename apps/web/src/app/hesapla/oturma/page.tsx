"use client";
import ExportPDFButton from "@/components/ExportPDFButton";
import MethodologySection from "@/components/MethodologySection";
import type { MethodologyData } from "@/components/MethodologySection";
import { useState } from "react";
import { elasticSettlement, consolidationSettlement, schmertmannSettlement } from "@geoforce/engine";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

const methodology: MethodologyData = {
  title: "Oturma Hesabı Yöntemleri",
  overview: "Temeller altında oluşan oturma üç bileşenden oluşur: anlık (elastik) oturma, birincil konsolidasyon oturması ve ikincil (krip) oturma. Granüler zeminlerde anlık oturma baskınken, kohezyonlu zeminlerde konsolidasyon oturması belirleyicidir.",
  methods: [
    {
      name: "Elastik (Anlık) Oturma — Boussinesq-Steinbrenner",
      description: "Yükleme anında oluşan, hacim değişimi olmaksızın şekil değiştirmeden kaynaklanan oturmadır. Elastisite teorisine dayanır.",
      formulas: [
        { name: "Elastik oturma", formula: "Se = q·B·(1−ν²)·Iw / Es", description: "q: temel taban basıncı, B: temel genişliği, ν: Poisson oranı, Es: elastisite modülü, Iw: etki faktörü" },
        { name: "Etki faktörü (esnek, köşe)", formula: "Iw = f(L/B, H/B)", description: "Steinbrenner tablosundan veya formülünden" },
        { name: "Rijit temel düzeltmesi", formula: "Se(rijit) ≈ 0.93 × Se(esnek, merkez)" },
      ],
      steps: [
        { step: 1, title: "Zemin parametreleri", description: "Es ve ν belirlenir (laboratuvar veya korelasyon)" },
        { step: 2, title: "Etki faktörü", description: "Temel geometrisi ve zemin kalınlığına göre Iw hesaplanır" },
        { step: 3, title: "Oturma hesabı", description: "Se = q·B·(1−ν²)·Iw / Es" },
      ],
      limitations: ["Homojen, izotrop, lineer elastik zemin varsayımı", "Tabakalı zeminlerde eşdeğer Es kullanılmalı"],
    },
    {
      name: "Birincil Konsolidasyon Oturması — Terzaghi 1D",
      description: "Doygun ince daneli zeminlerde boşluk suyu basıncının dissipasyonu ile oluşan zamana bağlı oturmadır. Ödometre deneyi sonuçlarına dayanır.",
      formulas: [
        { name: "Normal konsolide (NC)", formula: "Sc = Cc·H / (1+e0) · log((σ0'+Δσ) / σ0')", description: "Cc: sıkışma indeksi, e0: başlangıç boşluk oranı, H: tabaka kalınlığı" },
        { name: "Aşırı konsolide (OC, σ0'+Δσ ≤ σc')", formula: "Sc = Cs·H / (1+e0) · log((σ0'+Δσ) / σ0')", description: "Cs: şişme indeksi (≈ Cc/5–Cc/10)" },
        { name: "Aşırı konsolide (OC, σ0'+Δσ > σc')", formula: "Sc = Cs·H/(1+e0)·log(σc'/σ0') + Cc·H/(1+e0)·log((σ0'+Δσ)/σc')", description: "σc': ön konsolidasyon basıncı" },
        { name: "Aşırı konsolidasyon oranı", formula: "OCR = σc' / σ0'", description: "OCR=1: NC, OCR>1: OC" },
      ],
      steps: [
        { step: 1, title: "Zemin profili", description: "Tabaka kalınlığı, e0, Cc, Cs, σc' belirlenir" },
        { step: 2, title: "Gerilme artışı", description: "Δσ = temel yükünden kaynaklanan ek gerilme (Boussinesq)" },
        { step: 3, title: "NC/OC kontrolü", description: "σ0'+Δσ ile σc' karşılaştırılır" },
        { step: 4, title: "Oturma hesabı", description: "Uygun formül ile Sc hesaplanır" },
      ],
      limitations: ["1D konsolidasyon varsayımı (yanal deformasyon yok)", "İkincil oturma dahil değildir", "Çok tabakalı zeminlerde her tabaka ayrı hesaplanıp toplanır"],
    },
    {
      name: "Schmertmann Yöntemi (1970/1978)",
      description: "Granüler zeminlerde CPT veya SPT verilerine dayalı yarı-ampirik oturma hesabı. Derinliğe bağlı şekil değiştirme etkisi faktörü (Iz) kullanır.",
      formulas: [
        { name: "Oturma", formula: "S = C1·C2·q · Σ(Iz·Δz / Es)ᵢ", description: "Toplam etki derinliği boyunca alt tabakalara bölünerek hesaplanır" },
        { name: "Düzeltme katsayısı C1", formula: "C1 = 1 − 0.5·(σ0' / q)", description: "Gömme derinliği düzeltmesi" },
        { name: "Düzeltme katsayısı C2", formula: "C2 = 1 + 0.2·log(t/0.1)", description: "Krip düzeltmesi, t: yıl" },
        { name: "Etki faktörü Iz", formula: "Iz(max) = 0.5 + 0.1·√(q/σ0')", description: "Kare temel: z=B/2'de max, z=2B'de sıfır; Şerit: z=B'de max, z=4B'de sıfır" },
        { name: "Es (SPT'den)", formula: "Es ≈ 2.5–3.5 × N60 (MPa)", description: "Kum için yaklaşık korelasyon" },
      ],
      steps: [
        { step: 1, title: "Etki derinliği", description: "Kare temel: 2B, şerit temel: 4B" },
        { step: 2, title: "Alt tabakalara bölme", description: "Etki derinliği boyunca alt tabakalara ayrılır" },
        { step: 3, title: "Iz dağılımı", description: "Her alt tabaka ortasında Iz hesaplanır" },
        { step: 4, title: "Toplam oturma", description: "S = C1·C2·q·Σ(Iz·Δz/Es)" },
      ],
      limitations: ["Granüler zeminler için geliştirilmiştir", "Es korelasyonları yaklaşıktır", "Yeraltı suyu etkisi ayrıca değerlendirilmeli"],
    },
  ],
  references: [
    "Terzaghi, K. (1925). Erdbaumechanik auf Bodenphysikalischer Grundlage.",
    "Schmertmann, J.H. (1970). Static Cone to Compute Static Settlement Over Sand. JSMFD, ASCE, 96(SM3).",
    "Schmertmann, J.H. et al. (1978). Improved Strain Influence Factor Diagrams. JGED, ASCE, 104(GT8).",
    "Das, B.M. (2019). Principles of Foundation Engineering, 9th Ed.",
  ],
  standards: ["TS 500", "TBDY 2018", "Eurocode 7"],
  notes: [
    "İzin verilebilir toplam oturma genellikle 25 mm (kum) veya 50 mm (kil) ile sınırlandırılır.",
    "Diferansiyel oturma toplam oturmanın %75'ini geçmemelidir.",
    "Konsolidasyon süresi cv (konsolidasyon katsayısı) ve drenaj mesafesine bağlıdır.",
  ],
};

type Tab = "elastic" | "consolidation" | "schmertmann";

export default function OturmaPage() {
  const [tab, setTab] = useState<Tab>("elastic");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">📐 Oturma Hesabı</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Elastik oturma, 1D konsolidasyon ve Schmertmann yöntemi</p>
      <div className="mt-2"><ExportPDFButton moduleName="Oturma Hesabı" method="Elastik / Konsolidasyon / Schmertmann" inputs={{}} results={{}} /></div>
      <MethodologySection data={methodology} />
      <div className="mt-6 flex gap-2">
        {([["elastic","Elastik"],["consolidation","Konsolidasyon"],["schmertmann","Schmertmann"]] as const).map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab===k?"bg-brand-600 text-white":"bg-[var(--card)] border border-[var(--card-border)]"}`}>{l}</button>
        ))}
      </div>
      <div className="mt-6">
        {tab==="elastic"&&<ElasticForm/>}
        {tab==="consolidation"&&<ConsolidationForm/>}
        {tab==="schmertmann"&&<SchmertmannForm/>}
      </div>
    </div>
  );
}

function ElasticForm(){
  const [width,setWidth]=useState(2);
  const [length,setLength]=useState(2);
  const [pressure,setPressure]=useState(150);
  const [Es,setEs]=useState(20000);
  const [nu,setNu]=useState(0.3);
  const r=elasticSettlement({width,length,pressure,elasticModulus:Es,poissonRatio:nu});
  return(
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi</h2>
        <Field label="Temel genişliği B (m)" value={width} onChange={setWidth} min={0.1} step={0.1}/>
        <Field label="Temel uzunluğu L (m)" value={length} onChange={setLength} min={0.1} step={0.1}/>
        <Field label="Net taban basıncı q (kPa)" value={pressure} onChange={setPressure} min={0}/>
        <Field label="Elastisite modülü Es (kPa)" value={Es} onChange={setEs} min={100}/>
        <Field label="Poisson oranı ν" value={nu} onChange={setNu} min={0} max={0.5} step={0.05}/>
      </div>
      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-4">Sonuç</h2>
        <ResultBox label="Elastik Oturma" value={`${r.settlement} mm`} big/>
        <div className="mt-4 space-y-2 text-sm">
          <Row label="Yöntem" value={r.method}/>
          <Row label="Etki faktörü (If)" value={`${r.influenceFactor}`}/>
          <Row label="Rijitlik faktörü" value={`${r.rigidityFactor}`}/>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-earth-50 dark:bg-neutral-800 text-xs font-mono">
          <p>Se = q·B·(1-ν²)·If / Es</p>
          <p>Se = {pressure}×{width}×(1-{nu}²)×{r.influenceFactor} / {Es}</p>
          <p className="font-bold">Se = {r.settlement} mm</p>
        </div>
      </div>
    </div>
  );
}

function ConsolidationForm(){
  const [H,setH]=useState(4);
  const [e0,setE0]=useState(0.9);
  const [Cc,setCc]=useState(0.3);
  const [Cs,setCs]=useState(0.06);
  const [sigma0,setSigma0]=useState(80);
  const [deltaSigma,setDeltaSigma]=useState(50);
  const [sigmaP,setSigmaP]=useState(80);
  const [cv,setCv]=useState(2);
  const [drainage,setDrainage]=useState<"single"|"double">("double");

  const r=consolidationSettlement({thickness:H,e0,Cc,Cs,sigma0,deltaSigma,preconsolidationPressure:sigmaP,cv:cv>0?cv:undefined,drainage});
  const stateLabel={NC:"Normal Konsolide",["OC-case1"]:"Aşırı Konsolide (σ'f ≤ σ'p)",["OC-case2"]:"Aşırı Konsolide (σ'f > σ'p)"};

  return(
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi</h2>
        <Field label="Tabaka kalınlığı H (m)" value={H} onChange={setH} min={0.1} step={0.5}/>
        <Field label="Başlangıç boşluk oranı e₀" value={e0} onChange={setE0} min={0.1} max={3} step={0.05}/>
        <Field label="Sıkışma indeksi Cc" value={Cc} onChange={setCc} min={0.01} max={2} step={0.01}/>
        <Field label="Şişme indeksi Cs" value={Cs} onChange={setCs} min={0.001} max={0.5} step={0.005}/>
        <Field label="Mevcut efektif gerilme σ'₀ (kPa)" value={sigma0} onChange={setSigma0} min={1}/>
        <Field label="Gerilme artışı Δσ (kPa)" value={deltaSigma} onChange={setDeltaSigma} min={0}/>
        <Field label="Ön konsolidasyon basıncı σ'p (kPa)" value={sigmaP} onChange={setSigmaP} min={1}/>
        <Field label="Cv (m²/yıl) — 0 = zaman hesabı yok" value={cv} onChange={setCv} min={0} step={0.1}/>
        <div>
          <label className="block text-sm font-medium mb-1">Drenaj</label>
          <select value={drainage} onChange={e=>setDrainage(e.target.value as any)} className="input-field">
            <option value="double">Çift yönlü</option>
            <option value="single">Tek yönlü</option>
          </select>
        </div>
      </div>
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Sonuç</h2>
        <ResultBox label="Birincil Konsolidasyon Oturması" value={`${r.primarySettlement} mm`} big/>
        <div className="space-y-2 text-sm">
          <Row label="Zemin durumu" value={stateLabel[r.soilState]}/>
          <Row label="Yöntem" value={r.method}/>
        </div>
        {r.timeSettlement&&(
          <div>
            <h3 className="font-medium text-sm mt-4 mb-2">Zaman-Oturma (Recharts)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={r.timeSettlement.timeDays.map((t,i)=>({ "Zaman (gün)": t, "U (%)": r.timeSettlement!.degree[i], "Oturma (mm)": r.timeSettlement!.settlement[i] }))} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="Zaman (gün)" type="number" label={{ value: "Zaman (gün)", position: "insideBottom", offset: -10, fontSize: 11 }} tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" label={{ value: "U (%)", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: "Oturma (mm)", angle: 90, position: "insideRight", fontSize: 11 }} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="left" type="monotone" dataKey="U (%)" stroke="#3b82f6" strokeWidth={2} dot={false} name="Konsolidasyon U (%)" />
                <Line yAxisId="right" type="monotone" dataKey="Oturma (mm)" stroke="#ef4444" strokeWidth={2} dot={false} name="Oturma (mm)" />
              </LineChart>
            </ResponsiveContainer>

            <h3 className="font-medium text-sm mt-4 mb-2">Zaman-Oturma</h3>
            <div className="overflow-x-auto max-h-48 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[var(--card)]">
                  <tr className="border-b border-[var(--card-border)]">
                    <th className="text-left py-1">Zaman (gün)</th>
                    <th className="text-right py-1">U (%)</th>
                    <th className="text-right py-1">Oturma (mm)</th>
                  </tr>
                </thead>
                <tbody>
                  {r.timeSettlement.timeDays.map((t,i)=>(
                    <tr key={i} className="border-b border-[var(--card-border)]">
                      <td className="py-1">{t}</td>
                      <td className="text-right">{r.timeSettlement!.degree[i]}</td>
                      <td className="text-right font-medium">{r.timeSettlement!.settlement[i]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SchmertmannForm(){
  const [width,setWidth]=useState(2);
  const [pressure,setPressure]=useState(150);
  const [depth,setDepth]=useState(1);
  const [gamma,setGamma]=useState(18);
  const [timeYears,setTimeYears]=useState(5);
  const [layers]=useState([
    {depthTop:0,depthBottom:1,Es:15000},
    {depthTop:1,depthBottom:3,Es:20000},
    {depthTop:3,depthBottom:5,Es:25000},
  ]);
  const r=schmertmannSettlement({width,pressure,depth,gamma,layers,timeYears});
  return(
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Girdi</h2>
        <Field label="Temel genişliği B (m)" value={width} onChange={setWidth} min={0.1} step={0.1}/>
        <Field label="Net taban basıncı q (kPa)" value={pressure} onChange={setPressure} min={0}/>
        <Field label="Temel derinliği Df (m)" value={depth} onChange={setDepth} min={0} step={0.5}/>
        <Field label="γ (kN/m³)" value={gamma} onChange={setGamma} min={10} max={25} step={0.5}/>
        <Field label="Zaman (yıl)" value={timeYears} onChange={setTimeYears} min={0.1} step={1}/>
      </div>
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Sonuç</h2>
        <ResultBox label="Schmertmann Oturması" value={`${r.settlement} mm`} big/>
        <div className="space-y-2 text-sm">
          <Row label="C1 (derinlik düzeltmesi)" value={`${r.C1}`}/>
          <Row label="C2 (creep düzeltmesi)" value={`${r.C2}`}/>
        </div>
        {r.layerContributions.length>0&&(
          <div>
            <h3 className="font-medium text-sm mt-3 mb-2">Derinlik — Gerilme Etkisi Faktörü (Iz)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={r.layerContributions.map((l,i)=>({ derinlik: l.depth, Iz: Number(l.Iz), katkı: Number(l.contribution) }))} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 10 }} label={{ value: "Iz", position: "insideBottom", offset: -2, fontSize: 11 }} />
                <YAxis type="category" dataKey="derinlik" tick={{ fontSize: 10 }} label={{ value: "Derinlik (m)", angle: -90, position: "insideLeft", fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="Iz" name="Gerilme Etkisi Faktörü (Iz)" fill="#7c3aed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <h3 className="font-medium text-sm mt-4 mb-2">Tabaka Katkıları</h3>
            <table className="w-full text-xs">
              <thead><tr className="border-b border-[var(--card-border)]">
                <th className="text-left py-1">Derinlik (m)</th><th className="text-right py-1">Iz</th><th className="text-right py-1">Es (kPa)</th><th className="text-right py-1">Katkı (mm)</th>
              </tr></thead>
              <tbody>{r.layerContributions.map((l,i)=>(
                <tr key={i} className="border-b border-[var(--card-border)]"><td className="py-1">{l.depth}</td><td className="text-right">{l.Iz}</td><td className="text-right">{l.Es}</td><td className="text-right font-medium">{l.contribution}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({label,value,onChange,min,max,step}:{label:string;value:number;onChange:(v:number)=>void;min?:number;max?:number;step?:number}){
  return(<div><label className="block text-sm font-medium mb-1">{label}</label><input type="number" value={value} onChange={e=>onChange(Number(e.target.value))} min={min} max={max} step={step??1} className="input-field"/></div>);
}
function Row({label,value}:{label:string;value:string}){
  return(<div className="flex justify-between py-1.5 border-b border-[var(--card-border)] last:border-0"><span className="text-[var(--muted)]">{label}</span><span className="font-medium">{value}</span></div>);
}
function ResultBox({label,value,big}:{label:string;value:string;big?:boolean}){
  return(<div className="rounded-lg bg-brand-50 dark:bg-brand-900/20 p-4 text-center"><p className="text-xs text-[var(--muted)]">{label}</p><p className={`${big?"text-2xl":"text-xl"} font-bold text-brand-700 dark:text-brand-400`}>{value}</p></div>);
}
