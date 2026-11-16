import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renderiza el título', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /usuarios y publicaciones/i }),
    ).toBeInTheDocument()
  })
})
