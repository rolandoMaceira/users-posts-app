import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { jsonResponse, postsByUser, stubApi } from './test/fixtures'

describe('App', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('muestra la carga y después la lista de usuarios', async () => {
    stubApi()
    render(<App />)

    expect(screen.getByText(/cargando usuarios/i)).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /leanne graham/i })).toBeInTheDocument()
    expect(screen.getByText('3 usuarios')).toBeInTheDocument()
  })

  it('muestra un error con reintento cuando falla la carga de usuarios', async () => {
    const user = userEvent.setup()
    const fetchMock = stubApi({
      'GET /users': () => Promise.resolve(jsonResponse({}, 500)),
    })
    render(<App />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/no se pudieron cargar los usuarios/i)
    expect(alert).toHaveTextContent('(500)')

    // La API se recupera: reintentar vuelve a pedir los datos.
    fetchMock.mockImplementation(async () => jsonResponse([]))
    await user.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(await screen.findByText('0 usuarios')).toBeInTheDocument()
  })

  it('carga las publicaciones del usuario elegido', async () => {
    const user = userEvent.setup()
    stubApi()
    render(<App />)

    await user.click(await screen.findByRole('button', { name: /leanne graham/i }))

    expect(await screen.findByText('primer post de Leanne')).toBeInTheDocument()
    expect(screen.getByText('segundo post de Leanne')).toBeInTheDocument()
  })

  it('añade una publicación nueva y la conserva al cambiar de usuario', async () => {
    const user = userEvent.setup()
    stubApi()
    render(<App />)

    await user.click(await screen.findByRole('button', { name: /leanne graham/i }))
    await screen.findByText('primer post de Leanne')

    await user.type(screen.getByLabelText('Título'), 'Mi publicación')
    await user.type(screen.getByLabelText('Texto'), 'Cuerpo de prueba')
    await user.click(screen.getByRole('button', { name: /publicar/i }))

    const posts = within(screen.getByRole('region', { name: /publicaciones/i }))
    expect(await posts.findByText('Mi publicación')).toBeInTheDocument()
    expect(posts.getByText('Nueva')).toBeInTheDocument()
    expect(screen.getByText('Publicación añadida')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /ervin howell/i }))
    await screen.findByText('post de Ervin')
    expect(screen.queryByText('Mi publicación')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /leanne graham/i }))
    expect(await screen.findByText('Mi publicación')).toBeInTheDocument()
  })

  it('recuerda el usuario elegido tras recargar', async () => {
    localStorage.setItem('selectedUserId', '2')
    stubApi()
    render(<App />)

    expect(await screen.findByText('post de Ervin')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ervin Howell', level: 2 })).toBeInTheDocument()
  })

  it('vuelve a la lista con el botón Usuarios y olvida la selección', async () => {
    const user = userEvent.setup()
    stubApi()
    render(<App />)

    await user.click(await screen.findByRole('button', { name: /leanne graham/i }))
    await screen.findByText('primer post de Leanne')

    await user.click(screen.getByRole('button', { name: 'Usuarios' }))

    expect(screen.getByText(/elige a alguien de la lista/i)).toBeInTheDocument()
    expect(localStorage.getItem('selectedUserId')).toBeNull()
  })

  it('cambia entre tema claro y oscuro y lo guarda', async () => {
    const user = userEvent.setup()
    stubApi()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /cambiar a tema oscuro/i }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')

    await user.click(screen.getByRole('button', { name: /cambiar a tema claro/i }))
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('ignora la respuesta lenta del usuario anterior al cambiar de usuario', async () => {
    const user = userEvent.setup()
    let releaseSlow: () => void = () => {}
    stubApi({
      'GET /users/1/posts': () =>
        new Promise((resolve) => {
          releaseSlow = () => resolve(jsonResponse(postsByUser[1]))
        }),
    })
    render(<App />)

    await user.click(await screen.findByRole('button', { name: /leanne graham/i }))
    await user.click(screen.getByRole('button', { name: /ervin howell/i }))
    expect(await screen.findByText('post de Ervin')).toBeInTheDocument()

    // La petición de Leanne termina tarde: no debe aparecer en el panel de Ervin.
    await act(async () => {
      releaseSlow()
      await new Promise((resolve) => setTimeout(resolve, 20))
    })
    expect(screen.queryByText('primer post de Leanne')).not.toBeInTheDocument()
    expect(screen.getByText('post de Ervin')).toBeInTheDocument()
  })
})
