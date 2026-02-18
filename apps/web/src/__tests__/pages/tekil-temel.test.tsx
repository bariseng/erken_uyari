import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TekilTemelPage from '@/app/hesapla/tekil-temel/page'

describe('Tekil Temel Sayfası', () => {
  it('hatasız renderlanır', () => {
    render(<TekilTemelPage />)
  })

  it('başlık görünür', () => {
    render(<TekilTemelPage />)
    expect(screen.getByText(/Tekil Temel/i)).toBeInTheDocument()
  })

  it('hesapla butonu mevcut', () => {
    render(<TekilTemelPage />)
    expect(screen.getByRole('button', { name: /hesapla/i })).toBeInTheDocument()
  })

  it('input alanları mevcut', () => {
    render(<TekilTemelPage />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThanOrEqual(5)
  })
})
