import type { MessageTemplate, CommunicationType } from '@/types'

/**
 * Get user's bio from environment or use default
 */
export function getUserBio(): string {
  return (
    process.env.NEXT_PUBLIC_USER_BIO ||
    'Looking forward to connecting with you and exploring how we can work together.'
  )
}

/**
 * Get user's name from environment
 */
export function getUserName(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_USER_NAME || 'Hayden'
}

/**
 * Pre-defined message templates for quick outreach
 */
export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'initial-followup-sms',
    name: 'Initial Follow-up (SMS)',
    type: 'SMS',
    body: `Hi {{name}}, great meeting you at the conference! {{bio}}

Feel free to text or call me anytime.

- {{sender_name}}`,
  },
  {
    id: 'initial-followup-email',
    name: 'Initial Follow-up (Email)',
    type: 'EMAIL',
    subject: 'Great meeting you at the conference!',
    body: `Hi {{name}},

It was great connecting with you at the conference. {{bio}}

I'd love to continue our conversation and see how we might be able to work together.

Feel free to reach out anytime - looking forward to staying in touch!

Best regards,
{{sender_name}}
{{sender_title}}
{{sender_company}}

{{sender_phone}}
{{sender_email}}
{{sender_linkedin}}`,
  },
  {
    id: 'meeting-request-email',
    name: 'Meeting Request (Email)',
    type: 'EMAIL',
    subject: "Let's schedule a meeting",
    body: `Hi {{name}},

Following up on our conversation at the conference - I'd love to schedule some time to dive deeper into how we can work together.

{{bio}}

Are you available for a 30-minute call this week or next? I'm flexible with timing.

Let me know what works best for you!

Best regards,
{{sender_name}}`,
  },
  {
    id: 'checkin-sms',
    name: 'Check-in (SMS)',
    type: 'SMS',
    body: `Hey {{name}}, just wanted to check in and see how things are going. Let me know if there's anything I can help with!

- {{sender_name}}`,
  },
  {
    id: 'resource-share-email',
    name: 'Share Resource (Email)',
    type: 'EMAIL',
    subject: 'Resource I mentioned',
    body: `Hi {{name}},

As promised, here's the resource I mentioned during our conversation:

[Add your link or content here]

Hope you find it valuable. Let me know if you have any questions or if there's anything else I can help with.

Best regards,
{{sender_name}}`,
  },
]

/**
 * Replace template variables with actual values
 */
export function fillTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let filled = template

  // Replace all {{variable}} placeholders
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    filled = filled.replace(regex, value || '')
  })

  return filled.trim()
}

/**
 * Get variables for template filling
 */
export function getTemplateVariables(contactName: string): Record<string, string> {
  return {
    name: contactName,
    bio: getUserBio(),
    sender_name: process.env.NEXT_PUBLIC_DEFAULT_USER_NAME || 'Hayden',
    sender_title: process.env.NEXT_PUBLIC_DEFAULT_USER_TITLE || '',
    sender_company: process.env.NEXT_PUBLIC_DEFAULT_USER_COMPANY || '',
    sender_phone: process.env.NEXT_PUBLIC_DEFAULT_USER_PHONE || '',
    sender_email: process.env.NEXT_PUBLIC_DEFAULT_USER_EMAIL || '',
    sender_linkedin: process.env.NEXT_PUBLIC_DEFAULT_USER_LINKEDIN || '',
  }
}

/**
 * Get a specific template by ID
 */
export function getTemplateById(templateId: string): MessageTemplate | undefined {
  return MESSAGE_TEMPLATES.find((t) => t.id === templateId)
}

/**
 * Get templates filtered by type
 */
export function getTemplatesByType(type: CommunicationType): MessageTemplate[] {
  return MESSAGE_TEMPLATES.filter((t) => t.type === type)
}

