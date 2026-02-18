import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ZeminIyilestirmePage from '@/app/hesapla/zemin-iyilestirme/page'

describe('Zemin İyileştirme Sayfası', () => {
  it('hatasız renderlanır', () => {
    render(<ZeminIyilestirmePage />)
  })

  it('başlık görünür', () => {
    render(<ZeminIyilestirmePage />)
    expect(screen.getByText(/Zemin İyileştirme/i)).toBeInTheDocument()
  })

  it('input alanları mevcut', () => {
    render(<ZeminIyilestirmePage />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })
})
