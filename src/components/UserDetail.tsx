import type { CSSProperties } from 'react'
import type { User } from '../api/types'
import { useUserPosts } from '../hooks/useUserPosts'
import { getAvatarHue, getInitials } from '../lib/users'
import ErrorMessage from './ErrorMessage'
import Loading from './Loading'
import PostList from './PostList'
import './UserDetail.css'

interface UserDetailProps {
  user: User
}

export default function UserDetail({ user }: UserDetailProps) {
  const { posts, status, error, retry } = useUserPosts(user.id)

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

      <section aria-labelledby="posts-heading" className="detail-posts">
        <h3 id="posts-heading" className="detail-posts__heading">
          Publicaciones
          {status === 'success' && (
            <span className="detail-posts__count">{posts.length}</span>
          )}
        </h3>

        {status === 'loading' && <Loading label="Cargando publicaciones…" variant="posts" rows={4} />}
        {status === 'error' && (
          <ErrorMessage
            title="No se pudieron cargar las publicaciones"
            message={error ?? 'Ha ocurrido un error inesperado.'}
            onRetry={retry}
          />
        )}
        {status === 'success' && <PostList posts={posts} />}
      </section>
    </article>
  )
}
