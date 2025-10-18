# Contact Exchange App - Deployment Guide

## Quick Start (MVP for Conference)

### Prerequisites
- Ubuntu 22.04 VPS with root access
- Domain `contacts.ideanetworks.com` DNS pointed to server IP
- Nginx Proxy Manager already set up (or will set up)

---

## Step 1: Server Setup

SSH into your server and run the setup script:

```bash
# Upload the setup script
scp server-setup.sh root@your-server-ip:/root/

# SSH into server
ssh root@your-server-ip

# Make executable and run
chmod +x server-setup.sh
sudo bash server-setup.sh
```

**This will install:**
- Node.js 20 LTS
- PostgreSQL 15
- Docker & Docker Compose
- PM2 process manager
- UFW firewall (configured)
- Application directory structure

---

## Step 2: Change PostgreSQL Password

```bash
sudo -u postgres psql
```

In PostgreSQL prompt:
```sql
ALTER USER contact_admin WITH PASSWORD 'YourSecurePasswordHere';
\q
```

---

## Step 3: Deploy Application

### Option A: Direct from Development Machine

```bash
# From your local machine in the project directory
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ your-user@your-server-ip:/var/www/contact-exchange/
```

### Option B: Via Git (Recommended)

```bash
# On server
cd /var/www/contact-exchange
git clone https://github.com/yourusername/contact-exchange.git .

# Or if you prefer local files
# Copy files manually to /var/www/contact-exchange
```

---

## Step 4: Configure Environment

Create `.env` file in `/var/www/contact-exchange/`:

```bash
nano /var/www/contact-exchange/.env
```

Paste and customize (use .env.example as template):

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://contacts.ideanetworks.com
NODE_ENV=production

# Database
DATABASE_URL=postgresql://contact_admin:YourSecurePasswordHere@localhost:5432/contact_exchange

# Authentication (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=generate-a-random-secret-here
NEXTAUTH_URL=https://contacts.ideanetworks.com

# Your Contact Information (for MVP single-user mode)
NEXT_PUBLIC_DEFAULT_USER_NAME=Your Name
NEXT_PUBLIC_DEFAULT_USER_TITLE=Your Title
NEXT_PUBLIC_DEFAULT_USER_COMPANY=Your Company
NEXT_PUBLIC_DEFAULT_USER_EMAIL=your@email.com
NEXT_PUBLIC_DEFAULT_USER_PHONE=+1234567890
NEXT_PUBLIC_DEFAULT_USER_LINKEDIN=https://linkedin.com/in/yourprofile

# Admin Access (simple password for MVP)
ADMIN_PASSWORD=ChangeThisAdminPassword123!

# Optional: For Phase 2
# SENDGRID_API_KEY=
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
```

---

## Step 5: Install Dependencies & Build

```bash
cd /var/www/contact-exchange
npm install
npx prisma generate
npx prisma db push
npm run build
```

---

## Step 6: Start Application

### Option A: Using Systemd (Recommended for Production)

```bash
sudo systemctl daemon-reload
sudo systemctl enable contact-exchange
sudo systemctl start contact-exchange
sudo systemctl status contact-exchange
```

### Option B: Using PM2 (Alternative)

```bash
cd /var/www/contact-exchange
pm2 start npm --name "contact-exchange" -- start
pm2 save
```

---

## Step 7: Configure Nginx Proxy Manager

1. Log into Nginx Proxy Manager (usually at `http://your-server-ip:81`)
2. Add Proxy Host:
   - **Domain Names**: `contacts.ideanetworks.com`
   - **Scheme**: `http`
   - **Forward Hostname/IP**: `localhost`
   - **Forward Port**: `3000`
   - **Cache Assets**: ✓ Enabled
   - **Block Common Exploits**: ✓ Enabled
   - **Websockets Support**: ✓ Enabled (for future features)

3. SSL Tab:
   - **SSL Certificate**: Request New SSL Certificate (Let's Encrypt)
   - **Force SSL**: ✓ Enabled
   - **HTTP/2 Support**: ✓ Enabled
   - **HSTS Enabled**: ✓ Enabled

4. Save and test: Visit `https://contacts.ideanetworks.com`

---

## Step 8: Update Your QR Code

Update your existing QR code sticker to point to:
```
https://contacts.ideanetworks.com/me
```

Or for a unique ID:
```
https://contacts.ideanetworks.com/[your-unique-id]
```

---

## Verification Checklist

- [ ] Can access `https://contacts.ideanetworks.com`
- [ ] SSL certificate is valid (green padlock)
- [ ] Scanning QR code loads your contact page
- [ ] "Add to Contacts" downloads vCard
- [ ] "Send Text" opens SMS app
- [ ] "Connect on LinkedIn" opens LinkedIn
- [ ] Contact form submission works
- [ ] Can access admin dashboard at `/admin`

---

## Troubleshooting

### App won't start
```bash
# Check logs
sudo journalctl -u contact-exchange -f

# Or if using PM2
pm2 logs contact-exchange
```

### Database connection issues
```bash
# Test database connection
psql -U contact_admin -d contact_exchange -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql
```

### Port 3000 not accessible
```bash
# Check if app is running
curl http://localhost:3000

# Check if port is listening
sudo netstat -tlnp | grep 3000

# Check firewall (if accessing directly)
sudo ufw status
```

### Nginx Proxy Manager issues
```bash
# Check Nginx logs
docker logs nginx-proxy-manager
```

---

## Quick Commands Reference

```bash
# View app logs (systemd)
sudo journalctl -u contact-exchange -f

# Restart app
sudo systemctl restart contact-exchange

# Update app
cd /var/www/contact-exchange
git pull  # or rsync files
npm install
npx prisma db push
npm run build
sudo systemctl restart contact-exchange

# View database
psql -U contact_admin -d contact_exchange
```

---

## Post-Conference: Add More Features

After the conference, you can enhance with:
- Multi-user support
- Automated email/SMS follow-ups
- Advanced analytics
- CRM integrations

Simply uncomment and configure additional environment variables and deploy updates!

---

## Security Hardening (Before Going Live)

```bash
# 1. Close port 3000 (app only accessible via Nginx)
sudo ufw delete allow 3000/tcp

# 2. Close Nginx Proxy Manager admin port (after configuration)
sudo ufw delete allow 81/tcp

# 3. Configure fail2ban for SSH protection
sudo apt-get install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 4. Enable automatic security updates
sudo apt-get install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## Need Help?

Check the logs first:
```bash
# Application logs
sudo journalctl -u contact-exchange -f -n 100

# Database logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Nginx logs (if using Nginx directly)
sudo tail -f /var/log/nginx/error.log
```

