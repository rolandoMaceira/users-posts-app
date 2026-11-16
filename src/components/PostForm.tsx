import { useId, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { validatePost } from '../lib/validation'
import type { PostFormErrors, PostFormValues } from '../lib/validation'
import './PostForm.css'

interface PostFormProps {
  /** Debe rechazar la promesa si falla; el formulario conserva lo escrito. */
  onSubmit: (values: PostFormValues) => Promise<void>
  /** Avatar de quien publica, a la izquierda del compositor. */
  avatar?: ReactNode
}

const EMPTY: PostFormValues = { title: '', body: '' }
const TITLE_MAX = 100
const BODY_MAX = 500

export default function PostForm({ onSubmit, avatar }: PostFormProps) {
  const [values, setValues] = useState<PostFormValues>(EMPTY)
  const [errors, setErrors] = useState<PostFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const titleRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const uid = useId()
  const titleId = `${uid}-title`
  const bodyId = `${uid}-body`

  function handleChange(field: keyof PostFormValues, value: string) {
    const next = { ...values, [field]: value }
    setValues(next)
    // Si el campo tenía error, se limpia en cuanto deja de ser inválido.
    if (errors[field] && !validatePost(next)[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // La caja de texto crece con lo que se escribe.
  function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const found = validatePost(values)
    setErrors(found)
    if (found.title || found.body) {
      ;(found.title ? titleRef.current : bodyRef.current)?.focus()
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit({ title: values.title.trim(), body: values.body.trim() })
      setValues(EMPTY)
      if (bodyRef.current) bodyRef.current.style.height = ''
      titleRef.current?.focus()
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'No se pudo publicar. Inténtalo de nuevo.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="composer" onSubmit={handleSubmit} noValidate aria-label="Nueva publicación">
      {avatar}

      <div className="composer__main">
        <div className="field">
          <label htmlFor={titleId} className="visually-hidden">
            Título
          </label>
          <input
            ref={titleRef}
            id={titleId}
            className="composer__title"
            type="text"
            placeholder="Título"
            maxLength={TITLE_MAX}
            value={values.title}
            onChange={(e) => handleChange('title', e.target.value)}
            aria-invalid={errors.title ? 'true' : undefined}
            aria-describedby={errors.title ? `${titleId}-error` : undefined}
            autoComplete="off"
          />
          {errors.title && (
            <p id={`${titleId}-error`} className="field__error">
              {errors.title}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor={bodyId} className="visually-hidden">
            Texto
          </label>
          <textarea
            ref={bodyRef}
            id={bodyId}
            placeholder="¿Qué quieres contar?"
            rows={3}
            maxLength={BODY_MAX}
            value={values.body}
            onChange={(e) => {
              handleChange('body', e.target.value)
              autoGrow(e.target)
            }}
            aria-invalid={errors.body ? 'true' : undefined}
            aria-describedby={errors.body ? `${bodyId}-error` : undefined}
          />
          {errors.body && (
            <p id={`${bodyId}-error`} className="field__error">
              {errors.body}
            </p>
          )}
        </div>

        {submitError && (
          <p className="composer__error" role="alert">
            {submitError}
          </p>
        )}

        <div className="composer__actions">
          <span
            className={
              values.body.length >= BODY_MAX * 0.9 ? 'composer__count composer__count--near' : 'composer__count'
            }
            aria-hidden="true"
          >
            {values.body.length}/{BODY_MAX}
          </span>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Publicando…' : 'Publicar'}
          </button>
        </div>

        <p className="composer__note">
          JSONPlaceholder no guarda datos: la publicación solo existe mientras esta página siga abierta.
        </p>
      </div>
    </form>
  )
}
