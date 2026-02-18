import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import YanalBasincPage from '@/app/hesapla/yanal-basinc/page'

describe('Yanal Basınç Sayfası', () => {
  it('hatasız renderlanır', () => {
    render(<YanalBasincPage />)
  })

  it('başlık görünür', () => {
    render(<YanalBasincPage />)
    expect(screen.getByText(/Yanal Toprak Basıncı/i)).toBeInTheDocument()
  })

  it('input alanları mevcut', () => {
    render(<YanalBasincPage />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThanOrEqual(3)
  })
})
