import type { UserProfile } from '@/types'

export function getUserProfile(): UserProfile {
  return {
    name: process.env.NEXT_PUBLIC_DEFAULT_USER_NAME || 'Your Name',
    title: process.env.NEXT_PUBLIC_DEFAULT_USER_TITLE || 'Your Title',
    company: process.env.NEXT_PUBLIC_DEFAULT_USER_COMPANY || 'Your Company',
    email: process.env.NEXT_PUBLIC_DEFAULT_USER_EMAIL || 'your@email.com',
    phone: process.env.NEXT_PUBLIC_DEFAULT_USER_PHONE || '+1234567890',
    linkedin: process.env.NEXT_PUBLIC_DEFAULT_USER_LINKEDIN || 'https://linkedin.com',
    avatar: process.env.NEXT_PUBLIC_DEFAULT_USER_AVATAR,
    bio: process.env.NEXT_PUBLIC_USER_BIO,
  }
}

