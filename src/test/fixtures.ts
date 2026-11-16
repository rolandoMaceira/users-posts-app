import { vi } from 'vitest'
import type { Post, User } from '../api/types'

export const users: User[] = [
  {
    id: 1,
    name: 'Leanne Graham',
    username: 'Bret',
    email: 'leanne@example.com',
    phone: '1-770-736-8031',
    website: 'hildegard.org',
    company: { name: 'Romaguera-Crona', catchPhrase: 'Multi-layered client-server neural-net' },
  },
  {
    id: 2,
    name: 'Ervin Howell',
    username: 'Antonette',
    email: 'ervin@example.com',
    phone: '010-692-6593',
    website: 'anastasia.net',
    company: { name: 'Deckow-Crist', catchPhrase: 'Proactive didactic contingency' },
  },
  {
    id: 3,
    name: 'Mrs. Dennis Schulist',
    username: 'Leopoldo_Corkery',
    email: 'dennis@example.com',
    phone: '1-463-123-4447',
    website: 'ramiro.info',
    company: { name: 'Considine-Lockman', catchPhrase: 'Synchronised bottom-line interface' },
  },
]

export const postsByUser: Record<number, Post[]> = {
  1: [
    { id: 1, userId: 1, title: 'primer post de Leanne', body: 'texto uno' },
    { id: 2, userId: 1, title: 'segundo post de Leanne', body: 'texto dos' },
  ],
  2: [{ id: 11, userId: 2, title: 'post de Ervin', body: 'texto de Ervin' }],
  3: [],
}

export function jsonResponse(data: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(data) }
}

/** Simula la API de JSONPlaceholder. `overrides` permite cambiar una ruta concreta. */
export function stubApi(overrides: Record<string, () => Promise<unknown>> = {}) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input)).pathname
    const key = `${init?.method ?? 'GET'} ${url}`
    if (overrides[key]) return overrides[key]()

    if (key === 'GET /users') return jsonResponse(users)

    const postsMatch = /^GET \/users\/(\d+)\/posts$/.exec(key)
    if (postsMatch) return jsonResponse(postsByUser[Number(postsMatch[1])] ?? [])

    if (key === 'POST /posts') {
      // Igual que la API real: devuelve el cuerpo con id 101.
      return jsonResponse({ ...JSON.parse(String(init?.body)), id: 101 }, 201)
    }
    return jsonResponse({}, 404)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
