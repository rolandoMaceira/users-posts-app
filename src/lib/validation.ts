export interface PostFormValues {
  title: string
  body: string
}

export type PostFormErrors = Partial<Record<keyof PostFormValues, string>>

// Un campo con solo espacios cuenta como vacío.
export function validatePost(values: PostFormValues): PostFormErrors {
  const errors: PostFormErrors = {}
  if (!values.title.trim()) errors.title = 'Escribe un título para la publicación.'
  if (!values.body.trim()) errors.body = 'Escribe el texto de la publicación.'
  return errors
}
