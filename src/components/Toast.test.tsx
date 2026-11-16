import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Toast, { TOAST_DURATION_MS } from './Toast'

describe('Toast', () => {
  afterEach(() => vi.useRealTimers())

  it('muestra el mensaje y se cierra solo al terminar el tiempo', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    render(<Toast toast={{ id: 1, text: 'Publicación añadida', hue: 120 }} onDismiss={onDismiss} />)

    expect(screen.getByText('Publicación añadida')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(TOAST_DURATION_MS - 1))
    expect(onDismiss).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(1))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('no muestra nada ni programa cierres cuando no hay aviso', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    render(<Toast toast={null} onDismiss={onDismiss} />)

    act(() => vi.advanceTimersByTime(TOAST_DURATION_MS * 2))
    expect(onDismiss).not.toHaveBeenCalled()
    expect(screen.queryByText('Publicación añadida')).not.toBeInTheDocument()
  })
})
