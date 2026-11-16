import type { NewPost, Post, User } from './types'

const BASE_URL = 'https://jsonplaceholder.typicode.com'

export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, init)
  } catch (error) {
    // Las cancelaciones se propagan tal cual para que el llamador las ignore.
    if (isAbortError(error)) throw error
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión.')
  }

  // fetch no lanza con 4xx/5xx: hay que comprobar res.ok.
  if (!res.ok) {
    throw new ApiError(`El servidor respondió con un error (${res.status}).`, res.status)
  }

  try {
    return (await res.json()) as T
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new ApiError('La respuesta del servidor no es válida.', res.status)
  }
}

export function getUsers(signal?: AbortSignal): Promise<User[]> {
  return request<User[]>('/users', { signal })
}

export function getPostsByUser(userId: number, signal?: AbortSignal): Promise<Post[]> {
  return request<Post[]>(`/users/${userId}/posts`, { signal })
}

// JSONPlaceholder simula la creación: responde 201 con id 101 pero no persiste.
export function createPost(post: NewPost, signal?: AbortSignal): Promise<Post> {
  return request<Post>('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(post),
    signal,
  })
}
