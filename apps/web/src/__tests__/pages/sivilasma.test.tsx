import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SivilasmaPage from '@/app/hesapla/sivilasma/page'

describe('Sıvılaşma Sayfası', () => {
  it('hatasız renderlanır', () => {
    render(<SivilasmaPage />)
  })

  it('başlık görünür', () => {
    render(<SivilasmaPage />)
    expect(screen.getByText(/Sıvılaşma Değerlendirmesi/i)).toBeInTheDocument()
  })

  it('deprem parametreleri bölümü mevcut', () => {
    render(<SivilasmaPage />)
    expect(screen.getByText('Deprem Parametreleri')).toBeInTheDocument()
  })

  it('tabaka ekleme butonu mevcut', () => {
    render(<SivilasmaPage />)
    expect(screen.getByText(/Tabaka Ekle/i)).toBeInTheDocument()
  })

  it('LPI sonucu görünür', () => {
    render(<SivilasmaPage />)
    expect(screen.getByText(/Sıvılaşma Potansiyel İndeksi/i)).toBeInTheDocument()
  })

  it('input alanları mevcut', () => {
    render(<SivilasmaPage />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThanOrEqual(4)
  })
})
