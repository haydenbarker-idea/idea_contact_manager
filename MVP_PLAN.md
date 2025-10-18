# Contact Exchange MVP - Conference Ready

## ✅ **Your Confirmed Requirements**

### The Exchange Flow:
1. **Someone scans your QR code** → Lands on your public contact page
2. **They see your info** with quick action buttons:
   - 📥 **Add to Contacts** (downloads vCard)
   - 💬 **Send Text** (opens their SMS app with your number)
   - 🔗 **Connect on LinkedIn** (opens LinkedIn with your profile)
3. **They submit their details** via a quick form
4. **You view their submissions** in your admin dashboard

---

## 🚀 **MVP Feature List (Phase 1 - Conference Ready)**

### Public Features (No login required)
✅ Landing page at `/me` or `/[unique-id]` showing your contact card  
✅ vCard download button (iOS/Android compatible)  
✅ "Send Text" button (opens `sms:` link with pre-filled message)  
✅ "Connect on LinkedIn" button (opens LinkedIn app/web)  
✅ Contact submission form (Name, Email, Phone, LinkedIn, Company, Title)  
✅ Beautiful, mobile-first UI with animations  
✅ QR code display (for them to share back - optional)  

### Admin Features (Password protected)
✅ Dashboard at `/admin` to view all submissions  
✅ Simple password authentication  
✅ Export contacts as CSV  
✅ View submission timestamps  
✅ Add notes to contacts  
✅ Mark contacts as "followed up"  

### Technical Features
✅ PostgreSQL database for contact storage  
✅ Server-side rendering for fast page loads  
✅ Mobile-optimized responsive design  
✅ Rate limiting to prevent spam  
✅ Input validation and sanitization  
✅ SEO meta tags for social sharing  

---

## 📁 **Project Structure**

```
contact-exchange/
├── src/
│   ├── app/
│   │   ├── me/
│   │   │   └── page.tsx              # Your public contact page
│   │   ├── admin/
│   │   │   └── page.tsx              # Admin dashboard
│   │   ├── api/
│   │   │   ├── contacts/
│   │   │   │   ├── submit/route.ts   # Handle contact submissions
│   │   │   │   └── list/route.ts     # List contacts (admin only)
│   │   │   └── vcard/route.ts        # Generate vCard file
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home/redirect
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── contact-card.tsx          # Your contact display
│   │   ├── contact-form.tsx          # Submission form
│   │   └── admin-dashboard.tsx       # Admin interface
│   ├── lib/
│   │   ├── db.ts                     # Prisma client
│   │   ├── vcard.ts                  # vCard generation
│   │   └── utils.ts                  # Utilities
│   └── types/
│       └── index.ts                  # TypeScript types
├── prisma/
│   └── schema.prisma                 # Database schema
├── public/
│   └── logo.png                      # Your logo/avatar
├── .env                              # Environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## 🗄️ **Simplified Database Schema (MVP)**

### Contacts Table
```typescript
model Contact {
  id            String   @id @default(cuid())
  name          String
  email         String
  phone         String?
  linkedin      String?
  company       String?
  title         String?
  notes         String?
  followedUp    Boolean  @default(false)
  submittedAt   DateTime @default(now())
}
```

---

## 🎨 **UI/UX Design (Mobile-First)**

### Public Contact Page (`/me`)
```
┌─────────────────────────────┐
│  [Your Profile Photo/Logo]  │
│                             │
│    Your Name                │
│    Your Title               │
│    Your Company             │
│                             │
│  ┌─────────────────────┐   │
│  │   📥 Add to Contacts│   │ ← Downloads vCard
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │   💬 Send Text       │   │ ← Opens SMS app
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │   🔗 Connect on      │   │ ← Opens LinkedIn
│  │      LinkedIn        │   │
│  └─────────────────────┘   │
│                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━  │
│                             │
│  Share Your Contact Info    │
│                             │
│  [Name Input]               │
│  [Email Input]              │
│  [Phone Input] (optional)   │
│  [LinkedIn] (optional)      │
│  [Company] (optional)       │
│  [Title] (optional)         │
│                             │
│  ┌─────────────────────┐   │
│  │  ✨ Exchange Contacts│   │
│  └─────────────────────┘   │
└─────────────────────────────┘
```

### Success Screen
```
┌─────────────────────────────┐
│                             │
│      ✅                     │
│                             │
│   Contact Shared!           │
│                             │
│   I'll be in touch soon!    │
│                             │
└─────────────────────────────┘
```

### Admin Dashboard (`/admin`)
```
┌─────────────────────────────────────┐
│  Contact Exchange - Admin           │
│  [Logout] [Export CSV]              │
├─────────────────────────────────────┤
│                                     │
│  📊 Total Contacts: 24              │
│  📅 Today: 5                        │
│  ✅ Followed Up: 12                 │
│                                     │
├─────────────────────────────────────┤
│  Recent Submissions:                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ John Smith                  │   │
│  │ john@example.com            │   │
│  │ Senior Developer @ TechCo   │   │
│  │ 2 hours ago                 │   │
│  │ [View] [Mark Followed Up]   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Jane Doe                    │   │
│  │ jane@startup.com            │   │
│  │ CEO @ StartupXYZ            │   │
│  │ 5 hours ago                 │   │
│  │ [View] [Mark Followed Up]   │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔗 **Native Integration Details**

### vCard Download
- Generates `.vcf` file with your info
- iOS: Opens Contacts app, offers to add
- Android: Opens default contacts app

### Send Text (SMS)
- Uses `sms:` URL scheme
- Pre-filled message: "Hi [Your Name], great meeting you! Here's my contact info: [Your Email]"
- Opens in native SMS app (iMessage, Messages, etc.)

### LinkedIn Connection
- Direct link: `https://www.linkedin.com/in/yourprofile`
- Mobile: Opens LinkedIn app if installed
- Desktop: Opens LinkedIn website

---

## ⚡ **Quick Actions Required From You**

1. **Run server setup script** on your Ubuntu VPS
2. **Change PostgreSQL password** after setup
3. **Configure Nginx Proxy Manager** to point domain to app
4. **Update QR code** to point to `https://contacts.ideanetworks.com/me`
5. **Fill in your contact details** in `.env` file
6. **Deploy and test!**

---

## 🎯 **Timeline**

- **Now**: Server setup (30 minutes)
- **Next 2-4 hours**: Build MVP application
- **Test & Deploy**: 30 minutes
- **Total**: ~5 hours from start to conference-ready

---

## 🚀 **Phase 2 Enhancements (After Conference)**

Once MVP is working, we can add:
- 📧 Automated email follow-ups (SendGrid)
- 📱 Automated SMS (Twilio)
- 🤖 LinkedIn OAuth for automated connection requests
- 📊 Analytics dashboard with charts
- 👥 Multi-user support (other team members can use it)
- 🏷️ Tagging and segmentation
- 📅 Calendar integration
- 🔄 CRM integration (HubSpot, Salesforce)

---

## ✅ **Ready to Start?**

Confirm:
1. ✅ Server requirements understood
2. ✅ MVP scope looks good
3. ✅ Exchange flow matches your vision
4. ✅ Ready to run setup script

**Next Steps:**
1. You run `server-setup.sh` on your VPS
2. I'll build the Next.js application
3. We deploy and test
4. You update your QR code
5. You're ready for the conference! 🎉

