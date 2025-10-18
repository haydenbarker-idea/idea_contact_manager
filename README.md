# Contact Exchange App

A modern, professional contact exchange application for seamless business card swapping at conferences. Exchange contacts via QR codes with automated multi-channel follow-ups.

**Live at**: https://contacts.ideanetworks.com

---

## 🎯 Features

### MVP (Phase 1) - Conference Ready
- ✅ **Public Contact Page** - Mobile-optimized landing page with your info
- ✅ **vCard Download** - One-click download to phone contacts
- ✅ **Native SMS Integration** - Opens SMS app with pre-filled message
- ✅ **LinkedIn Connection** - Direct link to your LinkedIn profile
- ✅ **Contact Submission Form** - Visitors can share their info
- ✅ **Admin Dashboard** - View and manage all contact submissions
- ✅ **Export to CSV** - Download all contacts for follow-up
- ✅ **Password Protected Admin** - Simple authentication for dashboard

### Coming Soon (Phase 2)
- 📧 Automated email follow-ups
- 📱 Automated SMS campaigns
- 🤖 LinkedIn OAuth integration
- 📊 Analytics and tracking
- 👥 Multi-user support
- 🏷️ Contact tagging and segmentation

---

## 🚀 Quick Start

See [QUICKSTART.md](./QUICKSTART.md) for step-by-step deployment instructions.

**TL;DR:**
1. Point DNS to server: `137.220.52.23`
2. Run `server-setup-quick.sh` on Ubuntu 22.04
3. Deploy app and configure `.env`
4. Access at `https://contacts.ideanetworks.com`

---

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Server**: Ubuntu 22.04 + Nginx + Node.js 20
- **SSL**: Let's Encrypt (automatic)

---

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── me/                # Public contact page
│   │   ├── admin/             # Admin dashboard
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── contact-card.tsx   # Contact display
│   │   └── contact-form.tsx   # Submission form
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── vcard.ts           # vCard generation
│   │   └── validations.ts     # Zod schemas
│   └── types/                 # TypeScript types
├── prisma/
│   └── schema.prisma          # Database schema
├── server-setup-quick.sh      # Automated server setup
├── QUICKSTART.md              # Deployment guide
└── MVP_PLAN.md                # Feature roadmap
```

---

## 🔧 Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone <repo-url>
cd contact-exchange
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp env.example.txt .env
# Edit .env with your details
```

4. **Setup database**
```bash
npx prisma generate
npx prisma db push
```

5. **Run development server**
```bash
npm run dev
```

6. **Open browser**
```
http://localhost:3000
```

---

## 🌐 API Endpoints

### Public Endpoints
- `GET /api/vcard` - Download vCard file
- `POST /api/contacts/submit` - Submit contact information

### Protected Endpoints (Require Authentication)
- `GET /api/contacts/list` - List all contacts
- `PATCH /api/contacts/:id` - Update contact notes/status

---

## 📊 Database Schema

```prisma
model Contact {
  id          String   @id @default(cuid())
  name        String
  email       String
  phone       String?
  linkedin    String?
  company     String?
  title       String?
  notes       String?
  followedUp  Boolean  @default(false)
  submittedAt DateTime @default(now())
}
```

---

## 🔒 Security

- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection
- ✅ HTTPS only (enforced by Nginx)
- ✅ Password-protected admin area
- ✅ Rate limiting ready
- ✅ Environment variables for secrets

---

## 📱 Usage

### For You (Conference Attendee)
1. Update QR code to point to your site
2. Show QR code when networking
3. Check admin dashboard for submissions
4. Export contacts and follow up

### For Your Contacts
1. Scan your QR code
2. View your contact info
3. Click buttons to:
   - Add you to their contacts
   - Send you a text message
   - Connect on LinkedIn
4. Optionally share their info via form

---

## 🛠️ Deployment

### Server Requirements
- Ubuntu 22.04 LTS
- 2GB RAM minimum (4GB recommended)
- 20GB storage
- Ports 80, 443 open

### Automated Setup
Use `server-setup-quick.sh` for one-command setup:
- Installs Node.js 20
- Installs PostgreSQL 15
- Configures Nginx reverse proxy
- Sets up SSL with Let's Encrypt
- Configures firewall
- Creates systemd service

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## 🔄 Updates and Maintenance

### Update Application Code
```bash
# Sync changes from local machine
rsync -avz --exclude 'node_modules' --exclude '.next' \
  ./ root@137.220.52.23:/var/www/contact-exchange/

# On server
ssh root@137.220.52.23
cd /var/www/contact-exchange
npm install
npm run build
sudo systemctl restart contact-exchange
```

### Database Migrations
```bash
# After changing prisma/schema.prisma
npx prisma db push
```

### View Logs
```bash
sudo journalctl -u contact-exchange -f
```

### Backup Database
```bash
pg_dump -U contact_admin contact_exchange > backup.sql
```

---

## 📈 Roadmap

### Phase 1: MVP ✅ (Complete)
- [x] Public contact page
- [x] vCard generation
- [x] Native app integration (SMS, LinkedIn)
- [x] Contact submission form
- [x] Admin dashboard
- [x] CSV export

### Phase 2: Automation (Next)
- [ ] SendGrid email integration
- [ ] Twilio SMS integration
- [ ] LinkedIn OAuth
- [ ] Template system
- [ ] Scheduled follow-ups

### Phase 3: Advanced Features
- [ ] Analytics dashboard
- [ ] A/B testing
- [ ] CRM integration
- [ ] Multi-user support
- [ ] Team features

---

## 🤝 Contributing

This is a personal project for conference use, but suggestions are welcome!

---

## 📝 License

Private use only.

---

## 📞 Support

For issues or questions:
1. Check [QUICKSTART.md](./QUICKSTART.md) troubleshooting section
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup
3. Check application logs: `sudo journalctl -u contact-exchange -f`

---

## 🎉 Credits

Built with:
- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)

---

**Ready to network like a pro! 🚀**

