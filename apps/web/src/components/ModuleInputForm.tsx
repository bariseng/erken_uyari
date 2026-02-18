"use client";
/**
 * GeoForce — Modül Girdi Formu
 * Her modül için dinamik input alanları
 */
import type { ModuleKey } from "@/lib/report-store";

interface FieldDef {
  key: string;
  label: string;
  unit: string;
  default: number | string;
  min?: number;
  max?: number;
  step?: number;
  type?: "number" | "select";
  options?: { value: string; label: string }[];
}

const MODULE_FIELDS: Record<ModuleKey, FieldDef[]> = {
  "tasima-kapasitesi": [
    { key: "width", label: "Temel genişliği B", unit: "m", default: 2, min: 0.1, step: 0.1 },
    { key: "length", label: "Temel uzunluğu L", unit: "m", default: 2, min: 0.1, step: 0.1 },
    { key: "depth", label: "Temel derinliği Df", unit: "m", default: 1.5, min: 0, step: 0.1 },
    { key: "gamma", label: "Birim hacim ağırlık γ", unit: "kN/m³", default: 18, min: 10, max: 25, step: 0.5 },
    { key: "cohesion", label: "Kohezyon c", unit: "kPa", default: 20, min: 0, max: 500 },
    { key: "frictionAngle", label: "Sürtünme açısı φ", unit: "°", default: 30, min: 0, max: 50 },
    { key: "safetyFactor", label: "Güvenlik katsayısı FS", unit: "-", default: 3, min: 1, max: 5, step: 0.5 },
  ],
  "oturma": [
    { key: "width", label: "Temel genişliği B", unit: "m", default: 2, min: 0.1, step: 0.1 },
    { key: "length", label: "Temel uzunluğu L", unit: "m", default: 2, min: 0.1, step: 0.1 },
    { key: "pressure", label: "Net taban basıncı q", unit: "kPa", default: 100, min: 0 },
    { key: "elasticModulus", label: "Elastisite modülü Es", unit: "kPa", default: 15000, min: 100 },
    { key: "poissonRatio", label: "Poisson oranı ν", unit: "-", default: 0.3, min: 0, max: 0.5, step: 0.05 },
    { key: "thickness", label: "Tabaka kalınlığı H", unit: "m", default: 4, min: 0.1 },
    { key: "e0", label: "Başlangıç boşluk oranı e₀", unit: "-", default: 0.8, min: 0.1, step: 0.05 },
    { key: "Cc", label: "Sıkışma indeksi Cc", unit: "-", default: 0.25, min: 0.01, step: 0.01 },
    { key: "sigma0", label: "Mevcut efektif gerilme σ'₀", unit: "kPa", default: 80, min: 0 },
    { key: "deltaSigma", label: "Gerilme artışı Δσ", unit: "kPa", default: 50, min: 0 },
  ],
  "yanal-basinc": [
    { key: "wallHeight", label: "Duvar yüksekliği H", unit: "m", default: 5, min: 0.5, step: 0.5 },
    { key: "gamma", label: "Birim hacim ağırlık γ", unit: "kN/m³", default: 18, min: 10, max: 25, step: 0.5 },
    { key: "cohesion", label: "Kohezyon c", unit: "kPa", default: 0, min: 0 },
    { key: "frictionAngle", label: "Sürtünme açısı φ", unit: "°", default: 30, min: 0, max: 50 },
    { key: "surcharge", label: "Sürşarj q", unit: "kPa", default: 10, min: 0 },
    { key: "wallFriction", label: "Duvar sürtünme açısı δ", unit: "°", default: 20, min: 0, max: 40 },
    { key: "kh", label: "Yatay sismik katsayı kh", unit: "-", default: 0.2, min: 0, max: 0.5, step: 0.05 },
    { key: "kv", label: "Düşey sismik katsayı kv", unit: "-", default: 0.1, min: 0, max: 0.3, step: 0.05 },
  ],
  "deprem": [
    { key: "Ss", label: "Kısa periyot Ss", unit: "g", default: 1.0, min: 0, step: 0.05 },
    { key: "S1", label: "1s periyot S1", unit: "g", default: 0.3, min: 0, step: 0.05 },
    { key: "soilClass", label: "Zemin sınıfı", unit: "-", default: "ZC", type: "select", options: [
      { value: "ZA", label: "ZA" }, { value: "ZB", label: "ZB" }, { value: "ZC", label: "ZC" },
      { value: "ZD", label: "ZD" }, { value: "ZE", label: "ZE" },
    ]},
  ],
  "sivilasma": [
    { key: "depth", label: "Tabaka derinliği", unit: "m", default: 5, min: 0.5 },
    { key: "N", label: "SPT N değeri", unit: "-", default: 15, min: 0 },
    { key: "finesContent", label: "İnce dane oranı FC", unit: "%", default: 15, min: 0, max: 100 },
    { key: "magnitude", label: "Deprem büyüklüğü Mw", unit: "-", default: 7.5, min: 4, max: 9, step: 0.1 },
    { key: "amax", label: "Maks. yer ivmesi amax", unit: "g", default: 0.4, min: 0, step: 0.05 },
    { key: "waterTableDepth", label: "Yeraltı su seviyesi", unit: "m", default: 2, min: 0 },
    { key: "gamma", label: "Birim hacim ağırlık γ", unit: "kN/m³", default: 18, min: 10, max: 25 },
  ],
  "sev-stabilitesi": [
    { key: "height", label: "Şev yüksekliği H", unit: "m", default: 10, min: 1 },
    { key: "slopeAngle", label: "Şev açısı β", unit: "°", default: 30, min: 5, max: 80 },
    { key: "gamma", label: "Birim hacim ağırlık γ", unit: "kN/m³", default: 18, min: 10, max: 25, step: 0.5 },
    { key: "cohesion", label: "Kohezyon c", unit: "kPa", default: 15, min: 0 },
    { key: "frictionAngle", label: "Sürtünme açısı φ", unit: "°", default: 25, min: 0, max: 50 },
    { key: "ru", label: "Boşluk suyu basıncı oranı ru", unit: "-", default: 0, min: 0, max: 0.5, step: 0.05 },
  ],
  "kazik": [
    { key: "diameter", label: "Kazık çapı D", unit: "m", default: 0.6, min: 0.1, step: 0.1 },
    { key: "length", label: "Kazık uzunluğu L", unit: "m", default: 15, min: 1 },
    { key: "cu", label: "Drenajsız kayma dayanımı cu", unit: "kPa", default: 50, min: 0 },
    { key: "frictionAngle", label: "Sürtünme açısı φ", unit: "°", default: 30, min: 0, max: 50 },
    { key: "gamma", label: "Birim hacim ağırlık γ", unit: "kN/m³", default: 18, min: 10, max: 25 },
    { key: "N", label: "SPT N değeri", unit: "-", default: 20, min: 0 },
  ],
  "iksa": [
    { key: "excavationDepth", label: "Kazı derinliği H", unit: "m", default: 6, min: 1 },
    { key: "gamma", label: "Birim hacim ağırlık γ", unit: "kN/m³", default: 18, min: 10, max: 25, step: 0.5 },
    { key: "cohesion", label: "Kohezyon c", unit: "kPa", default: 5, min: 0 },
    { key: "frictionAngle", label: "Sürtünme açısı φ", unit: "°", default: 28, min: 0, max: 50 },
    { key: "surcharge", label: "Sürşarj q", unit: "kPa", default: 10, min: 0 },
    { key: "condition", label: "Mesnet koşulu", unit: "-", default: "cantilever", type: "select", options: [
      { value: "cantilever", label: "Konsol" }, { value: "single_anchor", label: "Tek Ankrajlı" }, { value: "multi_anchor", label: "Çok Ankrajlı" },
    ]},
  ],
  "siniflandirma": [
    { key: "gravel", label: "Çakıl oranı", unit: "%", default: 20, min: 0, max: 100 },
    { key: "sand", label: "Kum oranı", unit: "%", default: 45, min: 0, max: 100 },
    { key: "fines", label: "İnce dane oranı", unit: "%", default: 35, min: 0, max: 100 },
    { key: "LL", label: "Likit limit LL", unit: "%", default: 40, min: 0 },
    { key: "PL", label: "Plastik limit PL", unit: "%", default: 20, min: 0 },
  ],
  "konsolidasyon": [
    { key: "thickness", label: "Tabaka kalınlığı H", unit: "m", default: 4, min: 0.1 },
    { key: "e0", label: "Başlangıç boşluk oranı e₀", unit: "-", default: 0.8, min: 0.1, step: 0.05 },
    { key: "Cc", label: "Sıkışma indeksi Cc", unit: "-", default: 0.25, min: 0.01, step: 0.01 },
    { key: "cv", label: "Konsolidasyon katsayısı Cv", unit: "m²/yıl", default: 3, min: 0.01 },
    { key: "sigma0", label: "Mevcut efektif gerilme σ'₀", unit: "kPa", default: 80, min: 0 },
    { key: "deltaSigma", label: "Gerilme artışı Δσ", unit: "kPa", default: 50, min: 0 },
  ],
  "zemin-iyilestirme": [
    { key: "depth", label: "İyileştirme derinliği", unit: "m", default: 8, min: 1 },
    { key: "energy", label: "Düşme enerjisi W×h", unit: "ton·m", default: 200, min: 10 },
    { key: "gamma", label: "Birim hacim ağırlık γ", unit: "kN/m³", default: 16, min: 10, max: 25 },
  ],
  "faz-iliskileri": [
    { key: "Gs", label: "Özgül ağırlık Gs", unit: "-", default: 2.65, min: 2.4, max: 2.9, step: 0.01 },
    { key: "w", label: "Su muhtevası w", unit: "%", default: 20, min: 0, max: 100 },
    { key: "gamma", label: "Birim hacim ağırlık γ", unit: "kN/m³", default: 18, min: 10, max: 25, step: 0.5 },
  ],
  "arazi-deneyleri": [
    { key: "depth", label: "Derinlik", unit: "m", default: 5, min: 0 },
    { key: "N", label: "SPT N değeri", unit: "-", default: 15, min: 0 },
    { key: "gamma", label: "Birim hacim ağırlık γ", unit: "kN/m³", default: 18, min: 10, max: 25 },
    { key: "waterTableDepth", label: "Yeraltı su seviyesi", unit: "m", default: 3, min: 0 },
  ],
  "indeks-deneyleri": [
    { key: "LL", label: "Likit limit LL", unit: "%", default: 45, min: 0 },
    { key: "PL", label: "Plastik limit PL", unit: "%", default: 22, min: 0 },
    { key: "w", label: "Doğal su muhtevası w", unit: "%", default: 30, min: 0 },
  ],
  "gerilme-temel": [
    { key: "sigma1", label: "Büyük asal gerilme σ₁", unit: "kPa", default: 200, min: 0 },
    { key: "sigma3", label: "Küçük asal gerilme σ₃", unit: "kPa", default: 50, min: 0 },
    { key: "cohesion", label: "Kohezyon c", unit: "kPa", default: 20, min: 0 },
    { key: "frictionAngle", label: "Sürtünme açısı φ", unit: "°", default: 30, min: 0, max: 50 },
  ],
  "gerilme-dagilimi": [
    { key: "load", label: "Nokta yük P", unit: "kN", default: 100, min: 0 },
    { key: "depth", label: "Derinlik z", unit: "m", default: 3, min: 0.1 },
    { key: "offset", label: "Yatay mesafe r", unit: "m", default: 1, min: 0 },
  ],
  "istinat-duvari": [
    { key: "wallHeight", label: "Duvar yüksekliği H", unit: "m", default: 4, min: 1 },
    { key: "baseWidth", label: "Taban genişliği B", unit: "m", default: 2.5, min: 0.5, step: 0.1 },
    { key: "gamma", label: "Dolgu birim hacim ağırlık γ", unit: "kN/m³", default: 18, min: 10, max: 25 },
    { key: "frictionAngle", label: "Sürtünme açısı φ", unit: "°", default: 30, min: 0, max: 50 },
    { key: "cohesion", label: "Kohezyon c", unit: "kPa", default: 0, min: 0 },
  ],
  "saha-tepki": [
    { key: "Vs30", label: "Vs30", unit: "m/s", default: 300, min: 50, max: 1500 },
    { key: "thickness", label: "Tabaka kalınlığı", unit: "m", default: 20, min: 1 },
    { key: "Vs", label: "Tabaka Vs", unit: "m/s", default: 200, min: 50 },
    { key: "density", label: "Yoğunluk ρ", unit: "kg/m³", default: 1800, min: 1000, max: 2500 },
  ],
};

export function getModuleFields(moduleKey: ModuleKey): FieldDef[] {
  return MODULE_FIELDS[moduleKey] || [];
}

export function getDefaultInputs(moduleKey: ModuleKey): Record<string, number | string> {
  const fields = getModuleFields(moduleKey);
  const out: Record<string, number | string> = {};
  for (const f of fields) out[f.key] = f.default;
  return out;
}

interface ModuleInputFormProps {
  moduleKey: ModuleKey;
  inputs: Record<string, number | string>;
  onChange: (inputs: Record<string, number | string>) => void;
}

export default function ModuleInputForm({ moduleKey, inputs, onChange }: ModuleInputFormProps) {
  const fields = getModuleFields(moduleKey);

  const handleChange = (key: string, value: string) => {
    const field = fields.find(f => f.key === key);
    if (field?.type === "select") {
      onChange({ ...inputs, [key]: value });
    } else {
      onChange({ ...inputs, [key]: value === "" ? "" : Number(value) });
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {fields.map(f => (
        <div key={f.key}>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1">
            {f.label} {f.unit !== "-" && <span className="text-[var(--muted)]">({f.unit})</span>}
          </label>
          {f.type === "select" ? (
            <select
              value={inputs[f.key] ?? f.default}
              onChange={e => handleChange(f.key, e.target.value)}
              className="input-field text-sm"
            >
              {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : (
            <input
              type="number"
              value={inputs[f.key] ?? f.default}
              onChange={e => handleChange(f.key, e.target.value)}
              min={f.min}
              max={f.max}
              step={f.step ?? 1}
              className="input-field text-sm"
            />
          )}
        </div>
      ))}
    </div>
  );
}
