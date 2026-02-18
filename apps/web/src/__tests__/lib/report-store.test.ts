import { describe, it, expect } from 'vitest'
import { MODULE_META } from '@/lib/report-store'
import type { ModuleKey } from '@/lib/report-store'

describe('Report Store — MODULE_META', () => {
  const expectedModules: ModuleKey[] = [
    'tasima-kapasitesi', 'oturma', 'sivilasma', 'sev-stabilitesi', 'kazik',
    'iksa', 'yanal-basinc', 'deprem', 'siniflandirma', 'konsolidasyon',
    'zemin-iyilestirme', 'faz-iliskileri', 'arazi-deneyleri', 'indeks-deneyleri',
    'gerilme-temel', 'gerilme-dagilimi', 'istinat-duvari', 'saha-tepki',
    'braced-excavation', 'pad-footing', 'soil-properties-db',
    'destekli-kazi', 'tekil-temel', 'zemin-ozellik-db',
  ]

  it('tüm beklenen modülleri içerir', () => {
    for (const key of expectedModules) {
      expect(MODULE_META).toHaveProperty(key)
    }
  })

  it('her modülün icon, label ve methods alanı var', () => {
    for (const key of Object.keys(MODULE_META) as ModuleKey[]) {
      const meta = MODULE_META[key]
      expect(meta.icon).toBeTruthy()
      expect(meta.label).toBeTruthy()
      expect(meta.methods.length).toBeGreaterThan(0)
    }
  })

  it('toplam modül sayısı doğru', () => {
    expect(Object.keys(MODULE_META).length).toBe(expectedModules.length)
  })
})
