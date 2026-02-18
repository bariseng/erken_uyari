import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '@/components/Footer'

describe('Footer', () => {
  it('hatasız renderlanır', () => {
    render(<Footer />)
  })

  it('brand görünür', () => {
    render(<Footer />)
    expect(screen.getByText('Geo')).toBeInTheDocument()
  })

  it('hesaplar bölümü mevcut', () => {
    render(<Footer />)
    expect(screen.getByText('Hesaplar')).toBeInTheDocument()
  })

  it('iletişim bölümü mevcut', () => {
    render(<Footer />)
    expect(screen.getByText('İletişim')).toBeInTheDocument()
  })

  it('copyright görünür', () => {
    render(<Footer />)
    expect(screen.getByText(/2026 GeoForce/)).toBeInTheDocument()
  })

  it('GitHub linki mevcut', () => {
    render(<Footer />)
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument()
  })
})
