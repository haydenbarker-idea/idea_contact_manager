#!/bin/bash
set -e

echo "================================================"
echo "Pulling Latest Changes and Rebuilding"
echo "================================================"

cd /var/www/contact-exchange

echo "Step 1: Stopping service..."
systemctl stop contact-exchange

echo "Step 2: Pulling latest code..."
git pull origin main

echo "Step 3: Installing dependencies..."
npm install

echo "Step 4: Generating Prisma client..."
npx prisma generate

echo "Step 5: Removing old build..."
rm -rf .next

echo "Step 6: Building application..."
npm run build 2>&1 | tee build.log

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✓ Build successful!"
else
    echo "✗ Build failed! Check build.log for details"
    exit 1
fi

echo "Step 7: Checking if .next folder has required files..."
if [ ! -d ".next" ]; then
    echo "✗ ERROR: .next directory was not created!"
    exit 1
fi

echo "Step 8: Starting service..."
systemctl start contact-exchange

echo "Step 9: Waiting for service to start..."
sleep 5

echo "Step 10: Checking service status..."
systemctl status contact-exchange --no-pager -l

echo ""
echo "Step 11: Testing local connection..."
sleep 2
curl -f http://localhost:3000 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ App is responding on port 3000"
else
    echo "⚠ App is not responding yet on port 3000"
    echo "Checking logs..."
    journalctl -u contact-exchange -n 20 --no-pager
fi

echo ""
echo "================================================"
echo "Deployment Complete!"
echo "================================================"
echo "Test the app at: https://contacts.ideanetworks.com"

