#!/bin/bash

# Contact Exchange App - QUICK Ubuntu 22.04 Server Setup
# Includes Nginx proxy with automatic SSL
# Run with: sudo bash server-setup-quick.sh

set -e  # Exit on any error

echo "================================================"
echo "Contact Exchange App - Quick Server Setup"
echo "================================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Get domain name
read -p "Enter your domain name (e.g., contacts.ideanetworks.com): " DOMAIN_NAME
read -p "Enter your email for SSL certificate (for Let's Encrypt): " SSL_EMAIL

echo ""
echo -e "${YELLOW}Domain: $DOMAIN_NAME${NC}"
echo -e "${YELLOW}SSL Email: $SSL_EMAIL${NC}"
echo ""
read -p "Is this correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Setup cancelled"
    exit 1
fi

echo -e "${GREEN}Step 1: Updating system...${NC}"
apt-get update
apt-get upgrade -y

echo -e "${GREEN}Step 2: Installing essential tools...${NC}"
apt-get install -y curl git wget vim ufw build-essential

echo -e "${GREEN}Step 3: Installing Node.js 20 LTS...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo -e "${YELLOW}Node version: $(node -v)${NC}"
echo -e "${YELLOW}NPM version: $(npm -v)${NC}"

echo -e "${GREEN}Step 4: Installing PostgreSQL 15...${NC}"
apt-get install -y postgresql postgresql-contrib

systemctl start postgresql
systemctl enable postgresql

echo -e "${GREEN}Step 5: Setting up database...${NC}"
# Generate random password
DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-25)

sudo -u postgres psql -c "CREATE DATABASE contact_exchange;" 2>/dev/null || echo "Database exists"
sudo -u postgres psql -c "CREATE USER contact_admin WITH ENCRYPTED PASSWORD '$DB_PASSWORD';" 2>/dev/null || \
    sudo -u postgres psql -c "ALTER USER contact_admin WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE contact_exchange TO contact_admin;"
sudo -u postgres psql -c "ALTER DATABASE contact_exchange OWNER TO contact_admin;"

echo -e "${GREEN}Step 6: Installing Nginx...${NC}"
apt-get install -y nginx

echo -e "${GREEN}Step 7: Installing Certbot for SSL...${NC}"
apt-get install -y certbot python3-certbot-nginx

echo -e "${GREEN}Step 8: Configuring Nginx...${NC}"
# Create Nginx config
cat > /etc/nginx/sites-available/contact-exchange << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/contact-exchange /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx

echo -e "${GREEN}Step 9: Obtaining SSL certificate...${NC}"
certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos -m $SSL_EMAIL --redirect

echo -e "${GREEN}Step 10: Configuring firewall...${NC}"
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

echo -e "${GREEN}Step 11: Creating app directory...${NC}"
mkdir -p /var/www/contact-exchange
chown -R $SUDO_USER:$SUDO_USER /var/www/contact-exchange

echo -e "${GREEN}Step 12: Installing PM2...${NC}"
npm install -g pm2

echo -e "${GREEN}Step 13: Creating systemd service...${NC}"
cat > /etc/systemd/system/contact-exchange.service << EOF
[Unit]
Description=Contact Exchange App
After=network.target postgresql.service

[Service]
Type=simple
User=$SUDO_USER
WorkingDirectory=/var/www/contact-exchange
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload

echo -e "${GREEN}Step 14: Optimizing PostgreSQL...${NC}"
sudo -u postgres psql -c "ALTER SYSTEM SET shared_buffers = '256MB';"
sudo -u postgres psql -c "ALTER SYSTEM SET effective_cache_size = '1GB';"
sudo -u postgres psql -c "ALTER SYSTEM SET maintenance_work_mem = '64MB';"
sudo -u postgres psql -c "ALTER SYSTEM SET work_mem = '4MB';"
systemctl restart postgresql

echo -e "${GREEN}Step 15: Setting up auto-renewal for SSL...${NC}"
systemctl enable certbot.timer
systemctl start certbot.timer

# Save credentials
cat > /root/contact-exchange-credentials.txt << EOF
=====================================
CONTACT EXCHANGE APP CREDENTIALS
=====================================

Domain: $DOMAIN_NAME
SSL Email: $SSL_EMAIL

Database:
  Name: contact_exchange
  User: contact_admin
  Password: $DB_PASSWORD
  
Connection String:
postgresql://contact_admin:$DB_PASSWORD@localhost:5432/contact_exchange

App Directory: /var/www/contact-exchange

Admin Password: CHANGE_THIS_IN_ENV_FILE

Next Steps:
1. Deploy app to /var/www/contact-exchange
2. Create .env file with credentials above
3. Run: npm install && npx prisma db push && npm run build
4. Start: systemctl start contact-exchange

=====================================
EOF

chmod 600 /root/contact-exchange-credentials.txt

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${YELLOW}Credentials saved to: /root/contact-exchange-credentials.txt${NC}"
echo ""
echo -e "Database Connection String:"
echo -e "${GREEN}postgresql://contact_admin:$DB_PASSWORD@localhost:5432/contact_exchange${NC}"
echo ""
echo -e "SSL Certificate: ${GREEN}Installed and auto-renewing${NC}"
echo -e "Nginx Proxy: ${GREEN}Running and configured${NC}"
echo -e "Domain: ${GREEN}https://$DOMAIN_NAME${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Deploy your app to: ${GREEN}/var/www/contact-exchange${NC}"
echo -e "2. Create .env file (see credentials file)"
echo -e "3. Run: ${GREEN}cd /var/www/contact-exchange && npm install && npx prisma db push && npm run build${NC}"
echo -e "4. Start: ${GREEN}systemctl start contact-exchange${NC}"
echo ""
echo -e "${GREEN}Server is ready!${NC}"
echo ""

