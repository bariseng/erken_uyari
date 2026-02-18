import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import OturmaPage from '@/app/hesapla/oturma/page'

describe('Oturma Sayfası', () => {
  it('hatasız renderlanır', () => {
    render(<OturmaPage />)
  })

  it('başlık görünür', () => {
    render(<OturmaPage />)
    expect(screen.getByText(/Oturma Hesabı/i)).toBeInTheDocument()
  })

  it('tab butonları mevcut', () => {
    render(<OturmaPage />)
    expect(screen.getByText('Elastik')).toBeInTheDocument()
    expect(screen.getByText('Konsolidasyon')).toBeInTheDocument()
    expect(screen.getByText('Schmertmann')).toBeInTheDocument()
  })

  it('input alanları mevcut', () => {
    render(<OturmaPage />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBeGreaterThanOrEqual(3)
  })
})
