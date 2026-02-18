import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import KonsolidasyonPage from '@/app/hesapla/konsolidasyon/page'

describe('Konsolidasyon Sayfası', () => {
  it('hatasız renderlanır', () => {
    render(<KonsolidasyonPage />)
  })

  it('başlık görünür', () => {
    render(<KonsolidasyonPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Konsolidasyon/i)
  })

  it('input alanları mevcut', () => {
    render(<KonsolidasyonPage />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })
})
