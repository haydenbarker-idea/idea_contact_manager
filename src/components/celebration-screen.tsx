'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, MessageSquare, Linkedin, Sparkles } from 'lucide-react'
import type { UserProfile } from '@/types'
import Image from 'next/image'

interface CelebrationScreenProps {
  profile: UserProfile
  contactPhoto: string | null
  contactName: string
  contactId: string | null
  contactData: {
    name: string
    email: string
    phone: string
    linkedin: string
    conference: string
  }
}

export function CelebrationScreen({ profile, contactPhoto, contactName, contactId, contactData }: CelebrationScreenProps) {
  const [showFireworks, setShowFireworks] = useState(true)

  useEffect(() => {
    // Hide fireworks after 5 seconds
    const timer = setTimeout(() => setShowFireworks(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleDownloadVCard = async () => {
    try {
      // Fetch the vCard content
      const response = await fetch('/api/vcard')
      if (!response.ok) throw new Error('Failed to download vCard')
      
      // Create a blob from the response
      const blob = await response.blob()
      
      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${profile.name.replace(/\s+/g, '_')}.vcf`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('vCard download error:', error)
    }
  }

  const handleTextMe = () => {
    // Build comprehensive message with contact details
    const firstName = profile.name.split(' ')[0]
    const vcardUrl = contactId 
      ? `${window.location.origin}/api/contacts/${contactId}/vcard`
      : ''
    
    let message = `Hi ${firstName}! Great meeting you at ${contactData.conference}!\n\n`
    message += `Here's my info:\n`
    message += `📛 ${contactData.name}\n`
    message += `📧 ${contactData.email}\n`
    
    if (contactData.phone) {
      message += `📱 ${contactData.phone}\n`
    }
    
    if (contactData.linkedin) {
      message += `💼 ${contactData.linkedin}\n`
    }
    
    if (vcardUrl) {
      message += `\n💾 Save my contact (with photo):\n${vcardUrl}`
    }
    
    const encoded = encodeURIComponent(message)
    window.location.href = `sms:${profile.phone}?body=${encoded}`
  }

  const handleLinkedIn = () => {
    if (profile.linkedin) {
      window.open(profile.linkedin, '_blank')
    }
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 relative">
      {/* Fireworks Effect */}
      {showFireworks && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="fireworks-container">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="firework"
                style={{
                  left: `${20 + i * 15}%`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-8 animate-fade-in">
        <Card className="overflow-hidden border-2 border-primary shadow-2xl">
          <CardContent className="p-8 space-y-8">
            {/* Success Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Sparkles className="h-16 w-16 text-primary animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold">Great Meeting You!</h1>
              <p className="text-xl text-muted-foreground">
                Thanks, {contactName}! Let's stay connected.
              </p>
            </div>

            {/* Photos Side by Side */}
            <div className="flex justify-center items-center gap-8 py-6">
              {/* Contact's Photo */}
              {contactPhoto && (
                <div className="text-center space-y-2">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary/30 shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={contactPhoto}
                      alt={contactName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-medium">{contactName}</p>
                </div>
              )}

              {/* Plus Sign */}
              <div className="text-4xl font-bold text-primary">+</div>

              {/* Hayden's Photo */}
              <div className="text-center space-y-2">
                <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary/30 shadow-xl">
                  <Image
                    src="/images/hayden-headshot.jpg"
                    alt={profile.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="font-medium">{profile.name.split(' ')[0]}</p>
              </div>
            </div>

            {/* My Contact Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-center">
                Save My Contact Info
              </h3>
              
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{profile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title:</span>
                  <span className="font-medium">{profile.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company:</span>
                  <span className="font-medium">{profile.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <a href={`tel:${profile.phone}`} className="font-medium hover:underline">
                    {profile.phone}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <a href={`mailto:${profile.email}`} className="font-medium hover:underline text-right">
                    {profile.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleDownloadVCard}
                size="lg"
                className="w-full text-lg gap-2"
              >
                <Download className="h-5 w-5" />
                Save {profile.name.split(' ')[0]}'s Contact
              </Button>

              <Button
                onClick={handleTextMe}
                variant="outline"
                size="lg"
                className="w-full text-lg gap-2"
              >
                <MessageSquare className="h-5 w-5" />
                Text Me Now
              </Button>

              {profile.linkedin && (
                <Button
                  onClick={handleLinkedIn}
                  variant="outline"
                  size="lg"
                  className="w-full text-lg gap-2"
                >
                  <Linkedin className="h-5 w-5" />
                  Connect on LinkedIn
                </Button>
              )}
            </div>

            {/* Footer Message */}
            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              <p>I'll reach out within 24 hours. Looking forward to connecting!</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        .fireworks-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .firework {
          position: absolute;
          top: 50%;
          width: 4px;
          height: 4px;
          background: transparent;
          animation: firework 2s ease-out;
        }

        @keyframes firework {
          0% {
            transform: translateY(100vh);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh);
            opacity: 0;
          }
        }

        .firework::before,
        .firework::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          box-shadow: 
            0 0 10px 5px #ff0,
            0 0 20px 10px #f0f,
            0 0 30px 15px #0ff,
            -50px -50px 0 5px #ff0,
            50px -50px 0 5px #f0f,
            -50px 50px 0 5px #0ff,
            50px 50px 0 5px #ff0,
            -100px 0 0 7px #f0f,
            100px 0 0 7px #0ff,
            0 -100px 0 7px #ff0,
            0 100px 0 7px #f0f;
          animation: firework-particles 1s ease-out infinite;
        }

        @keyframes firework-particles {
          0% {
            opacity: 1;
            transform: scale(0);
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  )
}

