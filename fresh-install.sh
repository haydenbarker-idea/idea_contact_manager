#!/bin/bash

# Redirect all output to a log file
LOG_FILE="/root/fresh-install-$(date +%Y%m%d-%H%M%S).txt"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "================================================"
echo "Fresh Install - $(date)"
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
echo "Step 3: Removing node_modules and package-lock..."
rm -rf node_modules package-lock.json
echo "✓ Cleaned"

echo ""
echo "Step 4: Removing old build..."
rm -rf .next
echo "✓ Build cleaned"

echo ""
echo "Step 5: Fresh npm install..."
npm install

echo ""
echo "Step 6: Verifying React installation..."
npm list react react-dom

echo ""
echo "Step 7: Generating Prisma client..."
npx prisma generate

echo ""
echo "Step 8: Building application..."
npm run build 2>&1 | tee -a build-output.txt

BUILD_EXIT_CODE=$?
echo "Build exit code: $BUILD_EXIT_CODE"

echo ""
echo "Step 9: Checking build results..."
if [ -d ".next/standalone" ]; then
    echo "✓ Standalone build successful!"
    ls -la .next/standalone/
    
    echo ""
    echo "Step 10: Setting up standalone deployment..."
    # Copy required files
    cp -r public .next/standalone/ 2>/dev/null || echo "No public directory"
    mkdir -p .next/standalone/.next
    cp -r .next/static .next/standalone/.next/ 2>/dev/null || echo "No static directory"
    
    echo ""
    echo "Step 11: Updating systemd service..."
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
    
    systemctl daemon-reload
    echo "✓ Service configured for standalone"
else
    echo "✗ Standalone build not created, using standard mode"
    ls -la .next/
    
    echo ""
    echo "Step 11: Using standard systemd service..."
    cat > /etc/systemd/system/contact-exchange.service << 'EOF'
[Unit]
Description=Contact Exchange App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/contact-exchange
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    echo "✓ Service configured for standard mode"
fi

echo ""
echo "Step 12: Starting service..."
systemctl start contact-exchange
sleep 5

echo ""
echo "Step 13: Service status..."
systemctl status contact-exchange --no-pager -l

echo ""
echo "Step 14: Recent logs..."
journalctl -u contact-exchange -n 30 --no-pager

echo ""
echo "Step 15: Testing connection..."
sleep 3
curl -v http://localhost:3000 2>&1

echo ""
echo "================================================"
echo "Fresh Install Complete!"
echo "================================================"
echo "Full output saved to: $LOG_FILE"

