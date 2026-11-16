import { useRef, useState } from 'react'
import type { Post, User } from './api/types'
import Avatar from './components/Avatar'
import ErrorMessage from './components/ErrorMessage'
import Icon from './components/Icon'
import Loading from './components/Loading'
import ThemeToggle from './components/ThemeToggle'
import UserDetail from './components/UserDetail'
import UserList from './components/UserList'
import { useUsers } from './hooks/useUsers'
import { readStorage, writeStorage } from './lib/storage'
import './App.css'

const SELECTED_KEY = 'selectedUserId'

// Tarjetas decorativas del estado vacío.
const ART_USERS = [
  { id: 4, name: 'Ana B' },
  { id: 7, name: 'Luis M' },
  { id: 2, name: 'Eva R' },
]

export default function App() {
  const { users, status, error, retry } = useUsers()
  // Se guarda solo el id: así el usuario elegido sobrevive a una recarga.
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const saved = readStorage(SELECTED_KEY)
    return saved ? Number(saved) : null
  })
  const selected = users.find((u) => u.id === selectedId) ?? null
  // Publicaciones creadas por usuario: viven aquí para no perderse al cambiar
  // de usuario y volver (la API no las persiste).
  const [createdPosts, setCreatedPosts] = useState<Record<number, Post[]>>({})
  // JSONPlaceholder devuelve siempre id 101; usamos ids locales negativos,
  // únicos y que nunca chocan con los de la API.
  const nextLocalId = useRef(-1)

  function select(user: User) {
    setSelectedId(user.id)
    writeStorage(SELECTED_KEY, String(user.id))
  }

  function clearSelection() {
    setSelectedId(null)
    writeStorage(SELECTED_KEY, null)
  }

  function handlePostCreated(post: Post) {
    const local: Post = { ...post, id: nextLocalId.current-- }
    setCreatedPosts((prev) => ({
      ...prev,
      [local.userId]: [local, ...(prev[local.userId] ?? [])],
    }))
  }

  return (
    <div className={selected ? 'app app--detail' : 'app'}>
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            UP
          </span>
          <h1>Usuarios y publicaciones</h1>
        </div>
        <ThemeToggle />
      </header>

      <div className="workspace">
        <aside className="panel sidebar">
          {status === 'loading' && <Loading label="Cargando usuarios…" />}
          {status === 'error' && (
            <ErrorMessage
              title="No se pudieron cargar los usuarios"
              message={error ?? 'Ha ocurrido un error inesperado.'}
              onRetry={retry}
            />
          )}
          {status === 'success' && (
            <UserList users={users} selectedId={selected?.id ?? null} onSelect={select} />
          )}
        </aside>

        <main className={selected ? 'panel detail' : 'panel detail detail--empty'}>
          {selected ? (
            <>
              <button type="button" className="back" onClick={clearSelection}>
                <Icon name="back" />
                Usuarios
              </button>
              {/* key: al cambiar de usuario el panel se reinicia y nunca muestra
                  publicaciones del usuario anterior mientras carga las nuevas. */}
              <UserDetail
                key={selected.id}
                user={selected}
                localPosts={createdPosts[selected.id] ?? []}
                onPostCreated={handlePostCreated}
              />
            </>
          ) : (
            <div className="detail__placeholder">
              <div className="empty-art" aria-hidden="true">
                {ART_USERS.map((u) => (
                  <Avatar key={u.id} user={u} size="lg" />
                ))}
              </div>
              <h2>Elige a alguien de la lista</h2>
              <p>Aquí verás sus publicaciones y podrás escribir una nueva.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
