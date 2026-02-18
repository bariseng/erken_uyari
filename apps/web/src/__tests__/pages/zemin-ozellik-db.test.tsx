import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ZeminOzellikDBPage from '@/app/hesapla/zemin-ozellik-db/page'

describe('Zemin Özellik DB Sayfası', () => {
  it('hatasız renderlanır', () => {
    render(<ZeminOzellikDBPage />)
  })

  it('başlık görünür', () => {
    render(<ZeminOzellikDBPage />)
    expect(screen.getByText(/Zemin.*Kaya.*Özellik/i)).toBeInTheDocument()
  })

  it('tab butonları mevcut', () => {
    render(<ZeminOzellikDBPage />)
    expect(screen.getByText('🔬 Zemin')).toBeInTheDocument()
    expect(screen.getByText('🪨 Kaya')).toBeInTheDocument()
  })
})
