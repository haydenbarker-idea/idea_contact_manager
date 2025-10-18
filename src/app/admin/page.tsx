'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/utils'
import type { Contact } from '@/types'
import { toast } from '@/components/ui/use-toast'

export default function AdminPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/contacts/list', {
        headers: {
          Authorization: `Basic ${btoa(':' + password)}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setContacts(data.data.contacts)
        setIsAuthenticated(true)
        localStorage.setItem('adminPassword', password)
      } else {
        toast({
          title: 'Error',
          description: 'Invalid password',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: 'Error',
        description: 'Failed to authenticate',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkFollowedUp = async (contactId: string) => {
    const savedPassword = localStorage.getItem('adminPassword')
    if (!savedPassword) return

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(':' + savedPassword)}`,
        },
        body: JSON.stringify({ followedUp: true }),
      })

      if (response.ok) {
        setContacts(contacts.map(c => 
          c.id === contactId ? { ...c, followedUp: true } : c
        ))
        toast({
          title: 'Success',
          description: 'Contact marked as followed up',
        })
      }
    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update contact',
        variant: 'destructive',
      })
    }
  }

  const handleExportCSV = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Company', 'Title', 'LinkedIn', 'Submitted', 'Followed Up'],
      ...contacts.map(c => [
        c.name,
        c.email,
        c.phone || '',
        c.company || '',
        c.title || '',
        c.linkedin || '',
        new Date(c.submittedAt).toLocaleString(),
        c.followedUp ? 'Yes' : 'No',
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  useEffect(() => {
    // Try to auto-login with saved password
    const savedPassword = localStorage.getItem('adminPassword')
    if (savedPassword) {
      setPassword(savedPassword)
      fetch('/api/contacts/list', {
        headers: {
          Authorization: `Basic ${btoa(':' + savedPassword)}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setContacts(data.data.contacts)
            setIsAuthenticated(true)
          }
        })
        .catch(console.error)
    }
  }, [])

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    )
  }

  const todayCount = contacts.filter(
    c => new Date(c.submittedAt).toDateString() === new Date().toDateString()
  ).length

  const followedUpCount = contacts.filter(c => c.followedUp).length

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Contact Dashboard</h1>
            <p className="text-muted-foreground">Manage your conference connections</p>
          </div>
          <div className="space-x-2">
            <Button onClick={handleExportCSV} variant="outline">
              Export CSV
            </Button>
            <Button
              onClick={() => {
                localStorage.removeItem('adminPassword')
                setIsAuthenticated(false)
              }}
              variant="outline"
            >
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{contacts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Followed Up
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{followedUpCount}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Recent Submissions</h2>
          {contacts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No contacts yet. Share your QR code to get started!
              </CardContent>
            </Card>
          ) : (
            contacts.map((contact) => (
              <Card key={contact.id} className={contact.followedUp ? 'opacity-60' : ''}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold">{contact.name}</h3>
                      <p className="text-muted-foreground">{contact.email}</p>
                      {contact.phone && (
                        <p className="text-sm text-muted-foreground">{contact.phone}</p>
                      )}
                      {contact.company && (
                        <p className="text-sm">
                          {contact.title && `${contact.title} @ `}
                          {contact.company}
                        </p>
                      )}
                      {contact.linkedin && (
                        <a
                          href={contact.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          LinkedIn Profile
                        </a>
                      )}
                      <p className="text-xs text-muted-foreground pt-2">
                        {formatDate(new Date(contact.submittedAt))}
                      </p>
                    </div>
                    <div className="space-x-2">
                      {!contact.followedUp && (
                        <Button
                          onClick={() => handleMarkFollowedUp(contact.id)}
                          variant="outline"
                          size="sm"
                        >
                          Mark Followed Up
                        </Button>
                      )}
                      {contact.followedUp && (
                        <span className="text-sm text-green-600 font-medium">
                          ✓ Followed Up
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  )
}

