import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import IksaPage from '@/app/hesapla/iksa/page'

describe('İksa Sayfası', () => {
  it('hatasız renderlanır', () => {
    render(<IksaPage />)
  })

  it('başlık görünür', () => {
    render(<IksaPage />)
    expect(screen.getByText(/İksa/i)).toBeInTheDocument()
  })

  it('input alanları mevcut', () => {
    render(<IksaPage />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThanOrEqual(3)
  })
})
