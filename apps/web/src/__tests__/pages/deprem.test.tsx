import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DepremPage from '@/app/hesapla/deprem-parametreleri/page'

describe('Deprem Parametreleri Sayfası', () => {
  it('hatasız renderlanır', () => {
    render(<DepremPage />)
  })

  it('başlık görünür', () => {
    render(<DepremPage />)
    expect(screen.getByText(/Deprem Parametreleri/i)).toBeInTheDocument()
  })

  it('input alanları mevcut', () => {
    render(<DepremPage />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })
})
