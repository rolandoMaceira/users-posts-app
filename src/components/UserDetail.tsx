import type { CSSProperties } from 'react'
import { createPost } from '../api/api'
import type { Post, User } from '../api/types'
import { useUserPosts } from '../hooks/useUserPosts'
import { getAvatarHue, getInitials } from '../lib/users'
import type { PostFormValues } from '../lib/validation'
import ErrorMessage from './ErrorMessage'
import Loading from './Loading'
import PostForm from './PostForm'
import PostList from './PostList'
import './UserDetail.css'

interface UserDetailProps {
  user: User
  /** Publicaciones creadas en esta sesión (la API no las guarda). */
  localPosts: Post[]
  onPostCreated: (post: Post) => void
}

export default function UserDetail({ user, localPosts, onPostCreated }: UserDetailProps) {
  const { posts, status, error, retry } = useUserPosts(user.id)

  async function handleCreate(values: PostFormValues) {
    const created = await createPost({ userId: user.id, ...values })
    onPostCreated(created)
  }

  const allPosts = [...localPosts, ...posts]

  return (
    <article className="detail-card" aria-labelledby="detail-name">
      <header className="profile">
        <span
          className="profile__avatar"
          style={{ '--hue': getAvatarHue(user.id) } as CSSProperties}
          aria-hidden="true"
        >
          {getInitials(user.name)}
        </span>
        <div className="profile__text">
          <h2 id="detail-name" className="profile__name">
            {user.name}
          </h2>
          <p className="profile__meta">
            @{user.username} · {user.company.name}
          </p>
          <p className="profile__contact">
            <a href={`mailto:${user.email}`}>{user.email}</a>
          </p>
        </div>
      </header>

      <PostForm onSubmit={handleCreate} />

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
        {status === 'success' && <PostList posts={allPosts} />}
      </section>
    </article>
  )
}
