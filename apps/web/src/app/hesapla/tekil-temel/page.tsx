"use client";
import { useState } from "react";
import { padFootingDesign } from "@geoforce/engine";

export default function TekilTemelPage() {
  const [columnWidth, setColumnWidth] = useState(0.4);
  const [footingWidth, setFootingWidth] = useState(2.0);
  const [footingLength, setFootingLength] = useState(2.0);
  const [footingDepth, setFootingDepth] = useState(0.5);
  const [effectiveDepth, setEffectiveDepth] = useState(0.42);
  const [load, setLoad] = useState(800);
  const [moment, setMoment] = useState(50);
  const [horizontalForce, setHorizontalForce] = useState(30);
  const [fck, setFck] = useState(25);
  const [bearingPressure, setBearingPressure] = useState(200);
  const [gamma, setGamma] = useState(18);
  const [result, setResult] = useState<ReturnType<typeof padFootingDesign> | null>(null);

  const handleCalc = () => {
    setResult(padFootingDesign({
      columnWidth, footingWidth, footingLength, footingDepth,
      effectiveDepth, load, moment, horizontalForce, fck, bearingPressure, gamma,
    }));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">🧱 Tekil Temel Tasarımı</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Zımbalama, eğilme, kayma ve devrilme kontrolleri (ACI 318 / TS500)</p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Girdi */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Girdi Parametreleri</h2>
          <Field label="Kolon Genişliği (m)" value={columnWidth} onChange={setColumnWidth} min={0.1} max={1} step={0.05} />
          <Field label="Temel Genişliği B (m)" value={footingWidth} onChange={setFootingWidth} min={0.5} max={6} step={0.1} />
          <Field label="Temel Uzunluğu L (m)" value={footingLength} onChange={setFootingLength} min={0.5} max={6} step={0.1} />
          <Field label="Temel Kalınlığı h (m)" value={footingDepth} onChange={setFootingDepth} min={0.2} max={2} step={0.05} />
          <Field label="Faydalı Yükseklik d (m)" value={effectiveDepth} onChange={setEffectiveDepth} min={0.1} max={1.5} step={0.01} />
          <Field label="Düşey Yük N (kN)" value={load} onChange={setLoad} min={0} step={10} />
          <Field label="Moment M (kN·m)" value={moment} onChange={setMoment} min={0} step={5} />
          <Field label="Yatay Kuvvet H (kN)" value={horizontalForce} onChange={setHorizontalForce} min={0} step={5} />
          <Field label="Beton fck (MPa)" value={fck} onChange={setFck} min={16} max={50} step={1} />
          <Field label="Zemin Taşıma Basıncı q (kPa)" value={bearingPressure} onChange={setBearingPressure} min={50} step={10} />
          <Field label="Birim Hacim Ağırlık γ (kN/m³)" value={gamma} onChange={setGamma} min={10} max={25} step={0.5} />
          <button onClick={handleCalc} className="btn-primary w-full">Hesapla</button>
        </div>

        {/* Sonuç */}
        <div className="lg:col-span-2 space-y-4">
          {result && (
            <>
              <div className="card p-6 space-y-4">
                <h2 className="font-semibold text-lg">{result.method}</h2>
                <p className={`text-sm font-medium ${result.assessment.startsWith("Tüm") ? "text-green-600" : "text-red-600"}`}>{result.assessment}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <RBox label="Zımbalama" value={result.punchingShearCheck.adequate ? "✓ Yeterli" : "✗ Yetersiz"} color={result.punchingShearCheck.adequate ? "green" : "red"} />
                  <RBox label="Eğilme Momenti" value={`${result.bendingMoment} kN·m/m`} color="blue" />
                  <RBox label="Kayma FS" value={`${result.slidingFS}`} color={result.slidingFS >= 1.5 ? "green" : "red"} />
                  <RBox label="Devrilme FS" value={`${result.overturningFS}`} color={result.overturningFS >= 1.5 ? "green" : "red"} />
                </div>

                {/* Detaylar */}
                <h3 className="text-sm font-medium mt-4">Zımbalama Detayları</h3>
                <div className="space-y-1 text-sm">
                  <Row label="Zımbalama Kuvveti Vp" value={`${result.punchingShearCheck.punchingForce} kN`} />
                  <Row label="Zımbalama Çevresi" value={`${result.punchingShearCheck.punchingPerimeter} m`} />
                  <Row label="Zımbalama Gerilmesi vp" value={`${result.punchingShearCheck.punchingStress} MPa`} />
                  <Row label="İzin Verilebilir Gerilme" value={`${result.punchingShearCheck.allowableStress} MPa`} />
                </div>

                <h3 className="text-sm font-medium mt-4">Donatı & Basınç</h3>
                <div className="space-y-1 text-sm">
                  <Row label="Gerekli Donatı As" value={`${result.steelArea} cm²/m`} />
                  <Row label="qmax" value={`${result.pressureDistribution.qMax} kPa`} />
                  <Row label="qmin" value={`${result.pressureDistribution.qMin} kPa`} />
                  <Row label="Eksantrisite e" value={`${result.pressureDistribution.eccentricity} m`} />
                </div>
              </div>

              {/* Formüller */}
              <div className="card p-6 space-y-3">
                <h3 className="font-semibold text-sm">Formüller</h3>
                <div className="text-sm space-y-1 font-mono bg-earth-50 dark:bg-neutral-800 p-3 rounded-lg">
                  <p>Zımbalama: v<sub>p</sub> = V<sub>p</sub> / (u · d)</p>
                  <p>Eğilme: M = q · L² / 8</p>
                  <p>Devrilme: FS = M<sub>stab</sub> / M<sub>dev</sub> ≥ 1.5</p>
                  <p>Kayma: FS = (N·tanδ + P<sub>p</sub>) / H ≥ 1.5</p>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-[var(--card-border)] last:border-0">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-medium">{value}</span>
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
