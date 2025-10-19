'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Check, Loader2, Upload } from 'lucide-react'

export default function GetStartedPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    company: '',
    title: '',
    bio: '',
    slug: '',
    password: '',
    photoFile: null as File | null,
  })

  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Load data from localStorage if user just submitted contact form
  useEffect(() => {
    const recentContact = localStorage.getItem('recentContact')
    if (recentContact) {
      const contact = JSON.parse(recentContact)
      setFormData(prev => ({
        ...prev,
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        linkedin: contact.linkedin || '',
        company: contact.company || '',
        title: contact.title || '',
      }))
      // Generate suggested slug from name
      const suggestedSlug = contact.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setFormData(prev => ({ ...prev, slug: suggestedSlug }))
    }
  }, [])

  // Check slug availability
  useEffect(() => {
    if (formData.slug.length < 3) {
      setSlugAvailable(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      setCheckingSlug(true)
      try {
        const response = await fetch(`/api/users/check-slug?slug=${formData.slug}`)
        const data = await response.json()
        setSlugAvailable(data.available)
      } catch (error) {
        console.error('Error checking slug:', error)
      } finally {
        setCheckingSlug(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.slug])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, photoFile: file }))
      const reader = new FileReader()
      reader.onload = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Upload photo first if provided
      let photoUrl = null
      if (formData.photoFile) {
        const photoFormData = new FormData()
        photoFormData.append('photo', formData.photoFile)
        const photoResponse = await fetch('/api/upload/photo', {
          method: 'POST',
          body: photoFormData,
        })
        const photoData = await photoResponse.json()
        if (photoData.success) {
          photoUrl = photoData.data.url
        }
      }

      // Create user account
      const response = await fetch('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          photoUrl,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Clear recent contact from localStorage
        localStorage.removeItem('recentContact')
        
        // Redirect to their new page!
        window.location.href = `/u/${formData.slug}?welcome=true`
      } else {
        alert(data.error?.message || 'Failed to create account')
      }
    } catch (error) {
      console.error('Signup error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl text-center">
            🚀 Get Your Own Contact Exchange Page
          </CardTitle>
          <CardDescription className="text-center">
            Step {step} of 3 - Setup takes 60 seconds
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full ${
                  s <= step ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold">Your Information</h3>
                <p className="text-sm text-muted-foreground">
                  Let's confirm your details
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@company.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>

                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="linkedin.com/in/..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                      placeholder="ACME Inc"
                    />
                  </div>

                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="CEO"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.email}
                className="w-full"
                size="lg"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Customize Profile */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold">Customize Your Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Add a bio and photo to stand out
                </p>
              </div>

              <div>
                <Label htmlFor="bio">Bio (Tell people about yourself) *</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="I'm a passionate entrepreneur building innovative solutions in the tech space..."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <div>
                <Label>Profile Photo</Label>
                <div className="mt-2 flex items-center gap-4">
                  {photoPreview && (
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-purple-200">
                      <Image
                        src={photoPreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <label htmlFor="photo" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Click to upload your headshot
                        </p>
                        <p className="text-xs text-gray-400">
                          JPG, PNG (Max 5MB)
                        </p>
                      </div>
                    </label>
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!formData.bio}
                  className="w-full"
                  size="lg"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Choose Username & Password */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold">Choose Your Page URL</h3>
                <p className="text-sm text-muted-foreground">
                  This will be your unique link to share
                </p>
              </div>

              <div>
                <Label htmlFor="slug">Your Username *</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    contacts.ideanetworks.com/u/
                  </span>
                  <div className="flex-1 relative">
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={e => {
                        const cleaned = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, '')
                        setFormData({ ...formData, slug: cleaned })
                      }}
                      placeholder="john-smith"
                    />
                    {checkingSlug && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                    )}
                    {!checkingSlug && slugAvailable === true && (
                      <Check className="absolute right-3 top-3 h-4 w-4 text-green-600" />
                    )}
                    {!checkingSlug && slugAvailable === false && (
                      <span className="absolute right-3 top-3 text-xs text-red-600">Taken</span>
                    )}
                  </div>
                </div>
                {slugAvailable === true && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Available! Your page will be: /u/{formData.slug}
                  </p>
                )}
                {slugAvailable === false && (
                  <p className="text-xs text-red-600 mt-1">
                    ✗ This username is taken. Try another one.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Create Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  At least 6 characters
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">What You Get:</h4>
                <ul className="space-y-1 text-sm text-purple-800">
                  <li>✓ Your own contact exchange page</li>
                  <li>✓ Collect contacts with selfies</li>
                  <li>✓ Admin dashboard to manage contacts</li>
                  <li>✓ Automatic SMS & email follow-ups</li>
                  <li>✓ 100% free forever</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !formData.slug ||
                    !formData.password ||
                    formData.password.length < 6 ||
                    slugAvailable !== true ||
                    loading
                  }
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Creating Your Page...
                    </>
                  ) : (
                    <>
                      🚀 Create My Page!
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

