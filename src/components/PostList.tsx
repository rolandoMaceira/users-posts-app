import type { Post } from '../api/types'
import './PostList.css'

interface PostListProps {
  posts: Post[]
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="posts-empty">
        <p className="posts-empty__title">Este usuario aún no ha publicado nada.</p>
        <p>Cuando haya publicaciones, aparecerán aquí.</p>
      </div>
    )
  }

  return (
    <ol className="posts">
      {posts.map((post) => (
        <li key={post.id} className="post">
          <article>
            <h3 className="post__title">
              {post.title}
              {post.id < 0 && <span className="post__badge">Nueva</span>}
            </h3>
            <p className="post__body">{post.body}</p>
          </article>
        </li>
      ))}
    </ol>
  )
}
