#!/bin/bash

# Contact Exchange App - GitHub Deployment Script
# Run this AFTER server-setup-quick.sh completes
# Usage: sudo bash deploy-from-github.sh [github-repo-url]

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "================================================"
echo "Contact Exchange - GitHub Deployment"
echo "================================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Get GitHub repo URL
if [ -z "$1" ]; then
    read -p "Enter GitHub repository URL (e.g., https://github.com/username/repo.git): " REPO_URL
else
    REPO_URL=$1
fi

echo ""
echo -e "${YELLOW}Repository: $REPO_URL${NC}"
echo ""
read -p "Is this correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Deployment cancelled"
    exit 1
fi

echo -e "${GREEN}Step 1: Cloning repository...${NC}"
cd /var/www/contact-exchange

# Remove any existing files (except .env if it exists)
if [ -f .env ]; then
    mv .env /tmp/.env.backup
    echo "Backed up existing .env file"
fi

# Clone repository
rm -rf /var/www/contact-exchange/*
git clone $REPO_URL .

# Restore .env if it existed
if [ -f /tmp/.env.backup ]; then
    mv /tmp/.env.backup .env
    echo "Restored .env file"
fi

echo -e "${GREEN}Step 2: Checking for .env file...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}.env file not found. Creating from template...${NC}"
    
    # Prompt for configuration
    echo ""
    echo "Please provide your configuration:"
    echo ""
    
    read -p "Your Full Name: " USER_NAME
    read -p "Your Job Title: " USER_TITLE
    read -p "Your Company: " USER_COMPANY
    read -p "Your Email: " USER_EMAIL
    read -p "Your Phone (e.g., +15551234567): " USER_PHONE
    read -p "Your LinkedIn URL: " USER_LINKEDIN
    read -sp "Admin Password: " ADMIN_PASSWORD
    echo ""
    
    # Get database password from credentials file
    DB_PASSWORD=$(grep "Password:" /root/contact-exchange-credentials.txt | awk '{print $2}')
    
    # Generate NEXTAUTH_SECRET
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    
    # Create .env file
    cat > .env << EOF
# App Configuration
NEXT_PUBLIC_APP_URL=https://contacts.ideanetworks.com
NODE_ENV=production

# Database
DATABASE_URL=postgresql://contact_admin:${DB_PASSWORD}@localhost:5432/contact_exchange

# Authentication
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=https://contacts.ideanetworks.com

# Your Contact Information
NEXT_PUBLIC_DEFAULT_USER_NAME=${USER_NAME}
NEXT_PUBLIC_DEFAULT_USER_TITLE=${USER_TITLE}
NEXT_PUBLIC_DEFAULT_USER_COMPANY=${USER_COMPANY}
NEXT_PUBLIC_DEFAULT_USER_EMAIL=${USER_EMAIL}
NEXT_PUBLIC_DEFAULT_USER_PHONE=${USER_PHONE}
NEXT_PUBLIC_DEFAULT_USER_LINKEDIN=${USER_LINKEDIN}

# Admin Password
ADMIN_PASSWORD=${ADMIN_PASSWORD}
EOF
    
    echo -e "${GREEN}.env file created${NC}"
else
    echo -e "${GREEN}.env file already exists${NC}"
fi

echo -e "${GREEN}Step 3: Installing dependencies...${NC}"
npm install

echo -e "${GREEN}Step 4: Setting up database...${NC}"
npx prisma generate
npx prisma db push

echo -e "${GREEN}Step 5: Building application...${NC}"
npm run build

echo -e "${GREEN}Step 6: Setting permissions...${NC}"
chown -R $SUDO_USER:$SUDO_USER /var/www/contact-exchange

echo -e "${GREEN}Step 7: Starting application...${NC}"
systemctl daemon-reload
systemctl enable contact-exchange
systemctl restart contact-exchange

# Wait a moment for service to start
sleep 3

# Check status
if systemctl is-active --quiet contact-exchange; then
    echo -e "${GREEN}✓ Application is running${NC}"
else
    echo -e "${RED}✗ Application failed to start${NC}"
    echo "Check logs with: sudo journalctl -u contact-exchange -f"
    exit 1
fi

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "Your site is now live at:"
echo -e "${GREEN}https://contacts.ideanetworks.com${NC}"
echo ""
echo -e "Admin dashboard:"
echo -e "${GREEN}https://contacts.ideanetworks.com/admin${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Visit your site and verify it works"
echo -e "2. Test vCard download, SMS, and LinkedIn buttons"
echo -e "3. Submit a test contact via the form"
echo -e "4. Login to /admin and verify the submission appears"
echo -e "5. Update your QR code to: ${GREEN}https://contacts.ideanetworks.com${NC}"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "View logs:     ${GREEN}sudo journalctl -u contact-exchange -f${NC}"
echo -e "Restart app:   ${GREEN}sudo systemctl restart contact-exchange${NC}"
echo -e "Check status:  ${GREEN}sudo systemctl status contact-exchange${NC}"
echo ""
echo -e "${GREEN}Ready for the conference! 🎉${NC}"
echo ""

