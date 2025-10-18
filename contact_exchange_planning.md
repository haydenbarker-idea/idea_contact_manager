# Contact Exchange App - Planning Document
## Domain: contacts.ideanetworks.com

---

## 🎯 Project Overview

A modern, impressive contact exchange application that enables seamless business card swapping via QR codes at conferences. The app will handle the complete contact exchange flow and automate follow-up interactions across multiple channels.

---

## 🏗️ Technical Architecture

### Stack
- **Frontend**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + Zustand (for complex state)
- **QR Generation**: qrcode.react or qr-code-styling
- **Database**: PostgreSQL (via Supabase or similar)
- **Authentication**: NextAuth.js or Clerk
- **API Routes**: Next.js API routes
- **Deployment**: Docker container (for nginx proxy manager compatibility)

### Infrastructure
- **Reverse Proxy**: Nginx Proxy Manager
- **Domain**: contacts.ideanetworks.com
- **SSL**: Managed by Nginx Proxy Manager
- **Port**: Internal app runs on configurable port (default 3000)

---

## 📱 Core Features - Phase 1 (MVP)

### 1. QR Code Generation & Display
- Generate unique QR code containing vCard data
- Display QR code in full-screen mode for scanning
- Include branding/logo overlay on QR code
- Real-time QR code regeneration on profile updates

### 2. QR Code Scanning
- Camera access for scanning
- Parse vCard data from scanned QR codes
- Validate and sanitize incoming data
- Handle scan errors gracefully

### 3. Contact Exchange Flow
**Option A: Scan Their QR Code**
1. User opens camera
2. Scans contact's QR code
3. System automatically exchanges vCards
4. Confirmation screen with contact preview
5. Save to local contacts + app database

**Option B: They Scan Your QR Code**
1. Display your QR code
2. They scan and receive your vCard
3. Prompt them to enter their info OR share their QR
4. Complete the exchange
5. Save their contact

**Option C: Manual Entry**
1. Skip QR scanning
2. Manual form entry for contact details
3. Complete exchange
4. Generate follow-up sequence

### 4. vCard Management
- Create vCard (VCF) files
- Parse incoming vCard data
- Export contacts as .vcf files
- Support vCard 3.0 standard
- Fields: Name, Title, Company, Email, Phone, LinkedIn URL

---

## 🚀 Core Features - Phase 2 (Automation)

### 1. Multi-Channel Follow-Up System

#### Immediate Actions (Within 1 hour)
- **Email**: Send personalized "Nice to meet you" email
- **SMS**: Optional text message with contact card link
- **LinkedIn**: Generate LinkedIn connection request URL

#### Follow-Up Sequence (Configurable Timeline)
- **Day 1**: Initial follow-up email
- **Day 3**: Value-add content share (article, resource)
- **Day 7**: Check-in message
- **Day 14**: Offer for meeting/call
- **Day 30**: Long-term nurture touchpoint

### 2. LinkedIn Integration
- OAuth integration with LinkedIn API
- Auto-send connection requests with custom note
- Include mutual connections context
- Track connection status

### 3. Email Automation
- Template library for different scenarios
- Personalization tokens (name, company, meeting context)
- Tracking: Opens, clicks, replies
- Integration with SendGrid, Resend, or similar

### 4. SMS Integration
- Twilio integration for SMS
- Opt-in/opt-out management
- Short link generation for contact card
- Compliance with SMS regulations

---

## 📊 Database Schema

### Users Table
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  title: string;
  company: string;
  phone: string;
  linkedinUrl: string;
  avatarUrl?: string;
  qrCodeId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Contacts Table
```typescript
interface Contact {
  id: string;
  userId: string; // Owner of this contact
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactLinkedin?: string;
  contactCompany?: string;
  contactTitle?: string;
  metAt?: string; // Event/location
  exchangeMethod: 'qr_scan' | 'manual' | 'received';
  exchangedAt: Date;
  tags?: string[];
  notes?: string;
  followUpStatus: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
}
```

### FollowUpActions Table
```typescript
interface FollowUpAction {
  id: string;
  contactId: string;
  actionType: 'email' | 'sms' | 'linkedin' | 'manual';
  scheduledFor: Date;
  completedAt?: Date;
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  content?: string;
  templateId?: string;
  metadata?: Record<string, any>;
}
```

### Templates Table
```typescript
interface Template {
  id: string;
  userId: string;
  name: string;
  type: 'email' | 'sms';
  subject?: string; // For emails
  content: string;
  variables: string[]; // e.g., ['name', 'company']
  isDefault: boolean;
  createdAt: Date;
}
```

---

## 🎨 UI/UX Flow

### Home Screen
- Large "Show My QR" button
- "Scan Contact QR" button
- "Add Contact Manually" button
- Quick stats: Total contacts, Recent exchanges
- Settings icon (profile management)

### QR Display Screen
- Full-screen QR code
- Animated border/glow effect
- "Download vCard" button
- Instruction text: "Have them scan this code"
- Timer/session indicator (optional)

### Scanner Screen
- Live camera feed
- QR target overlay
- Auto-detect and scan
- Flashlight toggle
- Switch camera button

### Exchange Confirmation
- Split-screen showing both contacts
- Animated card flip/exchange animation
- Preview of data being exchanged
- "Confirm Exchange" button
- "Add Note" field
- "Tag Contact" options

### Success Screen
- Checkmark animation
- Contact saved confirmation
- Preview of follow-up sequence
- "Customize Follow-Up" button
- "View Contact" button
- "Exchange Another" button

---

## 🔧 Key Technical Requirements

### TypeScript Interfaces
```typescript
// Core types
type ExchangeMethod = 'qr_scan' | 'manual' | 'received';
type ActionType = 'email' | 'sms' | 'linkedin' | 'manual';
type ActionStatus = 'scheduled' | 'sent' | 'failed' | 'cancelled';

interface VCard {
  version: string;
  formattedName: string;
  organization?: string;
  title?: string;
  telephone?: string;
  email?: string;
  url?: string;
}

interface ExchangeEvent {
  timestamp: Date;
  method: ExchangeMethod;
  location?: string;
  notes?: string;
}
```

### API Endpoints
```
POST   /api/contacts/exchange          - Exchange contacts
GET    /api/contacts                   - List all contacts
GET    /api/contacts/:id               - Get single contact
PUT    /api/contacts/:id               - Update contact
DELETE /api/contacts/:id               - Delete contact
POST   /api/contacts/:id/notes         - Add note
POST   /api/contacts/:id/tags          - Add tags

POST   /api/followup/schedule          - Schedule follow-up
GET    /api/followup/:contactId        - Get follow-up sequence
PUT    /api/followup/:id               - Update follow-up action
POST   /api/followup/:id/send-now      - Send immediately

GET    /api/user/profile               - Get user profile
PUT    /api/user/profile               - Update profile
GET    /api/user/vcard                 - Get vCard data
GET    /api/user/qr                    - Get QR code

POST   /api/integrations/linkedin      - LinkedIn OAuth
POST   /api/integrations/email         - Email setup
POST   /api/integrations/sms           - SMS setup
```

### Environment Variables
```bash
# App
NEXT_PUBLIC_APP_URL=https://contacts.ideanetworks.com
NODE_ENV=production

# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://contacts.ideanetworks.com

# Email
SENDGRID_API_KEY=...
EMAIL_FROM=contact@ideanetworks.com

# SMS
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# LinkedIn
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
LINKEDIN_REDIRECT_URI=https://contacts.ideanetworks.com/api/auth/linkedin/callback
```

---

## 🚦 Development Phases

### Phase 1: Core Exchange (Week 1-2)
- [ ] Project setup with Next.js + TypeScript
- [ ] Database schema and migrations
- [ ] User authentication
- [ ] Profile management
- [ ] QR code generation and display
- [ ] QR code scanning functionality
- [ ] Basic vCard exchange flow
- [ ] Contact storage

### Phase 2: Enhanced UX (Week 3)
- [ ] Polished UI with animations
- [ ] Manual contact entry
- [ ] Contact list with search/filter
- [ ] Export contacts functionality
- [ ] Notes and tags system
- [ ] Mobile responsive design

### Phase 3: Automation Setup (Week 4)
- [ ] Email integration
- [ ] SMS integration
- [ ] LinkedIn API integration
- [ ] Template system
- [ ] Follow-up sequence builder

### Phase 4: Smart Follow-Ups (Week 5-6)
- [ ] Automated follow-up scheduling
- [ ] Multi-channel orchestration
- [ ] Tracking and analytics
- [ ] A/B testing for templates
- [ ] Reporting dashboard

### Phase 5: Polish & Deploy (Week 7)
- [ ] Error handling and edge cases
- [ ] Performance optimization
- [ ] Security audit
- [ ] Docker containerization
- [ ] Nginx proxy configuration
- [ ] SSL setup
- [ ] Production deployment

---

## 🔒 Security Considerations

- Input sanitization for all contact data
- Rate limiting on API endpoints
- CSRF protection
- XSS prevention
- Secure vCard parsing
- Phone number validation
- Email validation
- LinkedIn URL validation
- Opt-out mechanism for all communications
- GDPR compliance for data storage
- Encrypted database fields for sensitive data

---

## 📈 Success Metrics

- Exchange completion rate
- Average exchange time
- Follow-up engagement rate (opens, clicks, replies)
- LinkedIn connection acceptance rate
- User retention (daily/weekly active users)
- Number of contacts per user
- API response times
- Error rates

---

## 🎯 Future Enhancements

- Calendar integration for meeting scheduling
- AI-powered personalization of messages
- CRM integration (Salesforce, HubSpot)
- Analytics dashboard for networking insights
- Team/enterprise features
- Event-specific landing pages
- NFC card support (Apple Wallet, Google Wallet)
- WhatsApp integration
- Conference badge integration
- Bulk contact import/export
- Advanced search and segmentation
- Zapier integration for custom workflows

---

## 📝 Notes

- Keep the initial exchange flow under 10 seconds
- Prioritize mobile experience (most scanning happens on mobile)
- Ensure offline functionality for basic QR display
- Test extensively on different phone cameras
- Consider poor lighting conditions for QR scanning
- Plan for graceful degradation if integrations fail
- Build with rate limits in mind for all external APIs