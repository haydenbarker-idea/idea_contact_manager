#!/bin/bash

# Quick Deploy Script for SaaS Instance
# Pulls, builds, tests, and syncs logs to GitHub automatically

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SAAS_DIR="/var/www/contact-exchange-saas"
LOG_DIR="$SAAS_DIR/deployment-logs"
LOG_FILE="$LOG_DIR/quick-deploy-$TIMESTAMP.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}✗ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠ $1${NC}" | tee -a "$LOG_FILE"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   error "Please run as root (use sudo)"
   exit 1
fi

# Configure git for automated log syncing
configure_git() {
    cd "$SAAS_DIR"
    git config user.email "hbarker@ideanetworks.com"
    git config user.name "Hayden Barker"
    success "Git configured for automated logging"
}

# Sync logs to GitHub
sync_logs_to_github() {
    log "=== Syncing logs to GitHub ==="
    cd "$SAAS_DIR"
    
    log "Adding deployment logs..."
    git add deployment-logs/*.log 2>&1 | tee -a "$LOG_FILE"
    
    log "Committing logs..."
    git commit -m "logs: quick-deploy $TIMESTAMP" 2>&1 | tee -a "$LOG_FILE" || true
    
    log "Pushing to GitHub..."
    if git push origin feature/viral-saas 2>&1 | tee -a "$LOG_FILE"; then
        success "Logs synced to GitHub successfully"
        log "View at: https://github.com/haydenbarker-idea/idea_contact_manager/tree/feature/viral-saas/deployment-logs"
    else
        warning "Failed to sync logs to GitHub (may not be critical)"
    fi
}

# Set up EXIT trap to sync logs even on failure
trap sync_logs_to_github EXIT

echo "===================================================="
echo "Quick Deploy - SaaS Instance"
echo "===================================================="
echo ""

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

log "=== Quick Deploy Started ==="
log "Timestamp: $TIMESTAMP"

# Configure git
configure_git

# Step 1: Pull latest code
log "=== STEP 1: Pulling latest code ==="
cd "$SAAS_DIR"

log "Current branch:"
git branch --show-current 2>&1 | tee -a "$LOG_FILE"

log "Fetching from GitHub..."
git fetch origin 2>&1 | tee -a "$LOG_FILE"

log "Pulling latest code..."
git pull origin feature/viral-saas 2>&1 | tee -a "$LOG_FILE"

success "Code updated"

# Step 2: Install any new dependencies
log "=== STEP 2: Checking dependencies ==="
log "Running npm install..."
npm install 2>&1 | tee -a "$LOG_FILE"
success "Dependencies updated"

# Step 3: Regenerate Prisma client
log "=== STEP 3: Regenerating Prisma client ==="
npx prisma generate 2>&1 | tee -a "$LOG_FILE"
success "Prisma client updated"

# Step 4: Build application
log "=== STEP 4: Building application ==="
log "Running npm run build (takes ~90 seconds)..."

if npm run build 2>&1 | tee -a "$LOG_FILE"; then
    success "Build completed successfully"
else
    error "Build failed - check logs above"
    exit 1
fi

# Step 5: Copy static files
log "=== STEP 5: Copying static files ==="
if [ -d ".next/static" ]; then
    cp -r .next/static .next/standalone/.next/static 2>&1 | tee -a "$LOG_FILE"
    success "Static files copied"
else
    warning ".next/static not found - may cause issues"
fi

# Step 6: Restart service
log "=== STEP 6: Restarting service ==="
systemctl restart contact-exchange-saas 2>&1 | tee -a "$LOG_FILE"

# Wait for service to start
sleep 3

if systemctl is-active --quiet contact-exchange-saas; then
    success "Service restarted successfully"
else
    error "Service failed to start"
    log "Checking service status..."
    systemctl status contact-exchange-saas 2>&1 | tee -a "$LOG_FILE"
    exit 1
fi

# Step 7: Test communications
log "=== STEP 7: Testing Communication Features ==="

# Load environment variables for testing
if [ -f "$SAAS_DIR/.env" ]; then
    export $(grep -v '^#' "$SAAS_DIR/.env" | grep -E '^(NEXT_PUBLIC_DEFAULT_USER_|TWILIO_|RESEND_)' | xargs)
fi

TEST_PHONE="${NEXT_PUBLIC_DEFAULT_USER_PHONE:-+16476242735}"
TEST_EMAIL="${NEXT_PUBLIC_DEFAULT_USER_EMAIL:-hbarker@ideanetworks.com}"

# Wait for app to be ready
sleep 2

# Test SMS
log "Testing SMS (Twilio)..."
SMS_RESULT=$(curl -s -X POST https://saas.contacts.ideanetworks.com/api/test/sms \
    -H "Content-Type: application/json" \
    -d "{\"phone\":\"$TEST_PHONE\"}" || echo '{"success":false}')

if echo "$SMS_RESULT" | grep -q '"success":true'; then
    success "✓ SMS test sent to $TEST_PHONE"
else
    warning "SMS test failed or not configured"
    log "Response: $SMS_RESULT"
fi

# Test Email
log "Testing Email (Resend)..."
EMAIL_RESULT=$(curl -s -X POST https://saas.contacts.ideanetworks.com/api/test/email \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\"}" || echo '{"success":false}')

if echo "$EMAIL_RESULT" | grep -q '"success":true'; then
    success "✓ Email test sent to $TEST_EMAIL"
else
    warning "Email test failed or not configured"
    log "Response: $EMAIL_RESULT"
fi

# Step 8: Verify deployment
log "=== STEP 8: Verifying deployment ==="

log "Testing HTTPS connection..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://saas.contacts.ideanetworks.com || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    success "Site is accessible (HTTP $HTTP_STATUS)"
else
    warning "Site returned HTTP $HTTP_STATUS"
fi

log "Checking database..."
USER_COUNT=$(sudo -u postgres psql -d contact_exchange_saas -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | xargs || echo "0")
CONTACT_COUNT=$(sudo -u postgres psql -d contact_exchange_saas -t -c "SELECT COUNT(*) FROM contacts;" 2>/dev/null | xargs || echo "0")

log "Database stats:"
log "  • Users: $USER_COUNT"
log "  • Contacts: $CONTACT_COUNT"

success "Verification complete"

log "=== DEPLOYMENT SUCCESS ==="

echo ""
echo "===================================================="
echo "  ✅ Quick Deploy Complete!"
echo "===================================================="
echo ""
echo "🌍 Application:"
echo "   URL: https://saas.contacts.ideanetworks.com"
echo "   Status: $(systemctl is-active contact-exchange-saas)"
echo ""
echo "📊 Database:"
echo "   Users: $USER_COUNT"
echo "   Contacts: $CONTACT_COUNT"
echo ""
echo "📝 Logs:"
echo "   File: $LOG_FILE"
echo "   GitHub: Syncing automatically..."
echo ""
echo "🔍 Test Results:"
echo "   HTTP Status: $HTTP_STATUS"
echo "   SMS: $(echo "$SMS_RESULT" | grep -q '"success":true' && echo "✓ Sent" || echo "✗ Failed/Skipped")"
echo "   Email: $(echo "$EMAIL_RESULT" | grep -q '"success":true' && echo "✓ Sent" || echo "✗ Failed/Skipped")"
echo ""
echo "📱 Admin Dashboard:"
echo "   https://saas.contacts.ideanetworks.com/admin"
echo ""
echo "===================================================="

log "Deployment completed at: $(date '+%Y-%m-%d %H:%M:%S')"

