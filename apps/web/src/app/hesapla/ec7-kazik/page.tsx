"use client";
import { useState } from "react";
import { pileCapacityEC7 } from "@geoforce/engine";
import type { PileSoilLayer } from "@geoforce/engine";

export default function EC7KazikPage() {
  const [diameter, setDiameter] = useState(0.6);
  const [length, setLength] = useState(15);
  const [pileType, setPileType] = useState<"driven" | "bored">("bored");
  const [designApproach, setDesignApproach] = useState<"DA1-C1" | "DA1-C2" | "DA2">("DA1-C2");
  const [permanentLoad, setPermanentLoad] = useState(600);
  const [variableLoad, setVariableLoad] = useState(200);
  const [numberOfTests, setNumberOfTests] = useState(2);
  const [layers, setLayers] = useState<(PileSoilLayer & { id: number })[]>([
    { id: 1, depthTop: 0, depthBottom: 5, soilType: "clay", cu: 40, gamma: 17 },
    { id: 2, depthTop: 5, depthBottom: 10, soilType: "sand", frictionAngle: 32, gamma: 19, N: 20 },
    { id: 3, depthTop: 10, depthBottom: 20, soilType: "clay", cu: 80, gamma: 18 },
  ]);
  const [result, setResult] = useState<ReturnType<typeof pileCapacityEC7> | null>(null);

  const addLayer = () => {
    const last = layers[layers.length - 1];
    setLayers([...layers, { id: Date.now(), depthTop: last?.depthBottom ?? 0, depthBottom: (last?.depthBottom ?? 0) + 5, soilType: "clay", cu: 50, gamma: 18 }]);
  };
  const removeLayer = (id: number) => setLayers(layers.filter(l => l.id !== id));
  const updateLayer = (id: number, key: string, val: any) => setLayers(layers.map(l => l.id === id ? { ...l, [key]: val } : l));

  const handleCalc = () => {
    setResult(pileCapacityEC7({
      diameter, length, pileType, layers,
      designApproach, permanentLoad, variableLoad, numberOfTests,
    }));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">🇪🇺 EC7 Kazık Tasarımı</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Eurocode 7 — Design Approach 1 & 2, kısmi güvenlik katsayıları</p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Girdi */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Kazık & Yükler</h2>
          <Field label="Kazık Çapı D (m)" value={diameter} onChange={setDiameter} min={0.1} max={3} step={0.1} />
          <Field label="Kazık Uzunluğu L (m)" value={length} onChange={setLength} min={1} max={60} step={1} />
          <div>
            <label className="block text-sm font-medium mb-1">Kazık Tipi</label>
            <select value={pileType} onChange={e => setPileType(e.target.value as any)} className="input-field">
              <option value="driven">Çakma kazık</option>
              <option value="bored">Fore kazık</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tasarım Yaklaşımı</label>
            <select value={designApproach} onChange={e => setDesignApproach(e.target.value as any)} className="input-field">
              <option value="DA1-C1">DA1 — Combination 1</option>
              <option value="DA1-C2">DA1 — Combination 2</option>
              <option value="DA2">DA2</option>
            </select>
          </div>
          <Field label="Kalıcı Yük Gk (kN)" value={permanentLoad} onChange={setPermanentLoad} min={0} step={50} />
          <Field label="Değişken Yük Qk (kN)" value={variableLoad} onChange={setVariableLoad} min={0} step={50} />
          <Field label="Test Sayısı" value={numberOfTests} onChange={setNumberOfTests} min={1} max={5} step={1} />

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
          <button onClick={handleCalc} className="btn-primary w-full">Hesapla</button>
        </div>

        {/* Sonuç */}
        <div className="lg:col-span-2 space-y-4">
          {result && (
            <>
              <div className="card p-6 space-y-4">
                <h2 className="font-semibold text-lg">{result.method}</h2>
                <p className={`text-sm font-medium ${result.adequate ? "text-green-600" : "text-red-600"}`}>
                  {result.adequate ? "✓ Tasarım yeterli" : "✗ Tasarım yetersiz — kapasite artırılmalı"}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <RBox label="Tasarım Yükü Fd" value={`${result.designLoad} kN`} color="red" />
                  <RBox label="Karakteristik Rk" value={`${result.characteristicResistance} kN`} color="blue" />
                  <RBox label="Tasarım Direnci Rd" value={`${result.designResistance} kN`} color="green" />
                  <RBox label="Kullanım Oranı" value={`${(result.utilisation * 100).toFixed(1)}%`} color={result.utilisation <= 1 ? "green" : "red"} />
                </div>

                {/* Kısmi Faktörler */}
                <h3 className="text-sm font-medium mt-4">Kısmi Güvenlik Katsayıları</h3>
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--card-border)]">
                      <th className="text-left py-1">Faktör</th>
                      <th className="text-right py-1">Değer</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--card-border)]"><td className="py-1 text-[var(--muted)]">γG (kalıcı yük)</td><td className="text-right font-medium">{result.partialFactors.gammaG}</td></tr>
                    <tr className="border-b border-[var(--card-border)]"><td className="py-1 text-[var(--muted)]">γQ (değişken yük)</td><td className="text-right font-medium">{result.partialFactors.gammaQ}</td></tr>
                    <tr className="border-b border-[var(--card-border)]"><td className="py-1 text-[var(--muted)]">γb (uç direnci)</td><td className="text-right font-medium">{result.partialFactors.gammaB}</td></tr>
                    <tr className="border-b border-[var(--card-border)]"><td className="py-1 text-[var(--muted)]">γs (çevre sürt.)</td><td className="text-right font-medium">{result.partialFactors.gammaS}</td></tr>
                    <tr className="border-b border-[var(--card-border)]"><td className="py-1 text-[var(--muted)]">ξ3</td><td className="text-right font-medium">{result.correlationFactors.xi3}</td></tr>
                    <tr><td className="py-1 text-[var(--muted)]">ξ4</td><td className="text-right font-medium">{result.correlationFactors.xi4}</td></tr>
                  </tbody>
                </table>
                </div>
              </div>

              {/* Formüller */}
              <div className="card p-6 space-y-3">
                <h3 className="font-semibold text-sm">Formüller</h3>
                <div className="text-sm space-y-1 font-mono bg-earth-50 dark:bg-neutral-800 p-3 rounded-lg">
                  <p>F<sub>d</sub> = γ<sub>G</sub> · G<sub>k</sub> + γ<sub>Q</sub> · Q<sub>k</sub></p>
                  <p>R<sub>k</sub> = min(R<sub>c,cal</sub>/ξ<sub>3</sub> , R<sub>c,cal</sub>/ξ<sub>4</sub>)</p>
                  <p>R<sub>d</sub> = R<sub>b,k</sub>/γ<sub>b</sub> + R<sub>s,k</sub>/γ<sub>s</sub></p>
                  <p>Kullanım: F<sub>d</sub> / R<sub>d</sub> ≤ 1.0</p>
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

function MiniField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-[10px] text-[var(--muted)]">{label}</label>
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} className="input-field text-xs py-1" />
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
