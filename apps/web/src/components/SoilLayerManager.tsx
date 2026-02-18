"use client";
/**
 * GeoForce — Zemin Katmanı Yönetici Bileşeni
 * Birden fazla zemin katmanı ekleme, düzenleme, silme
 */
import { useState } from "react";

export interface SoilLayer {
  id: string;
  name: string;
  depthTop: number;
  depthBottom: number;
  soilType: "clay" | "sand" | "silt" | "gravel" | "rock" | "fill";
  gamma: number;
  gammaSat: number;
  cohesion: number;
  frictionAngle: number;
  E: number;
  N?: number;
  cu?: number;
  Cc?: number;
  Cs?: number;
  e0?: number;
  Vs?: number;
  description?: string;
}

const SOIL_TYPES: { value: SoilLayer["soilType"]; label: string; icon: string }[] = [
  { value: "fill", label: "Dolgu", icon: "🟫" },
  { value: "clay", label: "Kil", icon: "🟤" },
  { value: "silt", label: "Silt", icon: "🟡" },
  { value: "sand", label: "Kum", icon: "🟠" },
  { value: "gravel", label: "Çakıl", icon: "⚫" },
  { value: "rock", label: "Kaya", icon: "🪨" },
];

const DEFAULT_PARAMS: Record<SoilLayer["soilType"], Partial<SoilLayer>> = {
  fill: { gamma: 16, gammaSat: 18, cohesion: 0, frictionAngle: 25, E: 5000 },
  clay: { gamma: 17, gammaSat: 19, cohesion: 25, frictionAngle: 10, E: 8000, cu: 40, Cc: 0.25, Cs: 0.05, e0: 0.8 },
  silt: { gamma: 17, gammaSat: 19, cohesion: 10, frictionAngle: 22, E: 10000 },
  sand: { gamma: 18, gammaSat: 20, cohesion: 0, frictionAngle: 32, E: 20000, N: 20 },
  gravel: { gamma: 19, gammaSat: 21, cohesion: 0, frictionAngle: 38, E: 40000, N: 35 },
  rock: { gamma: 24, gammaSat: 25, cohesion: 100, frictionAngle: 40, E: 200000, Vs: 800 },
};

let _layerId = 0;
const uid = () => `layer_${++_layerId}_${Date.now()}`;

function createDefaultLayer(depthTop: number): SoilLayer {
  return {
    id: uid(),
    name: `Katman ${_layerId}`,
    depthTop,
    depthBottom: depthTop + 3,
    soilType: "clay",
    gamma: 17,
    gammaSat: 19,
    cohesion: 25,
    frictionAngle: 10,
    E: 8000,
    cu: 40,
    Cc: 0.25,
    Cs: 0.05,
    e0: 0.8,
  };
}

interface SoilLayerManagerProps {
  layers: SoilLayer[];
  onChange: (layers: SoilLayer[]) => void;
  waterTableDepth: number;
  onWaterTableChange: (depth: number) => void;
}

export default function SoilLayerManager({ layers, onChange, waterTableDepth, onWaterTableChange }: SoilLayerManagerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addLayer = () => {
    const lastBottom = layers.length > 0 ? layers[layers.length - 1].depthBottom : 0;
    const newLayer = createDefaultLayer(lastBottom);
    onChange([...layers, newLayer]);
    setExpandedId(newLayer.id);
  };

  const removeLayer = (id: string) => {
    onChange(layers.filter(l => l.id !== id));
  };

  const updateLayer = (id: string, updates: Partial<SoilLayer>) => {
    onChange(layers.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const handleTypeChange = (id: string, soilType: SoilLayer["soilType"]) => {
    const defaults = DEFAULT_PARAMS[soilType];
    updateLayer(id, { soilType, ...defaults });
  };

  const totalDepth = layers.length > 0 ? layers[layers.length - 1].depthBottom : 0;

  return (
    <div className="space-y-4">
      {/* Başlık + YASS */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">🗂️ Zemin Profili</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-[var(--muted)]">💧 YASS (m)</label>
            <input
              type="number"
              value={waterTableDepth}
              onChange={e => onWaterTableChange(Number(e.target.value))}
              min={0}
              step={0.5}
              className="input-field w-20 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Zemin profili görsel */}
      {layers.length > 0 && (
        <div className="rounded-lg border border-[var(--card-border)] overflow-hidden">
          {layers.map((layer, idx) => {
            const typeInfo = SOIL_TYPES.find(t => t.value === layer.soilType)!;
            const thickness = layer.depthBottom - layer.depthTop;
            const barH = Math.max(32, Math.min(80, thickness * 12));
            const isExpanded = expandedId === layer.id;
            const hasWater = waterTableDepth >= layer.depthTop && waterTableDepth < layer.depthBottom;

            return (
              <div key={layer.id}>
                {/* Katman bar */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : layer.id)}
                  className={`w-full flex items-center gap-3 px-4 transition-colors text-left ${
                    isExpanded ? "bg-brand-50 dark:bg-brand-900/20" : "hover:bg-earth-50 dark:hover:bg-neutral-800"
                  } ${idx > 0 ? "border-t border-[var(--card-border)]" : ""}`}
                  style={{ minHeight: barH }}
                >
                  {/* Derinlik göstergesi */}
                  <div className="flex flex-col items-center text-[10px] text-[var(--muted)] w-12 shrink-0">
                    <span>{layer.depthTop.toFixed(1)}m</span>
                    <div className="w-px h-3 bg-[var(--card-border)]" />
                    <span>{layer.depthBottom.toFixed(1)}m</span>
                  </div>

                  {/* Renk bar */}
                  <div className={`w-2 rounded-full shrink-0 ${
                    layer.soilType === "clay" ? "bg-amber-700" :
                    layer.soilType === "sand" ? "bg-orange-400" :
                    layer.soilType === "silt" ? "bg-yellow-500" :
                    layer.soilType === "gravel" ? "bg-gray-600" :
                    layer.soilType === "rock" ? "bg-gray-400" :
                    "bg-amber-500"
                  }`} style={{ height: barH - 8 }} />

                  {/* Bilgi */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span>{typeInfo.icon}</span>
                      <span className="font-medium text-sm truncate">{layer.name}</span>
                      <span className="text-xs text-[var(--muted)]">({typeInfo.label})</span>
                      {hasWater && <span className="text-xs text-blue-500">💧 YASS</span>}
                    </div>
                    <div className="flex gap-3 mt-0.5 text-[10px] text-[var(--muted)]">
                      <span>γ={layer.gamma} kN/m³</span>
                      <span>c={layer.cohesion} kPa</span>
                      <span>φ={layer.frictionAngle}°</span>
                      {layer.N !== undefined && <span>N={layer.N}</span>}
                      <span>H={thickness.toFixed(1)}m</span>
                    </div>
                  </div>

                  {/* Aç/kapa */}
                  <span className="text-xs text-[var(--muted)] shrink-0">{isExpanded ? "▲" : "▼"}</span>
                </button>

                {/* Detay formu */}
                {isExpanded && (
                  <div className="px-4 py-4 bg-[var(--card)] border-t border-[var(--card-border)] space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[var(--muted)] mb-1">Katman adı</label>
                        <input type="text" value={layer.name} onChange={e => updateLayer(layer.id, { name: e.target.value })} className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--muted)] mb-1">Zemin tipi</label>
                        <select value={layer.soilType} onChange={e => handleTypeChange(layer.id, e.target.value as SoilLayer["soilType"])} className="input-field text-sm">
                          {SOIL_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--muted)] mb-1">Üst derinlik (m)</label>
                        <input type="number" value={layer.depthTop} onChange={e => updateLayer(layer.id, { depthTop: Number(e.target.value) })} min={0} step={0.5} className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--muted)] mb-1">Alt derinlik (m)</label>
                        <input type="number" value={layer.depthBottom} onChange={e => updateLayer(layer.id, { depthBottom: Number(e.target.value) })} min={layer.depthTop + 0.5} step={0.5} className="input-field text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <LField label="γ (kN/m³)" value={layer.gamma} onChange={v => updateLayer(layer.id, { gamma: v })} min={10} max={28} step={0.5} />
                      <LField label="γsat (kN/m³)" value={layer.gammaSat} onChange={v => updateLayer(layer.id, { gammaSat: v })} min={14} max={28} step={0.5} />
                      <LField label="c (kPa)" value={layer.cohesion} onChange={v => updateLayer(layer.id, { cohesion: v })} min={0} max={500} />
                      <LField label="φ (°)" value={layer.frictionAngle} onChange={v => updateLayer(layer.id, { frictionAngle: v })} min={0} max={50} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <LField label="E (kPa)" value={layer.E} onChange={v => updateLayer(layer.id, { E: v })} min={100} />
                      <LField label="SPT N" value={layer.N ?? 0} onChange={v => updateLayer(layer.id, { N: v })} min={0} />
                      {(layer.soilType === "clay" || layer.soilType === "silt") && (
                        <>
                          <LField label="cu (kPa)" value={layer.cu ?? 0} onChange={v => updateLayer(layer.id, { cu: v })} min={0} />
                          <LField label="e₀" value={layer.e0 ?? 0.8} onChange={v => updateLayer(layer.id, { e0: v })} min={0.1} max={3} step={0.05} />
                          <LField label="Cc" value={layer.Cc ?? 0.25} onChange={v => updateLayer(layer.id, { Cc: v })} min={0} step={0.01} />
                          <LField label="Cs" value={layer.Cs ?? 0.05} onChange={v => updateLayer(layer.id, { Cs: v })} min={0} step={0.01} />
                        </>
                      )}
                      <LField label="Vs (m/s)" value={layer.Vs ?? 0} onChange={v => updateLayer(layer.id, { Vs: v })} min={0} />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--muted)] mb-1">Açıklama</label>
                      <input type="text" value={layer.description ?? ""} onChange={e => updateLayer(layer.id, { description: e.target.value })} className="input-field text-sm" placeholder="Örn: Kahverengi, orta plastisiteli, sert kıvamlı kil" />
                    </div>

                    <button onClick={() => removeLayer(layer.id)} className="text-xs text-red-500 hover:text-red-700">✕ Bu katmanı kaldır</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Katman ekle */}
      <button onClick={addLayer} className="btn-secondary w-full text-sm py-2.5">
        + Zemin Katmanı Ekle
      </button>

      {/* Özet */}
      {layers.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
          <span>📏 Toplam derinlik: {totalDepth.toFixed(1)} m</span>
          <span>🗂️ {layers.length} katman</span>
          <span>💧 YASS: {waterTableDepth.toFixed(1)} m</span>
        </div>
      )}
    </div>
  );
}

function LField({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--muted)] mb-1">{label}</label>
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step ?? 1} className="input-field text-sm" />
    </div>
  );
}

export { createDefaultLayer, SOIL_TYPES, DEFAULT_PARAMS };
