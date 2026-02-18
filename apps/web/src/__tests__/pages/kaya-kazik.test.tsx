import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import KayaKazikPage from '@/app/hesapla/kaya-kazik/page'

describe('Kaya Kazık Sayfası', () => {
  it('hatasız renderlanır', () => {
    render(<KayaKazikPage />)
  })

  it('başlık görünür', () => {
    render(<KayaKazikPage />)
    expect(screen.getByText(/Kaya Soketi Kazık/i)).toBeInTheDocument()
  })

  it('hesapla butonu mevcut', () => {
    render(<KayaKazikPage />)
    expect(screen.getByRole('button', { name: /hesapla/i })).toBeInTheDocument()
  })

  it('input alanları mevcut', () => {
    render(<KayaKazikPage />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThanOrEqual(5)
  })
})
