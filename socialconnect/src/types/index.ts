// all the types used in the app

export type User = {
  id: string
  username: string
  first_name: string
  last_name: string
  bio: string | null
  avatar_url: string | null
  website: string | null
  location: string | null
  posts_count: number
  followers_count: number
  following_count: number
  created_at: string
  updated_at: string
}

export type Post = {
  id: string
  content: string
  author_id: string
  image_url: string | null
  is_active: boolean
  like_count: number
  comment_count: number
  created_at: string
  updated_at: string
  // joined from profiles
  author?: User
  liked_by_me?: boolean
}

export type Comment = {
  id: string
  content: string
  user_id: string
  post_id: string
  created_at: string
  // joined
  user?: Pick<User, 'id' | 'username' | 'avatar_url' | 'first_name' | 'last_name'>
}

export type Follow = {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

// what we get back after login/register
export type AuthResponse = {
  user: User
  token: string
}

// form types
export type RegisterForm = {
  email: string
  username: string
  password: string
  first_name: string
  last_name: string
}

export type LoginForm = {
  email: string
  password: string
}

export type PostForm = {
  content: string
  image?: File | null
}

export type ProfileUpdateForm = {
  bio?: string
  avatar_url?: string
  website?: string
  location?: string
  first_name?: string
  last_name?: string
}

export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
  // joined
  sender?: User
  receiver?: User
}
