import { useEffect } from 'react'
import './Toast.css'

export interface ToastMessage {
  id: number
  text: string
}

interface ToastProps {
  toast: ToastMessage | null
  onDismiss: () => void
}

const DURATION_MS = 3500

// La región siempre está en el DOM para que los lectores de pantalla
// anuncien el mensaje cuando aparece.
export default function Toast({ toast, onDismiss }: ToastProps) {
  const id = toast?.id

  useEffect(() => {
    if (id === undefined) return
    const timer = setTimeout(onDismiss, DURATION_MS)
    return () => clearTimeout(timer)
  }, [id, onDismiss])

  return (
    <div className="toast-region" role="status">
      {toast && (
        <div className="toast" key={toast.id}>
          {toast.text}
        </div>
      )}
    </div>
  )
}
