import './feedback.css'

interface LoadingProps {
  /** Texto que anuncian los lectores de pantalla. */
  label: string
  /** Cuántas filas fantasma dibujar. */
  rows?: number
  /** Forma del esqueleto: filas de personas o bloques de publicación. */
  variant?: 'people' | 'posts'
}

export default function Loading({ label, rows = 6, variant = 'people' }: LoadingProps) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="visually-hidden">{label}</span>
      <div aria-hidden="true">
        {Array.from({ length: rows }, (_, i) =>
          variant === 'posts' ? (
            <div className="loading__post" key={i}>
              <span className="loading__line loading__line--long" />
              <span className="loading__line" />
              <span className="loading__line loading__line--short" />
            </div>
          ) : (
            <div className="loading__row" key={i}>
              <span className="loading__avatar" />
              <span className="loading__lines">
                <span className="loading__line loading__line--long" />
                <span className="loading__line loading__line--short" />
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  )
}
