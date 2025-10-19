'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import {
  LogOut,
  Users,
  Download,
  Mail,
  Phone,
  Linkedin,
  Building2,
  Calendar,
  QrCode,
  ExternalLink,
  Loader2,
  FileDown,
} from 'lucide-react'

interface Contact {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  title: string | null
  linkedin: string | null
  bio: string | null
  photoUrl: string | null
  submittedAt: string
  status: string
}

interface SessionUser {
  id: string
  name: string
  email: string
  slug: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [analytics, setAnalytics] = useState({ totalContacts: 0, recentContacts: 0 })
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      // Check session
      const sessionResponse = await fetch('/api/auth/session')
      const sessionData = await sessionResponse.json()

      if (!sessionData.success) {
        router.push('/login')
        return
      }

      setUser(sessionData.data.user)

      // Load contacts
      const contactsResponse = await fetch('/api/me/contacts')
      const contactsData = await contactsResponse.json()

      if (contactsData.success) {
        setContacts(contactsData.data.contacts)
        setAnalytics(contactsData.data.analytics)
      }
    } catch (error) {
      console.error('Dashboard load error:', error)
      toast({
        title: 'Error',
        description: 'Failed to load dashboard',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleExportCSV = () => {
    setExporting(true)
    try {
      // Create CSV content
      const headers = ['Name', 'Email', 'Phone', 'Company', 'Title', 'LinkedIn', 'Submitted At']
      const rows = contacts.map(c => [
        c.name,
        c.email,
        c.phone || '',
        c.company || '',
        c.title || '',
        c.linkedin || '',
        new Date(c.submittedAt).toLocaleString(),
      ])

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n')

      // Download
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `contacts-${user?.slug}-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: '✓ Export Successful',
        description: `Exported ${contacts.length} contacts to CSV`,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Export Failed',
        description: 'Failed to export contacts',
        variant: 'destructive',
      })
    } finally {
      setExporting(false)
    }
  }

  const handleDownloadVCard = async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}/vcard`)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `contact-${contactId}.vcf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('VCard download error:', error)
      toast({
        title: 'Download Failed',
        description: 'Failed to download vCard',
        variant: 'destructive',
      })
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

  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/u/${user.slug}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user.name}!</p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <QrCode className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Your QR Code Page</h3>
                  <p className="text-sm text-muted-foreground">Show this at conferences</p>
                </div>
                <Button onClick={() => window.open(`/u/${user.slug}/qr`, '_blank')} variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <ExternalLink className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Your Profile Page</h3>
                  <p className="text-sm text-muted-foreground">/u/{user.slug}</p>
                </div>
                <Button onClick={() => window.open(profileUrl, '_blank')} variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Total Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.totalContacts}</div>
              <p className="text-sm text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Recent Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.recentContacts}</div>
              <p className="text-sm text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Contacts List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Contacts</CardTitle>
                <CardDescription>People who have connected with you</CardDescription>
              </div>
              {contacts.length > 0 && (
                <Button onClick={handleExportCSV} disabled={exporting} variant="outline">
                  {exporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4 mr-2" />
                  )}
                  Export CSV
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No contacts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Share your QR code at conferences to start collecting contacts!
                </p>
                <Button onClick={() => window.open(`/u/${user.slug}/qr`, '_blank')}>
                  <QrCode className="h-4 w-4 mr-2" />
                  View My QR Code
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.map(contact => (
                  <div
                    key={contact.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start gap-4">
                      {contact.photoUrl && (
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                          <Image
                            src={contact.photoUrl}
                            alt={contact.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-semibold text-lg">{contact.name}</h4>
                            {(contact.title || contact.company) && (
                              <p className="text-sm text-muted-foreground">
                                {contact.title}
                                {contact.title && contact.company && ' at '}
                                {contact.company}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline">
                            {new Date(contact.submittedAt).toLocaleDateString()}
                          </Badge>
                        </div>

                        <div className="space-y-1 mb-3">
                          {contact.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <a href={`mailto:${contact.email}`} className="hover:underline">
                                {contact.email}
                              </a>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <a href={`tel:${contact.phone}`} className="hover:underline">
                                {contact.phone}
                              </a>
                            </div>
                          )}
                          {contact.linkedin && (
                            <div className="flex items-center gap-2 text-sm">
                              <Linkedin className="h-4 w-4 text-gray-400" />
                              <a
                                href={contact.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                LinkedIn Profile
                              </a>
                            </div>
                          )}
                        </div>

                        {contact.bio && (
                          <p className="text-sm text-muted-foreground mb-3">{contact.bio}</p>
                        )}

                        <Button
                          onClick={() => handleDownloadVCard(contact.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download vCard
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

