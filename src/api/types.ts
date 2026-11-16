export interface User {
  id: number
  name: string
  username: string
  email: string
  phone: string
  website: string
  address: { city: string }
  company: { name: string; catchPhrase: string }
}

export interface Post {
  id: number
  userId: number
  title: string
  body: string
}

export type NewPost = Pick<Post, 'userId' | 'title' | 'body'>
