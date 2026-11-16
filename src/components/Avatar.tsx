import type { CSSProperties } from 'react'
import type { User } from '../api/types'
import { getAvatarHue, getInitials } from '../lib/users'
import './Avatar.css'

interface AvatarProps {
  user: Pick<User, 'id' | 'name'>
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Decorativo: el nombre siempre aparece como texto al lado.
export default function Avatar({ user, size = 'md' }: AvatarProps) {
  return (
    <span
      className={`avatar avatar--${size}`}
      style={{ '--hue': getAvatarHue(user.id) } as CSSProperties}
      aria-hidden="true"
    >
      {getInitials(user.name)}
    </span>
  )
}
