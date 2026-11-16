import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PostForm from './PostForm'

describe('PostForm', () => {
  it('muestra errores por campo y no envía si está vacío', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<PostForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /publicar/i }))

    expect(screen.getByText(/escribe un título/i)).toBeInTheDocument()
    expect(screen.getByText(/escribe el texto/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Título')).toHaveFocus()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('trata un campo con solo espacios como vacío', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<PostForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Título'), '   ')
    await user.type(screen.getByLabelText('Texto'), 'Hola')
    await user.click(screen.getByRole('button', { name: /publicar/i }))

    expect(screen.getByText(/escribe un título/i)).toBeInTheDocument()
    expect(screen.queryByText(/escribe el texto/i)).not.toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('envía los datos sin espacios sobrantes y limpia el formulario', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<PostForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Título'), '  Mi título  ')
    await user.type(screen.getByLabelText('Texto'), 'Mi texto')
    await user.click(screen.getByRole('button', { name: /publicar/i }))

    expect(onSubmit).toHaveBeenCalledWith({ title: 'Mi título', body: 'Mi texto' })
    await waitFor(() => expect(screen.getByLabelText('Título')).toHaveValue(''))
    expect(screen.getByLabelText('Texto')).toHaveValue('')
  })

  it('conserva lo escrito y muestra el error si el envío falla', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new Error('El servidor no responde.'))
    render(<PostForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Título'), 'Título')
    await user.type(screen.getByLabelText('Texto'), 'Texto')
    await user.click(screen.getByRole('button', { name: /publicar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('El servidor no responde.')
    expect(screen.getByLabelText('Título')).toHaveValue('Título')
    expect(screen.getByRole('button', { name: /publicar/i })).toBeEnabled()
  })
})
