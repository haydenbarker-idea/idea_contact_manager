# 🚀 Quick Reference - Complete Deployment

## One-Page Deployment Guide

### Prerequisites
- ✅ GitHub account
- ✅ Ubuntu 22.04 server at `137.220.52.23`
- ✅ Domain: `contacts.ideanetworks.com`
- ✅ SSH access to server

---

## Step-by-Step Commands

### 1️⃣ Push to GitHub (Your Local Machine)
```bash
cd /path/to/idea_contact_manager

# Quick way - use the script
chmod +x PUSH_TO_GITHUB.sh
./PUSH_TO_GITHUB.sh

# Manual way
git init
git add .
git commit -m "Initial commit: Contact Exchange MVP"
git remote add origin https://github.com/YOUR_USERNAME/contact-exchange.git
git branch -M main
git push -u origin main
```

**Result**: Code is on GitHub ✅

---

### 2️⃣ Configure DNS
Go to your DNS provider:
- Add A Record: `contacts.ideanetworks.com` → `137.220.52.23`
- Wait 5 minutes

```bash
# Verify DNS
ping contacts.ideanetworks.com
# Should show: 137.220.52.23
```

**Result**: Domain points to server ✅

---

### 3️⃣ Setup Server
```bash
# Upload setup script
scp server-setup-quick.sh root@137.220.52.23:/root/

# SSH and run
ssh root@137.220.52.23
chmod +x server-setup-quick.sh
sudo bash server-setup-quick.sh
```

**Enter when prompted**:
- Domain: `contacts.ideanetworks.com`
- Email: your@email.com

**SAVE THE DATABASE PASSWORD!**

**Result**: Server configured with Node.js, PostgreSQL, Nginx, SSL ✅

---

### 4️⃣ Deploy Application
```bash
# Upload deployment script
scp deploy-from-github.sh root@137.220.52.23:/root/

# On server (or SSH back in)
ssh root@137.220.52.23
chmod +x deploy-from-github.sh
sudo bash deploy-from-github.sh https://github.com/YOUR_USERNAME/contact-exchange.git
```

**Enter when prompted**:
- Your Full Name
- Your Job Title
- Your Company
- Your Email
- Your Phone (e.g., +15551234567)
- Your LinkedIn URL
- Admin Password

**Result**: App is live! ✅

---

## 5️⃣ Verify & Test

Visit: **https://contacts.ideanetworks.com**

Test checklist:
- [ ] Page loads with SSL (green lock)
- [ ] Your info displays correctly
- [ ] "Add to Contacts" downloads vCard
- [ ] "Send Text" opens SMS app (test on phone)
- [ ] "Connect on LinkedIn" opens LinkedIn
- [ ] Form submission works
- [ ] Login to `/admin` works
- [ ] Can export CSV

**Result**: Everything works! ✅

---

## 6️⃣ Update QR Code

Change your QR code to:
```
https://contacts.ideanetworks.com
```

**Result**: Ready for conference! 🎉

---

## Common Commands Reference

### View Logs
```bash
ssh root@137.220.52.23
sudo journalctl -u contact-exchange -f
```

### Restart App
```bash
ssh root@137.220.52.23
sudo systemctl restart contact-exchange
```

### Check Status
```bash
ssh root@137.220.52.23
sudo systemctl status contact-exchange nginx postgresql
```

### Update App (After Changes)
```bash
# Local: Push changes to GitHub
git add .
git commit -m "Update description"
git push

# Server: Pull and rebuild
ssh root@137.220.52.23
cd /var/www/contact-exchange
git pull
npm install
npm run build
sudo systemctl restart contact-exchange
```

### One-Line Update
```bash
ssh root@137.220.52.23 'cd /var/www/contact-exchange && git pull && npm install && npm run build && sudo systemctl restart contact-exchange'
```

---

## Troubleshooting

### Site Not Loading
```bash
# Check DNS
ping contacts.ideanetworks.com

# Check services
ssh root@137.220.52.23
sudo systemctl status nginx contact-exchange postgresql

# Check logs
sudo journalctl -u contact-exchange -f
```

### SSL Certificate Error
```bash
ssh root@137.220.52.23
sudo certbot certificates
sudo certbot renew
```

### App Won't Start
```bash
ssh root@137.220.52.23
cd /var/www/contact-exchange
npm run build
sudo systemctl restart contact-exchange
sudo journalctl -u contact-exchange -n 50
```

### Database Connection Error
```bash
ssh root@137.220.52.23
cd /var/www/contact-exchange
cat .env | grep DATABASE_URL
sudo systemctl status postgresql
```

---

## File Locations

### On Server
- App: `/var/www/contact-exchange/`
- Logs: `journalctl -u contact-exchange`
- Nginx config: `/etc/nginx/sites-available/contact-exchange`
- Database credentials: `/root/contact-exchange-credentials.txt`
- Environment: `/var/www/contact-exchange/.env`

### URLs
- Public page: `https://contacts.ideanetworks.com`
- Admin dashboard: `https://contacts.ideanetworks.com/admin`
- API: `https://contacts.ideanetworks.com/api/*`

---

## Emergency Quick Fixes

### Restart Everything
```bash
ssh root@137.220.52.23
sudo systemctl restart contact-exchange nginx postgresql
```

### View Recent Errors
```bash
ssh root@137.220.52.23
sudo journalctl -u contact-exchange -n 100 --no-pager
```

### Check If App Is Responding
```bash
ssh root@137.220.52.23
curl http://localhost:3000
curl https://contacts.ideanetworks.com
```

---

## Complete Command Sequence (Copy-Paste)

```bash
# === ON YOUR LOCAL MACHINE ===

# 1. Push to GitHub
cd /path/to/idea_contact_manager
chmod +x PUSH_TO_GITHUB.sh
./PUSH_TO_GITHUB.sh

# 2. Upload scripts to server
scp server-setup-quick.sh root@137.220.52.23:/root/
scp deploy-from-github.sh root@137.220.52.23:/root/

# === ON THE SERVER (SSH) ===

# 3. Setup server
ssh root@137.220.52.23
chmod +x server-setup-quick.sh
sudo bash server-setup-quick.sh
# (Enter domain and email when prompted)

# 4. Deploy app
chmod +x deploy-from-github.sh
sudo bash deploy-from-github.sh https://github.com/YOUR_USERNAME/contact-exchange.git
# (Enter your contact info when prompted)

# 5. Verify
curl https://contacts.ideanetworks.com
systemctl status contact-exchange

# === DONE! ===
# Visit: https://contacts.ideanetworks.com
# Admin: https://contacts.ideanetworks.com/admin
```

---

## Important Notes

⚠️ **Security**:
- Never commit `.env` file (already in .gitignore)
- Keep admin password secure
- Database password is in `/root/contact-exchange-credentials.txt`

💡 **Tips**:
- Test on your phone before the conference
- Have backup business cards just in case
- Check admin dashboard periodically during conference
- Export contacts to CSV at end of each day

🔄 **Updates**:
- Make changes locally
- Push to GitHub
- Pull on server and rebuild
- Restart service

---

## Success Checklist

Before conference:
- [ ] Code pushed to GitHub
- [ ] DNS configured and propagated
- [ ] Server setup completed
- [ ] App deployed and running
- [ ] SSL certificate working
- [ ] All buttons tested
- [ ] Form submission works
- [ ] Admin dashboard accessible
- [ ] QR code updated
- [ ] Tested on real phone

During conference:
- [ ] First scan works
- [ ] Admin dashboard checked
- [ ] Multiple submissions tested

After conference:
- [ ] All contacts exported
- [ ] CSV downloaded
- [ ] Follow-up plan ready

---

## Your Configuration

- **Server IP**: 137.220.52.23
- **Domain**: contacts.ideanetworks.com
- **Public URL**: https://contacts.ideanetworks.com
- **Admin URL**: https://contacts.ideanetworks.com/admin
- **GitHub Repo**: https://github.com/YOUR_USERNAME/contact-exchange
- **SSH**: `ssh root@137.220.52.23`

---

## Getting Help

1. Check logs: `sudo journalctl -u contact-exchange -f`
2. Restart services: `sudo systemctl restart contact-exchange nginx`
3. Review documentation:
   - `START_HERE.md` - Quick start
   - `GITHUB_SETUP.md` - GitHub workflow
   - `TESTING_CHECKLIST.md` - Comprehensive testing
   - `DEPLOYMENT_SUMMARY.md` - Complete deployment

---

**You're all set! Time to network like a pro! 🚀**

