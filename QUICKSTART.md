# 🚀 Quick Start - Conference Ready Deployment

## Your Server Details
- **IP Address**: `137.220.52.23`
- **Domain**: `contacts.ideanetworks.com` (point to 137.220.52.23)
- **OS**: Ubuntu 22.04

---

## Step 1: DNS Setup (Do This First!)

Point your domain to the server:

1. Go to your DNS provider
2. Add/Update an **A Record**:
   - **Host**: `contacts` (or `@` for root domain)
   - **Value**: `137.220.52.23`
   - **TTL**: 300 (5 minutes)

Wait ~5 minutes for DNS propagation. Test with:
```bash
ping contacts.ideanetworks.com
# Should show 137.220.52.23
```

---

## Step 2: Run Server Setup

SSH into your server:
```bash
ssh root@137.220.52.23
```

Upload and run the setup script:
```bash
# Download the setup script (or copy from your local machine)
wget https://raw.githubusercontent.com/yourusername/yourrepo/main/server-setup-quick.sh
# OR upload with scp from your local machine:
# scp server-setup-quick.sh root@137.220.52.23:/root/

chmod +x server-setup-quick.sh
sudo bash server-setup-quick.sh
```

When prompted:
- **Domain**: `contacts.ideanetworks.com`
- **Email**: Your email for SSL certificate

**Save the database credentials shown at the end!**

---

## Step 3: Deploy Application

From your local development machine (this folder):

```bash
# Option A: Using rsync (recommended)
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ root@137.220.52.23:/var/www/contact-exchange/

# Option B: Using Git (if you have a repo)
# On server:
# cd /var/www/contact-exchange
# git clone https://github.com/yourusername/yourrepo.git .
```

---

## Step 4: Configure Environment

SSH into server and create `.env` file:

```bash
ssh root@137.220.52.23
cd /var/www/contact-exchange
nano .env
```

Paste this (fill in your details):

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://contacts.ideanetworks.com
NODE_ENV=production

# Database (use the password from setup script output)
DATABASE_URL=postgresql://contact_admin:YOUR_PASSWORD_HERE@localhost:5432/contact_exchange

# Authentication (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=https://contacts.ideanetworks.com

# Your Contact Information
NEXT_PUBLIC_DEFAULT_USER_NAME=Your Name
NEXT_PUBLIC_DEFAULT_USER_TITLE=Your Title
NEXT_PUBLIC_DEFAULT_USER_COMPANY=Your Company
NEXT_PUBLIC_DEFAULT_USER_EMAIL=your@email.com
NEXT_PUBLIC_DEFAULT_USER_PHONE=+15551234567
NEXT_PUBLIC_DEFAULT_USER_LINKEDIN=https://linkedin.com/in/yourprofile

# Optional: Your profile photo URL
# NEXT_PUBLIC_DEFAULT_USER_AVATAR=https://yoursite.com/photo.jpg

# Admin Password (choose a strong password)
ADMIN_PASSWORD=your-secure-admin-password
```

Generate secrets on server:
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

Save and exit (Ctrl+O, Enter, Ctrl+X).

---

## Step 5: Install and Build

Still on the server:

```bash
cd /var/www/contact-exchange

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Build application
npm run build
```

---

## Step 6: Start Application

```bash
# Start the service
sudo systemctl start contact-exchange

# Enable auto-start on boot
sudo systemctl enable contact-exchange

# Check status
sudo systemctl status contact-exchange
```

If you see errors, check logs:
```bash
sudo journalctl -u contact-exchange -f
```

---

## Step 7: Verify Everything Works

1. **Visit your site**: https://contacts.ideanetworks.com
   - Should show your contact page with SSL (green lock)

2. **Test vCard download**: Click "Add to Contacts"
   - Should download a `.vcf` file

3. **Test SMS link**: Click "Send Text"
   - Should open your SMS app (on mobile)

4. **Test LinkedIn**: Click "Connect on LinkedIn"
   - Should open LinkedIn

5. **Test form submission**: Fill out and submit the form
   - Should show success message

6. **Access admin**: https://contacts.ideanetworks.com/admin
   - Login with your ADMIN_PASSWORD
   - Should see the submitted contact

---

## Step 8: Update Your QR Code

Update your existing QR code to point to:
```
https://contacts.ideanetworks.com/me
```

Or just:
```
https://contacts.ideanetworks.com
```

(Both work - the root redirects to `/me`)

---

## 🎉 You're Ready!

Your contact exchange app is now live and ready for the conference!

---

## Quick Commands Reference

```bash
# View logs
sudo journalctl -u contact-exchange -f

# Restart app
sudo systemctl restart contact-exchange

# Stop app
sudo systemctl stop contact-exchange

# Check if app is running
curl http://localhost:3000

# Check Nginx status
sudo systemctl status nginx

# Test SSL certificate
curl -I https://contacts.ideanetworks.com
```

---

## Troubleshooting

### SSL Certificate Failed
```bash
# Try manual certbot
sudo certbot --nginx -d contacts.ideanetworks.com

# Check DNS is pointing correctly
dig contacts.ideanetworks.com +short
# Should show: 137.220.52.23
```

### App Won't Start
```bash
# Check logs for errors
sudo journalctl -u contact-exchange -n 50

# Make sure database is running
sudo systemctl status postgresql

# Test database connection
psql -U contact_admin -d contact_exchange -h localhost
```

### Can't Access Site
```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check if port 3000 is listening
sudo netstat -tlnp | grep 3000

# Check firewall
sudo ufw status
```

### "Database connection failed"
```bash
# Check DATABASE_URL in .env file
cat /var/www/contact-exchange/.env | grep DATABASE_URL

# Make sure PostgreSQL is running
sudo systemctl status postgresql

# Test connection manually
psql postgresql://contact_admin:PASSWORD@localhost:5432/contact_exchange
```

---

## Need to Make Changes?

After editing code:

```bash
# On your local machine, sync changes
rsync -avz --exclude 'node_modules' --exclude '.next' \
  ./ root@137.220.52.23:/var/www/contact-exchange/

# On server, rebuild and restart
ssh root@137.220.52.23
cd /var/www/contact-exchange
npm run build
sudo systemctl restart contact-exchange
```

---

## Security Notes

✅ SSL is automatically configured and will auto-renew
✅ Firewall is configured (only ports 22, 80, 443 open)
✅ App runs on internal port 3000 (not exposed)
✅ Admin dashboard requires password authentication

**Important**: 
- Keep your ADMIN_PASSWORD secret
- Keep your database credentials secure
- The credentials are saved in `/root/contact-exchange-credentials.txt`

---

## After the Conference

Once the conference is over, you can:

1. Export all contacts from admin dashboard (CSV)
2. Add automated follow-up features (see MVP_PLAN.md Phase 2)
3. Add multi-user support for team members
4. Integrate with your CRM

---

## Getting Help

If something goes wrong:

1. Check the logs: `sudo journalctl -u contact-exchange -f`
2. Check if services are running: `sudo systemctl status contact-exchange nginx postgresql`
3. Verify DNS: `ping contacts.ideanetworks.com`
4. Test local app: `curl http://localhost:3000`

**Most common issues**:
- DNS not propagated yet (wait 5-10 minutes)
- Wrong DATABASE_URL in .env
- Forgot to run `npm run build`
- Node_modules not installed

