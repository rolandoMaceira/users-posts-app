import { useCallback, useState } from 'react'
import { writeStorage } from '../lib/storage'

export type Theme = 'light' | 'dark'

// El tema inicial lo fija un script en index.html antes de pintar (evita el
// parpadeo); aquí solo se lee y se mantiene sincronizado.
function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(currentTheme)

  const toggle = useCallback(() => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    writeStorage('theme', next)
    setTheme(next)
  }, [])

  return { theme, toggle }
}
