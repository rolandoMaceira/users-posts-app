import { useCallback, useEffect, useState } from 'react'
import { getPostsByUser, isAbortError } from '../api/api'
import type { Post } from '../api/types'
import type { Status } from './useUsers'

/**
 * Carga las publicaciones de un usuario. Si `userId` cambia (o el componente
 * se desmonta) la petición anterior se cancela, así una respuesta lenta de
 * otro usuario nunca pisa a la del usuario actual.
 */
export function useUserPosts(userId: number) {
  const [posts, setPosts] = useState<Post[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getPostsByUser(userId, controller.signal)
      .then((data) => {
        setPosts(data)
        setStatus('success')
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return
        setError(err instanceof Error ? err.message : 'Error inesperado.')
        setStatus('error')
      })

    return () => controller.abort()
  }, [userId, attempt])

  const retry = useCallback(() => {
    setStatus('loading')
    setError(null)
    setAttempt((n) => n + 1)
  }, [])

  return { posts, status, error, retry }
}
