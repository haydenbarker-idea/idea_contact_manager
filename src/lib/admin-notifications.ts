import { sendSMS } from './twilio'

const ADMIN_PHONE = process.env.NEXT_PUBLIC_DEFAULT_USER_PHONE || '+16476242735'

/**
 * Send notification to admin when a new user signs up
 */
export async function notifyAdminNewUser(user: {
  name: string
  email: string
  slug: string
  phone?: string | null
  company?: string | null
}) {
  try {
    const message = `🎉 NEW USER SIGNUP!\n\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone || 'Not provided'}\nCompany: ${user.company || 'Not provided'}\nProfile: ${process.env.NEXT_PUBLIC_APP_URL || 'https://saas.contacts.ideanetworks.com'}/u/${user.slug}\n\nThey can now collect contacts!`

    const result = await sendSMS({
      to: ADMIN_PHONE,
      message,
    })

    if (result.success) {
      console.log('[ADMIN NOTIFY] New user signup notification sent:', user.email)
    } else {
      console.error('[ADMIN NOTIFY] Failed to send signup notification:', result.error)
    }

    return result
  } catch (error) {
    console.error('[ADMIN NOTIFY] Error sending signup notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}

/**
 * Send notification to admin when someone submits a contact
 */
export async function notifyAdminNewContact(contact: {
  name: string
  email: string
  phone?: string | null
  company?: string | null
  ownerName?: string
  ownerSlug?: string
}) {
  try {
    const connectionText = contact.ownerName
      ? `${contact.name} connected with ${contact.ownerName}`
      : `${contact.name} submitted contact`

    const message = `🤝 NEW CONNECTION!\n\n${connectionText}\n\nContact Info:\nName: ${contact.name}\nEmail: ${contact.email}\nPhone: ${contact.phone || 'Not provided'}\nCompany: ${contact.company || 'Not provided'}${
      contact.ownerName
        ? `\n\nCollected by: ${contact.ownerName}\nProfile: ${process.env.NEXT_PUBLIC_APP_URL || 'https://saas.contacts.ideanetworks.com'}/u/${contact.ownerSlug}`
        : ''
    }`

    const result = await sendSMS({
      to: ADMIN_PHONE,
      message,
    })

    if (result.success) {
      console.log(
        '[ADMIN NOTIFY] New contact notification sent:',
        contact.name,
        contact.ownerName ? `-> ${contact.ownerName}` : ''
      )
    } else {
      console.error('[ADMIN NOTIFY] Failed to send contact notification:', result.error)
    }

    return result
  } catch (error) {
    console.error('[ADMIN NOTIFY] Error sending contact notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}

/**
 * Check if admin notifications are enabled (Twilio configured)
 */
export function areAdminNotificationsEnabled(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER &&
    process.env.NEXT_PUBLIC_DEFAULT_USER_PHONE
  )
}

