'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelfieCapture } from '@/components/selfie-capture'
import { CelebrationScreen } from '@/components/celebration-screen'
import { toast } from '@/components/ui/use-toast'
import { Phone, Mail, Linkedin, MapPin } from 'lucide-react'
import type { UserProfile } from '@/types'
import Image from 'next/image'

interface ContactExchangeFlowProps {
  profile: UserProfile
  userId?: string  // Optional: for multi-tenant support
}

type FlowStep = 'landing' | 'selfie' | 'form' | 'success'

export function ContactExchangeFlow({ profile, userId }: ContactExchangeFlowProps) {
  const [step, setStep] = useState<FlowStep>('landing')
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    conference: '',
  })
  const [contactId, setContactId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSelfieCapture = async (blob: Blob) => {
    setPhotoBlob(blob)
    
    // Upload photo immediately
    try {
      const formData = new FormData()
      formData.append('photo', blob, 'selfie.jpg')
      
      const response = await fetch('/api/upload/photo', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const data = await response.json()
        setPhotoUrl(data.data.url)
        setStep('form')
      } else {
        toast({
          title: 'Error',
          description: 'Failed to upload photo. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Photo upload error:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload photo',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contacts/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          photoUrl,
          userId, // Include userId if provided (multi-tenant)
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setContactId(result.data.contactId)
        
        // Save contact info AND selfie to localStorage for "I Want This!" flow
        localStorage.setItem('recentContact', JSON.stringify({
          ...formData,
          photoUrl, // Include the selfie they just took!
        }))
        
        setStep('success')
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error?.message || 'Failed to submit contact info',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit contact info',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 'success') {
    return (
      <CelebrationScreen 
        profile={profile} 
        contactPhoto={photoUrl} 
        contactName={formData.name}
        contactId={contactId}
        contactData={formData}
      />
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      {step === 'landing' && (
        <div className="space-y-8 animate-fade-in">
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Profile Photo */}
                <div className="relative w-40 h-40 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-xl">
                  <Image
                    src={profile.photoUrl || profile.avatar || '/images/hayden-headshot.jpg'}
                    alt={profile.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Name & Title */}
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold">{profile.name}</h1>
                  <p className="text-xl text-muted-foreground">{profile.title}</p>
                  <p className="text-lg font-medium text-primary">{profile.company}</p>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-lg text-muted-foreground max-w-md">
                    {profile.bio}
                  </p>
                )}

                {/* Contact Info */}
                <div className="grid gap-3 w-full max-w-md text-left">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-5 w-5 text-primary" />
                    <a href={`tel:${profile.phone}`} className="hover:underline">
                      {profile.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-5 w-5 text-primary" />
                    <a href={`mailto:${profile.email}`} className="hover:underline">
                      {profile.email}
                    </a>
                  </div>
                  {profile.linkedin && (
                    <div className="flex items-center gap-3 text-sm">
                      <Linkedin className="h-5 w-5 text-primary" />
                      <a
                        href={profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>

                {/* Big CTA */}
                <Button
                  onClick={() => setStep('selfie')}
                  size="lg"
                  className="w-full max-w-md text-lg py-6 mt-4"
                >
                  Connect with {profile.name.split(' ')[0]}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'selfie' && (
        <div className="animate-fade-in">
          <SelfieCapture
            onCapture={handleSelfieCapture}
            onSkip={() => setStep('form')}
          />
        </div>
      )}

      {step === 'form' && (
        <Card className="animate-fade-in">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Let's Stay Connected!</h2>
                <p className="text-muted-foreground">
                  Share your details so I can follow up
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    placeholder="john@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedin: e.target.value })
                    }
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional - Opens your LinkedIn app to copy your profile URL
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conference">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Conference/Event *
                  </Label>
                  <Input
                    id="conference"
                    value={formData.conference}
                    onChange={(e) =>
                      setFormData({ ...formData, conference: e.target.value })
                    }
                    required
                    placeholder="Tech Summit 2025"
                  />
                  <p className="text-xs text-muted-foreground">
                    Where are we meeting today?
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Exchange Contact Info'}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

