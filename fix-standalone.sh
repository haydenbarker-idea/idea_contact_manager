#!/bin/bash

# Redirect all output to a log file
LOG_FILE="/root/standalone-fix-$(date +%Y%m%d-%H%M%S).txt"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "================================================"
echo "Standalone Build Fix - $(date)"
echo "Output will be saved to: $LOG_FILE"
echo "================================================"

cd /var/www/contact-exchange || exit 1

echo ""
echo "Step 1: Stopping service..."
systemctl stop contact-exchange
echo "✓ Service stopped"

echo ""
echo "Step 2: Pulling latest changes..."
git fetch origin
git reset --hard origin/main
echo "✓ Code updated"

echo ""
echo "Step 3: Verifying next.config.js..."
echo "--- next.config.js ---"
cat next.config.js

echo ""
echo "Step 4: Installing dependencies..."
npm install

echo ""
echo "Step 5: Generating Prisma client..."
npx prisma generate

echo ""
echo "Step 6: Cleaning old build..."
rm -rf .next

echo ""
echo "Step 7: Building with standalone mode..."
npm run build

BUILD_EXIT_CODE=$?
echo "Build exit code: $BUILD_EXIT_CODE"

echo ""
echo "Step 8: Checking build output..."
if [ -d ".next/standalone" ]; then
    echo "✓ Standalone directory created"
    ls -la .next/standalone/
else
    echo "✗ Standalone directory not found!"
    echo "Checking .next contents:"
    ls -la .next/
fi

echo ""
echo "Step 9: Updating systemd service for standalone..."
cat > /etc/systemd/system/contact-exchange.service << 'EOF'
[Unit]
Description=Contact Exchange App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/contact-exchange
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /var/www/contact-exchange/.next/standalone/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "✓ Service file updated"

echo ""
echo "Step 10: Copying required files for standalone..."
# Standalone needs public and .next/static folders
if [ -d ".next/standalone" ]; then
    cp -r public .next/standalone/ 2>/dev/null || echo "No public directory to copy"
    cp -r .next/static .next/standalone/.next/ 2>/dev/null || echo "No static directory to copy"
    echo "✓ Files copied"
fi

echo ""
echo "Step 11: Reloading systemd and starting service..."
systemctl daemon-reload
systemctl start contact-exchange
sleep 5

echo ""
echo "Step 12: Service status..."
systemctl status contact-exchange --no-pager -l

echo ""
echo "Step 13: Recent service logs..."
journalctl -u contact-exchange -n 30 --no-pager

echo ""
echo "Step 14: Testing local connection..."
sleep 3
curl -v http://localhost:3000 2>&1

echo ""
echo "================================================"
echo "Deployment Complete!"
echo "================================================"
echo "Full output saved to: $LOG_FILE"

