import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import KazikPage from '@/app/hesapla/kazik/page'

describe('Kazık Kapasitesi Sayfası', () => {
  it('hatasız renderlanır', () => {
    render(<KazikPage />)
  })

  it('başlık görünür', () => {
    render(<KazikPage />)
    expect(screen.getByText(/Kazık Kapasitesi/i)).toBeInTheDocument()
  })

  it('input alanları mevcut', () => {
    render(<KazikPage />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })
})
