#!/bin/bash

# Redirect all output to a log file
LOG_FILE="/root/deployment-output-$(date +%Y%m%d-%H%M%S).txt"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "================================================"
echo "Complete Deployment Fix - $(date)"
echo "Output will be saved to: $LOG_FILE"
echo "================================================"

cd /var/www/contact-exchange || exit 1

echo ""
echo "Step 1: Stopping service..."
systemctl stop contact-exchange
echo "✓ Service stopped"

echo ""
echo "Step 2: Checking git status..."
git status
git log --oneline -5

echo ""
echo "Step 3: Pulling latest changes..."
git fetch origin
git reset --hard origin/main
echo "✓ Code updated"

echo ""
echo "Step 4: Verifying critical files were updated..."
echo "--- src/app/page.tsx ---"
head -10 src/app/page.tsx
echo ""
echo "--- src/app/me/page.tsx ---"
head -10 src/app/me/page.tsx

echo ""
echo "Step 5: Installing/updating dependencies..."
npm install

echo ""
echo "Step 6: Generating Prisma client..."
npx prisma generate

echo ""
echo "Step 7: Cleaning old build..."
rm -rf .next

echo ""
echo "Step 8: Building application..."
npm run build

BUILD_EXIT_CODE=$?
echo "Build exit code: $BUILD_EXIT_CODE"

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✓ Build completed (with warnings is OK)"
else
    echo "✗ Build failed!"
fi

echo ""
echo "Step 9: Checking .next directory contents..."
ls -la .next/ 2>&1 || echo ".next directory not found!"
ls -la .next/*.json 2>&1 || echo "JSON files not found in .next!"

echo ""
echo "Step 10: Starting service..."
systemctl start contact-exchange
sleep 5

echo ""
echo "Step 11: Service status..."
systemctl status contact-exchange --no-pager -l

echo ""
echo "Step 12: Recent service logs..."
journalctl -u contact-exchange -n 30 --no-pager

echo ""
echo "Step 13: Testing local connection..."
sleep 3
curl -v http://localhost:3000 2>&1 || echo "Connection failed"

echo ""
echo "================================================"
echo "Deployment Complete!"
echo "================================================"
echo "Full output saved to: $LOG_FILE"
echo ""
echo "To view this output, run:"
echo "cat $LOG_FILE"

