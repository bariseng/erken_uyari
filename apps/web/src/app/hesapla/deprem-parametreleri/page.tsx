"use client";
import ExportPDFButton from "@/components/ExportPDFButton";
import MethodologySection from "@/components/MethodologySection";
import type { MethodologyData } from "@/components/MethodologySection";
import { useState, useMemo } from "react";
import { calculateSeismicParams } from "@geoforce/engine";
import type { TBDY2018SoilClass } from "@geoforce/engine";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ReferenceLine } from "recharts";

const methodology: MethodologyData = {
  title: "TBDY 2018 Deprem Parametreleri",
  overview: "Türkiye Bina Deprem Yönetmeliği 2018'e göre deprem tasarım parametreleri, sahaya özel deprem tehlike haritasından elde edilen kısa periyot (SS) ve 1 s periyot (S1) spektral ivme katsayıları ile zemin sınıfına bağlı yerel zemin etki katsayıları (Fs, F1) kullanılarak hesaplanır.",
  methods: [
    {
      name: "Tasarım Spektral İvme Katsayıları",
      description: "Kısa periyot ve 1 s periyot tasarım spektral ivme katsayıları, harita değerleri ile zemin katsayılarının çarpımıyla elde edilir.",
      formulas: [
        { name: "Kısa periyot tasarım spektral ivmesi", formula: "SDS = SS × Fs", description: "SS: kısa periyot harita spektral ivme katsayısı, Fs: kısa periyot zemin etki katsayısı" },
        { name: "1 s periyot tasarım spektral ivmesi", formula: "SD1 = S1 × F1", description: "S1: 1 s periyot harita spektral ivme katsayısı, F1: 1 s periyot zemin etki katsayısı" },
        { name: "Köşe periyotları", formula: "TA = 0.2 × SD1/SDS,  TB = SD1/SDS", description: "Tasarım spektrumunun sabit ivme bölgesi sınırları" },
        { name: "Uzun periyot", formula: "TL = 6 s (sabit)", description: "Sabit yer değiştirme bölgesinin başlangıcı" },
      ],
      steps: [
        { step: 1, title: "Harita değerlerini belirle", description: "AFAD Deprem Tehlike Haritasından SS ve S1 değerleri okunur (enlem/boylam veya adres ile)" },
        { step: 2, title: "Zemin sınıfını belirle", description: "Vs30, SPT N60 veya cu değerlerine göre ZA–ZF sınıfı belirlenir" },
        { step: 3, title: "Zemin etki katsayıları", description: "TBDY 2018 Tablo 16.2 (Fs) ve Tablo 16.3 (F1) interpolasyonla belirlenir" },
        { step: 4, title: "Tasarım spektrumu", description: "SDS, SD1, TA, TB hesaplanır ve yatay tasarım spektrumu çizilir" },
      ],
      limitations: ["ZF sınıfı zeminler için sahaya özel spektrum analizi gerekir", "Düşey spektrum yatay spektrumun 2/3'ü olarak alınabilir"],
    },
    {
      name: "Yatay Elastik Tasarım Spektrumu",
      description: "Periyoda bağlı spektral ivme değerlerini tanımlar. Dört bölgeden oluşur.",
      formulas: [
        { name: "0 ≤ T < TA", formula: "Sae(T) = (0.4 + 0.6·T/TA) × SDS", description: "Artan ivme bölgesi" },
        { name: "TA ≤ T ≤ TB", formula: "Sae(T) = SDS", description: "Sabit ivme platosü" },
        { name: "TB < T ≤ TL", formula: "Sae(T) = SD1 / T", description: "Sabit hız bölgesi" },
        { name: "T > TL", formula: "Sae(T) = SD1 × TL / T²", description: "Sabit yer değiştirme bölgesi" },
      ],
      limitations: ["Yapı önem katsayısı (I) ve taşıyıcı sistem davranış katsayısı (R) ayrıca uygulanır"],
    },
    {
      name: "Zemin Etki Katsayıları Tabloları",
      description: "Fs ve F1 katsayıları zemin sınıfı ve harita spektral ivme değerlerine göre TBDY 2018 Tablo 16.2 ve 16.3'ten interpolasyonla belirlenir.",
      formulas: [
        { name: "Fs aralığı", formula: "ZA: 0.8, ZB: 0.9, ZC: 1.0–1.3, ZD: 1.0–1.6, ZE: 0.8–2.4", description: "SS değerine bağlı olarak değişir" },
        { name: "F1 aralığı", formula: "ZA: 0.8, ZB: 0.8, ZC: 1.0–1.5, ZD: 1.0–2.4, ZE: 1.0–3.5", description: "S1 değerine bağlı olarak değişir" },
      ],
      limitations: ["Ara değerler doğrusal interpolasyonla hesaplanır"],
    },
  ],
  references: [
    "TBDY 2018 — Türkiye Bina Deprem Yönetmeliği, Bölüm 2 ve 16.",
    "AFAD — Türkiye Deprem Tehlike Haritası (https://tdth.afad.gov.tr).",
    "Akkar, S. et al. (2018). Türkiye Sismik Tehlike Haritası. AFAD.",
  ],
  standards: ["TBDY 2018", "AFAD TDTH"],
  notes: [
    "SS ve S1 değerleri 475 yıl tekrarlanma periyodu (50 yılda %10 aşılma olasılığı) için verilir.",
    "Deprem tasarım sınıfı (DTS): SDS değerine göre DTS=1 (SDS<0.33), DTS=2 (0.33≤SDS<0.50), DTS=3 (0.50≤SDS<0.75), DTS=4 (SDS≥0.75).",
    "Bina önem katsayısı (I): Konut=1.0, Hastane/Okul=1.5.",
  ],
};

const soilClasses: { value: TBDY2018SoilClass; label: string }[] = [
  { value: "ZA", label: "ZA — Sağlam kaya (Vs30 > 1500)" },
  { value: "ZB", label: "ZB — Kaya (760 < Vs30 ≤ 1500)" },
  { value: "ZC", label: "ZC — Sıkı zemin (360 < Vs30 ≤ 760)" },
  { value: "ZD", label: "ZD — Orta sıkı zemin (180 < Vs30 ≤ 360)" },
  { value: "ZE", label: "ZE — Yumuşak zemin (Vs30 ≤ 180)" },
];

export default function DepremParametreleriPage() {
  const [Ss, setSs] = useState(1.2);
  const [S1, setS1] = useState(0.3);
  const [soilClass, setSoilClass] = useState<TBDY2018SoilClass>("ZC");
  const [R, setR] = useState(4);
  const [D, setD] = useState(2.5);
  const [I, setI] = useState(1.0);

  const result = useMemo(
    () => calculateSeismicParams({ Ss, S1, soilClass, R, D, importanceFactor: I }),
    [Ss, S1, soilClass, R, D, I]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">🌍 TBDY 2018 Deprem Parametreleri</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Tasarım spektral ivme katsayıları ve elastik tasarım spektrumu</p>
      <div className="mt-2"><ExportPDFButton moduleName="Deprem Parametreleri" method="TBDY 2018" inputs={{}} results={{}} /></div>
      <MethodologySection data={methodology} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Girdi */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Girdi Parametreleri</h2>

          <div className="p-3 rounded-lg bg-earth-50 dark:bg-neutral-800 text-xs text-[var(--muted)]">
            💡 Ss ve S1 değerlerini <a href="https://tdth.afad.gov.tr" target="_blank" rel="noopener" className="text-brand-600 underline">AFAD TDTH</a> sitesinden koordinat girerek alabilirsiniz.
          </div>

          <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Harita Parametreleri</h3>
          <Field label="Ss — Kısa periyot harita spektral ivme" value={Ss} onChange={setSs} min={0.1} max={3} step={0.01} />
          <Field label="S1 — 1s periyot harita spektral ivme" value={S1} onChange={setS1} min={0.01} max={1.5} step={0.01} />

          <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide pt-2">Zemin Sınıfı</h3>
          <div>
            <select value={soilClass} onChange={(e) => setSoilClass(e.target.value as TBDY2018SoilClass)} className="input-field">
              {soilClasses.map((sc) => (
                <option key={sc.value} value={sc.value}>{sc.label}</option>
              ))}
            </select>
          </div>

          <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide pt-2">Yapı Parametreleri</h3>
          <Field label="Bina önem katsayısı, I" value={I} onChange={setI} min={1} max={1.5} step={0.1} />
          <Field label="Taşıyıcı sistem davranış katsayısı, R" value={R} onChange={setR} min={1} max={8} step={0.5} />
          <Field label="Dayanım fazlalığı katsayısı, D" value={D} onChange={setD} min={1} max={3} step={0.5} />
        </div>

        {/* Sonuçlar */}
        <div className="lg:col-span-2 space-y-4">
          {/* Ana sonuçlar */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Tasarım Parametreleri</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ResultBox label="SDS" value={result.SDS.toFixed(3)} color="red" />
              <ResultBox label="SD1" value={result.SD1.toFixed(3)} color="orange" />
              <ResultBox label="Fs" value={result.Fs.toFixed(3)} color="blue" />
              <ResultBox label="F1" value={result.F1.toFixed(3)} color="blue" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <ResultBox label="TA (s)" value={result.TA.toFixed(3)} color="gray" />
              <ResultBox label="TB (s)" value={result.TB.toFixed(3)} color="gray" />
              <ResultBox label="TL (s)" value={result.TL.toString()} color="gray" />
              <ResultBox label="DTS" value={result.DTS.toString()} color="green" />
            </div>
          </div>

          {/* Formüller */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-3">Hesap Adımları</h2>
            <div className="space-y-2 text-sm font-mono bg-earth-50 dark:bg-neutral-800 rounded-lg p-4">
              <p>SDS = Ss × Fs = {Ss} × {result.Fs} = <b>{result.SDS.toFixed(4)}</b></p>
              <p>SD1 = S1 × F1 = {S1} × {result.F1} = <b>{result.SD1.toFixed(4)}</b></p>
              <p>TA = 0.2 × SD1/SDS = 0.2 × {result.SD1.toFixed(4)}/{result.SDS.toFixed(4)} = <b>{result.TA.toFixed(4)} s</b></p>
              <p>TB = SD1/SDS = {result.SD1.toFixed(4)}/{result.SDS.toFixed(4)} = <b>{result.TB.toFixed(4)} s</b></p>
            </div>
          </div>

          {/* Spektrum Grafiği — Recharts */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Elastik Tasarım Spektrumu</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={result.spectrum.periods.map((t, i) => ({
                  T: t,
                  Sae: Number(result.spectrum.elasticSa[i]),
                  SaR: Number(result.spectrum.reducedSa[i]),
                }))}
                margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="T" type="number" tick={{ fontSize: 10 }} domain={[0, 6]} label={{ value: "Periyot, T (s)", position: "insideBottom", offset: -10, fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} label={{ value: "Spektral İvme, Sa (g)", angle: -90, position: "insideLeft", fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(value: number) => [`${value} g`, ""]} labelFormatter={(label: number) => `T = ${label} s`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={result.SDS} stroke="#dc2626" strokeDasharray="4 4" strokeWidth={1} label={{ value: `SDS=${result.SDS.toFixed(3)}`, position: "right", fontSize: 9, fill: "#dc2626" }} />
                <ReferenceLine y={result.SD1} stroke="#d97706" strokeDasharray="4 4" strokeWidth={1} label={{ value: `SD1=${result.SD1.toFixed(3)}`, position: "right", fontSize: 9, fill: "#d97706" }} />
                <ReferenceLine x={result.TA} stroke="#7c3aed" strokeDasharray="3 3" strokeWidth={1} label={{ value: "TA", position: "top", fontSize: 9, fill: "#7c3aed" }} />
                <ReferenceLine x={result.TB} stroke="#7c3aed" strokeDasharray="3 3" strokeWidth={1} label={{ value: "TB", position: "top", fontSize: 9, fill: "#7c3aed" }} />
                <Line type="monotone" dataKey="Sae" name="Elastik Sae(T)" stroke="#dc2626" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="SaR" name="Azaltılmış SaR(T)" stroke="#2563eb" strokeWidth={2} dot={false} strokeDasharray="6 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recharts Tasarım Spektrumu */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Tasarım Spektrumu (Recharts)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={result.spectrum.periods.map((t, i) => ({ "T (s)": t, "Sae (g)": result.spectrum.elasticSa[i], "SaR (g)": result.spectrum.reducedSa[i] }))} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="T (s)" type="number" label={{ value: "Periyot T (s)", position: "insideBottom", offset: -10, fontSize: 11 }} tick={{ fontSize: 10 }} />
                <YAxis label={{ value: "Sa (g)", angle: -90, position: "insideLeft", fontSize: 11 }} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Sae (g)" stroke="#ef4444" strokeWidth={2} dot={false} name="Elastik Sae(T)" />
                <Line type="monotone" dataKey="SaR (g)" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="6 3" name="Azaltılmış SaR(T)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Spektrum Tablosu */}
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-3">Spektrum Değerleri</h2>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[var(--card)]">
                  <tr className="border-b border-[var(--card-border)]">
                    <th className="text-left py-2 pr-4">T (s)</th>
                    <th className="text-right py-2 px-2">Sae (g)</th>
                    <th className="text-right py-2 pl-2">SaR (g)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.spectrum.periods.map((t, i) => (
                    <tr key={i} className="border-b border-[var(--card-border)] last:border-0">
                      <td className="py-1.5 pr-4">{t}</td>
                      <td className="text-right py-1.5 px-2 text-red-600 font-medium">{result.spectrum.elasticSa[i]}</td>
                      <td className="text-right py-1.5 pl-2 text-blue-600 font-medium">{result.spectrum.reducedSa[i]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultBox({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    red: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    gray: "bg-earth-50 dark:bg-neutral-800",
  };
  return (
    <div className={`rounded-lg p-3 text-center ${colors[color] || colors.gray}`}>
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} min={min} max={max} step={step ?? 1} className="input-field" />
    </div>
  );
}
