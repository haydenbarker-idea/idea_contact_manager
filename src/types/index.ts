export interface UserProfile {
  name: string
  title: string
  company: string
  email: string
  phone: string
  linkedin: string
  avatar?: string
  bio?: string
}

export type ContactStatus = 'NEW' | 'CONTACTED' | 'RESPONDED' | 'MEETING_SET' | 'CLIENT' | 'COLD'
export type CommunicationType = 'SMS' | 'EMAIL' | 'LINKEDIN' | 'PHONE' | 'IN_PERSON'
export type CommunicationDirection = 'OUTBOUND' | 'INBOUND'

export interface Contact {
  id: string
  name: string
  email: string
  phone?: string | null
  linkedin?: string | null
  company?: string | null
  title?: string | null
  notes?: string | null
  status: ContactStatus
  priority: number // 0 = normal, 1 = important, 2 = urgent
  photoUrl?: string | null // URL to their selfie
  conference?: string | null // Conference where we met
  submittedAt: Date
  lastContact?: Date | null
  updatedAt: Date
  communications?: Communication[]
}

export interface Communication {
  id: string
  contactId: string
  type: CommunicationType
  direction: CommunicationDirection
  subject?: string | null
  message: string
  status: string // SENT, DELIVERED, FAILED, READ
  sentAt: Date
  deliveredAt?: Date | null
  metadata?: any
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  available?: boolean  // For slug availability checks
  error?: {
    code: string
    message: string
  }
}

export interface MessageTemplate {
  id: string
  name: string
  subject?: string
  body: string
  type: CommunicationType
}

