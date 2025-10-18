#!/bin/bash

# Contact Exchange - Fix Nginx and Complete Deployment (v2)
# Handles missing database credentials
# Run with: sudo bash fix-and-deploy-v2.sh

set -e  # Exit on any error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "================================================"
echo "Contact Exchange - Fix and Deploy (v2)"
echo "================================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

DOMAIN="contacts.ideanetworks.com"
EMAIL="hbarker@ideanetworks.com"
REPO_URL="https://github.com/haydenbarker-idea/idea_contact_manager.git"

echo -e "${GREEN}Step 1: Checking/Setting up database password...${NC}"

# Check if credentials file exists
if [ -f /root/contact-exchange-credentials.txt ]; then
    echo -e "${GREEN}✓ Found existing credentials file${NC}"
    DB_PASSWORD=$(grep "Password:" /root/contact-exchange-credentials.txt | awk '{print $2}')
else
    echo -e "${YELLOW}⚠ Credentials file not found, creating new database password...${NC}"
    
    # Generate new password
    DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-25)
    
    # Set the password for the existing user
    sudo -u postgres psql << EOF
ALTER USER contact_admin WITH PASSWORD '$DB_PASSWORD';
EOF
    
    # Save credentials
    cat > /root/contact-exchange-credentials.txt << EOF
=====================================
CONTACT EXCHANGE APP CREDENTIALS
=====================================

Domain: $DOMAIN
SSL Email: $EMAIL

Database:
  Name: contact_exchange
  User: contact_admin
  Password: $DB_PASSWORD
  
Connection String:
postgresql://contact_admin:$DB_PASSWORD@localhost:5432/contact_exchange

=====================================
EOF
    chmod 600 /root/contact-exchange-credentials.txt
    echo -e "${GREEN}✓ Database password set and saved${NC}"
fi

echo -e "${GREEN}Step 2: Fixing Nginx configuration...${NC}"
cat > /etc/nginx/sites-available/contact-exchange << 'EOF'
server {
    listen 80;
    server_name contacts.ideanetworks.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

echo -e "${GREEN}✓ Nginx config created${NC}"

echo -e "${GREEN}Step 3: Enabling site...${NC}"
ln -sf /etc/nginx/sites-available/contact-exchange /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
echo -e "${GREEN}✓ Site enabled${NC}"

echo -e "${GREEN}Step 4: Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
else
    echo -e "${RED}✗ Nginx configuration test failed${NC}"
    exit 1
fi

echo -e "${GREEN}Step 5: Restarting Nginx...${NC}"
systemctl restart nginx
systemctl enable nginx
echo -e "${GREEN}✓ Nginx restarted${NC}"

echo -e "${GREEN}Step 6: Obtaining SSL certificate...${NC}"
certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL --redirect

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SSL certificate obtained${NC}"
else
    echo -e "${YELLOW}⚠ SSL certificate issue (may need DNS propagation - will continue anyway)${NC}"
fi

echo -e "${GREEN}Step 7: Setting up auto-renewal for SSL...${NC}"
systemctl enable certbot.timer
systemctl start certbot.timer
echo -e "${GREEN}✓ SSL auto-renewal configured${NC}"

echo -e "${GREEN}Step 8: Creating application directory...${NC}"
mkdir -p /var/www/contact-exchange
echo -e "${GREEN}✓ Directory created${NC}"

echo -e "${GREEN}Step 9: Cloning repository from GitHub...${NC}"
cd /var/www/contact-exchange

# Clean directory if files exist
if [ "$(ls -A /var/www/contact-exchange)" ]; then
    echo -e "${YELLOW}⚠ Directory not empty, cleaning...${NC}"
    rm -rf /var/www/contact-exchange/*
    rm -rf /var/www/contact-exchange/.*  2>/dev/null || true
fi

git clone $REPO_URL .
echo -e "${GREEN}✓ Repository cloned${NC}"

echo -e "${GREEN}Step 10: Prompting for your contact information...${NC}"
echo ""
echo -e "${BLUE}Please provide your contact information for the app:${NC}"
echo ""

read -p "Your Full Name: " USER_NAME
read -p "Your Job Title: " USER_TITLE
read -p "Your Company: " USER_COMPANY
read -p "Your Email: " USER_EMAIL
read -p "Your Phone (e.g., +15551234567): " USER_PHONE
read -p "Your LinkedIn URL: " USER_LINKEDIN
read -sp "Admin Password (for dashboard): " ADMIN_PASSWORD
echo ""
echo ""

# Generate NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo -e "${GREEN}Step 11: Creating .env file...${NC}"
cat > /var/www/contact-exchange/.env << EOF
# App Configuration
NEXT_PUBLIC_APP_URL=https://$DOMAIN
NODE_ENV=production

# Database
DATABASE_URL=postgresql://contact_admin:${DB_PASSWORD}@localhost:5432/contact_exchange

# Authentication
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=https://$DOMAIN

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

echo -e "${GREEN}✓ .env file created${NC}"

echo -e "${GREEN}Step 12: Installing dependencies...${NC}"
cd /var/www/contact-exchange
npm install

echo -e "${GREEN}Step 13: Setting up database...${NC}"
npx prisma generate
npx prisma db push

echo -e "${GREEN}Step 14: Building application...${NC}"
npm run build

echo -e "${GREEN}Step 15: Setting permissions...${NC}"
chown -R root:root /var/www/contact-exchange

echo -e "${GREEN}Step 16: Starting application...${NC}"
systemctl daemon-reload
systemctl enable contact-exchange
systemctl restart contact-exchange

# Wait for service to start
sleep 5

echo ""
echo "================================================"
echo "            DEPLOYMENT VALIDATION"
echo "================================================"
echo ""

# Validation checks
VALIDATION_PASSED=true

# Check 1: Nginx status
echo -e "${BLUE}[1/8]${NC} Checking Nginx status..."
if systemctl is-active --quiet nginx; then
    echo -e "  ${GREEN}✓ Nginx is running${NC}"
else
    echo -e "  ${RED}✗ Nginx is not running${NC}"
    VALIDATION_PASSED=false
fi

# Check 2: PostgreSQL status
echo -e "${BLUE}[2/8]${NC} Checking PostgreSQL status..."
if systemctl is-active --quiet postgresql; then
    echo -e "  ${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "  ${RED}✗ PostgreSQL is not running${NC}"
    VALIDATION_PASSED=false
fi

# Check 3: Application service status
echo -e "${BLUE}[3/8]${NC} Checking application service..."
if systemctl is-active --quiet contact-exchange; then
    echo -e "  ${GREEN}✓ Application service is running${NC}"
else
    echo -e "  ${RED}✗ Application service is not running${NC}"
    echo -e "  ${YELLOW}  Checking logs...${NC}"
    journalctl -u contact-exchange -n 20 --no-pager
    VALIDATION_PASSED=false
fi

# Check 4: Application responding on localhost
echo -e "${BLUE}[4/8]${NC} Checking application on localhost:3000..."
sleep 2  # Give it a moment more
if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Application responding on localhost:3000${NC}"
else
    echo -e "  ${RED}✗ Application not responding on localhost:3000${NC}"
    VALIDATION_PASSED=false
fi

# Check 5: Nginx configuration
echo -e "${BLUE}[5/8]${NC} Checking Nginx configuration..."
if nginx -t 2>&1 | grep -q "successful"; then
    echo -e "  ${GREEN}✓ Nginx configuration is valid${NC}"
else
    echo -e "  ${RED}✗ Nginx configuration has errors${NC}"
    VALIDATION_PASSED=false
fi

# Check 6: SSL certificate
echo -e "${BLUE}[6/8]${NC} Checking SSL certificate..."
if certbot certificates 2>&1 | grep -q "$DOMAIN"; then
    echo -e "  ${GREEN}✓ SSL certificate is installed${NC}"
else
    echo -e "  ${YELLOW}⚠ SSL certificate not found (DNS may not be propagated yet)${NC}"
fi

# Check 7: HTTPS access
echo -e "${BLUE}[7/8]${NC} Checking HTTPS access..."
if curl -sf -k https://$DOMAIN > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Site accessible via HTTPS${NC}"
else
    echo -e "  ${YELLOW}⚠ Site not accessible via HTTPS yet (check DNS)${NC}"
fi

# Check 8: Database connection
echo -e "${BLUE}[8/8]${NC} Checking database connection..."
if PGPASSWORD=$DB_PASSWORD psql -U contact_admin -d contact_exchange -h localhost -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Database connection successful${NC}"
else
    echo -e "  ${RED}✗ Database connection failed${NC}"
    VALIDATION_PASSED=false
fi

echo ""
echo "================================================"
echo "              DEPLOYMENT SUMMARY"
echo "================================================"
echo ""

if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "${GREEN}✓ DEPLOYMENT SUCCESSFUL!${NC}"
    echo ""
    echo "Your contact exchange app is now live!"
    echo ""
else
    echo -e "${YELLOW}⚠ DEPLOYMENT COMPLETED WITH WARNINGS${NC}"
    echo ""
    echo "Some checks failed. Review the issues above."
    echo ""
fi

echo "Site URL:      https://$DOMAIN"
echo "Admin Panel:   https://$DOMAIN/admin"
echo "API:           https://$DOMAIN/api/vcard"
echo ""
echo "Your Contact Information:"
echo "  Name:     $USER_NAME"
echo "  Title:    $USER_TITLE"
echo "  Company:  $USER_COMPANY"
echo "  Email:    $USER_EMAIL"
echo "  Phone:    $USER_PHONE"
echo ""
echo "Database:"
echo "  Status:   $(systemctl is-active postgresql)"
echo "  Name:     contact_exchange"
echo "  User:     contact_admin"
echo "  Password: (saved in /root/contact-exchange-credentials.txt)"
echo ""
echo "Services Status:"
echo "  Nginx:         $(systemctl is-active nginx)"
echo "  PostgreSQL:    $(systemctl is-active postgresql)"
echo "  Application:   $(systemctl is-active contact-exchange)"
echo ""
echo "================================================"
echo "        Recent Application Logs"
echo "================================================"
journalctl -u contact-exchange -n 15 --no-pager
echo "================================================"
echo ""

if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "${GREEN}Next Steps:${NC}"
    echo "1. Visit https://$DOMAIN to see your contact page"
    echo "2. Test vCard download, SMS, and LinkedIn buttons"
    echo "3. Submit a test contact via the form"
    echo "4. Login to https://$DOMAIN/admin with your password"
    echo "5. Update your QR code to: https://$DOMAIN"
    echo ""
    echo -e "${GREEN}You're ready for the conference! 🎉${NC}"
else
    echo -e "${YELLOW}Troubleshooting Commands:${NC}"
    echo "  View logs:      journalctl -u contact-exchange -f"
    echo "  Check Nginx:    systemctl status nginx"
    echo "  Check app:      curl http://localhost:3000"
    echo "  Verify DNS:     ping $DOMAIN"
    echo "  Test DB:        PGPASSWORD=$DB_PASSWORD psql -U contact_admin -d contact_exchange"
    echo ""
    echo "Copy ALL the output above and send it for troubleshooting."
fi

echo ""
echo "Database credentials saved in: /root/contact-exchange-credentials.txt"
echo "================================================"

