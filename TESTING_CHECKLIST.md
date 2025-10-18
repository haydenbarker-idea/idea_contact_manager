# Testing Checklist

Before going live at the conference, verify everything works!

---

## ✅ Pre-Deployment Tests (Local)

### Development Environment
- [ ] `npm install` completes without errors
- [ ] `npx prisma generate` runs successfully
- [ ] `npx prisma db push` creates database tables
- [ ] `npm run dev` starts development server
- [ ] Can access http://localhost:3000

### Public Contact Page
- [ ] Page loads at `/me`
- [ ] Your name, title, company display correctly
- [ ] Profile photo displays (if configured)
- [ ] Page is responsive on mobile (use browser dev tools)
- [ ] All text is readable

### Contact Card Actions
- [ ] "Add to Contacts" button downloads `.vcf` file
- [ ] vCard file opens in contacts app
- [ ] vCard contains all your information
- [ ] "Send Text" button generates correct SMS link
- [ ] "Connect on LinkedIn" button has correct URL

### Contact Form
- [ ] Form displays below contact card
- [ ] All fields are visible
- [ ] Email validation works (try invalid email)
- [ ] Form submits successfully
- [ ] Success message appears
- [ ] Contact is saved to database

### Admin Dashboard
- [ ] Can access `/admin` page
- [ ] Login prompt appears
- [ ] Correct password grants access
- [ ] Wrong password shows error
- [ ] Submitted contacts appear in list
- [ ] Stats show correct counts
- [ ] "Mark Followed Up" button works
- [ ] "Export CSV" downloads file
- [ ] CSV contains all contact data

---

## ✅ Server Setup Tests

### Server Access
- [ ] Can SSH to server: `ssh root@137.220.52.23`
- [ ] Server is Ubuntu 22.04
- [ ] Have sudo/root access

### DNS Configuration
- [ ] DNS A record points to 137.220.52.23
- [ ] `ping contacts.ideanetworks.com` returns correct IP
- [ ] `dig contacts.ideanetworks.com` shows A record

### Server Setup Script
- [ ] Script runs without errors
- [ ] Node.js installed: `node -v` shows v20.x
- [ ] PostgreSQL installed: `sudo systemctl status postgresql`
- [ ] Nginx installed: `sudo systemctl status nginx`
- [ ] SSL certificate obtained
- [ ] Firewall configured: `sudo ufw status`
- [ ] Database credentials saved

---

## ✅ Production Deployment Tests

### Application Deployment
- [ ] Files copied to `/var/www/contact-exchange`
- [ ] `.env` file created with correct values
- [ ] `npm install` completed on server
- [ ] `npx prisma db push` created tables
- [ ] `npm run build` succeeded
- [ ] No errors in build output

### Service Status
- [ ] Service starts: `sudo systemctl start contact-exchange`
- [ ] Service is active: `sudo systemctl status contact-exchange`
- [ ] Service enabled: `sudo systemctl enable contact-exchange`
- [ ] App responds: `curl http://localhost:3000`

### Nginx & SSL
- [ ] Nginx is running: `sudo systemctl status nginx`
- [ ] SSL certificate is valid
- [ ] HTTP redirects to HTTPS
- [ ] HTTPS loads without warnings

---

## ✅ Live Site Tests (Production)

### Basic Functionality
- [ ] Site loads: https://contacts.ideanetworks.com
- [ ] SSL shows green lock in browser
- [ ] No console errors (check browser dev tools)
- [ ] Page loads fast (under 2 seconds)

### Public Contact Page
- [ ] Your information displays correctly
- [ ] Profile photo loads (if configured)
- [ ] Page looks good on desktop
- [ ] Page looks good on mobile (test with real phone)
- [ ] Page looks good on tablet

### vCard Download
- [ ] Click "Add to Contacts" downloads file
- [ ] File is named correctly (e.g., `Your_Name.vcf`)
- [ ] File opens in contacts app (iOS/Android)
- [ ] All fields populated correctly:
  - [ ] Name
  - [ ] Email
  - [ ] Phone
  - [ ] Company
  - [ ] Title
  - [ ] LinkedIn URL

### SMS Integration (Test on Mobile)
- [ ] Click "Send Text" opens SMS app
- [ ] Message is pre-filled
- [ ] Your phone number is correct
- [ ] Can send the message

### LinkedIn Integration
- [ ] Click "Connect on LinkedIn" opens LinkedIn
- [ ] Correct profile loads
- [ ] Works on mobile app
- [ ] Works on desktop

### Contact Form Submission
- [ ] Form is visible and styled correctly
- [ ] Can fill in all fields
- [ ] Submit button works
- [ ] Success message appears
- [ ] Form resets after submission
- [ ] Can submit multiple contacts

### Admin Dashboard Access
- [ ] Can access https://contacts.ideanetworks.com/admin
- [ ] Login page appears
- [ ] Login with correct password works
- [ ] Dashboard shows stats
- [ ] Submitted contacts appear in list
- [ ] "Mark Followed Up" works
- [ ] "Export CSV" downloads
- [ ] Logout works
- [ ] Auto-login works (after first login)

---

## ✅ Mobile Testing (Critical!)

Most people will scan on mobile, so test thoroughly:

### iOS Testing
- [ ] Safari: Page loads correctly
- [ ] Safari: vCard downloads and imports
- [ ] Safari: SMS link works
- [ ] Safari: LinkedIn link opens app
- [ ] Safari: Form submission works
- [ ] Chrome iOS: Everything works
- [ ] Form is easy to type on mobile keyboard

### Android Testing
- [ ] Chrome: Page loads correctly
- [ ] Chrome: vCard downloads and imports
- [ ] Chrome: SMS link works
- [ ] Chrome: LinkedIn link opens app
- [ ] Chrome: Form submission works
- [ ] Samsung Internet: Everything works
- [ ] Form is easy to type on mobile keyboard

---

## ✅ QR Code Testing

### QR Code Generation
- [ ] QR code points to https://contacts.ideanetworks.com/me
- [ ] QR code is large enough to scan (300x300px minimum)
- [ ] QR code has error correction enabled

### QR Code Scanning
- [ ] iOS Camera app can scan QR code
- [ ] Android camera app can scan QR code
- [ ] QR code works from 1-2 feet away
- [ ] QR code works in bright light
- [ ] QR code works in dim light
- [ ] Scanning opens your site immediately

---

## ✅ Performance Tests

### Load Time
- [ ] Page loads in under 2 seconds
- [ ] Images load quickly (if using avatar)
- [ ] No "flash of unstyled content"
- [ ] Smooth animations

### Stress Test
- [ ] Submit 5 contacts rapidly
- [ ] All submissions saved correctly
- [ ] Admin dashboard loads quickly
- [ ] Export CSV with 10+ contacts works

---

## ✅ Error Handling

### Form Validation
- [ ] Empty name field shows error
- [ ] Invalid email shows error
- [ ] Invalid LinkedIn URL shows error
- [ ] Error messages are clear

### Network Errors
- [ ] Poor connection: Form shows error
- [ ] Timeout: User gets feedback
- [ ] Duplicate submission prevented

### Admin Errors
- [ ] Wrong password shows error
- [ ] Unauthorized access blocked
- [ ] Database errors handled gracefully

---

## ✅ Security Tests

### Admin Protection
- [ ] Can't access admin without password
- [ ] Wrong password rejected
- [ ] Password not visible in URL
- [ ] Session persists (localStorage)

### Input Sanitization
- [ ] SQL injection attempts fail
- [ ] XSS attempts fail
- [ ] Special characters handled correctly

### HTTPS
- [ ] HTTP auto-redirects to HTTPS
- [ ] No mixed content warnings
- [ ] SSL certificate valid

---

## ✅ Conference Day Checklist

### Before the Conference
- [ ] QR code sticker on phone
- [ ] QR code is scannable
- [ ] Site is live and working
- [ ] Have admin password ready
- [ ] Phone is charged
- [ ] Backup QR code printed (just in case)

### During Conference
- [ ] Test scan at start of day
- [ ] Check admin dashboard periodically
- [ ] Monitor for any issues
- [ ] Phone stays charged

### After Each Exchange
- [ ] Check if contact submitted
- [ ] Add quick note if needed
- [ ] Mark important contacts

### End of Day
- [ ] Export contacts to CSV
- [ ] Backup data
- [ ] Check all submissions loaded
- [ ] Plan follow-ups

---

## 🐛 Common Issues & Fixes

### "Site can't be reached"
- Check DNS: `ping contacts.ideanetworks.com`
- Check server: `ssh root@137.220.52.23`
- Check Nginx: `sudo systemctl status nginx`

### "SSL certificate error"
- Run: `sudo certbot renew`
- Check DNS is correct
- Wait for DNS propagation

### "Database connection failed"
- Check .env DATABASE_URL
- Check PostgreSQL: `sudo systemctl status postgresql`
- Test connection: `psql DATABASE_URL`

### "Page won't load"
- Check app: `sudo systemctl status contact-exchange`
- Check logs: `sudo journalctl -u contact-exchange -f`
- Restart: `sudo systemctl restart contact-exchange`

### "vCard won't download"
- Check API: `curl https://contacts.ideanetworks.com/api/vcard`
- Check .env has all NEXT_PUBLIC_ variables
- Rebuild: `npm run build && sudo systemctl restart contact-exchange`

### "Form submission fails"
- Check logs: `sudo journalctl -u contact-exchange -f`
- Check database connection
- Test API: `curl -X POST https://contacts.ideanetworks.com/api/contacts/submit`

---

## ✅ Final Sign-Off

Once all above tests pass:

- [ ] **Public page works perfectly**
- [ ] **vCard download works**
- [ ] **SMS and LinkedIn links work**
- [ ] **Form submission works**
- [ ] **Admin dashboard accessible**
- [ ] **Mobile testing complete**
- [ ] **QR code scans successfully**
- [ ] **SSL certificate valid**

**🎉 You're ready for the conference!**

---

## Emergency Contacts

If something goes wrong during the conference:

1. **Check logs**: `ssh root@137.220.52.23` then `sudo journalctl -u contact-exchange -f`
2. **Restart app**: `sudo systemctl restart contact-exchange`
3. **Check status**: `sudo systemctl status contact-exchange nginx postgresql`

**Worst case**: Have business cards as backup! 😉

