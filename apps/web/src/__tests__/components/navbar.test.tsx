import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Navbar from '@/components/Navbar'

describe('Navbar', () => {
  it('hatasız renderlanır', () => {
    render(<Navbar />)
  })

  it('logo/brand görünür', () => {
    render(<Navbar />)
    expect(screen.getByText('Geo')).toBeInTheDocument()
    expect(screen.getByText('Force')).toBeInTheDocument()
  })

  it('hesapla linki mevcut', () => {
    render(<Navbar />)
    expect(screen.getByText('Hesapla')).toBeInTheDocument()
  })

  it('rapor linki mevcut', () => {
    render(<Navbar />)
    expect(screen.getByText(/Rapor/)).toBeInTheDocument()
  })

  it('mobil menü butonu mevcut', () => {
    render(<Navbar />)
    // The mobile toggle button exists (svg hamburger)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })
})
