import { useId, useMemo, useState } from 'react'
import type { User } from '../api/types'
import { filterUsersByName } from '../lib/users'
import Avatar from './Avatar'
import './UserList.css'

interface UserListProps {
  users: User[]
  selectedId: number | null
  onSelect: (user: User) => void
}

export default function UserList({ users, selectedId, onSelect }: UserListProps) {
  const [query, setQuery] = useState('')
  const searchId = useId()
  const visible = useMemo(() => filterUsersByName(users, query), [users, query])

  return (
    <section className="roster" aria-label="Usuarios">
      <div className="roster__search">
        <label htmlFor={searchId} className="roster__label">
          Buscar usuario por nombre
        </label>
        <div className="roster__field">
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej. Clementine"
            autoComplete="off"
          />
        </div>
        <p className="roster__count" role="status">
          {visible.length === users.length
            ? `${users.length} usuarios`
            : `${visible.length} de ${users.length} usuarios`}
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="roster__empty">
          <p>
            Ningún usuario se llama <strong>“{query.trim()}”</strong>.
          </p>
          <button type="button" onClick={() => setQuery('')}>
            Borrar búsqueda
          </button>
        </div>
      ) : (
        <ul className="roster__list">
          {visible.map((user) => {
            const selected = user.id === selectedId
            return (
              <li key={user.id}>
                <button
                  type="button"
                  className="person"
                  aria-current={selected ? 'true' : undefined}
                  onClick={() => onSelect(user)}
                >
                  <Avatar user={user} />
                  <span className="person__text">
                    <span className="person__name">{user.name}</span>
                    <span className="person__meta">
                      @{user.username} · {user.company.name}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
