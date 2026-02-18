"use client";
import { useState } from "react";
import { estimateSoilProperties, estimateRockProperties } from "@geoforce/engine";

type Tab = "zemin" | "kaya";

const uscsOptions = ["GW","GP","GM","GC","SW","SP","SM","SC","ML","CL","OL","MH","CH","OH","Pt"];

export default function ZeminOzellikDBPage() {
  const [tab, setTab] = useState<Tab>("zemin");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">📚 Zemin & Kaya Özellik Veritabanı</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">USCS / SPT korelasyonu ve RMR / UCS bazlı kaya parametre tahmini</p>

      <div className="mt-6 flex gap-2">
        {([["zemin", "🔬 Zemin"], ["kaya", "🪨 Kaya"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === k ? "bg-brand-600 text-white" : "bg-[var(--card)] border border-[var(--card-border)]"}`}>{l}</button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "zemin" && <ZeminForm />}
        {tab === "kaya" && <KayaForm />}
      </div>
    </div>
  );
}

function ZeminForm() {
  const [uscsClass, setUscsClass] = useState("CL");
  const [sptN, setSptN] = useState(15);
  const [result, setResult] = useState<ReturnType<typeof estimateSoilProperties> | null>(null);

  const handleCalc = () => {
    setResult(estimateSoilProperties({ uscsClass, sptN }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Zemin Parametreleri</h2>
        <div>
          <label className="block text-sm font-medium mb-1">USCS Sınıfı</label>
          <select value={uscsClass} onChange={e => setUscsClass(e.target.value)} className="input-field">
            {uscsOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <Field label="SPT N Değeri" value={sptN} onChange={setSptN} min={0} max={60} step={1} />
        <button onClick={handleCalc} className="btn-primary w-full">Hesapla</button>
      </div>

      <div className="space-y-4">
        {result && (
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-lg">{result.uscsClass} — {result.description}</h2>
            <p className="text-xs text-[var(--muted)]">{result.method}</p>

            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--card-border)]">
                  <th className="text-left py-2">Parametre</th>
                  <th className="text-right py-2">Min</th>
                  <th className="text-right py-2">Max</th>
                  <th className="text-right py-2 font-bold">Tahmin</th>
                </tr>
              </thead>
              <tbody>
                <RangeRow label="γ (kN/m³)" data={result.gamma} />
                <RangeRow label="φ (°)" data={result.frictionAngle} />
                <RangeRow label="cu (kPa)" data={result.cohesion} />
                <RangeRow label="E (MPa)" data={result.modulus} />
              </tbody>
            </table>
            </div>
          </div>
        )}
        {!result && (
          <div className="card p-6 text-center text-[var(--muted)]">
            USCS sınıfı ve SPT N değeri girin, &quot;Hesapla&quot; butonuna tıklayın.
          </div>
        )}
      </div>
    </div>
  );
}

function KayaForm() {
  const [inputType, setInputType] = useState<"rmr" | "ucs">("rmr");
  const [rmr, setRmr] = useState(55);
  const [ucs, setUcs] = useState(50);
  const [result, setResult] = useState<ReturnType<typeof estimateRockProperties> | null>(null);

  const handleCalc = () => {
    setResult(estimateRockProperties(inputType === "rmr" ? { RMR: rmr } : { UCS: ucs }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Kaya Parametreleri</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Girdi Tipi</label>
          <select value={inputType} onChange={e => setInputType(e.target.value as any)} className="input-field">
            <option value="rmr">RMR (Bieniawski)</option>
            <option value="ucs">UCS (ISRM)</option>
          </select>
        </div>
        {inputType === "rmr" && <Field label="RMR Değeri" value={rmr} onChange={setRmr} min={0} max={100} step={1} />}
        {inputType === "ucs" && <Field label="UCS (MPa)" value={ucs} onChange={setUcs} min={0.1} max={300} step={1} />}
        <button onClick={handleCalc} className="btn-primary w-full">Hesapla</button>
      </div>

      <div className="space-y-4">
        {result && (
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-lg">{result.rockClass} — {result.description}</h2>
            <p className="text-xs text-[var(--muted)]">{result.method}</p>

            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--card-border)]">
                  <th className="text-left py-2">Parametre</th>
                  <th className="text-right py-2">Min</th>
                  <th className="text-right py-2">Max</th>
                  <th className="text-right py-2 font-bold">Tahmin</th>
                </tr>
              </thead>
              <tbody>
                <RangeRow label="c (kPa)" data={result.cohesion} />
                <RangeRow label="φ (°)" data={result.frictionAngle} />
                <RangeRow label="Em (GPa)" data={result.modulus} />
              </tbody>
            </table>
            </div>
          </div>
        )}
        {!result && (
          <div className="card p-6 text-center text-[var(--muted)]">
            RMR veya UCS değeri girin, &quot;Hesapla&quot; butonuna tıklayın.
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step ?? 1} className="input-field" />
    </div>
  );
}

function RangeRow({ label, data }: { label: string; data: { min: number; max: number; estimated: number } }) {
  return (
    <tr className="border-b border-[var(--card-border)]">
      <td className="py-2 text-[var(--muted)]">{label}</td>
      <td className="text-right py-2">{data.min}</td>
      <td className="text-right py-2">{data.max}</td>
      <td className="text-right py-2 font-bold text-brand-700">{data.estimated}</td>
    </tr>
  );
}
