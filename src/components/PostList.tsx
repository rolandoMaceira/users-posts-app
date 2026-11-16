import type { Post, User } from '../api/types'
import Avatar from './Avatar'
import './PostList.css'

interface PostListProps {
  posts: Post[]
  author: User
  /** Publicación recién creada: es la única que se anima al entrar. */
  freshPostId?: number | null
}

export default function PostList({ posts, author, freshPostId = null }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="posts-empty">
        <p className="posts-empty__title">{author.name} aún no ha publicado nada.</p>
        <p>Escribe la primera publicación con el formulario de arriba.</p>
      </div>
    )
  }

  return (
    <ol className="posts">
      {posts.map((post) => (
        <li key={post.id} className={post.id === freshPostId ? 'post post--fresh' : 'post'}>
          <article className="post__card">
            {/* La autoría es la misma en toda la lista: solo es contexto visual. */}
            <div className="post__author" aria-hidden="true">
              <Avatar user={author} size="sm" />
              <span>{author.name}</span>
            </div>
            <h4 className="post__title">
              {post.title}
              {post.id < 0 && <span className="post__badge">Nueva</span>}
            </h4>
            <p className="post__body">{post.body}</p>
          </article>
        </li>
      ))}
    </ol>
  )
}
