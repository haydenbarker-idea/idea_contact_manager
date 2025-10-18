#!/bin/bash

LOG_FILE="/root/fix-manifest-$(date +%Y%m%d-%H%M%S).txt"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "================================================"
echo "Fix Prerender Manifest - $(date)"
echo "================================================"

cd /var/www/contact-exchange || exit 1

echo "Step 1: Checking if prerender-manifest.json exists..."
if [ -f ".next/prerender-manifest.json" ]; then
    echo "✓ File exists"
    cat .next/prerender-manifest.json
else
    echo "✗ File missing - creating it manually"
    
    echo "Step 2: Creating prerender-manifest.json..."
    cat > .next/prerender-manifest.json << 'EOF'
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
EOF
    echo "✓ File created"
fi

echo ""
echo "Step 3: Verifying .next directory structure..."
ls -la .next/

echo ""
echo "Step 4: Starting service..."
systemctl restart contact-exchange
sleep 5

echo ""
echo "Step 5: Service status..."
systemctl status contact-exchange --no-pager -l

echo ""
echo "Step 6: Recent logs..."
journalctl -u contact-exchange -n 20 --no-pager

echo ""
echo "Step 7: Testing connection..."
sleep 3
curl -I http://localhost:3000 2>&1

echo ""
echo "================================================"
echo "Fix Complete!"
echo "================================================"
echo "Log saved to: $LOG_FILE"

