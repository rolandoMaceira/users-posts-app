import './feedback.css'

interface LoadingProps {
  /** Texto que anuncian los lectores de pantalla. */
  label: string
  /** Cuántas filas fantasma dibujar. */
  rows?: number
}

export default function Loading({ label, rows = 6 }: LoadingProps) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="visually-hidden">{label}</span>
      <div aria-hidden="true">
        {Array.from({ length: rows }, (_, i) => (
          <div className="loading__row" key={i}>
            <span className="loading__avatar" />
            <span className="loading__lines">
              <span className="loading__line loading__line--long" />
              <span className="loading__line loading__line--short" />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
