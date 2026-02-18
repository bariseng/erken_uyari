"use client";
/**
 * GeoForce — Gelişmiş Rapor Oluşturma Sayfası
 * Adım adım: Proje Bilgileri → Hesap Bölümleri → Önizleme → PDF
 */
import { useState, useCallback } from "react";
import { useReportStore, MODULE_META, type ModuleKey } from "@/lib/report-store";
import { computeModule } from "@/lib/report-compute";
import { generateReport, createGenericReport } from "@/lib/report-generator";
import type { ReportConfig, ReportSection as RPSection } from "@/lib/report-generator";
import ModuleInputForm, { getDefaultInputs } from "@/components/ModuleInputForm";

const STEPS = ["Proje Bilgileri", "Hesap Bölümleri", "Önizleme & İndir"];

export default function RaporPage() {
  const store = useReportStore();
  const { step, project, sections } = store;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">📄 Rapor Oluştur</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Geoteknik hesap sonuçlarınızı profesyonel PDF raporu olarak oluşturun
      </p>

      {/* Stepper */}
      <div className="mt-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => store.setStep(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
        {step === 1 && <StepSections />}
        {step === 2 && <StepPreview />}
      </div>
    </div>
  );
}

/* ─── Adım 0: Proje Bilgileri ─── */
function StepProject() {
  const { project, updateProject, setStep } = useReportStore();

  return (
    <div className="card p-6 max-w-2xl space-y-4">
      <h2 className="font-semibold text-lg">📋 Proje Bilgileri</h2>
      <p className="text-sm text-[var(--muted)]">Rapor kapak sayfasında görünecek bilgileri girin.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PField label="Proje adı *" value={project.projectName} onChange={v => updateProject({ projectName: v })} placeholder="Örn: Konut İnşaatı Projesi" />
        <PField label="Proje yeri *" value={project.projectLocation} onChange={v => updateProject({ projectLocation: v })} placeholder="Örn: İstanbul, Türkiye" />
        <PField label="Proje sahibi" value={project.projectOwner} onChange={v => updateProject({ projectOwner: v })} placeholder="Örn: ABC İnşaat A.Ş." />
        <PField label="Sorumlu mühendis *" value={project.engineer} onChange={v => updateProject({ engineer: v })} placeholder="Adınız" />
        <PField label="Rapor no" value={project.reportNo} onChange={v => updateProject({ reportNo: v })} />
        <PField label="Rapor tarihi" value={project.reportDate} onChange={v => updateProject({ reportDate: v })} />
        <PField label="Firma adı" value={project.company ?? ""} onChange={v => updateProject({ company: v })} placeholder="Opsiyonel" />
      </div>
      <div className="flex justify-end pt-2">
        <button
          onClick={() => setStep(1)}
          disabled={!project.projectName || !project.engineer}
          className="btn-primary disabled:opacity-40"
        >
          Devam → Hesap Bölümleri
        </button>
      </div>
    </div>
  );
}

/* ─── Adım 1: Hesap Bölümleri ─── */
function StepSections() {
  const { sections, addSection, removeSection, updateSectionInputs, updateSectionMethod, updateSectionResults, setStep } = useReportStore();
  const [addingModule, setAddingModule] = useState<ModuleKey | null>(null);

  const moduleKeys = Object.keys(MODULE_META) as ModuleKey[];

  const handleAdd = (key: ModuleKey) => {
    addSection(key);
    setAddingModule(null);
    // Varsayılan inputları set et
    const newSec = useReportStore.getState().sections;
    const last = newSec[newSec.length - 1];
    updateSectionInputs(last.id, getDefaultInputs(key));
  };

  const handleCompute = (id: string) => {
    const sec = sections.find(s => s.id === id);
    if (!sec) return;
    const results = computeModule(sec.moduleKey, sec.method, sec.inputs);
    updateSectionResults(id, results);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">🔧 Hesap Bölümleri ({sections.length})</h2>
        <button onClick={() => setAddingModule(addingModule ? null : moduleKeys[0])} className="btn-secondary text-sm">
          + Bölüm Ekle
        </button>
      </div>

      {/* Modül seçici */}
      {addingModule !== null && (
        <div className="card p-4">
          <p className="text-sm font-medium mb-3">Hesap modülü seçin:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {moduleKeys.map(key => {
              const m = MODULE_META[key];
              return (
                <button
                  key={key}
                  onClick={() => handleAdd(key)}
                  className="text-left p-3 rounded-lg border border-[var(--card-border)] hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                >
                  <span className="text-lg">{m.icon}</span>
                  <p className="text-xs font-medium mt-1">{m.label}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bölüm listesi */}
      {sections.length === 0 && !addingModule && (
        <div className="card p-12 text-center text-[var(--muted)]">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-medium">Henüz hesap bölümü eklenmedi</p>
          <p className="text-sm mt-1">Yukarıdaki "Bölüm Ekle" butonuyla başlayın</p>
        </div>
      )}

      {sections.map((sec, idx) => {
        const meta = MODULE_META[sec.moduleKey];
        return (
          <div key={sec.id} className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                <span className="text-lg mr-2">{meta.icon}</span>
                {idx + 1}. {meta.label}
              </h3>
              <button onClick={() => removeSection(sec.id)} className="text-red-500 hover:text-red-700 text-sm" title="Bölümü kaldır">
                ✕ Kaldır
              </button>
            </div>

            {/* Yöntem seçimi */}
            {meta.methods.length > 1 && (
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Yöntem</label>
                <select
                  value={sec.method}
                  onChange={e => updateSectionMethod(sec.id, e.target.value)}
                  className="input-field text-sm max-w-xs"
                >
                  {meta.methods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}

            {/* Girdi formu */}
            <ModuleInputForm
              moduleKey={sec.moduleKey}
              inputs={sec.inputs}
              onChange={inputs => updateSectionInputs(sec.id, inputs)}
            />

            {/* Hesapla butonu */}
            <div className="flex items-center gap-3">
              <button onClick={() => handleCompute(sec.id)} className="btn-primary text-sm">
                ⚡ Hesapla
              </button>
              {sec.computed && (
                <span className="text-xs text-green-600 font-medium">✓ Hesaplandı</span>
              )}
            </div>

            {/* Sonuç önizleme */}
            {sec.results && (
              <div className="rounded-lg bg-earth-50 dark:bg-neutral-800 p-4">
                {sec.results._error ? (
                  <p className="text-sm text-red-500">⚠️ {sec.results._error}</p>
                ) : sec.results._note ? (
                  <p className="text-sm text-[var(--muted)]">ℹ️ {sec.results._note}</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                    {Object.entries(sec.results)
                      .filter(([k]) => !k.startsWith("_"))
                      .slice(0, 12)
                      .map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-2">
                          <span className="text-[var(--muted)] truncate">{k}</span>
                          <span className="font-medium">{typeof v === "number" ? v.toFixed(2) : String(v)}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Navigasyon */}
      <div className="flex justify-between pt-2">
        <button onClick={() => setStep(0)} className="btn-secondary">← Proje Bilgileri</button>
        <button
          onClick={() => setStep(2)}
          disabled={sections.length === 0 || !sections.some(s => s.computed)}
          className="btn-primary disabled:opacity-40"
        >
          Devam → Önizleme & İndir
        </button>
      </div>
    </div>
  );
}

/* ─── Adım 2: Önizleme & İndir ─── */
function StepPreview() {
  const { project, sections, setStep } = useReportStore();
  const [generating, setGenerating] = useState(false);

  const computedSections = sections.filter(s => s.computed && s.results && !s.results._error);

  const handleDownload = useCallback(() => {
    setGenerating(true);
    try {
      const reportSections: RPSection[] = [];

      // Proje tanımı
      reportSections.push({
        title: "Proje Tanımı ve Amaç",
        type: "text",
        content: `Bu rapor, ${project.projectLocation} konumundaki ${project.projectName} projesi için geoteknik hesaplamaları içermektedir. Rapor, ${computedSections.length} adet hesap modülünün sonuçlarını kapsamaktadır. Hesaplamalar GeoForce platformu kullanılarak gerçekleştirilmiştir.`,
      });

      // Her hesap bölümü
      for (const sec of computedSections) {
        const meta = MODULE_META[sec.moduleKey];
        const results = sec.results!;

        // Girdi tablosu
        reportSections.push({
          title: `${meta.label} — Girdi Parametreleri`,
          type: "table",
          tableData: {
            headers: ["Parametre", "Değer"],
            rows: Object.entries(sec.inputs)
              .filter(([, v]) => v !== "" && v !== undefined)
              .map(([k, v]) => [k, String(v)]),
          },
        });

        // Hesap sonuçları
        const resultEntries = Object.entries(results).filter(([k]) => !k.startsWith("_"));
        reportSections.push({
          title: `${meta.label} — Hesap Sonuçları`,
          type: "calculation",
          calcData: {
            method: sec.method,
            inputs: Object.entries(sec.inputs)
              .filter(([, v]) => v !== "" && v !== undefined)
              .map(([k, v]) => ({ label: k, value: String(v), unit: "" })),
            results: resultEntries.slice(0, 20).map(([k, v]) => ({
              label: k,
              value: typeof v === "number" ? v.toFixed(2) : String(v),
              unit: "",
              highlight: k.includes("ultimate") || k.includes("allowable") || k.includes("FS") || k.includes("settlement"),
            })),
            notes: [`Yöntem: ${sec.method}`, `Modül: ${meta.label}`, "GeoForce platformu ile hesaplanmıştır."],
          },
        });
      }

      // Değerlendirme
      reportSections.push({
        title: "Genel Değerlendirme ve Öneriler",
        type: "text",
        content: "Yukarıdaki hesap sonuçları, yetkili bir geoteknik mühendis tarafından değerlendirilmeli ve onaylanmalıdır. Sonuçlar, saha koşulları, laboratuvar deneyleri ve mühendislik yargısı ile birlikte yorumlanmalıdır. Kesin mühendislik kararları için bu rapor tek başına yeterli değildir.",
      });

      const config: ReportConfig = {
        project,
        sections: reportSections,
        includeDisclaimer: true,
        language: "tr",
      };

      const doc = generateReport(config);
      doc.save(`${project.reportNo}_Geoteknik_Rapor.pdf`);
    } catch (err) {
      console.error("PDF hatası:", err);
      alert("PDF oluşturulurken hata oluştu.");
    } finally {
      setGenerating(false);
    }
  }, [project, computedSections]);

  return (
    <div className="space-y-6">
      {/* Rapor özeti */}
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
          </div>
        </div>

        {/* Rapor yapısı */}
        <h3 className="font-medium mb-3">Rapor İçeriği ({computedSections.length + 3} bölüm)</h3>
        <div className="space-y-2">
          <PreviewRow icon="📘" title="Kapak Sayfası" desc="Proje bilgileri, firma, mühendis" />
          <PreviewRow icon="📋" title="İçindekiler" desc="Otomatik bölüm listesi" />
          <PreviewRow icon="📝" title="Proje Tanımı ve Amaç" desc="Genel proje açıklaması" />

          {computedSections.map((sec, i) => {
            const meta = MODULE_META[sec.moduleKey];
            const resultCount = sec.results ? Object.keys(sec.results).filter(k => !k.startsWith("_")).length : 0;
            return (
              <PreviewRow
                key={sec.id}
                icon={meta.icon}
                title={`${meta.label} — ${sec.method}`}
                desc={`${Object.keys(sec.inputs).length} girdi, ${resultCount} sonuç`}
              />
            );
          })}

          <PreviewRow icon="📊" title="Genel Değerlendirme" desc="Sonuç ve öneriler" />
          <PreviewRow icon="⚠️" title="Sorumluluk Reddi" desc="Yasal uyarı" />
        </div>
      </div>

      {/* Hesaplanmamış bölüm uyarısı */}
      {sections.length > computedSections.length && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 p-4 text-sm">
          ⚠️ {sections.length - computedSections.length} bölüm henüz hesaplanmadı ve rapora dahil edilmeyecek.
          <button onClick={() => setStep(1)} className="ml-2 text-brand-600 underline">Geri dön ve hesapla</button>
        </div>
      )}

      {/* İndir */}
      <div className="flex items-center gap-4">
        <button onClick={() => setStep(1)} className="btn-secondary">← Hesap Bölümleri</button>
        <button
          onClick={handleDownload}
          disabled={generating || computedSections.length === 0}
          className="btn-primary text-lg px-8 py-3 disabled:opacity-40"
        >
          {generating ? "⏳ Oluşturuluyor..." : "📄 PDF Rapor İndir"}
        </button>
      </div>

      {/* Bilgi */}
      <div className="card p-4 text-xs text-[var(--muted)] space-y-1">
        <p>💡 Rapor A4 formatında, kapak sayfası, içindekiler, hesap detayları ve sorumluluk reddi içerir.</p>
        <p>📋 Her hesap bölümü için girdi parametreleri tablosu ve sonuç tablosu otomatik oluşturulur.</p>
        <p>🔒 Tüm işlemler tarayıcınızda gerçekleşir — verileriniz sunucuya gönderilmez.</p>
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
