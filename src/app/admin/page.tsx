'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Trash2, Eye, Users, Mail, Phone, Calendar, BarChart3, Search, RefreshCw } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface User {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  title: string | null
  slug: string
  active: boolean
  createdAt: string
  contactCount: number
}

interface Contact {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  title: string | null
  linkedin: string | null
  status: string
  submittedAt: string
  photoUrl: string | null
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Basic ${btoa(`:${password}`)}`,
        },
      })

      if (response.status === 401) {
        setIsAuthenticated(false)
        toast({
          title: 'Authentication Required',
          description: 'Please enter admin password',
          variant: 'destructive',
        })
        return
      }

      const data = await response.json()
      if (data.success) {
        setUsers(data.data)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await loadUsers()
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Delete user "${userName}"? This will also delete all their contacts.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Basic ${btoa(`:${password}`)}`,
        },
      })

        const data = await response.json()
      if (data.success) {
        toast({
          title: 'User Deleted',
          description: `${userName} has been deleted`,
        })
        setUsers(users.filter(u => u.id !== userId))
        if (selectedUser?.id === userId) {
          setSelectedUser(null)
          setContacts([])
        }
      } else {
        toast({
          title: 'Error',
          description: data.error?.message || 'Failed to delete user',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      })
    }
  }

  const handleViewContacts = async (user: User) => {
    setSelectedUser(user)
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/users/${user.id}/contacts`, {
        headers: {
          Authorization: `Basic ${btoa(`:${password}`)}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setContacts(data.data.contacts)
      } else {
      toast({
        title: 'Error',
          description: 'Failed to load contacts',
        variant: 'destructive',
      })
      }
    } catch (error) {
      console.error('Failed to load contacts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load contacts',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalContacts = users.reduce((sum, user) => sum + user.contactCount, 0)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">🔐 Admin Login</CardTitle>
            <CardDescription>Enter admin password to access dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Admin Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Authenticating...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users and view analytics</p>
          </div>
          <Button onClick={() => loadUsers()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
            </Button>
          </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
        </div>
              </CardContent>
            </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
                  <p className="text-3xl font-bold">{totalContacts}</p>
        </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
        </div>
              </CardContent>
            </Card>

          <Card>
                  <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Contacts/User</p>
                  <p className="text-3xl font-bold">
                    {users.length > 0 ? (totalContacts / users.length).toFixed(1) : '0'}
                  </p>
                          </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
                        </div>
            </CardContent>
          </Card>
                        </div>
                        
        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage all registered users</CardDescription>
            <div className="flex items-center gap-2 mt-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{user.name}</h3>
                      <Badge variant={user.active ? 'default' : 'secondary'}>
                        {user.active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{user.contactCount} contacts</Badge>
                        </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </span>
                      {user.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </span>
                      )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                        {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Profile: /u/{user.slug}
                    </div>
                    {user.company && user.title && (
                      <div className="text-sm">
                        {user.title} at {user.company}
                      </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                      onClick={() => handleViewContacts(user)}
                              variant="outline"
                            size="sm"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Contacts
                          </Button>
                          <Button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No users found
                      </div>
              )}
                    </div>
                  </CardContent>
                </Card>

        {/* Contacts View */}
        {selectedUser && (
          <Card>
            <CardHeader>
              <CardTitle>Contacts for {selectedUser.name}</CardTitle>
              <CardDescription>
                {contacts.length} contact{contacts.length !== 1 ? 's' : ''} collected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    {contact.photoUrl && (
                      <img
                        src={contact.photoUrl}
                        alt={contact.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{contact.name}</h4>
                        <Badge variant="outline">{contact.status}</Badge>
        </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>{contact.email}</div>
                        {contact.phone && <div>{contact.phone}</div>}
                        {contact.company && contact.title && (
                          <div>{contact.title} at {contact.company}</div>
                        )}
                        <div className="text-xs">
                          Submitted: {new Date(contact.submittedAt).toLocaleString()}
              </div>
            </div>
              </div>
            </div>
                ))}
                {contacts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No contacts yet
                          </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
              )}
            </div>
      </div>
  )
}
