interface VCardData {
  name: string
  title?: string
  company?: string
  email: string
  phone?: string
  linkedin?: string
}

export function generateVCard(data: VCardData): string {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.name}`,
    `EMAIL:${data.email}`,
  ]

  if (data.phone) {
    vcard.push(`TEL:${data.phone}`)
  }

  if (data.company) {
    vcard.push(`ORG:${data.company}`)
  }

  if (data.title) {
    vcard.push(`TITLE:${data.title}`)
  }

  if (data.linkedin) {
    vcard.push(`URL:${data.linkedin}`)
  }

  vcard.push('END:VCARD')

  return vcard.join('\r\n')
}

export function getVCardFilename(name: string): string {
  return `${name.replace(/\s+/g, '_')}.vcf`
}

