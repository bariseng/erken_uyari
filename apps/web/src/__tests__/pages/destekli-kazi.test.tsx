import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DestekliKaziPage from '@/app/hesapla/destekli-kazi/page'

describe('Destekli Kazı Sayfası', () => {
  it('hatasız renderlanır', () => {
    render(<DestekliKaziPage />)
  })

  it('başlık görünür', () => {
    render(<DestekliKaziPage />)
    expect(screen.getByText(/Destekli Kazı/i)).toBeInTheDocument()
  })

  it('hesapla butonu mevcut', () => {
    render(<DestekliKaziPage />)
    expect(screen.getByRole('button', { name: /hesapla/i })).toBeInTheDocument()
  })

  it('input alanları mevcut', () => {
    render(<DestekliKaziPage />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThanOrEqual(3)
  })
})
