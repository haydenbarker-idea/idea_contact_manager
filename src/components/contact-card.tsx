'use client'

import { Download, MessageSquare, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { UserProfile } from '@/types'

interface ContactCardProps {
  profile: UserProfile
}

export function ContactCard({ profile }: ContactCardProps) {
  const handleDownloadVCard = () => {
    window.location.href = '/api/vcard'
  }

  const handleSendText = () => {
    const message = `Hi ${profile.name}, great meeting you! Here's my contact info: ${profile.email}`
    window.location.href = `sms:${profile.phone}${/iPhone|iPad|iPod/i.test(navigator.userAgent) ? '&' : '?'}body=${encodeURIComponent(message)}`
  }

  const handleLinkedIn = () => {
    window.open(profile.linkedin, '_blank', 'noopener,noreferrer')
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          {profile.avatar && (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
          )}
          <h1 className="text-3xl font-bold mb-1">{profile.name}</h1>
          <p className="text-lg text-muted-foreground mb-1">{profile.title}</p>
          <p className="text-md text-muted-foreground">{profile.company}</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleDownloadVCard}
            className="w-full"
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Add to Contacts
          </Button>

          <Button
            onClick={handleSendText}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Send Text
          </Button>

          <Button
            onClick={handleLinkedIn}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Linkedin className="mr-2 h-5 w-5" />
            Connect on LinkedIn
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground space-y-1">
          <p>{profile.email}</p>
          <p>{profile.phone}</p>
        </div>
      </CardContent>
    </Card>
  )
}

