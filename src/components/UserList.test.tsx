import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { users } from '../test/fixtures'
import UserList from './UserList'

describe('UserList', () => {
  it('filtra por nombre al escribir, sin importar mayúsculas', async () => {
    const user = userEvent.setup()
    render(<UserList users={users} selectedId={null} onSelect={vi.fn()} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(3)

    await user.type(screen.getByLabelText(/buscar usuario por nombre/i), 'ERVIN')

    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByText('Ervin Howell')).toBeInTheDocument()
    expect(screen.queryByText('Leanne Graham')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('1 de 3 usuarios')
  })

  it('muestra un estado vacío y permite borrar la búsqueda', async () => {
    const user = userEvent.setup()
    render(<UserList users={users} selectedId={null} onSelect={vi.fn()} />)

    await user.type(screen.getByLabelText(/buscar usuario por nombre/i), 'zzz')
    expect(screen.getByText(/ningún usuario se llama/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /borrar búsqueda/i }))
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('avisa del usuario elegido y marca el seleccionado', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<UserList users={users} selectedId={2} onSelect={onSelect} />)

    expect(screen.getByRole('button', { name: /ervin howell/i })).toHaveAttribute(
      'aria-current',
      'true',
    )

    await user.click(screen.getByRole('button', { name: /leanne graham/i }))
    expect(onSelect).toHaveBeenCalledWith(users[0])
  })
})
