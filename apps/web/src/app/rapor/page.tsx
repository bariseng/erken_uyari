"use client";
/**
 * GeoForce — Gelişmiş Rapor Oluşturma Sayfası
 * Adım adım: Proje Bilgileri → Zemin Profili → Hesap Bölümleri → Önizleme → PDF
 * 
 * Özellikler:
 * - LABEL_MAP ile Türkçe etiketler
 * - PDF buton state yönetimi (loading/error/success)
 * - localStorage kalıcılığı
 * - Yeni alanlar: yapı türü, deprem bölgesi, logo, proje tanımı
 * - Sıvılaşma modülü bağlı
 */
import { useState, useCallback, useEffect } from "react";
import { useReportStore, MODULE_META, BUILDING_TYPES, SEISMIC_ZONES, type ModuleKey } from "@/lib/report-store";
import { computeModule, computeModuleWithCharts } from "@/lib/report-compute";
import { generateReport } from "@/lib/report-generator";
import { formatLabel, formatValue, getLabelMap } from "@/lib/report-labels";
import type { ReportConfig, ReportSection as RPSection } from "@/lib/report-generator";
import type { ChartData } from "@/lib/report-charts";
import ModuleInputForm, { getDefaultInputs } from "@/components/ModuleInputForm";
import SoilLayerManager from "@/components/SoilLayerManager";
import type { SoilLayer } from "@/components/SoilLayerManager";
import { SOIL_TYPES } from "@/components/SoilLayerManager";

const STEPS = ["Proje Bilgileri", "Zemin Profili", "Hesap Bölümleri", "Önizleme & İndir"];

// PDF Buton State Tipi
type ButtonState = "default" | "loading" | "success" | "error";

export default function RaporPage() {
  const store = useReportStore();
  const { step } = store;

  // localStorage'tan geri yükleme kontrolü
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("geoforce-report-storage");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.state?.project?.projectName || data.state?.sections?.length > 0) {
          setShowRestorePrompt(true);
        }
      } catch {}
    }
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">📄 Rapor Oluştur</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Geoteknik hesap sonuçlarınızı profesyonel PDF raporu olarak oluşturun
      </p>

      {/* Restore Prompt */}
      {showRestorePrompt && (
        <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-700 dark:text-blue-300">💾 Kayıtlı veri bulundu</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Kaldığınız yerden devam etmek ister misiniz?</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { store.reset(); setShowRestorePrompt(false); }}
                className="px-3 py-1.5 text-sm rounded-lg bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-700"
              >
                Sıfırla
              </button>
              <button
                onClick={() => setShowRestorePrompt(false)}
                className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Devam Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stepper */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => store.setStep(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              step === i
                ? "bg-brand-600 text-white"
                : step > i
                ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30"
                : "bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)]"
            }`}
          >
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-current">
              {step > i ? "✓" : i + 1}
            </span>
            <span className="hidden sm:inline">{s}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {step === 0 && <StepProject />}
        {step === 1 && <StepSoilProfile />}
        {step === 2 && <StepSections />}
        {step === 3 && <StepPreview />}
      </div>
    </div>
  );
}

/* ─── Adım 0: Proje Bilgileri ─── */
function StepProject() {
  const { project, updateProject, setStep, reset } = useReportStore();
  const [logoPreview, setLogoPreview] = useState<string | null>(project.companyLogo || null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 2MB limit
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo dosyası 2MB'dan küçük olmalıdır.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLogoPreview(base64);
      updateProject({ companyLogo: base64 });
    };
    reader.readAsDataURL(file);
  };

  const canProceed = project.projectName && project.engineer && project.projectLocation;

  return (
    <div className="card p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">📋 Proje Bilgileri</h2>
        <button
          onClick={() => { reset(); setLogoPreview(null); }}
          className="text-xs text-red-500 hover:text-red-700"
        >
          🗑️ Sıfırla
        </button>
      </div>

      <p className="text-sm text-[var(--muted)]">Rapor kapak sayfasında görünecek bilgileri girin.</p>

      {/* Temel Bilgiler */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-brand-700 dark:text-brand-400 border-b border-[var(--card-border)] pb-1">Temel Bilgiler</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PField label="Proje Adı *" value={project.projectName} onChange={v => updateProject({ projectName: v })} placeholder="Örn: Konut İnşaatı Projesi" />
          <PField label="Proje Yeri *" value={project.projectLocation} onChange={v => updateProject({ projectLocation: v })} placeholder="Örn: İstanbul, Türkiye" />
          <PField label="Proje Sahibi" value={project.projectOwner || ""} onChange={v => updateProject({ projectOwner: v })} placeholder="Örn: ABC İnşaat A.Ş." />
          <PField label="Sondaj No / Referans" value={project.drillingRef || ""} onChange={v => updateProject({ drillingRef: v })} placeholder="Örn: SK-2024-001" />
        </div>
      </div>

      {/* Yapı Bilgileri */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-brand-700 dark:text-brand-400 border-b border-[var(--card-border)] pb-1">Yapı Bilgileri</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Yapı Türü</label>
            <select
              value={project.buildingType || ""}
              onChange={e => updateProject({ buildingType: e.target.value })}
              className="input-field"
            >
              <option value="">Seçin...</option>
              {BUILDING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deprem Bölgesi (TBDY 2018)</label>
            <select
              value={project.seismicZone || "DD-2"}
              onChange={e => updateProject({ seismicZone: e.target.value })}
              className="input-field"
            >
              {SEISMIC_ZONES.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Rapor Bilgileri */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-brand-700 dark:text-brand-400 border-b border-[var(--card-border)] pb-1">Rapor Bilgileri</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PField label="Rapor No" value={project.reportNo} onChange={v => updateProject({ reportNo: v })} />
          <PField label="Rapor Tarihi" value={project.reportDate} onChange={v => updateProject({ reportDate: v })} />
          <PField label="Sorumlu Mühendis *" value={project.engineer} onChange={v => updateProject({ engineer: v })} placeholder="Ad Soyad, Ünvan" />
          <PField label="Firma Adı" value={project.company || ""} onChange={v => updateProject({ company: v })} placeholder="Opsiyonel" />
        </div>
      </div>

      {/* Firma Logosu */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-brand-700 dark:text-brand-400 border-b border-[var(--card-border)] pb-1">Firma Logosu</h3>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Logo Yükle (PNG/JPG, max 2MB)</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleLogoChange}
              className="input-field text-sm"
            />
            <p className="text-xs text-[var(--muted)] mt-1">Logo, rapor kapak sayfasında görünecektir.</p>
          </div>
          {logoPreview && (
            <div className="w-20 h-20 rounded-lg border border-[var(--card-border)] overflow-hidden bg-white flex items-center justify-center">
              <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
          )}
        </div>
      </div>

      {/* Proje Tanımı */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Proje Tanımı</label>
        <textarea
          value={project.projectDescription || ""}
          onChange={e => updateProject({ projectDescription: e.target.value })}
          rows={4}
          className="input-field resize-none"
          placeholder="Proje kapsamı, amaç, yapılan çalışmalar hakkında kısa açıklama..."
        />
        <p className="text-xs text-[var(--muted)]">Bu metin raporun 1. bölümünde yer alacaktır. Boş bırakılırsa otomatik metin oluşturulur.</p>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={() => setStep(1)}
          disabled={!canProceed}
          className="btn-primary disabled:opacity-40"
        >
          Devam → Zemin Profili
        </button>
      </div>
    </div>
  );
}

/* ─── Adım 1: Zemin Profili ─── */
function StepSoilProfile() {
  const { soilLayers, waterTableDepth, setSoilLayers, setWaterTableDepth, setStep } = useReportStore();

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="card p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-lg">🗂️ Zemin Profili</h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Sondaj verilerine göre zemin katmanlarını tanımlayın. Bu bilgiler raporda zemin profili bölümünde ve hesaplamalarda kullanılacaktır.
          </p>
        </div>

        <SoilLayerManager
          layers={soilLayers}
          onChange={setSoilLayers}
          waterTableDepth={waterTableDepth}
          onWaterTableChange={setWaterTableDepth}
        />
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={() => setStep(0)} className="btn-secondary">← Proje Bilgileri</button>
        <button onClick={() => setStep(2)} className="btn-primary">
          Devam → Hesap Bölümleri
        </button>
      </div>
    </div>
  );
}

/* ─── Adım 2: Hesap Bölümleri ─── */
function StepSections() {
  const { sections, addSection, removeSection, updateSectionInputs, updateSectionMethod, updateSectionResults, updateSectionNotes, updateSectionCharts, setStep } = useReportStore();
  const [addingModule, setAddingModule] = useState<ModuleKey | null>(null);

  const moduleKeys = Object.keys(MODULE_META) as ModuleKey[];

  const handleAdd = (key: ModuleKey) => {
    addSection(key);
    setAddingModule(null);
    // Yeni eklenen section'ın inputlarını ayarla
    setTimeout(() => {
      const newSec = useReportStore.getState().sections;
      const last = newSec[newSec.length - 1];
      updateSectionInputs(last.id, getDefaultInputs(key));
    }, 0);
  };

  const handleCompute = (id: string) => {
    const sec = sections.find(s => s.id === id);
    if (!sec) return;
    
    // computeModuleWithCharts kullan — hem results hem charts
    const { results, charts } = computeModuleWithCharts(sec.moduleKey, sec.method, sec.inputs);
    updateSectionResults(id, results);
    // Chart verisini de kaydet
    if (charts && charts.length > 0) {
      updateSectionCharts(id, charts);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">🔧 Hesap Bölümleri ({sections.length})</h2>
        <button onClick={() => setAddingModule(addingModule ? null : moduleKeys[0])} className="btn-secondary text-sm">
          + Bölüm Ekle
        </button>
      </div>

      {addingModule !== null && (
        <div className="card p-4">
          <p className="text-sm font-medium mb-3">Hesap modülü seçin:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {moduleKeys.map(key => {
              const m = MODULE_META[key];
              const isConnected = m.connected;
              return (
                <button
                  key={key}
                  onClick={() => isConnected && handleAdd(key)}
                  disabled={!isConnected}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    isConnected
                      ? "border-[var(--card-border)] hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <span className="text-lg">{m.icon}</span>
                  <p className="text-xs font-medium mt-1">{m.label}</p>
                  {!isConnected && <span className="text-[10px] text-gray-400">Yakında</span>}
                </button>
              );
            })}
          </div>
          {addingModule !== null && (
            <button onClick={() => setAddingModule(null)} className="mt-3 text-xs text-[var(--muted)] hover:text-brand-600">
              ✕ Kapat
            </button>
          )}
        </div>
      )}

      {sections.length === 0 && !addingModule && (
        <div className="card p-12 text-center text-[var(--muted)]">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-medium">Henüz hesap bölümü eklenmedi</p>
          <p className="text-sm mt-1">Yukarıdaki &quot;Bölüm Ekle&quot; butonuyla başlayın</p>
        </div>
      )}

      {sections.map((sec, idx) => {
        const meta = MODULE_META[sec.moduleKey];
        const resultEntries = sec.results ? Object.entries(sec.results).filter(([k]) => !k.startsWith("_")) : [];
        
        return (
          <div key={sec.id} className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                <span className="text-lg mr-2">{meta.icon}</span>
                {idx + 1}. {meta.label}
                {sec.computed && <span className="ml-2 text-xs text-green-600 font-medium">✓ Bağlı</span>}
              </h3>
              <button onClick={() => removeSection(sec.id)} className="text-red-500 hover:text-red-700 text-sm">✕ Kaldır</button>
            </div>

            {meta.methods.length > 1 && (
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Yöntem</label>
                <select value={sec.method} onChange={e => updateSectionMethod(sec.id, e.target.value)} className="input-field text-sm max-w-xs">
                  {meta.methods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}

            <ModuleInputForm moduleKey={sec.moduleKey} inputs={sec.inputs} onChange={inputs => updateSectionInputs(sec.id, inputs)} />

            <div className="flex items-center gap-3">
              <button onClick={() => handleCompute(sec.id)} className="btn-primary text-sm">⚡ Hesapla</button>
              {sec.computed && <span className="text-xs text-green-600 font-medium">✓ Hesaplandı</span>}
            </div>

            {sec.results && (
              <div className="rounded-lg bg-earth-50 dark:bg-neutral-800 p-4">
                {sec.results._error ? (
                  <p className="text-sm text-red-500">⚠️ {sec.results._error}</p>
                ) : sec.results._note ? (
                  <p className="text-sm text-[var(--muted)]">ℹ️ {sec.results._note}</p>
                ) : resultEntries.length > 0 ? (
                  <div className="space-y-3">
                    {/* Girdi parametreleri */}
                    <div>
                      <p className="text-xs font-semibold text-[var(--muted)] mb-2">Girdi Parametreleri:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                        {Object.entries(sec.inputs).filter(([, v]) => v !== "" && v !== undefined).map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-2">
                            <span className="text-[var(--muted)] truncate">{formatLabel(k, sec.moduleKey)}</span>
                            <span className="font-medium">{formatValue(k, v, sec.moduleKey)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Sonuçlar */}
                    <div>
                      <p className="text-xs font-semibold text-[var(--muted)] mb-2">Hesap Sonuçları:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                        {resultEntries.slice(0, 15).map(([k, v]) => {
                          const isHighlight = k.includes("ultimate") || k.includes("allowable") || k.includes("FS") || k.includes("LPI") || k.includes("settlement") || k.includes("riskLevel");
                          return (
                            <div key={k} className={`flex justify-between gap-2 ${isHighlight ? "font-semibold text-brand-700 dark:text-brand-400" : ""}`}>
                              <span className="text-[var(--muted)] truncate">{formatLabel(k, sec.moduleKey)}</span>
                              <span>{formatValue(k, v, sec.moduleKey)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sıvılaşma özel: Tabaka tablosu */}
                    {sec.moduleKey === "sivilasma" && sec.results._layerDetails && (
                      <div className="mt-3 overflow-x-auto">
                        <p className="text-xs font-semibold text-[var(--muted)] mb-2">Tabaka Bazlı Sonuçlar:</p>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-[var(--card-border)]">
                              <th className="py-1 px-2 text-left">Derinlik (m)</th>
                              <th className="py-1 px-2 text-left">(N1)60cs</th>
                              <th className="py-1 px-2 text-left">CSR</th>
                              <th className="py-1 px-2 text-left">CRR</th>
                              <th className="py-1 px-2 text-left">MSF</th>
                              <th className="py-1 px-2 text-left">FS</th>
                              <th className="py-1 px-2 text-left">Durum</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sec.results._layerDetails.map((l: any, i: number) => (
                              <tr key={i} className={`border-b border-[var(--card-border)] ${l.FS < 1 ? "bg-red-50 dark:bg-red-900/20" : l.FS < 1.2 ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}`}>
                                <td className="py-1 px-2">{l.depth}</td>
                                <td className="py-1 px-2">{l.N160cs || "-"}</td>
                                <td className="py-1 px-2">{l.CSR?.toFixed(3)}</td>
                                <td className="py-1 px-2">{l.CRR?.toFixed(3)}</td>
                                <td className="py-1 px-2">{l.MSF?.toFixed(2)}</td>
                                <td className={`py-1 px-2 font-medium ${l.FS < 1 ? "text-red-600" : l.FS < 1.2 ? "text-yellow-600" : "text-green-600"}`}>{l.FS?.toFixed(2)}</td>
                                <td className="py-1 px-2">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                    l.status === "liquefiable" ? "bg-red-100 text-red-700" :
                                    l.status === "marginal" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-green-100 text-green-700"
                                  }`}>
                                    {l.status === "liquefiable" ? "Sıvılaşabilir" : l.status === "marginal" ? "Sınırda" : "Güvenli"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* Notlar alanı */}
            {sec.computed && (
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Notlar (raporda italik gösterilecek)</label>
                <textarea
                  value={sec.notes || ""}
                  onChange={e => updateSectionNotes(sec.id, e.target.value)}
                  rows={2}
                  className="input-field text-sm resize-none"
                  placeholder="Bu hesapla ilgili ek notlar..."
                />
              </div>
            )}
          </div>
        );
      })}

      <div className="flex justify-between pt-2">
        <button onClick={() => setStep(1)} className="btn-secondary">← Zemin Profili</button>
        <button onClick={() => setStep(3)} disabled={sections.length === 0 || !sections.some(s => s.computed)} className="btn-primary disabled:opacity-40">
          Devam → Önizleme & İndir
        </button>
      </div>
    </div>
  );
}

/* ─── Adım 3: Önizleme & İndir ─── */
function StepPreview() {
  const { project, sections, soilLayers, waterTableDepth, setStep } = useReportStore();
  const [buttonState, setButtonState] = useState<ButtonState>("default");

  const computedSections = sections.filter(s => s.computed && s.results && !s.results._error);

  const handleDownload = useCallback(async () => {
    setButtonState("loading");
    
    try {
      const reportSections: RPSection[] = [];

      // 1. Proje tanımı
      const description = project.projectDescription || 
        `Bu rapor, ${project.projectName} kapsamında ${project.projectLocation} lokasyonunda gerçekleştirilen geoteknik araştırma ve analizleri içermektedir. Çalışma, ${computedSections.map(s => MODULE_META[s.moduleKey].label).join(", ")} analizlerini kapsamakta olup TBDY 2018 yönetmeliği esas alınarak hazırlanmıştır.`;
      
      reportSections.push({
        title: "Proje Tanımı ve Amaç",
        type: "text",
        content: description,
      });

      // 2. Zemin profili
      if (soilLayers.length > 0) {
        const typeLabel = (t: string) => SOIL_TYPES.find(s => s.value === t)?.label || t;
        reportSections.push({
          title: "Zemin Profili ve Parametreler",
          type: "table",
          tableData: {
            headers: ["Katman", "Derinlik (m)", "Zemin Tipi", "γ (kN/m³)", "γsat (kN/m³)", "c (kPa)", "φ (°)", "Es (kPa)", "SPT N", "Cu (kPa)", "Vs (m/s)"],
            rows: soilLayers.map((l, i) => [
              l.name || `Katman ${i + 1}`,
              `${l.depthTop.toFixed(1)} - ${l.depthBottom.toFixed(1)}`,
              typeLabel(l.soilType),
              String(l.gamma),
              String(l.gammaSat || "-"),
              String(l.cohesion),
              String(l.frictionAngle),
              String(l.E || "-"),
              l.N !== undefined ? String(l.N) : "-",
              l.cu !== undefined ? String(l.cu) : "-",
              l.Vs !== undefined ? String(l.Vs) : "-",
            ]),
          },
        });

        // YASS bilgisi
        reportSections.push({
          title: "Yeraltı Su Seviyesi",
          type: "text",
          content: `Yeraltı su seviyesi (YASS) sondaj çalışmalarında ${waterTableDepth.toFixed(1)} m derinlikte ölçülmüştür. Hesaplamalarda bu seviye dikkate alınmıştır.`,
        });
      }

      // 3. Her hesap bölümü
      for (const sec of computedSections) {
        const meta = MODULE_META[sec.moduleKey];
        const results = sec.results!;

        // Teorik arka plan
        reportSections.push({
          title: `${meta.label} — Teorik Arka Plan`,
          type: "text",
          content: getTheoreticalBackground(sec.moduleKey, sec.method),
        });

        // Girdi parametreleri tablosu
        reportSections.push({
          title: `${meta.label} — Girdi Parametreleri`,
          type: "table",
          tableData: {
            headers: ["Parametre", "Değer", "Birim"],
            rows: Object.entries(sec.inputs)
              .filter(([, v]) => v !== "" && v !== undefined)
              .map(([k, v]) => [
                formatLabel(k, sec.moduleKey),
                formatValue(k, v, sec.moduleKey),
                getUnit(k, sec.moduleKey),
              ]),
          },
        });

        // Sonuçlar tablosu
        const resultEntries = Object.entries(results).filter(([k]) => !k.startsWith("_") && !k.startsWith("layers."));
        reportSections.push({
          title: `${meta.label} — Hesap Sonuçları`,
          type: "calculation",
          calcData: {
            method: sec.method,
            inputs: Object.entries(sec.inputs)
              .filter(([, v]) => v !== "" && v !== undefined)
              .map(([k, v]) => ({
                label: formatLabel(k, sec.moduleKey),
                value: formatValue(k, v, sec.moduleKey),
                unit: getUnit(k, sec.moduleKey),
              })),
            results: resultEntries.slice(0, 20).map(([k, v]) => ({
              label: formatLabel(k, sec.moduleKey),
              value: formatValue(k, v, sec.moduleKey),
              unit: getUnit(k, sec.moduleKey),
              highlight: k.includes("ultimate") || k.includes("allowable") || k.includes("FS") || k.includes("LPI") || k.includes("settlement") || k.includes("riskLevel"),
            })),
            notes: [
              `Yöntem: ${sec.method}`,
              `Modül: ${meta.label}`,
              "GeoForce platformu ile hesaplanmıştır.",
              sec.notes || "",
            ].filter(Boolean),
          },
        });

        // Sıvılaşma özel: Tabaka tablosu
        if (sec.moduleKey === "sivilasma" && results._layerDetails) {
          reportSections.push({
            title: "Sıvılaşma — Tabaka Bazlı Sonuçlar",
            type: "table",
            tableData: {
              headers: ["Derinlik (m)", "(N1)60cs", "σ'v (kPa)", "CSR", "CRR", "MSF", "FS", "Durum"],
              rows: results._layerDetails.map((l: any) => [
                String(l.depth),
                l.N160cs ? l.N160cs.toFixed(1) : "-",
                l.sigmaVeff?.toFixed(1) || "-",
                l.CSR?.toFixed(3) || "-",
                l.CRR?.toFixed(3) || "-",
                l.MSF?.toFixed(2) || "-",
                l.FS?.toFixed(2) || "-",
                l.status === "liquefiable" ? "Sıvılaşabilir" : l.status === "marginal" ? "Sınırda" : "Güvenli",
              ]),
            },
          });
        }

        // Chart'ları ekle (varsa)
        if (sec.charts && sec.charts.length > 0) {
          for (let i = 0; i < sec.charts.length; i++) {
            const chartData = sec.charts[i];
            reportSections.push({
              title: i === 0 ? `${meta.label} — Grafik` : `${meta.label} — Grafik ${i + 1}`,
              type: "chart",
              chartData: chartData,
            });
          }
        }
      }

      // 4. Değerlendirme
      reportSections.push({
        title: "Genel Değerlendirme ve Öneriler",
        type: "text",
        content: generateEvaluation(computedSections, project),
      });

      const config: ReportConfig = {
        project,
        sections: reportSections,
        includeDisclaimer: true,
        language: "tr",
      };

      const doc = generateReport(config);
      doc.save(`${project.reportNo || "Geoteknik"}_Rapor.pdf`);
      
      setButtonState("success");
      setTimeout(() => setButtonState("default"), 2000);
    } catch (err: any) {
      console.error("PDF hatası:", err);
      setButtonState("error");
      setTimeout(() => setButtonState("default"), 3000);
    }
  }, [project, computedSections, soilLayers, waterTableDepth]);

  // Buton içeriği
  const buttonContent = {
    default: { text: "📄 PDF Rapor İndir", className: "btn-primary" },
    loading: { text: "⏳ Hazırlanıyor...", className: "btn-primary opacity-70 cursor-wait" },
    success: { text: "✅ İndirildi", className: "bg-green-600 hover:bg-green-700 text-white" },
    error: { text: "❌ Hata, tekrar dene", className: "bg-red-600 hover:bg-red-700 text-white" },
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="font-semibold text-lg mb-4">📑 Rapor Önizleme</h2>

        {/* Proje bilgileri */}
        <div className="rounded-lg bg-brand-50 dark:bg-brand-900/20 p-4 mb-4">
          <h3 className="font-medium text-brand-700 dark:text-brand-400 mb-2">Proje Bilgileri</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-[var(--muted)]">Proje:</span> {project.projectName}</div>
            <div><span className="text-[var(--muted)]">Konum:</span> {project.projectLocation}</div>
            <div><span className="text-[var(--muted)]">Mühendis:</span> {project.engineer}</div>
            <div><span className="text-[var(--muted)]">Rapor No:</span> {project.reportNo}</div>
            <div><span className="text-[var(--muted)]">Tarih:</span> {project.reportDate}</div>
            {project.company && <div><span className="text-[var(--muted)]">Firma:</span> {project.company}</div>}
            {project.buildingType && <div><span className="text-[var(--muted)]">Yapı:</span> {BUILDING_TYPES.find(t => t.value === project.buildingType)?.label}</div>}
            {project.seismicZone && <div><span className="text-[var(--muted)]">Deprem:</span> {SEISMIC_ZONES.find(z => z.value === project.seismicZone)?.label}</div>}
          </div>
        </div>

        {/* Zemin profili özeti */}
        {soilLayers.length > 0 && (
          <div className="rounded-lg bg-earth-50 dark:bg-neutral-800 p-4 mb-4">
            <h3 className="font-medium mb-2">🗂️ Zemin Profili ({soilLayers.length} katman)</h3>
            <div className="space-y-1 text-sm">
              {soilLayers.map((l, i) => {
                const typeInfo = SOIL_TYPES.find(t => t.value === l.soilType);
                return (
                  <div key={l.id} className="flex items-center gap-2">
                    <span className="text-xs w-24 text-[var(--muted)]">{l.depthTop.toFixed(1)}-{l.depthBottom.toFixed(1)} m</span>
                    <span>{typeInfo?.icon}</span>
                    <span className="font-medium">{l.name}</span>
                    <span className="text-xs text-[var(--muted)]">γ={l.gamma}, c={l.cohesion}, φ={l.frictionAngle}°</span>
                  </div>
                );
              })}
              <div className="text-xs text-blue-500 mt-1">💧 YASS: {waterTableDepth.toFixed(1)} m</div>
            </div>
          </div>
        )}

        {/* Rapor yapısı */}
        <h3 className="font-medium mb-3">Rapor İçeriği</h3>
        <div className="space-y-2">
          <PreviewRow icon="📘" title="Kapak Sayfası" desc="Proje bilgileri, firma, mühendis" />
          <PreviewRow icon="📋" title="İçindekiler" desc="Otomatik bölüm listesi" />
          <PreviewRow icon="📝" title="Proje Tanımı ve Amaç" desc="Genel proje açıklaması" />
          {soilLayers.length > 0 && (
            <>
              <PreviewRow icon="🗂️" title="Zemin Profili ve Parametreler" desc={`${soilLayers.length} katman, derinlik, zemin tipi, parametreler`} />
              <PreviewRow icon="💧" title="Yeraltı Su Seviyesi" desc={`YASS: ${waterTableDepth.toFixed(1)} m`} />
            </>
          )}
          {computedSections.map((sec) => {
            const meta = MODULE_META[sec.moduleKey];
            const resultCount = sec.results ? Object.keys(sec.results).filter(k => !k.startsWith("_")).length : 0;
            return (
              <PreviewRow key={sec.id} icon={meta.icon} title={`${meta.label} — ${sec.method}`} desc={`${Object.keys(sec.inputs).length} girdi, ${resultCount} sonuç`} />
            );
          })}
          <PreviewRow icon="📊" title="Genel Değerlendirme" desc="Sonuç ve öneriler" />
          <PreviewRow icon="⚠️" title="Sorumluluk Reddi" desc="Yasal uyarı" />
        </div>
      </div>

      {sections.length > computedSections.length && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 p-4 text-sm">
          ⚠️ {sections.length - computedSections.length} bölüm henüz hesaplanmadı ve rapora dahil edilmeyecek.
          <button onClick={() => setStep(2)} className="ml-2 text-brand-600 underline">Geri dön ve hesapla</button>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button onClick={() => setStep(2)} className="btn-secondary">← Hesap Bölümleri</button>
        <button
          onClick={handleDownload}
          disabled={buttonState === "loading" || computedSections.length === 0}
          className={`text-lg px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-40 ${buttonContent[buttonState].className}`}
        >
          {buttonContent[buttonState].text}
        </button>
      </div>

      <div className="card p-4 text-xs text-[var(--muted)] space-y-1">
        <p>💡 Rapor A4 formatında, kapak sayfası, içindekiler, zemin profili, hesap detayları ve sorumluluk reddi içerir.</p>
        <p>📋 Zemin profili tablosu sektör standartlarına uygun: katman adı, derinlik, zemin tipi, parametreler.</p>
        <p>🔒 Tüm işlemler tarayıcınızda gerçekleşir — verileriniz sunucuya gönderilmez.</p>
        <p>💾 Verileriniz otomatik olarak kaydedilir — sayfayı yenilerseniz kaldığınız yerden devam edebilirsiniz.</p>
      </div>
    </div>
  );
}

/* ─── Yardımcı Bileşenler ─── */

function PField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} className="input-field" placeholder={placeholder} />
    </div>
  );
}

function PreviewRow({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-earth-50 dark:bg-neutral-800">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-[var(--muted)]">{desc}</p>
      </div>
    </div>
  );
}

// ─── Yardımcı Fonksiyonlar ───

function getUnit(key: string, moduleKey: string): string {
  const labelMap = getLabelMap(moduleKey);
  const entry = labelMap[key];
  return entry?.unit || "";
}

function getTheoreticalBackground(moduleKey: string, method: string): string {
  const backgrounds: Record<string, string> = {
    "tasima-kapasitesi": `Temel taşıma kapasitesi, ${method.split(" ")[0]} yöntemi kullanılarak hesaplanmıştır. Bu yöntemde nihai taşıma kapasitesi; kohezyon, üst yük ve zemin ağırlığı terimlerinin toplamı olarak belirlenir. Güvenlik katsayısı uygulanarak izin verilebilir taşıma kapasitesi bulunur.`,
    "sivilasma": "Sıvılaşma potansiyeli, Boulanger & Idriss (2014) yöntemi ile değerlendirilmiştir. Bu yöntemde SPT-N değerleri düzeltilerek çevrimsel dayanım oranı (CRR) hesaplanır ve deprem kaynaklı çevrimsel gerilme oranı (CSR) ile karşılaştırılır.",
    "sev-stabilitesi": `Şev stabilitesi analizi, ${method} yöntemi kullanılarak yapılmıştır. Bu yöntemde kritik kayma yüzeyi belirlenir ve güvenlik katsayısı hesaplanır. FS ≥ 1.5 değerleri güvenli kabul edilir.`,
    "oturma": "Oturma hesabı, elastik ve/veya konsolidasyon teorisi kullanılarak yapılmıştır. Ani oturma ve zamanla gelişen konsolidasyon oturması ayrı ayrı hesaplanır.",
    "kazik": "Kazık taşıma kapasitesi, gövde sürtünmesi ve uç direnci bileşenlerinin toplamı olarak hesaplanmıştır.",
    "yanal-basinc": `Yanal toprak basıncı, ${method} teorisi kullanılarak hesaplanmıştır. Aktif ve pasif basınç katsayıları belirlenerek zamansız ve/veya sismik basınçlar bulunur.`,
    "deprem": "Deprem parametreleri, TBDY 2018 yönetmeliği esas alınarak hesaplanmıştır. Yer büyütme faktörleri uygulanarak tasarım spektrum ivmeleri belirlenir.",
    "iksa": "İksa tasarımı, aktif ve pasif basınç dengelemesi prensibine dayanır. Gömülme derinliği ve gerekli ankraj kuvvetleri hesaplanır.",
    "konsolidasyon": "Konsolidasyon analizi, Terzaghi'nin tek yönlü konsolidasyon teorisine dayanır. Zaman-oturma ilişkisi belirlenir.",
  };
  
  return backgrounds[moduleKey] || "Bu hesaplama, ilgili mühendislik standartları ve yöntemleri kullanılarak yapılmıştır.";
}

function generateEvaluation(computedSections: { moduleKey: ModuleKey; results: Record<string, any> | null }[], project: any): string {
  const modules = computedSections.map(s => MODULE_META[s.moduleKey].label);
  
  let eval_ = `Bu rapor, ${project.projectName} projesi için ${modules.join(", ")} konularında geoteknik değerlendirme içermektedir.\n\n`;
  
  // Modül bazlı özet
  for (const sec of computedSections) {
    const meta = MODULE_META[sec.moduleKey];
    const r = sec.results;
    
    if (sec.moduleKey === "tasima-kapasitesi" && r?.allowable) {
      eval_ += `Taşıma Kapasitesi: İzin verilebilir taşıma kapasitesi ${typeof r.allowable === 'number' ? r.allowable.toFixed(0) : r.allowable} kPa olarak hesaplanmıştır. `;
      eval_ += `Bu değer proje için yeterli kabul edilmektedir.\n\n`;
    }
    
    if (sec.moduleKey === "sivilasma" && r?.LPI !== undefined) {
      eval_ += `Sıvılaşma: LPI değeri ${r.LPI.toFixed(1)} (${r.riskLevelTR || "belirsiz"}) olarak hesaplanmıştır. `;
      if (r.LPI > 15) {
        eval_ += `Yüksek sıvılaşma riski mevcuttur. Zemin iyileştirme önlemleri önerilmektedir.\n\n`;
      } else if (r.LPI > 5) {
        eval_ += `Orta düzey sıvılaşma riski mevcuttur. Detaylı analizler yapılmalıdır.\n\n`;
      } else {
        eval_ += `Sıvılaşma riski düşük veya sınırlıdır.\n\n`;
      }
    }
    
    if (sec.moduleKey === "sev-stabilitesi" && r?.FS) {
      eval_ += `Şev Stabilitesi: Güvenlik katsayısı FS = ${typeof r.FS === 'number' ? r.FS.toFixed(2) : r.FS} olarak hesaplanmıştır. `;
      eval_ += r.FS >= 1.5 ? `Şev stabil açısından güvenlidir.\n\n` : r.FS >= 1.0 ? `Şev sınırda stabilitededir, önlem alınması önerilir.\n\n` : `Şev stabil değildir, iyileştirme gereklidir.\n\n`;
    }
  }
  
  eval_ += "\nSonuçlar, yetkili bir geoteknik mühendis tarafından değerlendirilmeli ve onaylanmalıdır. Kesin mühendislik kararları için saha koşulları ve laboratuvar deneyleri ile birlikte değerlendirme yapılmalıdır.";
  
  return eval_;
}
