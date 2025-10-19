# Changelog

All notable changes to the Contact Exchange app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-10-19

### 🎉 Initial Production Release

First stable, production-ready version of the Contact Exchange app.

### Added
- **Selfie Capture Experience**
  - Camera access with permission handling
  - Photo upload and storage
  - Display on celebration screen with fireworks
  - Photos embedded in vCards

- **Contact Exchange Flow**
  - Landing page with profile photo and bio
  - Multi-step form (selfie → contact info → celebration)
  - Conference/event tracking
  - Fireworks animation on success

- **Multi-Channel Automatic Follow-Up**
  - SMS via Twilio (instant, with vCard link)
  - Email via Resend (HTML template + PDF attachment)
  - WhatsApp integration (downloads vCard first)
  - LinkedIn connection option

- **vCard Generation**
  - Includes embedded photos (base64)
  - Proper mobile download handling
  - Dynamic generation for each contact
  - Your vCard with your photo

- **Admin Dashboard (CRM)**
  - View all contacts with photos
  - Status pipeline (NEW → CONTACTED → RESPONDED → MEETING_SET → CLIENT → COLD)
  - Send SMS/Email directly from dashboard
  - Communication history tracking
  - Notes and priority flags
  - Contact deletion
  - CSV export
  - Search and filtering

- **Professional Email Template**
  - Gradient design (purple/blue)
  - Mobile-responsive
  - Includes contact info, LinkedIn links
  - Company value proposition
  - PDF attachment support
  - Strong CTA for business opportunities

- **Deployment & DevOps**
  - Self-healing deployment script
  - Automatic log sync to GitHub
  - Environment variable auto-population
  - Credential preservation across deployments
  - Test endpoints for SMS/Email validation
  - Debug endpoint for troubleshooting
  - Automatic deployment testing
  - Photo serving via API route
  - Standalone deployment mode support

### Technical Details
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL with Prisma ORM
- **SMS:** Twilio integration
- **Email:** Resend with HTML templates and PDF attachments
- **Deployment:** Docker + Nginx Proxy Manager
- **Server:** Ubuntu 22.04

### Configuration
- Environment variables with smart defaults
- Auto-populated user information
- Placeholder system for API credentials
- Comprehensive logging throughout

---

## [Unreleased]

Features and fixes that are in development but not yet released.

### Planned Features
- TBD (to be discussed)

---

## Version History

- **v1.0.0** (2025-10-19): Initial production release ✅

---

## How to Use This Changelog

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

---

## Version Tagging

To see all available versions:
```bash
git tag -l
```

To checkout a specific version:
```bash
git checkout v1.0.0
```

To see what changed between versions:
```bash
git diff v1.0.0 v1.1.0
```

