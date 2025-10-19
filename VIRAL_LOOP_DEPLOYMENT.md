# 🚀 Viral Loop Feature - Deployment Guide

## 🎉 What's New

This update transforms the Contact Exchange app from single-user to **unlimited multi-tenant SaaS**!

### The Viral Loop:
```
User submits contact 
  → Sees "I Want This!" button 
  → 60-second onboarding 
  → Gets own page instantly 
  → Shares with contacts 
  → VIRAL GROWTH! 📈
```

---

## ⚠️ IMPORTANT: Database Migration Required

**This update changes the database schema.** You MUST run a migration before deploying.

### New Database Tables:
- **users** - Store user accounts and profiles
- **contacts.userId** - Link contacts to users (nullable)

---

## 🔧 Deployment Steps

### 1. On Your Server (SSH)

```bash
cd /var/www/contact-exchange

# Pull latest code
git fetch origin
git reset --hard origin/main

# Install new dependencies (bcryptjs)
npm install

# ⚠️ CRITICAL: Run database migration
npx prisma migrate dev --name add_users_table

# Or for production:
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Now deploy normally
bash deploy-selfie-experience.sh
```

### 2. What the Migration Does

- Creates `users` table with:
  - Profile info (name, email, phone, etc.)
  - Bio and photo customization
  - Unique slug for URL (`/u/username`)
  - Hashed password for authentication
  - Active status flag

- Updates `contacts` table:
  - Adds `userId` field (nullable)
  - Creates index on `userId`
  - Links contacts to the user who collected them

- **Backwards Compatible:**
  - All existing contacts keep working (userId = null)
  - Hayden's contacts are preserved
  - No data loss

---

## 🎯 Testing the Viral Loop

### Step 1: Test as a New User

1. Go to: `https://contacts.ideanetworks.com/me`
2. Complete the contact exchange (take selfie, fill form)
3. On celebration screen, look for **"I Want This!"** button
4. Click it → Should go to `/get-started`

### Step 2: Complete Onboarding

1. **Step 1:** Confirm your info (should be pre-filled)
2. **Step 2:** Add a bio and upload photo
3. **Step 3:** Choose username (e.g., `john-smith`)
   - Watch for green checkmark (available)
   - Set a password
4. Click **"Create My Page!"**

### Step 3: Verify Your Page

1. Should redirect to: `/u/john-smith?welcome=true`
2. Green banner shows: "Welcome! Your page is live"
3. Your profile shows with your photo and bio
4. Test the full flow:
   - Have someone submit a contact to YOUR page
   - Check if their info is saved
   - Verify they see YOUR information

### Step 4: Check Database

```bash
# On server
npx prisma studio

# Or via psql:
psql -d contact_exchange

# Check users table:
SELECT id, name, email, slug, active FROM users;

# Check contacts linked to user:
SELECT name, email, "userId" FROM contacts WHERE "userId" IS NOT NULL;
```

---

## 🎨 What Users See

### On Celebration Screen (After Submitting Contact):

```
┌─────────────────────────────────────────┐
│  ✅ Fireworks, "Thanks!", Contact Info  │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ ✨ Want This For Yourself?        │ │
│  │                                   │ │
│  │ Get Your Own Contact Exchange     │ │
│  │ Setup takes 60 seconds. Free.     │ │
│  │                                   │ │
│  │  [ 🚀 I Want This! ]              │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Onboarding Flow:

```
Step 1: Your Information
├─ Name, Email (pre-filled)
├─ Phone, LinkedIn
└─ Company, Title

Step 2: Customize Profile
├─ Bio (required, 500 chars)
└─ Profile Photo (upload)

Step 3: Choose Username
├─ Slug: /u/your-name
├─ Real-time availability check
└─ Password (6+ characters)
```

### New User Page:

```
https://contacts.ideanetworks.com/u/john-smith

┌─────────────────────────────────────────┐
│ 🎉 Welcome John! Your page is live     │
│ Share this link to collect contacts!   │
└─────────────────────────────────────────┘

[Their profile photo]
John Smith
CEO at ACME Inc

"I'm passionate about..."

[Connect with John] → Contact Exchange Flow
```

---

## 🔐 Security Features

✅ **Password Hashing:** bcryptjs with salt rounds  
✅ **Slug Validation:** Only a-z, 0-9, hyphens  
✅ **Email Uniqueness:** Prevents duplicate accounts  
✅ **Slug Uniqueness:** Each username is unique  
✅ **Input Sanitization:** All user input validated  
✅ **SQL Injection Protection:** Prisma parameterized queries  

---

## 📊 Database Schema

### Users Table

```prisma
model User {
  id          String    @id @default(cuid())
  
  // Profile
  name        String
  email       String    @unique
  phone       String?
  linkedin    String?
  company     String?
  title       String?
  bio         String?
  photoUrl    String?
  
  // URL & Auth
  slug        String    @unique  // /u/[slug]
  password    String    // Hashed with bcryptjs
  
  // Status
  active      Boolean   @default(true)
  
  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lastLoginAt DateTime?
  
  // Relations
  contacts    Contact[] // Contacts they collected
}
```

### Updated Contacts Table

```prisma
model Contact {
  id       String  @id @default(cuid())
  userId   String? // NEW: Links to user who collected them
  user     User?   @relation(...)
  
  // ... rest of contact fields ...
}
```

---

## 🎓 User Management

### View All Users:
```bash
npx prisma studio
# Navigate to "User" model
```

### Reset User Password (if needed):
```bash
node
> const bcrypt = require('bcryptjs')
> bcrypt.hash('newpassword', 10).then(console.log)
# Copy hash, update in database
```

### Deactivate User:
```sql
UPDATE users SET active = false WHERE slug = 'username';
```

### Delete User (removes all their contacts):
```sql
DELETE FROM users WHERE slug = 'username';
-- Contacts cascade delete automatically
```

---

## 🚨 Troubleshooting

### "User already exists"
- Email is already in database
- Slug is already taken
- User should try different username

### "Slug not available"
- Someone else has that username
- Try variations: john-smith, john-s, jsmith

### Photo not uploading
- Check `public/uploads/` directory exists
- Verify permissions: `chmod 755 public/uploads`
- Check file size (max 5MB)

### Migration fails
```bash
# Reset and retry:
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Can't find user page
- Check user.active = true
- Verify slug in database matches URL
- Check for typos in slug

---

## 📈 Monitoring Growth

### Track User Signups:
```sql
-- Total users
SELECT COUNT(*) FROM users WHERE active = true;

-- Users by day
SELECT DATE(created_at), COUNT(*) 
FROM users 
GROUP BY DATE(created_at) 
ORDER BY DATE(created_at) DESC;

-- Most active users (by contacts collected)
SELECT 
  u.name, 
  u.slug, 
  COUNT(c.id) as contact_count
FROM users u
LEFT JOIN contacts c ON u.id = c."userId"
GROUP BY u.id
ORDER BY contact_count DESC
LIMIT 10;
```

### Viral Coefficient:
```
Viral Coefficient = (New Users / Existing Users) per time period

Goal: > 1.0 = exponential growth!
```

---

## 🎯 Next Steps

### Phase 1: Core Viral Loop ✅ (COMPLETED)
- [x] Database schema
- [x] "I Want This!" button
- [x] Onboarding flow
- [x] Dynamic user routes
- [x] User signup API

### Phase 2: User Features (TODO)
- [ ] User login/authentication
- [ ] User-specific admin dashboard (/u/[username]/admin)
- [ ] Edit profile
- [ ] View analytics (contacts collected, growth)
- [ ] Export contacts

### Phase 3: Enhanced Viral Loop (TODO)
- [ ] Referral tracking (who signed up from whose page?)
- [ ] Leaderboard (most contacts collected)
- [ ] Social sharing buttons
- [ ] Email invite system
- [ ] Incentives for referrals

### Phase 4: Monetization (TODO)
- [ ] Free tier (50 contacts)
- [ ] Pro tier ($9/mo - unlimited contacts)
- [ ] Analytics dashboard
- [ ] CRM integrations
- [ ] Custom branding

---

## 🎊 Success Metrics

Track these after deployment:

✅ **Activation Rate:** % of contacts who click "I Want This!"  
✅ **Completion Rate:** % who finish onboarding  
✅ **Viral Coefficient:** New users per existing user  
✅ **Time to First Contact:** How fast new users collect their first contact  
✅ **Retention:** % of users still active after 7 days  

**Target:** 20% activation rate × 80% completion × 2.0 viral coefficient = 32% compound growth per cycle! 🚀

---

## 💡 Tips for Maximum Virality

1. **Make it easy:** Onboarding is 60 seconds - keep it that way
2. **Social proof:** Show "X people using this" counter
3. **Incentives:** First 100 users get premium features free
4. **Scarcity:** "Limited beta access" creates urgency
5. **Share buttons:** Make it ONE CLICK to share their page
6. **Gamification:** Badges for milestones (10, 50, 100 contacts)

---

**Ready to go viral!** 🚀📈

Deploy, test, and watch the exponential growth! 🎉

