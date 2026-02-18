import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EC7KazikPage from '@/app/hesapla/ec7-kazik/page'

describe('EC7 Kazık Sayfası', () => {
  it('hatasız renderlanır', () => {
    render(<EC7KazikPage />)
  })

  it('başlık görünür', () => {
    render(<EC7KazikPage />)
    expect(screen.getByText(/EC7 Kazık/i)).toBeInTheDocument()
  })

  it('hesapla butonu mevcut', () => {
    render(<EC7KazikPage />)
    expect(screen.getByRole('button', { name: /hesapla/i })).toBeInTheDocument()
  })

  it('input alanları mevcut', () => {
    render(<EC7KazikPage />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThanOrEqual(3)
  })
})
