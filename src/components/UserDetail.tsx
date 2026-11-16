import type { CSSProperties } from 'react'
import { createPost } from '../api/api'
import type { Post, User } from '../api/types'
import { useUserPosts } from '../hooks/useUserPosts'
import { getAvatarHue } from '../lib/users'
import type { PostFormValues } from '../lib/validation'
import Avatar from './Avatar'
import ErrorMessage from './ErrorMessage'
import Icon from './Icon'
import Loading from './Loading'
import PostForm from './PostForm'
import PostList from './PostList'
import './UserDetail.css'

interface UserDetailProps {
  user: User
  /** Publicaciones creadas en esta sesión (la API no las guarda). */
  localPosts: Post[]
  onPostCreated: (post: Post) => void
  /** Id de la publicación recién creada, para animarla al entrar. */
  freshPostId: number | null
  /** Vuelve a la lista (solo se ve en móvil). */
  onBack: () => void
}

export default function UserDetail({ user, localPosts, onPostCreated, freshPostId, onBack }: UserDetailProps) {
  const { posts, status, error, retry } = useUserPosts(user.id)

  async function handleCreate(values: PostFormValues) {
    const created = await createPost({ userId: user.id, ...values })
    onPostCreated(created)
  }

  const allPosts = [...localPosts, ...posts]

  return (
    <article
      className="profile-card"
      aria-labelledby="detail-name"
      style={{ '--hue': getAvatarHue(user.id) } as CSSProperties}
    >
      {/* La portada toma su color del mismo tono que el monograma. */}
      <div className="cover">
        <button type="button" className="back" onClick={onBack}>
          <Icon name="back" />
          Usuarios
        </button>
      </div>

      <div className="detail-body">
        <header className="profile">
          <Avatar user={user} size="xl" />
          <div className="profile__text">
            <h2 id="detail-name" className="profile__name">
              {user.name}
            </h2>
            <p className="profile__meta">
              @{user.username} · {user.company.name}
            </p>
          </div>
        </header>

        <ul className="chips" aria-label="Datos de contacto">
          <li>
            <Icon name="mail" />
            <a href={`mailto:${user.email}`}>{user.email}</a>
          </li>
          <li>
            <Icon name="globe" />
            <a href={`https://${user.website}`} target="_blank" rel="noreferrer">
              {user.website}
            </a>
          </li>
          <li>
            <Icon name="phone" />
            <span>{user.phone}</span>
          </li>
          <li>
            <Icon name="pin" />
            <span>{user.address.city}</span>
          </li>
        </ul>

        <PostForm onSubmit={handleCreate} avatar={<Avatar user={user} />} />

        <section aria-labelledby="posts-heading" className="detail-posts">
          <h3 id="posts-heading" className="detail-posts__heading">
            Publicaciones
            {status === 'success' && (
              <span className="detail-posts__count">{allPosts.length}</span>
            )}
          </h3>

          {status === 'loading' && (
            <Loading label="Cargando publicaciones…" variant="posts" rows={4} />
          )}
          {status === 'error' && (
            <ErrorMessage
              title="No se pudieron cargar las publicaciones"
              message={error ?? 'Ha ocurrido un error inesperado.'}
              onRetry={retry}
            />
          )}
          {status === 'success' && <PostList posts={allPosts} author={user} freshPostId={freshPostId} />}
        </section>
      </div>
    </article>
  )
}
