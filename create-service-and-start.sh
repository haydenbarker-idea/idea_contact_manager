#!/bin/bash

# Create systemd service and start the app
# Run with: sudo bash create-service-and-start.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "================================================"
echo "Creating Service and Starting App"
echo "================================================"
echo ""

echo -e "${GREEN}Step 1: Creating systemd service file...${NC}"
cat > /etc/systemd/system/contact-exchange.service << 'EOF'
[Unit]
Description=Contact Exchange App
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/contact-exchange
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✓ Service file created${NC}"

echo -e "${GREEN}Step 2: Reloading systemd...${NC}"
systemctl daemon-reload

echo -e "${GREEN}Step 3: Enabling service...${NC}"
systemctl enable contact-exchange

echo -e "${GREEN}Step 4: Starting service...${NC}"
systemctl start contact-exchange

echo -e "${GREEN}Step 5: Waiting for app to start...${NC}"
sleep 5

echo -e "${GREEN}Step 6: Checking status...${NC}"
if systemctl is-active --quiet contact-exchange; then
    echo -e "${GREEN}✓ Service is running!${NC}"
else
    echo -e "${RED}✗ Service failed to start${NC}"
    echo "Checking logs..."
    journalctl -u contact-exchange -n 30 --no-pager
    exit 1
fi

echo -e "${GREEN}Step 7: Testing application...${NC}"
sleep 2

if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Application is responding on port 3000${NC}"
else
    echo -e "${YELLOW}⚠ Application not responding yet...${NC}"
    echo "Checking logs..."
    journalctl -u contact-exchange -n 20 --no-pager
fi

echo ""
echo "================================================"
echo "Deployment Status"
echo "================================================"
echo ""
echo "Service Status:"
systemctl status contact-exchange --no-pager -l
echo ""
echo "================================================"
echo "Recent Logs:"
echo "================================================"
journalctl -u contact-exchange -n 20 --no-pager
echo ""
echo "================================================"
echo ""
echo "Your site should now be available at:"
echo "  ${GREEN}https://contacts.ideanetworks.com${NC}"
echo ""
echo "Commands to check status:"
echo "  systemctl status contact-exchange"
echo "  journalctl -u contact-exchange -f"
echo "  curl http://localhost:3000"
echo ""

