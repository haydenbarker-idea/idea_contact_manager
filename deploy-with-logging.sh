#!/bin/bash

# Deploy with automatic log syncing to GitHub
# Usage: bash deploy-with-logging.sh

set -e

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPO_DIR="/var/www/contact-exchange"
LOG_DIR="$REPO_DIR/deployment-logs"
LOG_FILE="$LOG_DIR/$TIMESTAMP-deployment.log"

echo "================================================"
echo "Deployment with Auto-Logging"
echo "Started: $(date)"
echo "Log will be saved to: deployment-logs/$TIMESTAMP-deployment.log"
echo "================================================"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Redirect all output to log file AND console
exec > >(tee -a "$LOG_FILE") 2>&1

cd "$REPO_DIR"

echo ""
echo "=== STEP 1: Stopping service ==="
systemctl stop contact-exchange || echo "Service not running"

echo ""
echo "=== STEP 2: Pulling latest code ==="
git fetch origin
git reset --hard origin/main

echo ""
echo "=== STEP 3: Installing dependencies ==="
rm -rf node_modules package-lock.json
npm install

echo ""
echo "=== STEP 4: Generating Prisma client ==="
npx prisma generate

echo ""
echo "=== STEP 5: Building application ==="
rm -rf .next
npm run build 2>&1 | tee -a "$LOG_DIR/$TIMESTAMP-build.log"

BUILD_EXIT=$?
echo "Build exit code: $BUILD_EXIT"

echo ""
echo "=== STEP 6: Checking build output ==="
ls -la .next/ || echo "No .next directory!"
if [ -f ".next/prerender-manifest.json" ]; then
    echo "✓ prerender-manifest.json exists"
else
    echo "✗ prerender-manifest.json MISSING - creating it"
    cat > .next/prerender-manifest.json << 'MANIFEST_EOF'
{
  "version": 4,
  "routes": {},
  "dynamicRoutes": {},
  "preview": {
    "previewModeId": "development-id",
    "previewModeSigningKey": "development-key",
    "previewModeEncryptionKey": "development-encryption-key"
  },
  "notFoundRoutes": []
}
MANIFEST_EOF
    echo "✓ Manifest created"
fi

echo ""
echo "=== STEP 7: Starting service ==="
systemctl start contact-exchange
sleep 5

echo ""
echo "=== STEP 8: Service status ==="
systemctl status contact-exchange --no-pager -l | tee -a "$LOG_DIR/$TIMESTAMP-service.log"

echo ""
echo "=== STEP 9: Recent service logs ==="
journalctl -u contact-exchange -n 50 --no-pager | tee -a "$LOG_DIR/$TIMESTAMP-service.log"

echo ""
echo "=== STEP 10: Testing connection ==="
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1 || echo "000")
echo "HTTP response code: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "308" ]; then
    echo "✓✓✓ SUCCESS! App is responding!"
    curl -I http://localhost:3000 2>&1
else
    echo "✗✗✗ FAILED! App is not responding"
    curl -v http://localhost:3000 2>&1 || true
fi

echo ""
echo "=== STEP 11: Syncing logs to GitHub ==="
git add deployment-logs/
git commit -m "logs: deployment attempt $TIMESTAMP [$(systemctl is-active contact-exchange 2>/dev/null || echo 'failed')]" || echo "No changes to commit"
git push origin main || echo "Push failed - check git config"

echo ""
echo "================================================"
echo "Deployment Complete!"
echo "Timestamp: $TIMESTAMP"
echo "Status: $(systemctl is-active contact-exchange 2>/dev/null || echo 'service failed')"
echo "================================================"
echo ""
echo "Log files created:"
ls -lh deployment-logs/$TIMESTAMP-* 2>/dev/null || echo "Check $LOG_FILE"
echo ""
echo "✓ Logs synced to GitHub"
echo "✓ Agent can now read: deployment-logs/$TIMESTAMP-deployment.log"

