import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import Icon from './Icon'
import './Toast.css'

export interface ToastMessage {
  id: number
  text: string
  /** Tono del perfil que originó el aviso, para teñirlo de su color. */
  hue?: number
}

interface ToastProps {
  toast: ToastMessage | null
  onDismiss: () => void
}

export const TOAST_DURATION_MS = 3500

// La región siempre está en el DOM para que los lectores de pantalla
// anuncien el mensaje cuando aparece.
export default function Toast({ toast, onDismiss }: ToastProps) {
  const id = toast?.id

  useEffect(() => {
    if (id === undefined) return
    const timer = setTimeout(onDismiss, TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [id, onDismiss])

  return (
    <div className="toast-region" role="status">
      {toast && (
        <div
          className="toast"
          key={toast.id}
          style={
            {
              '--hue': toast.hue ?? 170,
              '--duration': `${TOAST_DURATION_MS}ms`,
            } as CSSProperties
          }
        >
          <span className="toast__icon">
            <Icon name="check" size={16} />
          </span>
          <span className="toast__text">{toast.text}</span>
          {/* La barra se vacía en el mismo tiempo que tarda en cerrarse. */}
          <span className="toast__progress" aria-hidden="true" />
        </div>
      )}
    </div>
  )
}
