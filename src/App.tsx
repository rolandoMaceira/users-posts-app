import { useRef, useState } from 'react'
import type { Post, User } from './api/types'
import ErrorMessage from './components/ErrorMessage'
import Loading from './components/Loading'
import UserDetail from './components/UserDetail'
import UserList from './components/UserList'
import { useUsers } from './hooks/useUsers'
import './App.css'

export default function App() {
  const { users, status, error, retry } = useUsers()
  const [selected, setSelected] = useState<User | null>(null)
  // Publicaciones creadas por usuario: viven aquí para no perderse al cambiar
  // de usuario y volver (la API no las persiste).
  const [createdPosts, setCreatedPosts] = useState<Record<number, Post[]>>({})
  // JSONPlaceholder devuelve siempre id 101; usamos ids locales negativos,
  // únicos y que nunca chocan con los de la API.
  const nextLocalId = useRef(-1)

  function handlePostCreated(post: Post) {
    const local: Post = { ...post, id: nextLocalId.current-- }
    setCreatedPosts((prev) => ({
      ...prev,
      [local.userId]: [local, ...(prev[local.userId] ?? [])],
    }))
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <header className="sidebar__header">
          <h1>Usuarios y publicaciones</h1>
          <p>Elige a alguien para leer lo que ha publicado.</p>
        </header>
        {status === 'loading' && <Loading label="Cargando usuarios…" />}
        {status === 'error' && (
          <ErrorMessage
            title="No se pudieron cargar los usuarios"
            message={error ?? 'Ha ocurrido un error inesperado.'}
            onRetry={retry}
          />
        )}
        {status === 'success' && (
          <UserList
            users={users}
            selectedId={selected?.id ?? null}
            onSelect={setSelected}
          />
        )}
      </aside>

      <main className={selected ? 'detail' : 'detail detail--empty'}>
        {selected ? (
          // key: al cambiar de usuario el panel se reinicia y nunca muestra
          // publicaciones del usuario anterior mientras carga las nuevas.
          <UserDetail
            key={selected.id}
            user={selected}
            localPosts={createdPosts[selected.id] ?? []}
            onPostCreated={handlePostCreated}
          />
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
