import { z } from 'zod'

export const contactSubmissionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  company: z.string().max(100, 'Company name too long').optional(),
  title: z.string().max(100, 'Title too long').optional(),
})

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>

