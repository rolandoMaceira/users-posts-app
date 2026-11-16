import { useCallback, useEffect, useRef, useState } from 'react'
import type { Post, User } from './api/types'
import Avatar from './components/Avatar'
import ErrorMessage from './components/ErrorMessage'
import Icon from './components/Icon'
import Loading from './components/Loading'
import ThemeToggle from './components/ThemeToggle'
import Toast from './components/Toast'
import type { ToastMessage } from './components/Toast'
import UserDetail from './components/UserDetail'
import UserList from './components/UserList'
import { useUsers } from './hooks/useUsers'
import { readStorage, writeStorage } from './lib/storage'
import { getAvatarHue } from './lib/users'
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
  const [freshPostId, setFreshPostId] = useState<number | null>(null)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const dismissToast = useCallback(() => setToast(null), [])

  // Menú lateral: solo existe como cajón en pantallas estrechas; en escritorio
  // la lista está siempre visible y este estado no tiene efecto visual.
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    menuButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    closeButtonRef.current?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeMenu()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen, closeMenu])

  function select(user: User) {
    setSelectedId(user.id)
    setFreshPostId(null)
    writeStorage(SELECTED_KEY, String(user.id))
    if (menuOpen) closeMenu()
  }

  function handlePostCreated(post: Post) {
    const local: Post = { ...post, id: nextLocalId.current-- }
    setCreatedPosts((prev) => ({
      ...prev,
      [local.userId]: [local, ...(prev[local.userId] ?? [])],
    }))
    setFreshPostId(local.id)
    setToast({
      id: Date.now(),
      text: 'Publicación añadida',
      hue: getAvatarHue(local.userId),
    })
  }

  return (
    <div className={menuOpen ? 'app app--menu-open' : 'app'}>
      <header className="topbar">
        <div className="topbar__lead">
          <button
            ref={menuButtonRef}
            type="button"
            className="icon-button menu-button"
            aria-label="Abrir lista de usuarios"
            aria-expanded={menuOpen}
            aria-controls="sidebar"
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" size={20} />
          </button>
          <div className="brand">
            <span className="brand__mark" aria-hidden="true">
              UP
            </span>
            <h1>Usuarios y publicaciones</h1>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <div className="workspace">
        {/* Fondo oscuro del cajón: solo existe en móvil. */}
        <div className="scrim" aria-hidden="true" onClick={closeMenu} />

        <aside id="sidebar" className="panel sidebar" aria-label="Usuarios">
          <div className="sidebar__bar">
            <h2>Usuarios</h2>
            <button
              ref={closeButtonRef}
              type="button"
              className="icon-button"
              aria-label="Cerrar lista de usuarios"
              onClick={closeMenu}
            >
              <Icon name="close" size={20} />
            </button>
          </div>
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
            // key: al cambiar de usuario el panel se reinicia y nunca muestra
            // publicaciones del usuario anterior mientras carga las nuevas.
            <UserDetail
              key={selected.id}
              user={selected}
              localPosts={createdPosts[selected.id] ?? []}
              onPostCreated={handlePostCreated}
              freshPostId={freshPostId}
            />
          ) : (
            <div className="detail__placeholder">
              <div className="empty-art" aria-hidden="true">
                {ART_USERS.map((u) => (
                  <Avatar key={u.id} user={u} size="lg" />
                ))}
              </div>
              <h2>Elige a alguien de la lista</h2>
              <p>Aquí verás sus publicaciones y podrás escribir una nueva.</p>
              <button type="button" className="empty-cta" onClick={() => setMenuOpen(true)}>
                Ver usuarios
              </button>
            </div>
          )}
        </main>
      </div>
      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
