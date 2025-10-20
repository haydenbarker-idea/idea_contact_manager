import { z } from 'zod'

export const contactSubmissionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable(),
  linkedin: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
  company: z.string().max(100, 'Company name too long').optional().nullable(),
  title: z.string().max(100, 'Title too long').optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  conference: z.string().max(200, 'Conference name too long').optional().nullable(),
})

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>

