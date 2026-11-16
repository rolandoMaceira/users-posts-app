import { describe, expect, it } from 'vitest'
import { users } from '../test/fixtures'
import { filterUsersByName, getInitials } from './users'

describe('filterUsersByName', () => {
  it('devuelve todos con una búsqueda vacía o de espacios', () => {
    expect(filterUsersByName(users, '')).toHaveLength(3)
    expect(filterUsersByName(users, '   ')).toHaveLength(3)
  })

  it('ignora tildes y mayúsculas', () => {
    const withAccent = [{ ...users[0], name: 'Ángela Pérez' }]
    expect(filterUsersByName(withAccent, 'angela perez')).toHaveLength(1)
    expect(filterUsersByName(withAccent, 'ÁNGELA')).toHaveLength(1)
  })
})

describe('getInitials', () => {
  it('usa nombre y apellido', () => {
    expect(getInitials('Leanne Graham')).toBe('LG')
  })

  it('ignora tratamientos como "Mrs."', () => {
    expect(getInitials('Mrs. Dennis Schulist')).toBe('DS')
  })
})
