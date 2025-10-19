import { readFileSync } from 'fs'
import { join } from 'path'

interface VCardData {
  name: string
  title?: string
  company?: string
  email: string
  phone?: string
  linkedin?: string
  photoPath?: string
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

  // Embed photo if provided
  if (data.photoPath) {
    try {
      // Handle both regular and standalone deployment
      let fullPath = join(process.cwd(), 'public', data.photoPath)
      
      // Try standalone path first (production)
      const standalonePath = join(process.cwd(), '.next', 'standalone', 'public', data.photoPath)
      const { existsSync } = require('fs')
      
      if (existsSync(standalonePath)) {
        fullPath = standalonePath
      } else if (!existsSync(fullPath)) {
        // Photo doesn't exist in either location
        throw new Error(`Photo not found: ${data.photoPath}`)
      }
      
      const photoData = readFileSync(fullPath)
      const base64Photo = photoData.toString('base64')
      
      // Split base64 into chunks of 75 characters (vCard spec)
      const chunks = base64Photo.match(/.{1,75}/g) || []
      
      vcard.push('PHOTO;ENCODING=b;TYPE=JPEG:')
      chunks.forEach((chunk, index) => {
        if (index === 0) {
          vcard[vcard.length - 1] += chunk
        } else {
          vcard.push(' ' + chunk)
        }
      })
    } catch (error) {
      console.error('Failed to embed photo in vCard:', error)
      // Continue without photo if there's an error
    }
  }

  vcard.push('END:VCARD')

  return vcard.join('\r\n')
}

export function getVCardFilename(name: string): string {
  return `${name.replace(/\s+/g, '_')}.vcf`
}
