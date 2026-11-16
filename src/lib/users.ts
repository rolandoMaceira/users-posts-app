import type { User } from '../api/types'

// Quita tildes y pasa a minúsculas: "Ánge" coincide con "ange".
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function filterUsersByName(users: User[], query: string): User[] {
  const q = normalize(query)
  if (!q) return users
  return users.filter((user) => normalize(user.name).includes(q))
}

const TITLE_PREFIX = /^(mr|mrs|ms|miss|dr|prof)\.?\s+/i

// "Mrs. Dennis Schulist" -> "DS"
export function getInitials(name: string): string {
  const words = name.replace(TITLE_PREFIX, '').split(/\s+/).filter(Boolean)
  const first = words[0]?.[0] ?? '?'
  const last = words.length > 1 ? words[words.length - 1][0] : ''
  return (first + last).toUpperCase()
}

// Tono estable por usuario para el monograma.
export function getAvatarHue(id: number): number {
  return (id * 47) % 360
}
