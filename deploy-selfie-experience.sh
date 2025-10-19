#!/bin/bash

# Deploy Selfie Experience - Complete Setup
# Run this on the server: bash deploy-selfie-experience.sh

set -e

APP_DIR="/var/www/contact-exchange"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
LOG_DIR="$APP_DIR/deployment-logs"
LOG_FILE="$LOG_DIR/${TIMESTAMP}-selfie-deployment.log"

echo "================================================"
echo "🎉 Selfie Experience Deployment"
echo "$(date)"
echo "Log: $LOG_FILE"
echo "================================================"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Function to log with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== STEP 1: Stopping service ==="
systemctl stop contact-exchange 2>&1 | tee -a "$LOG_FILE" || true
log "✓ Service stopped"

log "=== STEP 2: Pulling latest code ==="
cd "$APP_DIR" || exit 1
git fetch origin 2>&1 | tee -a "$LOG_FILE"
git reset --hard origin/main 2>&1 | tee -a "$LOG_FILE"
log "✓ Code updated to latest version"

log "=== STEP 3: Updating environment variables ==="
# Backup existing .env
if [ -f .env ]; then
    cp .env .env.backup-${TIMESTAMP}
    log "✓ Backed up existing .env"
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

# Update Resend from email if not set
if ! grep -q "RESEND_FROM_EMAIL=hbarker@ideanetworks.com" .env 2>/dev/null; then
    log "Setting Resend from email..."
    if grep -q "RESEND_FROM_EMAIL=" .env 2>/dev/null; then
        sed -i 's|RESEND_FROM_EMAIL=.*|RESEND_FROM_EMAIL=hbarker@ideanetworks.com|' .env
    else
        echo "RESEND_FROM_EMAIL=hbarker@ideanetworks.com" >> .env
    fi
    log "✓ Updated from email"
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
EOF
    log "✓ Added user info"
fi

log "✓ Environment configured"

log "=== STEP 4: Installing dependencies ==="
npm install 2>&1 | tee -a "$LOG_FILE"
log "✓ Dependencies installed"

log "=== STEP 5: Running database migration ==="
npx prisma db push --skip-generate 2>&1 | tee -a "$LOG_FILE"
npx prisma generate 2>&1 | tee -a "$LOG_FILE"
log "✓ Database updated with photo and conference fields"

log "=== STEP 6: Creating uploads directory ==="
mkdir -p public/uploads/contacts 2>&1 | tee -a "$LOG_FILE"
chmod 755 public/uploads/contacts 2>&1 | tee -a "$LOG_FILE"
log "✓ Uploads directory ready"

log "=== STEP 7: Building application ==="
npm run build 2>&1 | tee -a "$LOG_FILE"

# Check if prerender-manifest.json exists, create if missing
if [ ! -f ".next/prerender-manifest.json" ]; then
    log "Creating missing prerender-manifest.json"
    echo '{"version":4,"routes":{},"dynamicRoutes":{},"preview":{"previewModeId":"","previewModeSigningKey":"","previewModeEncryptionKey":""}}' > .next/prerender-manifest.json
fi

log "✓ Build complete"

log "=== STEP 8: Starting service ==="
systemctl start contact-exchange 2>&1 | tee -a "$LOG_FILE"
sleep 5

log "=== STEP 9: Checking service status ==="
if systemctl is-active --quiet contact-exchange; then
    log "✓ Service is running"
else
    log "✗ Service failed to start"
    log "Recent logs:"
    journalctl -u contact-exchange -n 30 --no-pager 2>&1 | tee -a "$LOG_FILE"
    exit 1
fi

log "=== STEP 10: Testing application ==="
sleep 3

# Test localhost
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>&1 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ]; then
    log "✓ Local server responding (HTTP $HTTP_CODE)"
else
    log "⚠ Local server returned HTTP $HTTP_CODE"
fi

# Test public domain
DOMAIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://contacts.ideanetworks.com/ 2>&1 || echo "000")
if [ "$DOMAIN_CODE" = "200" ] || [ "$DOMAIN_CODE" = "307" ]; then
    log "✓ Public domain responding (HTTP $DOMAIN_CODE)"
else
    log "⚠ Public domain returned HTTP $DOMAIN_CODE"
fi

log "=== STEP 11: Syncing logs to GitHub ==="
cd "$APP_DIR" || exit 1

# Configure git if needed
if ! git config user.email; then
    log "Setting git config"
    git config user.email "hbarker@ideanetworks.com"
    git config user.name "Hayden Barker"
fi

# Add logs
git add deployment-logs/ 2>&1 | tee -a "$LOG_FILE" || true

# Commit if changes
if ! git diff --cached --exit-code > /dev/null 2>&1; then
    git commit -m "logs: selfie experience deployment $TIMESTAMP [SUCCESS]" 2>&1 | tee -a "$LOG_FILE" || true
    git push origin main 2>&1 | tee -a "$LOG_FILE" || log "⚠ Could not push logs (non-critical)"
else
    log "No log changes to commit"
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
log "   • SMS & LinkedIn integration"
log "   • Enhanced admin dashboard"
log ""
log "📋 NEXT STEPS:"
log "   1. Test on your phone: https://contacts.ideanetworks.com"
log "   2. Allow camera permissions"
log "   3. Take a test selfie"
log "   4. Check admin dashboard for your test contact"
log "   5. Print your QR code!"
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
echo "================================================"
echo "GO MAKE MEMORABLE CONNECTIONS! 🚀"
echo "================================================"

