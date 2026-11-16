import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('renderiza el título', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) }),
    )
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /usuarios y publicaciones/i }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/0 usuarios/i)).toBeInTheDocument()
  })
})
