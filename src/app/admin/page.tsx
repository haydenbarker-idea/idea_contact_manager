'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'
import type { Contact, ContactStatus, MessageTemplate, Communication } from '@/types'
import { toast } from '@/components/ui/use-toast'
import { 
  MessageSquare, 
  Mail, 
  Star, 
  Calendar,
  Eye,
  Edit,
  MapPin,
  Trash2,
} from 'lucide-react'
import Image from 'next/image'

export default function AdminPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Communication dialogs
  const [smsDialog, setSmsDialog] = useState<{ open: boolean; contact: Contact | null }>({ open: false, contact: null })
  const [emailDialog, setEmailDialog] = useState<{ open: boolean; contact: Contact | null }>({ open: false, contact: null })
  const [commHistoryDialog, setCommHistoryDialog] = useState<{ open: boolean; contact: Contact | null }>({ open: false, contact: null })
  const [notesDialog, setNotesDialog] = useState<{ open: boolean; contact: Contact | null }>({ open: false, contact: null })
  
  // Message composition
  const [smsMessage, setSmsMessage] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [communications, setCommunications] = useState<Communication[]>([])
  const [notes, setNotes] = useState('')

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
        setFilteredContacts(data.data.contacts)
        setIsAuthenticated(true)
        localStorage.setItem('adminPassword', password)
        
        // Load templates
        loadTemplates()
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

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.data.templates)
      }
    } catch (error) {
      console.error('Load templates error:', error)
    }
  }

  const getAuthHeaders = () => {
    const savedPassword = localStorage.getItem('adminPassword')
    return {
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(':' + (savedPassword || password))}`,
    }
  }

  const handleUpdateStatus = async (contactId: string, status: ContactStatus, priority?: number) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, priority }),
      })

      if (response.ok) {
        const data = await response.json()
        setContacts(contacts.map(c => 
          c.id === contactId ? data.data.contact : c
        ))
        applyFilters(contacts.map(c => 
          c.id === contactId ? data.data.contact : c
        ))
        toast({
          title: 'Success',
          description: 'Contact updated',
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

  const handleSendSMS = async () => {
    if (!smsDialog.contact) return

    try {
      const response = await fetch('/api/communications/sms', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          contactId: smsDialog.contact.id,
          message: smsMessage,
          templateId: selectedTemplate || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'SMS sent successfully',
        })
        setSmsDialog({ open: false, contact: null })
        setSmsMessage('')
        setSelectedTemplate('')
        // Refresh contacts to update lastContact
        refreshContacts()
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error?.message || 'Failed to send SMS',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Send SMS error:', error)
      toast({
        title: 'Error',
        description: 'Failed to send SMS',
        variant: 'destructive',
      })
    }
  }

  const handleSendEmail = async () => {
    if (!emailDialog.contact) return

    try {
      const response = await fetch('/api/communications/email', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          contactId: emailDialog.contact.id,
          subject: emailSubject,
          message: emailMessage,
          templateId: selectedTemplate || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Email sent successfully',
        })
        setEmailDialog({ open: false, contact: null })
        setEmailSubject('')
        setEmailMessage('')
        setSelectedTemplate('')
        // Refresh contacts to update lastContact
        refreshContacts()
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.error?.message || 'Failed to send email',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Send email error:', error)
      toast({
        title: 'Error',
        description: 'Failed to send email',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteContact = async (contactId: string, contactName: string) => {
    if (!confirm(`Are you sure you want to delete ${contactName}? This action cannot be undone.`)) {
      return
    }

    const savedPassword = localStorage.getItem('adminPassword')
    if (!savedPassword) return

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Basic ${btoa(':' + savedPassword)}`,
        },
      })

      if (response.ok) {
        // Remove from local state
        setContacts(prev => prev.filter(c => c.id !== contactId))
        setFilteredContacts(prev => prev.filter(c => c.id !== contactId))
        
        toast({
          title: 'Success',
          description: `${contactName} has been deleted`,
        })
      } else {
        throw new Error('Failed to delete contact')
      }
    } catch (error) {
      console.error('Delete contact error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete contact',
        variant: 'destructive',
      })
    }
  }

  const handleLoadCommunications = async (contact: Contact) => {
    try {
      const response = await fetch(`/api/contacts/${contact.id}/communications`, {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setCommunications(data.data.communications)
        setCommHistoryDialog({ open: true, contact })
      }
    } catch (error) {
      console.error('Load communications error:', error)
    }
  }

  const handleUpdateNotes = async () => {
    if (!notesDialog.contact) return

    try {
      const response = await fetch(`/api/contacts/${notesDialog.contact.id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes }),
      })

      if (response.ok) {
        const data = await response.json()
        setContacts(contacts.map(c => 
          c.id === notesDialog.contact!.id ? data.data.contact : c
        ))
        toast({
          title: 'Success',
          description: 'Notes updated',
        })
        setNotesDialog({ open: false, contact: null })
        setNotes('')
      }
    } catch (error) {
      console.error('Update notes error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update notes',
        variant: 'destructive',
      })
    }
  }

  const refreshContacts = async () => {
    const savedPassword = localStorage.getItem('adminPassword')
    if (!savedPassword) return

    try {
      const response = await fetch('/api/contacts/list', {
        headers: {
          Authorization: `Basic ${btoa(':' + savedPassword)}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setContacts(data.data.contacts)
        applyFilters(data.data.contacts)
      }
    } catch (error) {
      console.error('Refresh error:', error)
    }
  }

  const applyFilters = (contactList: Contact[]) => {
    let filtered = contactList

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.company?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query)
      )
    }

    setFilteredContacts(filtered)
  }

  const handleTemplateChange = (templateId: string, type: 'sms' | 'email') => {
    setSelectedTemplate(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      if (type === 'sms') {
        setSmsMessage(template.body)
      } else {
        setEmailSubject(template.subject || '')
        setEmailMessage(template.body)
      }
    }
  }

  const handleExportCSV = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Company', 'Title', 'LinkedIn', 'Conference', 'Status', 'Priority', 'Submitted', 'Last Contact', 'Notes', 'Photo URL'],
      ...contacts.map(c => [
        c.name,
        c.email,
        c.phone || '',
        c.company || '',
        c.title || '',
        c.linkedin || '',
        c.conference || '',
        c.status,
        c.priority.toString(),
        new Date(c.submittedAt).toLocaleString(),
        c.lastContact ? new Date(c.lastContact).toLocaleString() : '',
        c.notes || '',
        c.photoUrl || '',
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

  const getDaysSince = (date: Date) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  const getStatusBadge = (status: ContactStatus) => {
    const config = {
      NEW: { label: 'New', className: 'bg-blue-100 text-blue-800' },
      CONTACTED: { label: 'Contacted', className: 'bg-yellow-100 text-yellow-800' },
      RESPONDED: { label: 'Responded', className: 'bg-green-100 text-green-800' },
      MEETING_SET: { label: 'Meeting Set', className: 'bg-purple-100 text-purple-800' },
      CLIENT: { label: 'Client', className: 'bg-emerald-100 text-emerald-800' },
      COLD: { label: 'Cold', className: 'bg-gray-100 text-gray-800' },
    }
    const { label, className } = config[status]
    return <Badge className={className}>{label}</Badge>
  }

  useEffect(() => {
    applyFilters(contacts)
  }, [statusFilter, searchQuery])

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
            setFilteredContacts(data.data.contacts)
            setIsAuthenticated(true)
            loadTemplates()
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

  const statusCounts = {
    ALL: contacts.length,
    NEW: contacts.filter(c => c.status === 'NEW').length,
    CONTACTED: contacts.filter(c => c.status === 'CONTACTED').length,
    RESPONDED: contacts.filter(c => c.status === 'RESPONDED').length,
    MEETING_SET: contacts.filter(c => c.status === 'MEETING_SET').length,
    CLIENT: contacts.filter(c => c.status === 'CLIENT').length,
    COLD: contacts.filter(c => c.status === 'COLD').length,
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Card
              key={status}
              className={`cursor-pointer transition-all ${
                statusFilter === status ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setStatusFilter(status as ContactStatus | 'ALL')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {status.replace('_', ' ')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search contacts by name, email, company, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xl"
          />
        </div>

        {/* Contacts List */}
        <div className="space-y-4">
          {filteredContacts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No contacts found.
              </CardContent>
            </Card>
          ) : (
            filteredContacts.map((contact) => {
              const daysSince = getDaysSince(contact.submittedAt)
              return (
                <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      {/* Contact Photo */}
                      {contact.photoUrl && (
                        <div className="mr-4 flex-shrink-0">
                          <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-primary/20">
                            <Image
                              src={contact.photoUrl}
                              alt={contact.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold">{contact.name}</h3>
                          {getStatusBadge(contact.status)}
                          {contact.priority > 0 && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          <p className="text-muted-foreground">{contact.email}</p>
                          {contact.phone && (
                            <p className="text-muted-foreground">{contact.phone}</p>
                          )}
                          {contact.company && (
                            <p>
                              {contact.title && `${contact.title} @ `}
                              {contact.company}
                            </p>
                          )}
                          {contact.linkedin && (
                            <a
                              href={contact.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              LinkedIn Profile
                            </a>
                          )}
                        </div>

                        {contact.conference && (
                          <p className="text-sm">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {contact.conference}
                          </p>
                        )}

                        {contact.notes && (
                          <p className="text-sm text-muted-foreground italic mt-2">
                            Note: {contact.notes}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Met {daysSince} day{daysSince !== 1 ? 's' : ''} ago
                          </span>
                          {contact.lastContact && (
                            <span>
                              Last contact: {formatDate(new Date(contact.lastContact))}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 ml-4">
                        <Select
                          value={contact.status}
                          onValueChange={(value) => handleUpdateStatus(contact.id, value as ContactStatus)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NEW">New</SelectItem>
                            <SelectItem value="CONTACTED">Contacted</SelectItem>
                            <SelectItem value="RESPONDED">Responded</SelectItem>
                            <SelectItem value="MEETING_SET">Meeting Set</SelectItem>
                            <SelectItem value="CLIENT">Client</SelectItem>
                            <SelectItem value="COLD">Cold</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="flex gap-2">
                          {contact.phone && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSmsDialog({ open: true, contact })
                                setSmsMessage('')
                                setSelectedTemplate('')
                              }}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEmailDialog({ open: true, contact })
                              setEmailSubject('')
                              setEmailMessage('')
                              setSelectedTemplate('')
                            }}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setNotes(contact.notes || '')
                              setNotesDialog({ open: true, contact })
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLoadCommunications(contact)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteContact(contact.id, contact.name)}
                            title="Delete contact"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          size="sm"
                          variant={contact.priority > 0 ? 'default' : 'outline'}
                          onClick={() => handleUpdateStatus(contact.id, contact.status, contact.priority > 0 ? 0 : 1)}
                        >
                          <Star className={`h-4 w-4 ${contact.priority > 0 ? 'fill-white' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* SMS Dialog */}
        <Dialog open={smsDialog.open} onOpenChange={(open) => !open && setSmsDialog({ open: false, contact: null })}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send SMS to {smsDialog.contact?.name}</DialogTitle>
              <DialogDescription>
                Phone: {smsDialog.contact?.phone}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Template (optional)</Label>
                <Select value={selectedTemplate} onValueChange={(value) => handleTemplateChange(value, 'sms')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.filter(t => t.type === 'SMS').map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  rows={6}
                  placeholder="Type your message..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {smsMessage.length} characters
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSmsDialog({ open: false, contact: null })}>
                Cancel
              </Button>
              <Button onClick={handleSendSMS} disabled={!smsMessage}>
                Send SMS
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Email Dialog */}
        <Dialog open={emailDialog.open} onOpenChange={(open) => !open && setEmailDialog({ open: false, contact: null })}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Email to {emailDialog.contact?.name}</DialogTitle>
              <DialogDescription>
                Email: {emailDialog.contact?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Template (optional)</Label>
                <Select value={selectedTemplate} onValueChange={(value) => handleTemplateChange(value, 'email')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.filter(t => t.type === 'EMAIL').map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subject</Label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject..."
                />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={10}
                  placeholder="Type your message..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEmailDialog({ open: false, contact: null })}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} disabled={!emailSubject || !emailMessage}>
                Send Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Communication History Dialog */}
        <Dialog open={commHistoryDialog.open} onOpenChange={(open) => !open && setCommHistoryDialog({ open: false, contact: null })}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Communication History - {commHistoryDialog.contact?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {communications.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No communication history yet.</p>
              ) : (
                communications.map((comm) => (
                  <Card key={comm.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge>{comm.type}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(new Date(comm.sentAt))}
                            </span>
                          </div>
                          {comm.subject && (
                            <p className="font-semibold">{comm.subject}</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{comm.message}</p>
                        </div>
                        <Badge variant={comm.status === 'SENT' ? 'default' : 'secondary'}>
                          {comm.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Notes Dialog */}
        <Dialog open={notesDialog.open} onOpenChange={(open) => !open && setNotesDialog({ open: false, contact: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Notes - {notesDialog.contact?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={8}
                placeholder="Add notes about this contact..."
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNotesDialog({ open: false, contact: null })}>
                Cancel
              </Button>
              <Button onClick={handleUpdateNotes}>
                Save Notes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
