import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SevStabilitesiPage from '@/app/hesapla/sev-stabilitesi/page'

describe('Şev Stabilitesi Sayfası', () => {
  it('hatasız renderlanır', () => {
    render(<SevStabilitesiPage />)
  })

  it('başlık görünür', () => {
    render(<SevStabilitesiPage />)
    expect(screen.getByText(/Şev Stabilitesi/i)).toBeInTheDocument()
  })

  it('input alanları mevcut', () => {
    render(<SevStabilitesiPage />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThanOrEqual(3)
  })
})
