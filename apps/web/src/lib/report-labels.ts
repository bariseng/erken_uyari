/**
 * GeoForce — Rapor Etiket Haritaları (LABEL_MAP)
 * Ham JSON key'leri → Türkçe etiket + birim
 */

// ─── Taşıma Kapasitesi ───
export const BEARING_LABELS: Record<string, { label: string; unit: string }> = {
  // Girdiler
  width: { label: "Temel Genişliği (B)", unit: "m" },
  length: { label: "Temel Uzunluğu (L)", unit: "m" },
  depth: { label: "Temel Derinliği (Df)", unit: "m" },
  gamma: { label: "Birim Hacim Ağırlık (γ)", unit: "kN/m³" },
  cohesion: { label: "Kohezyon (c)", unit: "kPa" },
  frictionAngle: { label: "İçsel Sürtünme Açısı (φ)", unit: "°" },
  safetyFactor: { label: "Güvenlik Katsayısı (FS)", unit: "" },
  // Sonuçlar
  method: { label: "Hesap Yöntemi", unit: "" },
  ultimate: { label: "Nihai Taşıma Kapasitesi (qu)", unit: "kPa" },
  allowable: { label: "İzin Verilebilir Taşıma Kapasitesi (qa)", unit: "kPa" },
  "factors.Nc": { label: "Taşıma Kapasitesi Faktörü Nc", unit: "" },
  "factors.Nq": { label: "Taşıma Kapasitesi Faktörü Nq", unit: "" },
  "factors.Ngamma": { label: "Taşıma Kapasitesi Faktörü Nγ", unit: "" },
  "factors.Nγ": { label: "Taşıma Kapasitesi Faktörü Nγ", unit: "" },
  "shapeFactors.sc": { label: "Şekil Faktörü sc", unit: "" },
  "shapeFactors.sq": { label: "Şekil Faktörü sq", unit: "" },
  "shapeFactors.sgamma": { label: "Şekil Faktörü sγ", unit: "" },
  "shapeFactors.sγ": { label: "Şekil Faktörü sγ", unit: "" },
  "depthFactors.dc": { label: "Derinlik Faktörü dc", unit: "" },
  "depthFactors.dq": { label: "Derinlik Faktörü dq", unit: "" },
  "depthFactors.dgamma": { label: "Derinlik Faktörü dγ", unit: "" },
  "inclinationFactors.ic": { label: "Eğiklik Faktörü ic", unit: "" },
  "inclinationFactors.iq": { label: "Eğiklik Faktörü iq", unit: "" },
  "components.cohesionTerm": { label: "Kohezyon Terimi", unit: "kPa" },
  "components.surchargeTerm": { label: "Üst Yük Terimi", unit: "kPa" },
  "components.surchargeterm": { label: "Üst Yük Terimi", unit: "kPa" },
  "components.depthTerm": { label: "Derinlik Terimi", unit: "kPa" },
  "components.gammaTerm": { label: "Zemin Ağırlığı Terimi", unit: "kPa" },
};

// ─── Sıvılaşma ───
export const LIQUEFACTION_LABELS: Record<string, { label: string; unit: string }> = {
  // Girdiler
  magnitude: { label: "Deprem Büyüklüğü (Mw)", unit: "" },
  amax: { label: "Maksimum Yer İvmesi (amax)", unit: "g" },
  waterTableDepth: { label: "Yeraltı Su Seviyesi (YASS)", unit: "m" },
  gamma: { label: "Birim Hacim Ağırlık (γ)", unit: "kN/m³" },
  gammaSat: { label: "Doymuş Birim Hacim Ağırlık (γsat)", unit: "kN/m³" },
  depth: { label: "Tabaka Derinliği", unit: "m" },
  N: { label: "SPT N Değeri", unit: "" },
  finesContent: { label: "İnce Dane Oranı (FC)", unit: "%" },
  // Sonuçlar
  LPI: { label: "Sıvılaşma Potansiyeli İndeksi (LPI)", unit: "" },
  LPI_class: { label: "LPI Sınıfı", unit: "" },
  "layers.depth": { label: "Derinlik", unit: "m" },
  "layers.N1_60": { label: "(N1)60", unit: "" },
  "layers.N1_60cs": { label: "(N1)60cs", unit: "" },
  "layers.sigma_v": { label: "Toplam Gerilme (σv)", unit: "kPa" },
  "layers.sigma_v_prime": { label: "Efektif Gerilme (σ'v)", unit: "kPa" },
  "layers.CSR": { label: "Döngüsel Gerilme Oranı (CSR)", unit: "" },
  "layers.CRR": { label: "Döngüsel Dayanım Oranı (CRR)", unit: "" },
  "layers.MSF": { label: "Büyüklük Düzeltme Faktörü (MSF)", unit: "" },
  "layers.FS": { label: "Güvenlik Katsayısı (FS)", unit: "" },
  "layers.status": { label: "Durum", unit: "" },
};

// ─── Şev Stabilitesi ───
export const SLOPE_LABELS: Record<string, { label: string; unit: string }> = {
  height: { label: "Şev Yüksekliği (H)", unit: "m" },
  slopeAngle: { label: "Şev Açısı (β)", unit: "°" },
  gamma: { label: "Birim Hacim Ağırlık (γ)", unit: "kN/m³" },
  cohesion: { label: "Kohezyon (c)", unit: "kPa" },
  frictionAngle: { label: "İçsel Sürtünme Açısı (φ)", unit: "°" },
  ru: { label: "Boşluk Suyu Basıncı Oranı (ru)", unit: "" },
  FS: { label: "Güvenlik Katsayısı (FS)", unit: "" },
  method: { label: "Hesap Yöntemi", unit: "" },
  "criticalCenter.x": { label: "Kritik Merkez X", unit: "m" },
  "criticalCenter.y": { label: "Kritik Merkez Y", unit: "m" },
  criticalRadius: { label: "Kritik Yarıçap", unit: "m" },
};

// ─── Oturma ───
export const SETTLEMENT_LABELS: Record<string, { label: string; unit: string }> = {
  // Girdiler
  width: { label: "Temel Genişliği (B)", unit: "m" },
  length: { label: "Temel Uzunluğu (L)", unit: "m" },
  pressure: { label: "Net Taban Basıncı (q)", unit: "kPa" },
  elasticModulus: { label: "Elastisite Modülü (Es)", unit: "kPa" },
  poissonRatio: { label: "Poisson Oranı (ν)", unit: "" },
  thickness: { label: "Tabaka Kalınlığı (H)", unit: "m" },
  e0: { label: "Başlangıç Boşluk Oranı (e₀)", unit: "" },
  Cc: { label: "Sıkışma İndeksi (Cc)", unit: "" },
  Cs: { label: "Şişme İndeksi (Cs)", unit: "" },
  sigma0: { label: "Mevcut Efektif Gerilme (σ'₀)", unit: "kPa" },
  deltaSigma: { label: "Gerilme Artışı (Δσ)", unit: "kPa" },
  preconsolidationPressure: { label: "Önkonsolidasyon Basıncı (σ'p)", unit: "kPa" },
  cv: { label: "Konsolidasyon Katsayısı (cv)", unit: "m²/yıl" },
  // Sonuçlar
  method: { label: "Hesap Yöntemi", unit: "" },
  immediateSettlement: { label: "Ani Oturma (Si)", unit: "mm" },
  primarySettlement: { label: "Primer Konsolidasyon Oturması (Sc)", unit: "mm" },
  secondarySettlement: { label: "Sekonder Oturma (Ss)", unit: "mm" },
  totalSettlement: { label: "Toplam Oturma (St)", unit: "mm" },
  settlement: { label: "Toplam Oturma", unit: "mm" },
};

// ─── Kazık Kapasitesi ───
export const PILE_LABELS: Record<string, { label: string; unit: string }> = {
  diameter: { label: "Kazık Çapı (D)", unit: "m" },
  length: { label: "Kazık Uzunluğu (L)", unit: "m" },
  pileType: { label: "Kazık Tipi", unit: "" },
  cu: { label: "Drenajsız Kayma Dayanımı (cu)", unit: "kPa" },
  frictionAngle: { label: "İçsel Sürtünme Açısı (φ)", unit: "°" },
  gamma: { label: "Birim Hacim Ağırlık (γ)", unit: "kN/m³" },
  N: { label: "SPT N Değeri", unit: "" },
  safetyFactor: { label: "Güvenlik Katsayısı (FS)", unit: "" },
  method: { label: "Hesap Yöntemi", unit: "" },
  shaftCapacity: { label: "Gövde Taşıma Kapasitesi (Qs)", unit: "kN" },
  tipCapacity: { label: "Uç Taşıma Kapasitesi (Qp)", unit: "kN" },
  ultimate: { label: "Nihai Taşıma Kapasitesi (Qu)", unit: "kN" },
  allowable: { label: "İzin Verilebilir Taşıma Kapasitesi (Qa)", unit: "kN" },
};

// ─── Yanal Toprak Basıncı ───
export const LATERAL_LABELS: Record<string, { label: string; unit: string }> = {
  wallHeight: { label: "Duvar Yüksekliği (H)", unit: "m" },
  gamma: { label: "Birim Hacim Ağırlık (γ)", unit: "kN/m³" },
  cohesion: { label: "Kohezyon (c)", unit: "kPa" },
  frictionAngle: { label: "İçsel Sürtünme Açısı (φ)", unit: "°" },
  surcharge: { label: "Sürşarj Yükü (q)", unit: "kPa" },
  wallFriction: { label: "Duvar Sürtünme Açısı (δ)", unit: "°" },
  kh: { label: "Yatay Sismik Katsayı (kh)", unit: "" },
  kv: { label: "Düşey Sismik Katsayı (kv)", unit: "" },
  method: { label: "Hesap Yöntemi", unit: "" },
  Ka: { label: "Aktif Basınç Katsayısı (Ka)", unit: "" },
  Kp: { label: "Pasif Basınç Katsayısı (Kp)", unit: "" },
  activeForce: { label: "Aktif İtki (Pa)", unit: "kN/m" },
  passiveForce: { label: "Pasif Direnç (Pp)", unit: "kN/m" },
  activeMoment: { label: "Aktif Moment", unit: "kN·m/m" },
};

// ─── Deprem Parametreleri ───
export const SEISMIC_LABELS: Record<string, { label: string; unit: string }> = {
  Ss: { label: "Kısa Periyot Tasarım İvmesi (Ss)", unit: "g" },
  S1: { label: "1 s Periyot Tasarım İvmesi (S1)", unit: "g" },
  soilClass: { label: "Zemin Sınıfı", unit: "" },
  SMS: { label: "Kısa Periyot Düzeltilmiş İvme (SMS)", unit: "g" },
  SM1: { label: "1 s Periyot Düzeltilmiş İvme (SM1)", unit: "g" },
  SDS: { label: "Kısa Periyot Tasarım Spektrum İvmesi (SDS)", unit: "g" },
  SD1: { label: "1 s Periyot Tasarım Spektrum İvmesi (SD1)", unit: "g" },
  Fa: { label: "Kısa Periyot Yer Büyütme Faktörü (Fa)", unit: "" },
  Fv: { label: "1 s Periyot Yer Büyütme Faktörü (Fv)", unit: "" },
  Ta: { label: "Kısa Periyot (TA)", unit: "s" },
  Tb: { label: "Uzun Periyot (TB)", unit: "s" },
  TL: { label: "Geçiş Periyodu (TL)", unit: "s" },
};

// ─── İksa Tasarımı ───
export const EXCAVATION_LABELS: Record<string, { label: string; unit: string }> = {
  excavationDepth: { label: "Kazı Derinliği (H)", unit: "m" },
  embedmentDepth: { label: "Gömülme Derinliği (D)", unit: "m" },
  gamma: { label: "Birim Hacim Ağırlık (γ)", unit: "kN/m³" },
  cohesion: { label: "Kohezyon (c)", unit: "kPa" },
  frictionAngle: { label: "İçsel Sürtünme Açısı (φ)", unit: "°" },
  surcharge: { label: "Sürşarj Yükü (q)", unit: "kPa" },
  condition: { label: "Mesnetleme Koşulu", unit: "" },
  Ka: { label: "Aktif Basınç Katsayısı (Ka)", unit: "" },
  Kp: { label: "Pasif Basınç Katsayısı (Kp)", unit: "" },
  maxMoment: { label: "Maksimum Moment (Mmax)", unit: "kN·m/m" },
  maxMomentDepth: { label: "Maksimum Moment Derinliği", unit: "m" },
  requiredDepth: { label: "Gerekli Gömülme Derinliği", unit: "m" },
  anchorForce: { label: "Ankraj Kuvveti", unit: "kN/m" },
};

// ─── Konsolidasyon ───
export const CONSOLIDATION_LABELS: Record<string, { label: string; unit: string }> = {
  thickness: { label: "Tabaka Kalınlığı (H)", unit: "m" },
  e0: { label: "Başlangıç Boşluk Oranı (e₀)", unit: "" },
  Cc: { label: "Sıkışma İndeksi (Cc)", unit: "" },
  Cs: { label: "Şişme İndeksi (Cs)", unit: "" },
  cv: { label: "Konsolidasyon Katsayısı (cv)", unit: "m²/yıl" },
  ch: { label: "Yatay Konsolidasyon Katsayısı (ch)", unit: "m²/yıl" },
  sigma0: { label: "Mevcut Efektif Gerilme (σ'₀)", unit: "kPa" },
  deltaSigma: { label: "Gerilme Artışı (Δσ)", unit: "kPa" },
  preconsolidationPressure: { label: "Önkonsolidasyon Basıncı (σ'p)", unit: "kPa" },
  drainage: { label: "Drenaj Koşulu", unit: "" },
  drainagePath: { label: "Drenaj Yolu (Hd)", unit: "m" },
  targetDegree: { label: "Hedef Konsolidasyon Derecesi (U)", unit: "%" },
  primarySettlement: { label: "Primer Oturma (Sc)", unit: "mm" },
  timeRequired: { label: "Gerekli Süre", unit: "gün" },
  timeRequiredYears: { label: "Gerekli Süre", unit: "yıl" },
  // PVD
  spacing: { label: "Dren Aralığı (S)", unit: "m" },
  pattern: { label: "Dren Düzeni", unit: "" },
  drainDiameter: { label: "Dren Çapı (dw)", unit: "m" },
};

// ─── Zemin Sınıflandırma ───
export const CLASSIFICATION_LABELS: Record<string, { label: string; unit: string }> = {
  gravel: { label: "Çakıl Oranı", unit: "%" },
  sand: { label: "Kum Oranı", unit: "%" },
  fines: { label: "İnce Dane Oranı", unit: "%" },
  LL: { label: "Likit Limit (LL)", unit: "%" },
  PL: { label: "Plastik Limit (PL)", unit: "%" },
  PI: { label: "Plastisite İndeksi (PI)", unit: "%" },
  USCS: { label: "USCS Sınıfı", unit: "" },
  AASHTO: { label: "AASHTO Sınıfı", unit: "" },
  AASHTO_group: { label: "AASHTO Grubu", unit: "" },
  description: { label: "Zemin Tanımı", unit: "" },
};

// ─── Zemin İyileştirme ───
export const IMPROVEMENT_LABELS: Record<string, { label: string; unit: string }> = {
  depth: { label: "İyileştirme Derinliği", unit: "m" },
  energy: { label: "Düşme Enerjisi (W×h)", unit: "ton·m" },
  gamma: { label: "Birim Hacim Ağırlık (γ)", unit: "kN/m³" },
  improvedDepth: { label: "İyileştirilen Derinlik", unit: "m" },
  numberOfPasses: { label: "Geçiş Sayısı", unit: "" },
  printSpacing: { label: "İz Aralığı", unit: "m" },
};

// ─── Faz İlişkileri ───
export const PHASE_LABELS: Record<string, { label: string; unit: string }> = {
  Gs: { label: "Özgül Ağırlık (Gs)", unit: "" },
  w: { label: "Su Muhtevası (w)", unit: "%" },
  gamma: { label: "Birim Hacim Ağırlık (γ)", unit: "kN/m³" },
  e: { label: "Boşluk Oranı (e)", unit: "" },
  n: { label: "Porozite (n)", unit: "" },
  S: { label: "Doygunluk Derecesi (S)", unit: "%" },
  gamma_d: { label: "Kuru Birim Ağırlık (γd)", unit: "kN/m³" },
  gamma_sat: { label: "Doymuş Birim Ağırlık (γsat)", unit: "kN/m³" },
  optimumWaterContent: { label: "Optimum Su Muhtevası (wopt)", unit: "%" },
  maxDryDensity: { label: "Maksimum Kuru Yoğunluk (γd,max)", unit: "kN/m³" },
};

// ─── Arazi Deneyleri ───
export const FIELD_TEST_LABELS: Record<string, { label: string; unit: string }> = {
  depth: { label: "Derinlik", unit: "m" },
  N: { label: "SPT N Değeri", unit: "" },
  gamma: { label: "Birim Hacim Ağırlık (γ)", unit: "kN/m³" },
  waterTableDepth: { label: "Yeraltı Su Seviyesi (YASS)", unit: "m" },
  surcharge: { label: "Sürşarj Yükü", unit: "kPa" },
  totalStress: { label: "Toplam Gerilme (σv)", unit: "kPa" },
  porePressure: { label: "Boşluk Suyu Basıncı (u)", unit: "kPa" },
  effectiveStress: { label: "Efektif Gerilme (σ'v)", unit: "kPa" },
  N60: { label: "N60", unit: "" },
  N1_60: { label: "(N1)60", unit: "" },
  phi_estimated: { label: "Tahmini Sürtünme Açısı (φ)", unit: "°" },
  Es_estimated: { label: "Tahmini Elastisite Modülü (Es)", unit: "MPa" },
};

// ─── İndeks Deneyleri ───
export const INDEX_TEST_LABELS: Record<string, { label: string; unit: string }> = {
  LL: { label: "Likit Limit (LL)", unit: "%" },
  PL: { label: "Plastik Limit (PL)", unit: "%" },
  PI: { label: "Plastisite İndeksi (PI)", unit: "%" },
  w: { label: "Doğal Su Muhtevası (w)", unit: "%" },
  SL: { label: "Çekme Limiti (SL)", unit: "" },
  LI: { label: "Likitite İndeksi (LI)", unit: "" },
  activity: { label: "Aktivite", unit: "" },
  D10: { label: "D10", unit: "mm" },
  D30: { label: "D30", unit: "mm" },
  D60: { label: "D60", unit: "mm" },
  Cu: { label: "Düzgünsüzlük Katsayısı (Cu)", unit: "" },
  Cc: { label: "Eğrilik Katsayısı (Cc)", unit: "" },
};

// ─── Gerilme & Temel ───
export const STRESS_FOUNDATION_LABELS: Record<string, { label: string; unit: string }> = {
  sigma1: { label: "Büyük Asal Gerilme (σ₁)", unit: "kPa" },
  sigma3: { label: "Küçük Asal Gerilme (σ₃)", unit: "kPa" },
  cohesion: { label: "Kohezyon (c)", unit: "kPa" },
  frictionAngle: { label: "İçsel Sürtünme Açısı (φ)", unit: "°" },
  center: { label: "Mohr Dairesi Merkezi", unit: "kPa" },
  radius: { label: "Mohr Dairesi Yarıçapı", unit: "kPa" },
  tau_max: { label: "Maksimum Kayma Gerilmesi (τmax)", unit: "kPa" },
  area: { label: "Temel Alanı (A)", unit: "m²" },
  width: { label: "Temel Genişliği (B)", unit: "m" },
};

// ─── Gerilme Dağılımı & CBR ───
export const STRESS_DISTRIBUTION_LABELS: Record<string, { label: string; unit: string }> = {
  load: { label: "Nokta Yük (P)", unit: "kN" },
  depth: { label: "Derinlik (z)", unit: "m" },
  offset: { label: "Yatay Mesafe (r)", unit: "m" },
  sigma_z: { label: "Düşey Gerilme Artışı (Δσz)", unit: "kPa" },
  sigma_r: { label: "Radyal Gerilme Artışı (Δσr)", unit: "kPa" },
  tau_rz: { label: "Kayma Gerilmesi (τrz)", unit: "kPa" },
  CBR: { label: "Kaliforniya Taşıma Oranı (CBR)", unit: "%" },
};

// ─── İstinat Duvarı ───
export const RETAINING_WALL_LABELS: Record<string, { label: string; unit: string }> = {
  wallHeight: { label: "Duvar Yüksekliği (H)", unit: "m" },
  baseWidth: { label: "Taban Genişliği (B)", unit: "m" },
  gamma: { label: "Dolgu Birim Hacim Ağırlığı (γ)", unit: "kN/m³" },
  frictionAngle: { label: "Dolgu Sürtünme Açısı (φ)", unit: "°" },
  cohesion: { label: "Kohezyon (c)", unit: "kPa" },
  Ka: { label: "Aktif Basınç Katsayısı (Ka)", unit: "" },
  Kp: { label: "Pasif Basınç Katsayısı (Kp)", unit: "" },
  Pa: { label: "Aktif İtki (Pa)", unit: "kN/m" },
  sliding_FS: { label: "Kayma Güvenlik Katsayısı", unit: "" },
  overturning_FS: { label: "Devrilme Güvenlik Katsayısı", unit: "" },
  bearing_FS: { label: "Taşıma Güvenlik Katsayısı", unit: "" },
  eccentricity: { label: "Eksantrisite (e)", unit: "m" },
};

// ─── Saha Tepki ───
export const SITE_RESPONSE_LABELS: Record<string, { label: string; unit: string }> = {
  Vs30: { label: "Ortalama Kayma Dalgası Hızı (Vs30)", unit: "m/s" },
  thickness: { label: "Tabaka Kalınlığı", unit: "m" },
  Vs: { label: "Kayma Dalgası Hızı (Vs)", unit: "m/s" },
  density: { label: "Yoğunluk (ρ)", unit: "kg/m³" },
  soilClass: { label: "TBDY Zemin Sınıfı", unit: "" },
  F: { label: "Yer Büyütme Faktörü", unit: "" },
  PGA_bedrock: { label: "Ana Kaya PGA", unit: "g" },
  PGA_surface: { label: "Yüzey PGA", unit: "g" },
};

// ─── Modül bazlı etiket getirici ───
export function getLabelMap(moduleKey: string): Record<string, { label: string; unit: string }> {
  switch (moduleKey) {
    case "tasima-kapasitesi": return BEARING_LABELS;
    case "sivilasma": return LIQUEFACTION_LABELS;
    case "sev-stabilitesi": return SLOPE_LABELS;
    case "oturma": return SETTLEMENT_LABELS;
    case "kazik": return PILE_LABELS;
    case "yanal-basinc": return LATERAL_LABELS;
    case "deprem": return SEISMIC_LABELS;
    case "iksa": return EXCAVATION_LABELS;
    case "konsolidasyon": return CONSOLIDATION_LABELS;
    case "siniflandirma": return CLASSIFICATION_LABELS;
    case "zemin-iyilestirme": return IMPROVEMENT_LABELS;
    case "faz-iliskileri": return PHASE_LABELS;
    case "arazi-deneyleri": return FIELD_TEST_LABELS;
    case "indeks-deneyleri": return INDEX_TEST_LABELS;
    case "gerilme-temel": return STRESS_FOUNDATION_LABELS;
    case "gerilme-dagilimi": return STRESS_DISTRIBUTION_LABELS;
    case "istinat-duvari": return RETAINING_WALL_LABELS;
    case "saha-tepki": return SITE_RESPONSE_LABELS;
    case "braced-excavation": return EXCAVATION_LABELS;
    case "destekli-kazi": return EXCAVATION_LABELS;
    default: return {};
  }
}

// ─── Etiket formatlama ───
export function formatLabel(key: string, moduleKey: string): string {
  const labelMap = getLabelMap(moduleKey);
  const entry = labelMap[key];
  if (entry) {
    return entry.unit ? `${entry.label} (${entry.unit})` : entry.label;
  }
  // Fallback: key'i daha okunabilir yap
  return key
    .replace(/\./g, " → ")
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim();
}

export function formatValue(key: string, value: any, moduleKey: string): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number") {
    // Hassasiyet belirle
    const labelMap = getLabelMap(moduleKey);
    const entry = labelMap[key];
    if (entry?.unit === "°" || entry?.unit === "%") {
      return value.toFixed(1);
    }
    if (Math.abs(value) < 0.01) {
      return value.toExponential(2);
    }
    if (Math.abs(value) >= 1000) {
      return value.toFixed(0);
    }
    return value.toFixed(2);
  }
  return String(value);
}
