import { useState } from 'react'
import type { User } from './api/types'
import UserList from './components/UserList'
import { useUsers } from './hooks/useUsers'
import './App.css'

export default function App() {
  const { users, status } = useUsers()
  const [selected, setSelected] = useState<User | null>(null)

  return (
    <div className="app">
      <aside className="sidebar">
        <header className="sidebar__header">
          <h1>Usuarios y publicaciones</h1>
          <p>Elige a alguien para leer lo que ha publicado.</p>
        </header>
        {status === 'success' && (
          <UserList
            users={users}
            selectedId={selected?.id ?? null}
            onSelect={setSelected}
          />
        )}
      </aside>

      <main className="detail">
        {selected ? (
          <h2>{selected.name}</h2>
        ) : (
          <div className="detail__placeholder">
            <h2>Aún no hay nadie seleccionado</h2>
            <p>Sus publicaciones aparecerán aquí al elegir un usuario de la lista.</p>
          </div>
        )}
      </main>
    </div>
  )
}
