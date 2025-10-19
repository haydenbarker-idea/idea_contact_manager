'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { ArrowLeft, Loader2, Upload, Camera, Save } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  title: string | null
  linkedin: string | null
  bio: string | null
  photoUrl: string | null
  slug: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    linkedin: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      // Check session
      const sessionResponse = await fetch('/api/auth/session')
      const sessionData = await sessionResponse.json()

      if (!sessionData.success) {
        router.push('/login')
        return
      }

      // Load full user profile
      const profileResponse = await fetch('/api/users/me')
      const profileData = await profileResponse.json()

      if (profileData.success) {
        const userData = profileData.data
        setUser(userData)
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          company: userData.company || '',
          title: userData.title || '',
          linkedin: userData.linkedin || '',
          bio: userData.bio || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setPhotoPreview(userData.photoUrl)
      }
    } catch (error) {
      console.error('Profile load error:', error)
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Validation
      if (!formData.name || !formData.email) {
        toast({
          title: 'Validation Error',
          description: 'Name and email are required',
          variant: 'destructive',
        })
        setSaving(false)
        return
      }

      // Password validation if changing password
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          toast({
            title: 'Validation Error',
            description: 'Current password required to change password',
            variant: 'destructive',
          })
          setSaving(false)
          return
        }
        if (formData.newPassword !== formData.confirmPassword) {
          toast({
            title: 'Validation Error',
            description: 'New passwords do not match',
            variant: 'destructive',
          })
          setSaving(false)
          return
        }
        if (formData.newPassword.length < 6) {
          toast({
            title: 'Validation Error',
            description: 'New password must be at least 6 characters',
            variant: 'destructive',
          })
          setSaving(false)
          return
        }
      }

      // Upload photo if changed
      let photoUrl = photoPreview
      if (photoFile) {
        const photoFormData = new FormData()
        photoFormData.append('photo', photoFile)
        const photoResponse = await fetch('/api/upload/photo', {
          method: 'POST',
          body: photoFormData,
        })
        const photoData = await photoResponse.json()
        if (photoData.success) {
          photoUrl = photoData.data.url
        }
      }

      // Update profile
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        title: formData.title || null,
        linkedin: formData.linkedin || null,
        bio: formData.bio || null,
        photoUrl,
      }

      // Include password change if provided
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: '✓ Profile Updated',
          description: 'Your changes have been saved successfully',
        })

        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }))

        // Reload profile
        await loadProfile()
      } else {
        toast({
          title: 'Update Failed',
          description: data.error?.message || 'Failed to update profile',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while saving',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Profile Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Photo */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
            <CardDescription>Update your profile picture</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {photoPreview ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-purple-200">
                  <Image
                    src={photoPreview}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1 space-y-3">
                <p className="text-sm text-muted-foreground">Choose how to update your photo:</p>
                <div className="grid grid-cols-2 gap-3">
                  <label htmlFor="photo-camera" className="cursor-pointer">
                    <div className="border-2 border-gray-300 rounded-lg p-3 text-center hover:border-purple-400 hover:bg-purple-50 transition">
                      <Camera className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                      <p className="text-sm font-medium text-gray-700">
                        Take Photo
                      </p>
                    </div>
                  </label>
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="border-2 border-gray-300 rounded-lg p-3 text-center hover:border-purple-400 hover:bg-purple-50 transition">
                      <Upload className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                      <p className="text-sm font-medium text-gray-700">
                        Upload Photo
                      </p>
                    </div>
                  </label>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  JPG, PNG (Max 5MB)
                </p>
                <input
                  id="photo-camera"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
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
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
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

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell people about yourself..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password (leave blank to keep current password)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Password must be at least 6 characters long
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

