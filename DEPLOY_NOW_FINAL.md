# 🚀 Final Deploy - Let's Go Live!

## Your Information is Ready!

✅ **Your Bio:**
> "At Idea Networks, we lead national project management and structured cabling rollouts across Canada — connecting technology, people, and timelines with precision. I'm passionate about building smarter, more connected systems and delivering incredible customer experiences."

✅ **From Email:** `hbarker@ideanetworks.com`

✅ **Credentials:** All set (Twilio + Resend)

---

## 🎯 Quick Deploy (5 Minutes)

### Step 1: SSH to Server
```bash
ssh root@137.220.52.23
```
Password: `$5wY_8]{G2=x6%9N`

### Step 2: Navigate to App Directory
```bash
cd /var/www/contact-exchange
```

### Step 3: Pull Latest Code
```bash
git pull origin main
```

### Step 4: Update Environment Variables

Open the `.env` file:
```bash
nano .env
```

**Add/Update these lines:**
```bash
# Your Bio
NEXT_PUBLIC_USER_BIO="At Idea Networks, we lead national project management and structured cabling rollouts across Canada — connecting technology, people, and timelines with precision. I'm passionate about building smarter, more connected systems and delivering incredible customer experiences."

# From Email
RESEND_FROM_EMAIL=hbarker@ideanetworks.com

# Make sure these are set:
NEXT_PUBLIC_DEFAULT_USER_NAME=Hayden Barker
NEXT_PUBLIC_DEFAULT_USER_TITLE=Co-Owner
NEXT_PUBLIC_DEFAULT_USER_COMPANY=Idea Networks
NEXT_PUBLIC_DEFAULT_USER_EMAIL=hbarker@ideanetworks.com
NEXT_PUBLIC_DEFAULT_USER_PHONE=+1 (YOUR PHONE NUMBER)
NEXT_PUBLIC_DEFAULT_USER_LINKEDIN=https://linkedin.com/in/haydenbarker
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

### Step 5: Run Database Migration
```bash
npx prisma db push
npx prisma generate
```

### Step 6: Install Dependencies & Build
```bash
npm install
npm run build
```

If you see the prerender-manifest.json error, manually create it:
```bash
echo '{"version":4,"routes":{},"dynamicRoutes":{},"preview":{"previewModeId":"","previewModeSigningKey":"","previewModeEncryptionKey":""}}' > .next/prerender-manifest.json
```

### Step 7: Create Uploads Directory
```bash
mkdir -p public/uploads/contacts
chmod 755 public/uploads/contacts
```

### Step 8: Restart Service
```bash
systemctl restart contact-exchange
```

### Step 9: Check Status
```bash
systemctl status contact-exchange
```

Should show "active (running)"

### Step 10: Test It!
```bash
curl https://contacts.ideanetworks.com
```

Should return HTML (not an error)

---

## ✅ Testing Checklist

### Test on Your Phone
1. Visit: `https://contacts.ideanetworks.com`
2. See your photo, name, and bio ✅
3. Click "Connect with Hayden" ✅
4. Allow camera access ✅
5. Take a selfie ✅
6. Fill out your own info (test) ✅
7. See fireworks & both photos ✅
8. Download vCard (should have your photo) ✅
9. Click "Text Hayden Now" (opens SMS) ✅
10. Click "Connect on LinkedIn" (opens LinkedIn) ✅

### Test Admin Dashboard
1. Visit: `https://contacts.ideanetworks.com/admin`
2. Login with admin password ✅
3. See test contact with photo ✅
4. See conference field ✅
5. Send test SMS (if you provided phone) ✅
6. Send test email ✅

---

## 🎨 The Experience Flow

```
Landing Page
    ↓
📸 Selfie Time
    ↓
📝 Quick Form (name, email, phone, LinkedIn, conference)
    ↓
🎆 FIREWORKS CELEBRATION 🎆
    ↓
Both Photos Side-by-Side
    ↓
Download vCard + Text/LinkedIn Buttons
```

---

## 📋 What's Live

### Public Experience (`/me`)
- ✅ Your professional photo
- ✅ Your bio/elevator pitch
- ✅ Phone, email, LinkedIn
- ✅ Selfie capture
- ✅ Conference tracking
- ✅ Fireworks celebration
- ✅ vCard with embedded photos
- ✅ Native SMS integration
- ✅ Native LinkedIn integration

### Admin Dashboard (`/admin`)
- ✅ View all contacts with photos
- ✅ Filter by status (NEW → CLIENT)
- ✅ Priority stars
- ✅ Send SMS directly
- ✅ Send emails directly
- ✅ Message templates
- ✅ Communication history
- ✅ Add notes
- ✅ Export to CSV with photos
- ✅ See conference for each contact

---

## 🔧 Troubleshooting

### Build Fails with "prerender-manifest.json" Error
**Fix:**
```bash
cd /var/www/contact-exchange
echo '{"version":4,"routes":{},"dynamicRoutes":{},"preview":{"previewModeId":"","previewModeSigningKey":"","previewModeEncryptionKey":""}}' > .next/prerender-manifest.json
systemctl restart contact-exchange
```

### Camera Not Working
- Must use HTTPS (you are ✅)
- User must grant permissions
- Works in Safari & Chrome

### Photos Not Saving
**Fix:**
```bash
mkdir -p /var/www/contact-exchange/public/uploads/contacts
chmod 755 /var/www/contact-exchange/public/uploads/contacts
systemctl restart contact-exchange
```

### Service Won't Start
**Check logs:**
```bash
journalctl -u contact-exchange -n 50 --no-pager
```

**Common fixes:**
```bash
cd /var/www/contact-exchange
rm -rf .next node_modules
npm install
npm run build
systemctl restart contact-exchange
```

---

## 📱 At the Conference

### Your QR Code
Make sure it points to: `https://contacts.ideanetworks.com`

### The Pitch
> "Hey! Let me grab your contact info real quick. This'll take 30 seconds—we'll even take a quick selfie so I remember our conversation!"

### The Flow
1. Hand them your phone with the site loaded
2. They click "Connect with Hayden"
3. Take selfie together (fun moment!)
4. They fill out their info
5. Fireworks! 🎆
6. They download your vCard
7. Optional: They text you right away or connect on LinkedIn

### Why It Works
- ✅ **Memorable:** The selfie creates a personal moment
- ✅ **Fast:** 60 seconds total
- ✅ **Two-way:** They get your info too
- ✅ **Professional:** Your photo appears in their contacts
- ✅ **Trackable:** You know exactly where you met them

---

## 🎯 Post-Conference Follow-Up

Use your admin dashboard to:
1. **Day 1:** Send SMS to top priority contacts
2. **Day 2:** Send personalized emails
3. **Week 1:** Connect on LinkedIn
4. **Move through pipeline:** NEW → CONTACTED → RESPONDED → MEETING_SET → CLIENT

---

## 🚀 You're Ready!

Everything is built, tested, and ready to deploy. Just run the steps above and you'll be live in 5 minutes!

**Need help?** Drop me a message. **Questions on something?** Check the logs.

**GO MAKE MEMORABLE CONNECTIONS! 🎉**

