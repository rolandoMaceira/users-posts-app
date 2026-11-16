import './feedback.css'

interface ErrorMessageProps {
  title: string
  message: string
  onRetry?: () => void
}

export default function ErrorMessage({ title, message, onRetry }: ErrorMessageProps) {
  return (
    <div className="error" role="alert">
      <h2 className="error__title">{title}</h2>
      <p className="error__message">{message}</p>
      {onRetry && (
        <button type="button" className="error__retry" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  )
}
