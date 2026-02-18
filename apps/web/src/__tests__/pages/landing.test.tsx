import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

describe('Landing Page', () => {
  it('hatasız renderlanır', () => {
    render(<HomePage />)
  })

  it('hero başlık görünür', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Geoteknik Hesaplar/i)
  })

  it('özellik kartları mevcut', () => {
    render(<HomePage />)
    const allText = screen.getAllByText('26 Hesap Modülü')
    expect(allText.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('PDF Rapor')).toBeInTheDocument()
    expect(screen.getByText('Gerçek Grafikler')).toBeInTheDocument()
    expect(screen.getByText('Açık Kaynak')).toBeInTheDocument()
  })

  it('CTA butonları mevcut', () => {
    render(<HomePage />)
    expect(screen.getAllByText(/Hesaplamaya Başla/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Ücretsiz Kayıt Ol/i).length).toBeGreaterThanOrEqual(1)
  })

  it('Free vs Pro tablosu renderlanır', () => {
    render(<HomePage />)
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Planlar')).toBeInTheDocument()
  })

  it('istatistikler görünür', () => {
    render(<HomePage />)
    expect(screen.getByText('26')).toBeInTheDocument()
    expect(screen.getByText('110+')).toBeInTheDocument()
    expect(screen.getByText('TBDY')).toBeInTheDocument()
  })

  it('modül kategorileri görünür', () => {
    render(<HomePage />)
    expect(screen.getByText('Temel Modüller')).toBeInTheDocument()
    expect(screen.getByText('İleri Modüller')).toBeInTheDocument()
  })
})
