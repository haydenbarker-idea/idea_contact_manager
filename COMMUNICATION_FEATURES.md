# Communication Features Guide

## Overview

Your Contact Exchange app now includes powerful two-way communication tools to help you stay connected with conference contacts and move them through your sales pipeline.

## New Features

### 1. **Contact Status Pipeline**
Track each contact through their journey:
- **NEW** → Just submitted their info
- **CONTACTED** → You've reached out
- **RESPONDED** → They replied to you
- **MEETING_SET** → Meeting scheduled
- **CLIENT** → Converted to client
- **COLD** → No response/not interested

### 2. **Priority System**
- Star contacts to mark them as high priority
- High-priority contacts stand out in your dashboard
- Use for hot leads or VIP connections

### 3. **SMS Messaging (via Twilio)**
- Send text messages directly from the admin dashboard
- Use pre-built templates or write custom messages
- Automatic tracking of sent messages
- Updates contact status automatically

### 4. **Email Messaging (via Resend)**
- Send professional emails from your dashboard
- Choose from pre-written templates
- Track email history per contact
- Auto-updates last contact timestamp

### 5. **Message Templates**
Pre-built templates for common scenarios:
- **SMS:**
  - Initial Follow-up
  - Check-in
- **EMAIL:**
  - Initial Follow-up
  - Meeting Request
  - Resource Sharing

All templates automatically fill in:
- Contact's name
- Your info (name, title, company)
- Your bio/introduction

### 6. **Communication History**
- View all past interactions with each contact
- See sent SMS and emails
- Track delivery status
- Review conversation timeline

### 7. **Contact Notes**
- Add private notes about each contact
- Track conversation points
- Remember important details

### 8. **Days Since Met**
- Automatically calculates days since initial contact
- Visual reminder to follow up
- Never let a hot lead go cold

### 9. **Enhanced Search & Filtering**
- Filter by status (NEW, CONTACTED, etc.)
- Search by name, email, company, or phone
- Quick stats dashboard

### 10. **Export Improvements**
- CSV export now includes:
  - Status
  - Priority
  - Last contact date
  - Notes

## Setup Requirements

### Twilio (SMS)
1. Sign up at https://twilio.com
2. Get your credentials:
   - Account SID
   - Auth Token
   - Twilio Phone Number
3. Add to `.env`:
   ```
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=+1...
   ```

### Resend (Email)
1. Sign up at https://resend.com
2. Get your API key
3. Verify your domain (for best deliverability)
4. Add to `.env`:
   ```
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL=your@domain.com
   ```

### Your Bio
Add your introduction text to `.env`:
```
NEXT_PUBLIC_USER_BIO="I help businesses scale their technology infrastructure. Let's explore how we can work together to grow your business."
```

This bio will automatically be inserted into your message templates.

## Database Migration

**IMPORTANT:** After updating your code, you MUST run the database migration:

```bash
cd /var/www/contact-exchange
npx prisma migrate dev --name add_communication_features
npx prisma generate
```

Or if already in production:
```bash
npx prisma db push
npx prisma generate
```

This adds the new fields and tables for:
- Contact status
- Priority
- Last contact timestamp
- Communications log

## How to Use

### Admin Dashboard Overview

1. **Stats Row**: Shows count of contacts by status. Click any stat card to filter.

2. **Search Bar**: Find contacts quickly by any field.

3. **Contact Cards** show:
   - Status badge (color-coded)
   - Priority star (if marked important)
   - Days since you met
   - Last contact date
   - Quick action buttons

4. **Action Buttons** on each contact:
   - **Status Dropdown**: Change contact status
   - **📱 SMS Button**: Send text message (if they have phone)
   - **✉️ Email Button**: Send email
   - **✏️ Notes Button**: Add/edit private notes
   - **👁️ History Button**: View communication history
   - **⭐ Star Button**: Toggle priority

### Sending Messages

**SMS Flow:**
1. Click 📱 button on a contact
2. (Optional) Select a template
3. Customize the message
4. Click "Send SMS"
5. Contact automatically marked as "CONTACTED"

**Email Flow:**
1. Click ✉️ button on a contact
2. (Optional) Select a template
3. Add/edit subject line
4. Customize the message
5. Click "Send Email"
6. Contact automatically marked as "CONTACTED"

### Best Practices

1. **Follow Up Quickly**: NEW contacts should be contacted within 24 hours
   
2. **Use Templates**: Save time with consistent messaging
   
3. **Add Notes**: Document key conversation points immediately
   
4. **Track Status**: Move contacts through the pipeline as they respond
   
5. **Star VIPs**: Mark high-value contacts for priority follow-up
   
6. **Review History**: Check past communications before reaching out again

7. **Monitor Days**: Follow up if no response after 3-5 days

## Message Template Variables

Templates automatically replace these placeholders:
- `{{name}}` → Contact's name
- `{{bio}}` → Your bio from .env
- `{{sender_name}}` → Your name
- `{{sender_title}}` → Your job title
- `{{sender_company}}` → Your company
- `{{sender_phone}}` → Your phone
- `{{sender_email}}` → Your email
- `{{sender_linkedin}}` → Your LinkedIn URL

## API Endpoints

New endpoints added:

- `POST /api/communications/sms` - Send SMS
- `POST /api/communications/email` - Send email
- `GET /api/contacts/[id]/communications` - Get communication history
- PATCH `/api/contacts/[id]/status` - Update contact status/priority/notes
- `GET /api/templates` - Get message templates

## Troubleshooting

### SMS not sending
- Check Twilio credentials in `.env`
- Verify phone number format (+1...)
- Check Twilio console for errors
- Ensure phone number is verified (trial accounts)

### Email not sending
- Check Resend API key
- Verify sender email domain
- Check Resend dashboard for logs
- Ensure recipient email is valid

### Communications not saving
- Run database migration
- Check console for errors
- Verify Prisma schema is up to date

## Next Steps

Consider adding:
- Automated follow-up reminders
- Email open tracking
- SMS reply webhooks
- Bulk messaging
- Scheduled messages
- Custom templates per user

---

**Need help?** Check the logs at `/var/www/contact-exchange/logs` or contact support.

