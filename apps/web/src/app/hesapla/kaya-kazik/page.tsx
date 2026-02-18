"use client";
import { useState } from "react";
import { rockSocketCapacity, rockSocketSettlement } from "@geoforce/engine";

export default function KayaKazikPage() {
  const [socketDiameter, setSocketDiameter] = useState(1.0);
  const [socketLength, setSocketLength] = useState(3.0);
  const [rockUCS, setRockUCS] = useState(30);
  const [RQD, setRQD] = useState(70);
  const [load, setLoad] = useState(5000);
  const [rockModulus, setRockModulus] = useState(10000);
  const [concreteModulus, setConcreteModulus] = useState(30000);
  const [capResult, setCapResult] = useState<ReturnType<typeof rockSocketCapacity> | null>(null);
  const [settResult, setSettResult] = useState<ReturnType<typeof rockSocketSettlement> | null>(null);

  const handleCalc = () => {
    setCapResult(rockSocketCapacity({ socketDiameter, socketLength, rockUCS, RQD }));
    setSettResult(rockSocketSettlement({ load, socketDiameter, socketLength, rockModulus, concreteModulus }));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">🪨 Kaya Soketi Kazık</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Zhang & Einstein (1998) kapasite + AASHTO (2002) oturma analizi</p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Girdi */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Girdi Parametreleri</h2>
          <Field label="Soket Çapı D (m)" value={socketDiameter} onChange={setSocketDiameter} min={0.3} max={3} step={0.1} />
          <Field label="Soket Uzunluğu Ls (m)" value={socketLength} onChange={setSocketLength} min={0.5} max={20} step={0.5} />
          <Field label="Kaya UCS (MPa)" value={rockUCS} onChange={setRockUCS} min={1} max={300} step={1} />
          <Field label="RQD (%)" value={RQD} onChange={setRQD} min={0} max={100} step={5} />
          <Field label="Uygulanan Yük (kN)" value={load} onChange={setLoad} min={0} step={100} />
          <Field label="Kaya Modülü Er (MPa)" value={rockModulus} onChange={setRockModulus} min={100} step={500} />
          <Field label="Beton Modülü Ec (MPa)" value={concreteModulus} onChange={setConcreteModulus} min={10000} step={1000} />
          <button onClick={handleCalc} className="btn-primary w-full">Hesapla</button>
        </div>

        {/* Sonuç */}
        <div className="lg:col-span-2 space-y-4">
          {capResult && settResult && (
            <>
              {/* Kapasite */}
              <div className="card p-6 space-y-4">
                <h2 className="font-semibold text-lg">{capResult.method}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <RBox label="Uç Direnci Qp" value={`${capResult.tipCapacity} kN`} color="blue" />
                  <RBox label="Çevre Sürt. Qs" value={`${capResult.shaftCapacity} kN`} color="orange" />
                  <RBox label="Nihai Qu" value={`${capResult.ultimate} kN`} color="red" />
                  <RBox label={`İzin Ver. Qa (FS=${capResult.safetyFactor})`} value={`${capResult.allowable} kN`} color="green" />
                  <RBox label="RQD Faktörü" value={`${capResult.rqdFactor}`} color="gray" />
                </div>

                <h3 className="text-sm font-medium mt-4">Birim Dirençler</h3>
                <div className="space-y-1 text-sm">
                  <Row label="Birim uç direnci qp" value={`${capResult.unitTipResistance} MPa`} />
                  <Row label="Birim çevre sürtünmesi qs" value={`${capResult.unitShaftResistance} MPa`} />
                </div>
              </div>

              {/* Oturma */}
              <div className="card p-6 space-y-4">
                <h2 className="font-semibold text-lg">{settResult.method}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <RBox label="Elastik Kısalma" value={`${settResult.elasticShortening} mm`} color="blue" />
                  <RBox label="Uç Oturması" value={`${settResult.tipSettlement} mm`} color="orange" />
                  <RBox label="Toplam Oturma" value={`${settResult.totalSettlement} mm`} color="green" />
                </div>
              </div>

              {/* Formüller */}
              <div className="card p-6 space-y-3">
                <h3 className="font-semibold text-sm">Formüller</h3>
                <div className="text-sm space-y-1 font-mono bg-earth-50 dark:bg-neutral-800 p-3 rounded-lg">
                  <p>q<sub>p</sub> = 4.83 · (UCS)<sup>0.51</sup></p>
                  <p>q<sub>s</sub> = 0.4 · (UCS)<sup>0.5</sup></p>
                  <p>δ<sub>e</sub> = P · L / (A<sub>p</sub> · E<sub>c</sub>)</p>
                  <p>δ<sub>tip</sub> = P · I<sub>p</sub> / (D · E<sub>r</sub>)</p>
                </div>
              </div>
            </>
          )}
          {!capResult && (
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
