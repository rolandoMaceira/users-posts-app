import { useTheme } from '../hooks/useTheme'
import Icon from './Icon'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  return (
    <button
      type="button"
      className="icon-button"
      onClick={toggle}
      aria-label={dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      <Icon name={dark ? 'sun' : 'moon'} size={20} />
    </button>
  )
}
