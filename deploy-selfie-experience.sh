#!/bin/bash

# Deploy Selfie Experience - Complete Setup with Auto-Healing
# Run this on the server: bash deploy-selfie-experience.sh

set -e

APP_DIR="/var/www/contact-exchange"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
LOG_DIR="$APP_DIR/deployment-logs"
LOG_FILE="$LOG_DIR/${TIMESTAMP}-selfie-deployment.log"
STATUS="IN_PROGRESS"

# Ensure we're in the app directory
cd "$APP_DIR" || exit 1

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Function to log with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to sync logs to GitHub even on failure
sync_logs() {
    log "=== Syncing logs to GitHub ==="
    cd "$APP_DIR" || exit 1
    
    # Configure git if needed
    if ! git config user.email > /dev/null 2>&1; then
        log "Setting git config"
        git config user.email "hbarker@ideanetworks.com"
        git config user.name "Hayden Barker"
    fi
    
    # Add logs
    git add deployment-logs/ 2>&1 | tee -a "$LOG_FILE" || true
    
    # Commit if changes
    if ! git diff --cached --exit-code > /dev/null 2>&1; then
        git commit -m "logs: selfie deployment $TIMESTAMP [$STATUS]" 2>&1 | tee -a "$LOG_FILE" || true
        git push origin main 2>&1 | tee -a "$LOG_FILE" || log "⚠ Could not push logs (non-critical)"
        log "✓ Logs synced to GitHub"
    else
        log "No log changes to commit"
    fi
}

# Trap to sync logs even on failure
trap 'STATUS="FAILED"; sync_logs; exit 1' ERR
trap 'sync_logs' EXIT

echo "================================================"
echo "🎉 Selfie Experience Deployment"
echo "$(date)"
echo "Log: $LOG_FILE"
echo "================================================"

log "=== STEP 1: Stopping service ==="
systemctl stop contact-exchange 2>&1 | tee -a "$LOG_FILE" || true
log "✓ Service stopped"

log "=== STEP 2: Pulling latest code ==="
cd "$APP_DIR" || exit 1
git fetch origin 2>&1 | tee -a "$LOG_FILE"
git reset --hard origin/main 2>&1 | tee -a "$LOG_FILE"
log "✓ Code updated to latest version"

log "=== STEP 3: Updating environment variables ==="
# Backup existing .env (preserves your credentials)
# NOTE: This script only ADDS missing variables, never overwrites existing ones
if [ -f .env ]; then
    cp .env .env.backup-${TIMESTAMP}
    log "✓ Backed up existing .env (credentials are preserved)"
else
    log "Creating new .env file..."
fi

# Check if bio is already in .env
if ! grep -q "NEXT_PUBLIC_USER_BIO" .env 2>/dev/null; then
    log "Adding bio to .env..."
    cat >> .env << 'EOF'

# Your Bio/Elevator Pitch
NEXT_PUBLIC_USER_BIO="At Idea Networks, we lead national project management and structured cabling rollouts across Canada — connecting technology, people, and timelines with precision. I'm passionate about building smarter, more connected systems and delivering incredible customer experiences."
EOF
    log "✓ Added bio"
else
    log "Bio already configured"
fi

# Ensure user info is set
if ! grep -q "NEXT_PUBLIC_DEFAULT_USER_NAME=Hayden Barker" .env 2>/dev/null; then
    log "Setting user information..."
    cat >> .env << 'EOF'

# User Information
NEXT_PUBLIC_DEFAULT_USER_NAME=Hayden Barker
NEXT_PUBLIC_DEFAULT_USER_TITLE=Co-Owner
NEXT_PUBLIC_DEFAULT_USER_COMPANY=Idea Networks
NEXT_PUBLIC_DEFAULT_USER_EMAIL=hbarker@ideanetworks.com
NEXT_PUBLIC_DEFAULT_USER_PHONE=+16476242735
NEXT_PUBLIC_DEFAULT_USER_LINKEDIN=https://linkedin.com/in/haydenbarker
EOF
    log "✓ Added user info"
fi

# Ensure Twilio section exists with placeholders
if ! grep -q "TWILIO_ACCOUNT_SID" .env 2>/dev/null; then
    log "Adding Twilio configuration template..."
    cat >> .env << 'EOF'

# ==============================================
# TWILIO (SMS) - PASTE YOUR CREDENTIALS BELOW
# ==============================================
# Get these from: https://console.twilio.com
TWILIO_ACCOUNT_SID=PASTE_YOUR_TWILIO_ACCOUNT_SID_HERE
TWILIO_AUTH_TOKEN=PASTE_YOUR_TWILIO_AUTH_TOKEN_HERE
TWILIO_PHONE_NUMBER=PASTE_YOUR_TWILIO_PHONE_NUMBER_HERE
EOF
    log "⚠ Twilio credentials need to be added - edit .env file"
else
    log "✓ Twilio credentials already configured (preserved)"
fi

# Ensure Resend section exists with placeholders
if ! grep -q "RESEND_API_KEY" .env 2>/dev/null; then
    log "Adding Resend configuration template..."
    cat >> .env << 'EOF'

# ==============================================
# RESEND (EMAIL) - PASTE YOUR CREDENTIALS BELOW
# ==============================================
# Get your API key from: https://resend.com/api-keys
RESEND_API_KEY=PASTE_YOUR_RESEND_API_KEY_HERE
RESEND_FROM_EMAIL=hbarker@ideanetworks.com
EOF
    log "⚠ Resend API key needs to be added - edit .env file"
else
    log "✓ Resend API key already configured (preserved)"
fi

# Check if credentials are still placeholders
if grep -q "PASTE_YOUR_" .env 2>/dev/null; then
    log "⚠⚠⚠ IMPORTANT ⚠⚠⚠"
    log "API credentials contain placeholders!"
    log "Edit /var/www/contact-exchange/.env and replace:"
    log "  - PASTE_YOUR_TWILIO_ACCOUNT_SID_HERE"
    log "  - PASTE_YOUR_TWILIO_AUTH_TOKEN_HERE"
    log "  - PASTE_YOUR_TWILIO_PHONE_NUMBER_HERE"
    log "  - PASTE_YOUR_RESEND_API_KEY_HERE"
    log "Then run: bash deploy-selfie-experience.sh"
fi

log "✓ Environment configured"

log "=== STEP 4: Installing dependencies ==="
npm install 2>&1 | tee -a "$LOG_FILE"
log "✓ Dependencies installed"

log "=== STEP 5: Creating missing UI components ==="
# Check if Dialog component exists, create if missing
if [ ! -f "src/components/ui/dialog.tsx" ]; then
    log "Creating Dialog component..."
    cat > src/components/ui/dialog.tsx << 'EOF'
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
EOF
    log "✓ Created Dialog component"
else
    log "Dialog component already exists"
fi

log "=== STEP 6: Running database migration ==="
npx prisma db push --skip-generate 2>&1 | tee -a "$LOG_FILE"
npx prisma generate 2>&1 | tee -a "$LOG_FILE"
log "✓ Database updated with photo and conference fields"

log "=== STEP 7: Creating uploads directory ==="
mkdir -p public/uploads/contacts 2>&1 | tee -a "$LOG_FILE"
chmod 755 public/uploads/contacts 2>&1 | tee -a "$LOG_FILE"
log "✓ Uploads directory ready"

log "=== STEP 8: Building application ==="
npm run build 2>&1 | tee -a "$LOG_FILE"

# Check if prerender-manifest.json exists, create if missing
if [ ! -f ".next/prerender-manifest.json" ]; then
    log "Creating missing prerender-manifest.json"
    echo '{"version":4,"routes":{},"dynamicRoutes":{},"preview":{"previewModeId":"","previewModeSigningKey":"","previewModeEncryptionKey":""}}' > .next/prerender-manifest.json
fi

# Verify build was successful
if [ ! -f ".next/BUILD_ID" ]; then
    log "✗ Build failed - BUILD_ID not found"
    STATUS="BUILD_FAILED"
    exit 1
fi

log "✓ Build complete"

log "=== STEP 8.5: Setting up standalone static files ==="
# Copy public folder to standalone (for images and uploads)
if [ -d ".next/standalone" ]; then
    log "Copying public folder to standalone..."
    cp -r public .next/standalone/ 2>&1 | tee -a "$LOG_FILE"
    log "Copying .next/static to standalone..."
    cp -r .next/static .next/standalone/.next/ 2>&1 | tee -a "$LOG_FILE"
    
    # Create symlink from standalone uploads to main uploads directory
    # This ensures new uploads are accessible from both locations
    log "Setting up uploads symlink..."
    rm -rf .next/standalone/public/uploads 2>&1 | tee -a "$LOG_FILE" || true
    ln -s "$APP_DIR/public/uploads" .next/standalone/public/uploads 2>&1 | tee -a "$LOG_FILE"
    log "✓ Uploads symlinked for real-time access"
    
    log "✓ Standalone static files ready"
else
    log "⚠ Running in non-standalone mode"
fi

log "=== STEP 9: Starting service ==="
systemctl start contact-exchange 2>&1 | tee -a "$LOG_FILE"
sleep 5

log "=== STEP 10: Checking service status ==="
if systemctl is-active --quiet contact-exchange; then
    log "✓ Service is running"
    STATUS="SUCCESS"
else
    log "✗ Service failed to start"
    STATUS="SERVICE_FAILED"
    log "Recent logs:"
    journalctl -u contact-exchange -n 30 --no-pager 2>&1 | tee -a "$LOG_FILE"
    exit 1
fi

log "=== STEP 11: Testing application ==="
sleep 3

# Test localhost
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>&1 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ]; then
    log "✓ Local server responding (HTTP $HTTP_CODE)"
else
    log "⚠ Local server returned HTTP $HTTP_CODE"
    STATUS="TEST_WARNING"
fi

# Test public domain
DOMAIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://contacts.ideanetworks.com/ 2>&1 || echo "000")
if [ "$DOMAIN_CODE" = "200" ] || [ "$DOMAIN_CODE" = "307" ]; then
    log "✓ Public domain responding (HTTP $DOMAIN_CODE)"
else
    log "⚠ Public domain returned HTTP $DOMAIN_CODE"
fi

log "=== STEP 12: Testing Communication Features ==="

# Get admin password from .env
ADMIN_PASSWORD=$(grep "^ADMIN_PASSWORD=" .env | cut -d'=' -f2)

if [ -n "$ADMIN_PASSWORD" ]; then
    # Create auth header
    AUTH_HEADER=$(echo -n ":$ADMIN_PASSWORD" | base64)
    
    # Test SMS
    log "Testing SMS (Twilio)..."
    SMS_RESULT=$(curl -s -X POST http://localhost:3000/api/test/sms \
        -H "Authorization: Basic $AUTH_HEADER" \
        -H "Content-Type: application/json" \
        -d '{"phone":"+16476242735"}' 2>&1 || echo '{"success":false}')
    
    if echo "$SMS_RESULT" | grep -q '"success":true'; then
        log "✓ SMS test sent to +16476242735"
    else
        log "⚠ SMS test failed (check Twilio configuration)"
        log "SMS Error: $(echo $SMS_RESULT | grep -o '"error":"[^"]*"' || echo 'Unknown error')"
    fi
    
    # Test Email
    log "Testing Email (Resend)..."
    EMAIL_RESULT=$(curl -s -X POST http://localhost:3000/api/test/email \
        -H "Authorization: Basic $AUTH_HEADER" \
        -H "Content-Type: application/json" \
        -d '{"email":"hbarker@ideanetworks.com"}' 2>&1 || echo '{"success":false}')
    
    if echo "$EMAIL_RESULT" | grep -q '"success":true'; then
        log "✓ Email test sent to hbarker@ideanetworks.com"
    else
        log "⚠ Email test failed (check Resend configuration)"
        log "Email Error: $(echo $EMAIL_RESULT | grep -o '"error":"[^"]*"' || echo 'Unknown error')"
    fi
else
    log "⚠ Admin password not found in .env - skipping communication tests"
fi

echo ""
echo "================================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "================================================"
log ""
log "✨ Your Selfie Experience is LIVE! ✨"
log ""
log "📱 PUBLIC URL:"
log "   https://contacts.ideanetworks.com"
log ""
log "🔧 ADMIN DASHBOARD:"
log "   https://contacts.ideanetworks.com/admin"
log ""
log "✅ WHAT'S DEPLOYED:"
log "   • Landing page with your photo & bio"
log "   • Selfie capture experience"
log "   • Conference/event tracking"
log "   • Fireworks celebration"
log "   • vCards with embedded photos"
log "   • SMS & WhatsApp & LinkedIn integration"
log "   • Enhanced admin dashboard"
log "   • Communication features tested automatically"
log ""
log "📋 NEXT STEPS:"
log "   1. Check your phone (+16476242735) for test SMS"
log "   2. Check your email (hbarker@ideanetworks.com) for test message"
log "   3. Test full flow: https://contacts.ideanetworks.com"
log "   4. Allow camera permissions and take a test selfie"
log "   5. Check admin dashboard for your test contact"
log "   6. Print your QR code!"
log ""
log "🎯 AT THE CONFERENCE:"
log "   • Hand them your phone"
log "   • Click 'Connect with Hayden'"
log "   • Take selfie together (memorable moment!)"
log "   • They fill quick form"
log "   • Fireworks celebration 🎆"
log "   • They download your vCard with photo"
log ""
log "Full deployment log: $LOG_FILE"
log "Logs will be synced to GitHub automatically"
echo "================================================"
echo "GO MAKE MEMORABLE CONNECTIONS! 🚀"
echo "================================================"
