"use client";
import { useState } from "react";
import { bracedExcavation } from "@geoforce/engine";
import type { BracedExcavationInput } from "@geoforce/engine";

export default function DestekliKaziPage() {
  const [excavationDepth, setExcavationDepth] = useState(10);
  const [gamma, setGamma] = useState(18);
  const [cohesion, setCohesion] = useState(0);
  const [frictionAngle, setFrictionAngle] = useState(30);
  const [strutLevelsStr, setStrutLevelsStr] = useState("2,5,8");
  const [strutSpacing, setStrutSpacing] = useState(3);
  const [surcharge, setSurcharge] = useState(10);
  const [soilType, setSoilType] = useState<"kum" | "kil">("kum");
  const [result, setResult] = useState<ReturnType<typeof bracedExcavation> | null>(null);

  const handleCalc = () => {
    const levels = strutLevelsStr.split(",").map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    const input: BracedExcavationInput = {
      excavationDepth,
      gamma,
      cohesion: soilType === "kum" ? 0 : cohesion,
      frictionAngle: soilType === "kum" ? frictionAngle : 0,
      strutLevels: levels,
      strutSpacing,
      surcharge,
    };
    setResult(bracedExcavation(input));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">🏗️ Destekli Kazı Analizi</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Peck (1969) — Apparent earth pressure, destek kuvvetleri, taban kabarması</p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Girdi */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Girdi Parametreleri</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Zemin Tipi</label>
            <select value={soilType} onChange={e => setSoilType(e.target.value as any)} className="input-field">
              <option value="kum">Kum</option>
              <option value="kil">Kil</option>
            </select>
          </div>

          <Field label="Kazı Derinliği H (m)" value={excavationDepth} onChange={setExcavationDepth} min={1} max={30} step={0.5} />
          <Field label="Birim Hacim Ağırlık γ (kN/m³)" value={gamma} onChange={setGamma} min={10} max={25} step={0.5} />

          {soilType === "kil" && (
            <Field label="Kohezyon cu (kPa)" value={cohesion} onChange={setCohesion} min={5} max={200} step={5} />
          )}
          {soilType === "kum" && (
            <Field label="Sürtünme Açısı φ (°)" value={frictionAngle} onChange={setFrictionAngle} min={20} max={45} step={1} />
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Destek Seviyeleri (m, virgülle)</label>
            <input type="text" value={strutLevelsStr} onChange={e => setStrutLevelsStr(e.target.value)} className="input-field" placeholder="2,5,8" />
          </div>

          <Field label="Destek Yatay Aralığı (m)" value={strutSpacing} onChange={setStrutSpacing} min={1} max={10} step={0.5} />
          <Field label="Sürşarj q (kPa)" value={surcharge} onChange={setSurcharge} min={0} max={50} step={5} />

          <button onClick={handleCalc} className="btn-primary w-full">Hesapla</button>
        </div>

        {/* Sonuç */}
        <div className="lg:col-span-2 space-y-4">
          {result && (
            <>
              <div className="card p-6 space-y-4">
                <h2 className="font-semibold text-lg">{result.method}</h2>
                <p className="text-sm text-[var(--muted)]">{result.soilCategory}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <RBox label="Görünür Basınç pa" value={`${result.apparentPressure} kPa`} color="blue" />
                  <RBox label="Taban Kabarması FS" value={`${result.baseHeaveFS}`} color={result.baseHeaveFS >= 1.5 ? "green" : "red"} />
                  <RBox label="Stabilite" value={result.stability.split("—")[0].trim()} color={result.baseHeaveFS >= 1.5 ? "green" : "orange"} />
                </div>

                {/* Destek Kuvvetleri */}
                <h3 className="text-sm font-medium mt-4">Destek Kuvvetleri</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--card-border)]">
                      <th className="text-left py-1">Seviye (m)</th>
                      <th className="text-right py-1">Kuvvet (kN/m)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.strutForces.map((sf, i) => (
                      <tr key={i} className="border-b border-[var(--card-border)]">
                        <td className="py-1">{sf.level}</td>
                        <td className="text-right font-medium">{sf.force}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Basınç Diyagramı */}
                <h3 className="text-sm font-medium mt-4">Basınç Diyagramı</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--card-border)]">
                        <th className="text-left py-1">Derinlik (m)</th>
                        <th className="text-right py-1">Basınç (kPa)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.pressureDiagram.filter((_, i) => i % 2 === 0).map((pt, i) => (
                        <tr key={i} className="border-b border-[var(--card-border)]">
                          <td className="py-1">{pt.depth}</td>
                          <td className="text-right">{pt.pressure}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Formüller */}
              <div className="card p-6 space-y-3">
                <h3 className="font-semibold text-sm">Formüller</h3>
                <div className="text-sm space-y-1 font-mono bg-earth-50 dark:bg-neutral-800 p-3 rounded-lg">
                  <p>Kum: p<sub>a</sub> = 0.65 · K<sub>a</sub> · γ · H</p>
                  <p>Kil: p<sub>a</sub> = γH · (1 − 4c<sub>u</sub> / (γH))</p>
                  <p>Taban Kabarması: FS = N<sub>c</sub> · c<sub>u</sub> / (γH + q)</p>
                </div>
              </div>
            </>
          )}
          {!result && (
            <div className="card p-6 text-center text-[var(--muted)]">
              Parametreleri girin ve &quot;Hesapla&quot; butonuna tıklayın.
            </div>
          )}
        </div>
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

function RBox({ label, value, color }: { label: string; value: string; color: string }) {
  const c: Record<string, string> = { green: "bg-green-50 dark:bg-green-900/20 text-green-700", blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700", orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-700", red: "bg-red-50 dark:bg-red-900/20 text-red-700", gray: "bg-earth-50 dark:bg-neutral-800" };
  return (
    <div className={`rounded-lg p-3 text-center ${c[color] || c.gray}`}>
      <p className="text-[10px] text-[var(--muted)]">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
