import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TasimaKapasitesiPage from '@/app/hesapla/tasima-kapasitesi/page'

describe('Taşıma Kapasitesi Sayfası', () => {
  it('hatasız renderlanır', () => {
    render(<TasimaKapasitesiPage />)
  })

  it('başlık görünür', () => {
    render(<TasimaKapasitesiPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Taşıma Kapasitesi/i)
  })

  it('input alanları mevcut', () => {
    render(<TasimaKapasitesiPage />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThanOrEqual(5)
  })

  it('yöntem seçici mevcut', () => {
    render(<TasimaKapasitesiPage />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('karşılaştırma tablosu varsayılan olarak görünür', () => {
    render(<TasimaKapasitesiPage />)
    expect(screen.getByText('Karşılaştırma')).toBeInTheDocument()
  })
})
