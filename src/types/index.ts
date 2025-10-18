export interface UserProfile {
  name: string
  title: string
  company: string
  email: string
  phone: string
  linkedin: string
  avatar?: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone?: string | null
  linkedin?: string | null
  company?: string | null
  title?: string | null
  notes?: string | null
  followedUp: boolean
  submittedAt: Date
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

