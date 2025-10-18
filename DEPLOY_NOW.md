# 🚀 Deploy to Server - Quick Commands

Your code is now on GitHub at:
**https://github.com/haydenbarker-idea/idea_contact_manager.git**

---

## Complete Deployment (Copy & Paste)

### Step 1: DNS Setup
Point `contacts.ideanetworks.com` → `137.220.52.23` (A Record at your DNS provider)

Wait 5 minutes, then verify:
```bash
ping contacts.ideanetworks.com
```

---

### Step 2: Upload Scripts to Server
From your Windows machine (PowerShell):
```powershell
scp server-setup-quick.sh root@137.220.52.23:/root/
scp deploy-from-github.sh root@137.220.52.23:/root/
```

---

### Step 3: Run Complete Deployment
SSH to server and run these commands:

```bash
ssh root@137.220.52.23

# 1. Setup server (Node.js, PostgreSQL, Nginx, SSL)
chmod +x /root/server-setup-quick.sh
sudo bash /root/server-setup-quick.sh
# Enter: contacts.ideanetworks.com and your email

# 2. Deploy from GitHub
chmod +x /root/deploy-from-github.sh
sudo bash /root/deploy-from-github.sh https://github.com/haydenbarker-idea/idea_contact_manager.git
# Enter your contact information when prompted
```

That's it! Your site will be live at **https://contacts.ideanetworks.com**

---

## One-Line Alternative (After DNS is configured)

```bash
ssh root@137.220.52.23 'curl -sO https://raw.githubusercontent.com/haydenbarker-idea/idea_contact_manager/main/server-setup-quick.sh && curl -sO https://raw.githubusercontent.com/haydenbarker-idea/idea_contact_manager/main/deploy-from-github.sh && chmod +x *.sh && bash server-setup-quick.sh'
```

---

## What Will Be Installed

- ✅ Node.js 20 LTS
- ✅ PostgreSQL 15
- ✅ Nginx reverse proxy
- ✅ Let's Encrypt SSL certificate
- ✅ Your contact exchange application
- ✅ Systemd service (auto-start on boot)

---

## After Deployment

Visit: https://contacts.ideanetworks.com
- Test vCard download
- Test SMS link (on phone)
- Test LinkedIn link
- Test form submission
- Login to /admin with your password
- Export contacts to CSV

---

## Update Your QR Code

Point it to:
```
https://contacts.ideanetworks.com
```

---

## Future Updates

When you make changes:

```bash
# The code is already on GitHub, so just:
ssh root@137.220.52.23
cd /var/www/contact-exchange
git pull
npm run build
sudo systemctl restart contact-exchange
```

Or one-liner:
```bash
ssh root@137.220.52.23 'cd /var/www/contact-exchange && git pull && npm run build && sudo systemctl restart contact-exchange'
```

---

## Quick Commands

```bash
# View logs
ssh root@137.220.52.23 'journalctl -u contact-exchange -f'

# Restart app
ssh root@137.220.52.23 'systemctl restart contact-exchange'

# Check status
ssh root@137.220.52.23 'systemctl status contact-exchange'
```

---

## ✅ Ready!

You're all set! Follow the steps above and you'll be live in 30 minutes! 🎉

