import { useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { validatePost } from '../lib/validation'
import type { PostFormErrors, PostFormValues } from '../lib/validation'
import './PostForm.css'

interface PostFormProps {
  /** Debe rechazar la promesa si falla; el formulario conserva lo escrito. */
  onSubmit: (values: PostFormValues) => Promise<void>
}

const EMPTY: PostFormValues = { title: '', body: '' }

export default function PostForm({ onSubmit }: PostFormProps) {
  const [values, setValues] = useState<PostFormValues>(EMPTY)
  const [errors, setErrors] = useState<PostFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [published, setPublished] = useState(false)

  const titleRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const uid = useId()
  const titleId = `${uid}-title`
  const bodyId = `${uid}-body`

  function handleChange(field: keyof PostFormValues, value: string) {
    const next = { ...values, [field]: value }
    setValues(next)
    setPublished(false)
    // Si el campo tenía error, se limpia en cuanto deja de ser inválido.
    if (errors[field] && !validatePost(next)[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
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
      setPublished(true)
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
    <form className="post-form" onSubmit={handleSubmit} noValidate aria-label="Nueva publicación">
      <h3 className="post-form__heading">Nueva publicación</h3>

      <div className="field">
        <label htmlFor={titleId}>Título</label>
        <input
          ref={titleRef}
          id={titleId}
          type="text"
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
        <label htmlFor={bodyId}>Texto</label>
        <textarea
          ref={bodyRef}
          id={bodyId}
          rows={4}
          value={values.body}
          onChange={(e) => handleChange('body', e.target.value)}
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
        <p className="post-form__error" role="alert">
          {submitError}
        </p>
      )}

      <div className="post-form__actions">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Publicando…' : 'Publicar'}
        </button>
        <p className="post-form__status" role="status">
          {published ? 'Publicación añadida.' : ''}
        </p>
      </div>

      <p className="post-form__note">
        JSONPlaceholder no guarda datos: la publicación solo existe mientras esta página siga abierta.
      </p>
    </form>
  )
}
