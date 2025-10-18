#!/bin/bash

# Fix missing dependencies and rebuild
# Run with: sudo bash fix-build.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "================================================"
echo "Fixing Build Dependencies"
echo "================================================"
echo ""

cd /var/www/contact-exchange

echo -e "${GREEN}Step 1: Installing missing dependencies...${NC}"
npm install --save-dev autoprefixer postcss tailwindcss

echo -e "${GREEN}Step 2: Verifying all dependencies...${NC}"
npm install

echo -e "${GREEN}Step 3: Generating Prisma client...${NC}"
npx prisma generate

echo -e "${GREEN}Step 4: Building application...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Build successful!${NC}"
    echo ""
    echo -e "${GREEN}Step 5: Restarting application...${NC}"
    systemctl restart contact-exchange
    
    sleep 3
    
    if systemctl is-active --quiet contact-exchange; then
        echo -e "${GREEN}✓ Application is running${NC}"
        echo ""
        echo "Testing application..."
        if curl -sf http://localhost:3000 > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Application responding on localhost:3000${NC}"
        else
            echo -e "${YELLOW}⚠ Application not responding yet, give it a few seconds...${NC}"
        fi
    else
        echo -e "${RED}✗ Application failed to start${NC}"
        echo "Checking logs..."
        journalctl -u contact-exchange -n 20 --no-pager
    fi
    
    echo ""
    echo "================================================"
    echo -e "${GREEN}All Fixed!${NC}"
    echo "================================================"
    echo ""
    echo "Your site should now be live at:"
    echo "  https://contacts.ideanetworks.com"
    echo ""
    echo "Admin dashboard:"
    echo "  https://contacts.ideanetworks.com/admin"
    echo ""
    echo "Check status:"
    echo "  systemctl status contact-exchange"
    echo ""
    echo "View logs:"
    echo "  journalctl -u contact-exchange -f"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Build failed${NC}"
    echo ""
    echo "Check the error above and send the output for troubleshooting."
    exit 1
fi

