#!/bin/bash

# Deploy Communication Features Update
# This script updates your Contact Exchange app with SMS/Email capabilities

set -e

APP_DIR="/var/www/contact-exchange"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
LOG_DIR="$APP_DIR/deployment-logs"
LOG_FILE="$LOG_DIR/${TIMESTAMP}-communication-update.log"

echo "================================================"
echo "Communication Features Update - $(date)"
echo "Log: $LOG_FILE"
echo "================================================"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Function to log with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== STEP 1: Stopping service ==="
systemctl stop contact-exchange 2>&1 | tee -a "$LOG_FILE"
log "✓ Service stopped"

log "=== STEP 2: Pulling latest code ==="
cd "$APP_DIR" || exit 1
git fetch origin 2>&1 | tee -a "$LOG_FILE"
git reset --hard origin/main 2>&1 | tee -a "$LOG_FILE"
log "✓ Code updated"

log "=== STEP 3: Installing dependencies ==="
npm install 2>&1 | tee -a "$LOG_FILE"
log "✓ Dependencies installed"

log "=== STEP 4: Checking environment variables ==="
if ! grep -q "TWILIO_ACCOUNT_SID" .env 2>/dev/null; then
    log "⚠️  WARNING: Twilio credentials not found in .env"
    log "Please add the following to your .env file:"
    log "  TWILIO_ACCOUNT_SID=your-sid"
    log "  TWILIO_AUTH_TOKEN=your-token"
    log "  TWILIO_PHONE_NUMBER=+1234567890"
fi

if ! grep -q "RESEND_API_KEY" .env 2>/dev/null; then
    log "⚠️  WARNING: Resend credentials not found in .env"
    log "Please add the following to your .env file:"
    log "  RESEND_API_KEY=your-key"
    log "  RESEND_FROM_EMAIL=your@email.com"
fi

if ! grep -q "NEXT_PUBLIC_USER_BIO" .env 2>/dev/null; then
    log "⚠️  INFO: User bio not found in .env"
    log "Consider adding: NEXT_PUBLIC_USER_BIO=\"Your introduction text\""
fi

log "=== STEP 5: Running database migration ==="
npx prisma db push 2>&1 | tee -a "$LOG_FILE"
npx prisma generate 2>&1 | tee -a "$LOG_FILE"
log "✓ Database updated"

log "=== STEP 6: Building application ==="
npm run build 2>&1 | tee -a "$LOG_FILE"

# Check if prerender-manifest.json exists, create if missing
if [ ! -f ".next/prerender-manifest.json" ]; then
    log "⚠️  Creating missing prerender-manifest.json"
    echo '{"version":4,"routes":{},"dynamicRoutes":{},"preview":{"previewModeId":"","previewModeSigningKey":"","previewModeEncryptionKey":""}}' > .next/prerender-manifest.json
fi

log "✓ Build complete"

log "=== STEP 7: Starting service ==="
systemctl start contact-exchange 2>&1 | tee -a "$LOG_FILE"
sleep 3

log "=== STEP 8: Checking service status ==="
if systemctl is-active --quiet contact-exchange; then
    log "✓ Service is running"
else
    log "✗ Service failed to start"
    log "Recent logs:"
    journalctl -u contact-exchange -n 20 --no-pager 2>&1 | tee -a "$LOG_FILE"
    exit 1
fi

log "=== STEP 9: Testing application ==="
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ]; then
    log "✓ Application responding (HTTP $HTTP_CODE)"
else
    log "✗ Application not responding properly (HTTP $HTTP_CODE)"
    journalctl -u contact-exchange -n 20 --no-pager 2>&1 | tee -a "$LOG_FILE"
    exit 1
fi

log "=== STEP 10: Summary ==="
log "✓ Communication features deployed successfully!"
log ""
log "Next steps:"
log "1. Add Twilio credentials to .env (for SMS)"
log "2. Add Resend credentials to .env (for Email)"
log "3. Add NEXT_PUBLIC_USER_BIO to .env (your introduction)"
log "4. Restart service: systemctl restart contact-exchange"
log "5. Test at: https://contacts.ideanetworks.com/admin"
log ""
log "Documentation: $APP_DIR/COMMUNICATION_FEATURES.md"
log "Full log: $LOG_FILE"

log "=== STEP 11: Syncing logs to GitHub ==="
cd "$APP_DIR" || exit 1

# Configure user.name and user.email if not set
if ! git config user.email; then
    log "Setting default git config"
    git config user.email "hbarker@ideanetworks.com"
    git config user.name "Hayden Barker"
fi

# Add all new log files
git add deployment-logs/ 2>&1 | tee -a "$LOG_FILE"

# Commit changes if any
if git diff --cached --exit-code; then
    log "No changes to commit"
else
    git commit -m "logs: communication features deployment $TIMESTAMP [SUCCESS]" 2>&1 | tee -a "$LOG_FILE"
fi

# Push to GitHub
if git push origin main 2>&1 | tee -a "$LOG_FILE"; then
    log "✓ Logs synced to GitHub"
else
    log "⚠️  Push failed - check git config"
fi

echo "================================================"
echo "Deployment complete! Check log for details."
echo "================================================"

