# 🚀 Deployment Summary - contacts.ideanetworks.com

## Your Configuration

**Server IP**: `137.220.52.23`
**Domain**: `contacts.ideanetworks.com`
**Platform**: Ubuntu 22.04

---

## 📋 Deployment Steps (In Order)

### 1️⃣ DNS Configuration
Point your domain to the server:
- **A Record**: `contacts.ideanetworks.com` → `137.220.52.23`
- **TTL**: 300 seconds
- Wait 5-10 minutes for propagation

Verify:
```bash
ping contacts.ideanetworks.com
# Should show: 137.220.52.23
```

---

### 2️⃣ Server Setup
SSH into server:
```bash
ssh root@137.220.52.23
```

Upload and run setup script:
```bash
# From your local machine
scp server-setup-quick.sh root@137.220.52.23:/root/

# On server
ssh root@137.220.52.23
chmod +x /root/server-setup-quick.sh
sudo bash /root/server-setup-quick.sh
```

When prompted, enter:
- Domain: `contacts.ideanetworks.com`
- Email: (your email for SSL)

**💾 Save the database password shown at the end!**

---

### 3️⃣ Deploy Application
From your local machine (in this project folder):
```bash
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ root@137.220.52.23:/var/www/contact-exchange/
```

---

### 4️⃣ Configure Environment
SSH back to server:
```bash
ssh root@137.220.52.23
cd /var/www/contact-exchange
nano .env
```

Paste and fill in your details:
```env
NEXT_PUBLIC_APP_URL=https://contacts.ideanetworks.com
NODE_ENV=production
DATABASE_URL=postgresql://contact_admin:YOUR_DB_PASSWORD@localhost:5432/contact_exchange
NEXTAUTH_SECRET=RUN_openssl_rand_-base64_32
NEXTAUTH_URL=https://contacts.ideanetworks.com
NEXT_PUBLIC_DEFAULT_USER_NAME=Your Full Name
NEXT_PUBLIC_DEFAULT_USER_TITLE=Your Job Title
NEXT_PUBLIC_DEFAULT_USER_COMPANY=Your Company
NEXT_PUBLIC_DEFAULT_USER_EMAIL=your@email.com
NEXT_PUBLIC_DEFAULT_USER_PHONE=+15551234567
NEXT_PUBLIC_DEFAULT_USER_LINKEDIN=https://linkedin.com/in/yourprofile
ADMIN_PASSWORD=ChooseSecurePassword123
```

Generate NEXTAUTH_SECRET on server:
```bash
openssl rand -base64 32
# Copy output to NEXTAUTH_SECRET
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

---

### 5️⃣ Build & Start
Still on server:
```bash
cd /var/www/contact-exchange
npm install
npx prisma generate
npx prisma db push
npm run build
sudo systemctl start contact-exchange
sudo systemctl enable contact-exchange
```

Check status:
```bash
sudo systemctl status contact-exchange
```

---

### 6️⃣ Verify Deployment
Visit: https://contacts.ideanetworks.com

✅ Should see your contact page with green lock (SSL)

Test these:
- Click "Add to Contacts" → Downloads vCard
- Click "Send Text" → Opens SMS app
- Click "Connect on LinkedIn" → Opens LinkedIn
- Fill and submit form → Shows success
- Visit `/admin` → Can login and see submissions

---

### 7️⃣ Update QR Code
Change your QR code sticker to:
```
https://contacts.ideanetworks.com/me
```

Or simply:
```
https://contacts.ideanetworks.com
```

---

## 📁 Files Created

### Server Files
- `/var/www/contact-exchange/` - Application directory
- `/etc/nginx/sites-available/contact-exchange` - Nginx config
- `/etc/systemd/system/contact-exchange.service` - Systemd service
- `/root/contact-exchange-credentials.txt` - Saved credentials

### Local Files
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `next.config.js` - Next.js config
- `tailwind.config.ts` - Tailwind config
- `prisma/schema.prisma` - Database schema
- `src/app/me/page.tsx` - Public contact page
- `src/app/admin/page.tsx` - Admin dashboard
- `src/components/contact-card.tsx` - Contact display
- `src/components/contact-form.tsx` - Submission form
- `src/app/api/` - API routes

---

## 🔧 Useful Commands

### On Server (137.220.52.23)

```bash
# View app logs
sudo journalctl -u contact-exchange -f

# Restart app
sudo systemctl restart contact-exchange

# Check app status
sudo systemctl status contact-exchange

# Check if app is responding
curl http://localhost:3000

# Check Nginx
sudo systemctl status nginx

# Check PostgreSQL
sudo systemctl status postgresql

# View database credentials
cat /root/contact-exchange-credentials.txt

# Test SSL certificate
curl -I https://contacts.ideanetworks.com

# Check firewall
sudo ufw status
```

### From Local Machine

```bash
# SSH to server
ssh root@137.220.52.23

# Deploy updates
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ root@137.220.52.23:/var/www/contact-exchange/

# After deploying updates, rebuild on server
ssh root@137.220.52.23 'cd /var/www/contact-exchange && npm run build && sudo systemctl restart contact-exchange'
```

---

## 🔍 Troubleshooting

### Site Not Loading
```bash
# Check DNS
ping contacts.ideanetworks.com

# Check if services are running
ssh root@137.220.52.23
sudo systemctl status nginx contact-exchange postgresql

# Check logs
sudo journalctl -u contact-exchange -n 50
```

### SSL Certificate Issues
```bash
ssh root@137.220.52.23
sudo certbot certificates
sudo certbot renew --dry-run
```

### Database Connection Errors
```bash
ssh root@137.220.52.23
cd /var/www/contact-exchange

# Check .env file
cat .env | grep DATABASE_URL

# Test database connection
psql $(grep DATABASE_URL .env | cut -d '=' -f2)
```

### App Won't Start
```bash
ssh root@137.220.52.23
cd /var/www/contact-exchange

# Check for errors
npm run build

# View detailed logs
sudo journalctl -u contact-exchange -f
```

---

## 📊 What's Been Built

### Public Features (No Login Required)
✅ **Contact Landing Page** (`/me`)
- Displays your contact information
- Mobile-optimized design
- Professional appearance

✅ **vCard Download** (`/api/vcard`)
- One-click download to phone contacts
- Compatible with iOS and Android
- Contains all your information

✅ **Native App Integration**
- SMS link opens messaging app
- LinkedIn link opens profile
- Pre-filled message for easy contact

✅ **Contact Submission Form**
- Collects name, email, phone, company, title, LinkedIn
- Input validation with error messages
- Success confirmation
- Stores in database

### Admin Features (Password Protected)
✅ **Admin Dashboard** (`/admin`)
- View all contact submissions
- See submission stats (total, today, followed up)
- Mark contacts as followed up
- Export to CSV
- Simple password authentication

### Backend
✅ **API Routes**
- `POST /api/contacts/submit` - Submit contact
- `GET /api/contacts/list` - List all (authenticated)
- `PATCH /api/contacts/:id` - Update contact (authenticated)
- `GET /api/vcard` - Download vCard

✅ **Database**
- PostgreSQL with Prisma ORM
- Contact storage with metadata
- Indexed for performance
- Secure and scalable

✅ **Infrastructure**
- Nginx reverse proxy
- Let's Encrypt SSL (auto-renewing)
- Systemd service (auto-start on boot)
- Firewall configured
- Production-ready

---

## 🎯 Next Steps (After Conference)

### Immediate (Today)
1. Complete DNS setup
2. Run server setup script
3. Deploy application
4. Test everything
5. Update QR code

### Before Conference
1. Test on your phone
2. Test with a friend
3. Verify admin dashboard
4. Export test data
5. Print backup QR code

### During Conference
1. Scan QR code with first person
2. Check admin dashboard works
3. Monitor submissions

### After Conference
1. Export all contacts (CSV)
2. Follow up with connections
3. Consider Phase 2 features:
   - Automated email follow-ups
   - SMS campaigns
   - LinkedIn OAuth
   - Analytics dashboard

---

## 📞 Support

### Documentation
- **QUICKSTART.md** - Step-by-step deployment
- **DEPLOYMENT.md** - Detailed deployment guide
- **MVP_PLAN.md** - Feature roadmap
- **TESTING_CHECKLIST.md** - Comprehensive testing
- **README.md** - Project overview

### Quick Help
Most issues can be solved by:
1. Checking logs: `sudo journalctl -u contact-exchange -f`
2. Restarting app: `sudo systemctl restart contact-exchange`
3. Checking DNS: `ping contacts.ideanetworks.com`
4. Verifying .env file has correct values

---

## ✅ Success Checklist

Before the conference, verify:
- [ ] DNS points to 137.220.52.23
- [ ] Site loads with SSL at https://contacts.ideanetworks.com
- [ ] vCard download works
- [ ] SMS link works on mobile
- [ ] LinkedIn link works
- [ ] Form submission works
- [ ] Admin dashboard accessible
- [ ] Can export CSV
- [ ] QR code updated and scannable

---

## 🎉 You're Ready!

Everything is built and ready to deploy. Just follow the steps above in order, and you'll have a professional contact exchange app running in about 30 minutes!

**Good luck at the conference! 🚀**

