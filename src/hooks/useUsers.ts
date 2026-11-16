import { useCallback, useEffect, useState } from 'react'
import { getUsers, isAbortError } from '../api/api'
import type { User } from '../api/types'

export type Status = 'loading' | 'error' | 'success'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getUsers(controller.signal)
      .then((data) => {
        setUsers(data)
        setStatus('success')
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return
        setError(err instanceof Error ? err.message : 'Error inesperado.')
        setStatus('error')
      })

    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => {
    setStatus('loading')
    setError(null)
    setAttempt((n) => n + 1)
  }, [])

  return { users, status, error, retry }
}
