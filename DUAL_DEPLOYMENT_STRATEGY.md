# 🎯 Dual Deployment Strategy - Production + SaaS Development

## 📋 Overview

This strategy allows you to:
- ✅ Keep your **working v1.0.0** app stable and live
- ✅ Develop and test the **viral SaaS version** safely
- ✅ No risk to production
- ✅ Easy rollback if needed

---

## 🏗️ **Two-Environment Architecture**

```
┌────────────────────────────────────────────────────────────┐
│  PRODUCTION (Stable)                                       │
├────────────────────────────────────────────────────────────┤
│  Domain:     contacts.ideanetworks.com                     │
│  Branch:     main (locked at v1.0.0)                       │
│  Path:       /var/www/contact-exchange                     │
│  Service:    contact-exchange.service                      │
│  Port:       3000                                          │
│  Database:   contact_exchange                              │
│  Purpose:    Your personal contact exchange                │
│  Status:     🟢 LIVE & WORKING                             │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  DEVELOPMENT (SaaS Testing)                                │
├────────────────────────────────────────────────────────────┤
│  Domain:     saas.contacts.ideanetworks.com                │
│  Branch:     feature/viral-saas                            │
│  Path:       /var/www/contact-exchange-saas                │
│  Service:    contact-exchange-saas.service                 │
│  Port:       3001                                          │
│  Database:   contact_exchange_saas                         │
│  Purpose:    Test viral loop & multi-tenant features       │
│  Status:     🟡 DEVELOPMENT                                │
└────────────────────────────────────────────────────────────┘
```

---

## 🚀 **Setup Steps**

### 1. Configure Subdomain in Nginx Proxy Manager

**Option A: Use `saas.contacts.ideanetworks.com`**

1. Log into Nginx Proxy Manager (http://137.220.52.23:81)
2. Add new Proxy Host:
   - **Domain Names:** `saas.contacts.ideanetworks.com`
   - **Scheme:** http
   - **Forward Hostname/IP:** 127.0.0.1
   - **Forward Port:** 3001
   - **SSL:** Request new SSL certificate (Let's Encrypt)
   - **Force SSL:** Yes
   - **HTTP/2:** Yes

**Option B: Use `beta.contacts.ideanetworks.com`** (Alternative)
- Same steps, just use `beta` instead of `saas`

### 2. Update DNS

Add a DNS record:
```
Type: A
Name: saas
Value: 137.220.52.23
TTL: 300
```

Or if using Cloudflare, add:
```
Type: A
Name: saas.contacts
Content: 137.220.52.23
Proxy: Yes (Orange cloud)
```

---

## 🔧 **Server Setup (SSH)**

### Step 1: Clone SaaS Version

```bash
# SSH into server
ssh root@137.220.52.23

# Create new directory for SaaS version
cd /var/www
git clone https://github.com/haydenbarker-idea/idea_contact_manager.git contact-exchange-saas
cd contact-exchange-saas

# Switch to feature branch
git checkout feature/viral-saas

# Install dependencies
npm install
```

### Step 2: Create Separate Database

```bash
# Create new database for SaaS version
sudo -u postgres psql

postgres=# CREATE DATABASE contact_exchange_saas;
postgres=# GRANT ALL PRIVILEGES ON DATABASE contact_exchange_saas TO your_db_user;
postgres=# \q
```

### Step 3: Configure Environment

```bash
cd /var/www/contact-exchange-saas

# Copy env from production as template
cp /var/www/contact-exchange/.env .env

# Edit .env for SaaS version
nano .env
```

**Update these values:**
```bash
# Database (different database!)
DATABASE_URL="postgresql://user:pass@localhost:5432/contact_exchange_saas"

# App URL (new subdomain!)
NEXT_PUBLIC_APP_URL=https://saas.contacts.ideanetworks.com

# Different admin password (optional)
ADMIN_PASSWORD=different_password_for_saas

# Same Twilio/Resend credentials (shared)
# ... keep existing credentials ...
```

### Step 4: Run Database Migration

```bash
cd /var/www/contact-exchange-saas

# Generate Prisma client
npx prisma generate

# Run migration to create users table
npx prisma migrate deploy

# Verify tables created
npx prisma studio
# Check that both 'users' and 'contacts' tables exist
```

### Step 5: Create Systemd Service

```bash
# Create new service file
sudo nano /etc/systemd/system/contact-exchange-saas.service
```

**Service file content:**
```ini
[Unit]
Description=Contact Exchange SaaS (Development)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/contact-exchange-saas
ExecStart=/usr/bin/node /var/www/contact-exchange-saas/.next/standalone/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=contact-exchange-saas
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

### Step 6: Create Deployment Script

```bash
cd /var/www/contact-exchange-saas

# Copy and modify deployment script
cp /var/www/contact-exchange/deploy-selfie-experience.sh deploy-saas.sh

# Edit script
nano deploy-saas.sh
```

**Key changes in `deploy-saas.sh`:**
```bash
# Change service name
SERVICE_NAME="contact-exchange-saas"

# Change app directory
APP_DIR="/var/www/contact-exchange-saas"

# Change branch
git checkout feature/viral-saas
git pull origin feature/viral-saas

# Change log file names
LOG_FILE="deployment-logs/saas-deploy-${TIMESTAMP}.log"
```

### Step 7: Initial Build and Start

```bash
cd /var/www/contact-exchange-saas

# Build the app
npm run build

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable contact-exchange-saas
sudo systemctl start contact-exchange-saas

# Check status
sudo systemctl status contact-exchange-saas

# Check logs
journalctl -u contact-exchange-saas -n 50 -f
```

---

## 🧪 **Testing the SaaS Version**

### Test Checklist:

1. **Access the site:**
   ```
   https://saas.contacts.ideanetworks.com
   ```

2. **Test basic flow:**
   - Landing page loads
   - Selfie capture works
   - Form submission works
   - Celebration screen appears

3. **Test "I Want This!" button:**
   - Click button on celebration screen
   - Should go to `/get-started`
   - Complete 3-step onboarding
   - Get redirected to `/u/your-username`

4. **Test new user page:**
   ```
   https://saas.contacts.ideanetworks.com/u/test-user
   ```
   - Profile loads from database
   - Contact exchange flow works
   - Contact saves to that user's account

5. **Verify database:**
   ```bash
   cd /var/www/contact-exchange-saas
   npx prisma studio
   ```
   - Check `users` table has entries
   - Check `contacts` table has `userId` links

---

## 🔄 **Workflow: Development Cycle**

### Making Changes to SaaS Version:

```bash
# On your local machine
git checkout feature/viral-saas

# Make changes
# ... edit files ...

git add .
git commit -m "feat: add new feature"
git push origin feature/viral-saas

# On the server
ssh root@137.220.52.23
cd /var/www/contact-exchange-saas
bash deploy-saas.sh
```

### Keeping Production Stable:

```bash
# Production stays on main branch (v1.0.0)
cd /var/www/contact-exchange

# If you need to update production:
git checkout main
git pull origin main
bash deploy-selfie-experience.sh
```

---

## ✅ **When SaaS is Ready for Production**

Once the SaaS version is tested and stable:

### Option 1: Replace Production (Recommended)

```bash
# 1. Backup production database
pg_dump contact_exchange > /backups/contact_exchange_backup.sql

# 2. Merge feature branch to main
git checkout main
git merge feature/viral-saas
git push origin main

# 3. Deploy to production
cd /var/www/contact-exchange
git pull origin main
npx prisma migrate deploy  # Run migration
bash deploy-selfie-experience.sh

# 4. Keep SaaS environment for future testing
# (or delete it if you want)
```

### Option 2: Swap Domains

```bash
# Make SaaS the main domain
# Switch nginx proxy:
#   contacts.ideanetworks.com -> port 3001 (SaaS)
#   legacy.contacts.ideanetworks.com -> port 3000 (old version)
```

---

## 📊 **Monitoring Both Environments**

### Check Production Status:
```bash
sudo systemctl status contact-exchange
journalctl -u contact-exchange -n 50
curl https://contacts.ideanetworks.com
```

### Check SaaS Status:
```bash
sudo systemctl status contact-exchange-saas
journalctl -u contact-exchange-saas -n 50
curl https://saas.contacts.ideanetworks.com
```

### Database Queries:

**Production (v1.0.0):**
```bash
psql -d contact_exchange -c "SELECT COUNT(*) as total_contacts FROM contacts;"
```

**SaaS (Development):**
```bash
psql -d contact_exchange_saas -c "SELECT COUNT(*) as total_users FROM users;"
psql -d contact_exchange_saas -c "SELECT COUNT(*) as total_contacts FROM contacts;"
```

---

## 🎯 **Branch Strategy Summary**

```
main (Production)
  ├─ v1.0.0 tag ✅ (stable baseline)
  └─ Your working single-user app

feature/viral-saas (Development)
  ├─ Multi-tenant database
  ├─ Viral loop features
  ├─ "I Want This!" button
  └─ User onboarding flow
```

---

## 💡 **Benefits of This Approach**

✅ **Zero Risk:** Production never breaks  
✅ **Fast Iteration:** Develop/test SaaS features freely  
✅ **Easy Rollback:** Production always stable at v1.0.0  
✅ **Separate Data:** Different databases = no pollution  
✅ **Real Testing:** Test on actual server, not just localhost  
✅ **Smooth Migration:** Merge to main when ready  

---

## 🚨 **Important Notes**

### Cost:
- **Server:** Same server, no extra cost
- **SSL:** Free (Let's Encrypt)
- **Database:** Same PostgreSQL instance, separate database
- **Total Extra Cost:** $0 ✅

### Resources:
- **RAM:** Both apps running = ~500MB total (server has plenty)
- **Disk:** ~200MB extra for second codebase
- **CPU:** Minimal (only used when accessed)

### Data Isolation:
- ✅ Production contacts stay safe in `contact_exchange` database
- ✅ SaaS testing uses `contact_exchange_saas` database
- ✅ No cross-contamination

---

## 🎓 **Quick Reference Commands**

### Deploy Production (Stable):
```bash
ssh root@137.220.52.23
cd /var/www/contact-exchange
git checkout main
bash deploy-selfie-experience.sh
```

### Deploy SaaS (Development):
```bash
ssh root@137.220.52.23
cd /var/www/contact-exchange-saas
git checkout feature/viral-saas
bash deploy-saas.sh
```

### Switch Between Branches Locally:
```bash
# Work on production fixes
git checkout main

# Work on SaaS features
git checkout feature/viral-saas

# See all branches
git branch -a
```

---

## 🎉 **Ready to Set Up?**

**Next Steps:**
1. Set up DNS record for `saas.contacts.ideanetworks.com`
2. Configure Nginx Proxy Manager for subdomain
3. Run server setup steps above
4. Test SaaS version
5. Iterate and develop freely!

**Your production app stays safe at v1.0.0 while you build the future!** 🚀

