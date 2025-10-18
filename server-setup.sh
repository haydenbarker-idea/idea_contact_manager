#!/bin/bash

# Contact Exchange App - Ubuntu 22.04 Server Setup Script
# Run with: sudo bash server-setup.sh

set -e  # Exit on any error

echo "================================================"
echo "Contact Exchange App - Server Setup"
echo "================================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${GREEN}Step 1: Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

echo -e "${GREEN}Step 2: Installing essential tools...${NC}"
apt-get install -y curl git wget vim ufw build-essential

echo -e "${GREEN}Step 3: Installing Node.js 20 LTS...${NC}"
# Install Node.js 20 using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify installation
echo -e "${YELLOW}Node version: $(node -v)${NC}"
echo -e "${YELLOW}NPM version: $(npm -v)${NC}"

echo -e "${GREEN}Step 4: Installing PostgreSQL 15...${NC}"
# Install PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

echo -e "${GREEN}Step 5: Setting up PostgreSQL database...${NC}"
# Create database and user
sudo -u postgres psql -c "CREATE DATABASE contact_exchange;" || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER contact_admin WITH ENCRYPTED PASSWORD 'ChangeThisPassword123!';" || echo "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE contact_exchange TO contact_admin;"
sudo -u postgres psql -c "ALTER DATABASE contact_exchange OWNER TO contact_admin;"

echo -e "${GREEN}Step 6: Installing Docker (for future use)...${NC}"
# Install Docker
apt-get install -y apt-transport-https ca-certificates software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

systemctl start docker
systemctl enable docker

echo -e "${GREEN}Step 7: Configuring firewall (UFW)...${NC}"
# Configure firewall
ufw --force enable
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 81/tcp    # Nginx Proxy Manager Admin (optional, can be removed after setup)
ufw allow 3000/tcp  # Next.js app (only if not using proxy)

echo -e "${GREEN}Step 8: Creating application directory...${NC}"
# Create app directory
mkdir -p /var/www/contact-exchange
chown -R $SUDO_USER:$SUDO_USER /var/www/contact-exchange

echo -e "${GREEN}Step 9: Installing PM2 for process management...${NC}"
npm install -g pm2
pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER

echo -e "${GREEN}Step 10: Creating systemd service file...${NC}"
cat > /etc/systemd/system/contact-exchange.service << 'EOF'
[Unit]
Description=Contact Exchange App
After=network.target postgresql.service

[Service]
Type=simple
User=REPLACE_USER
WorkingDirectory=/var/www/contact-exchange
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Replace REPLACE_USER with actual user
sed -i "s/REPLACE_USER/$SUDO_USER/g" /etc/systemd/system/contact-exchange.service

echo -e "${GREEN}Step 11: Setting up log directories...${NC}"
mkdir -p /var/log/contact-exchange
chown -R $SUDO_USER:$SUDO_USER /var/log/contact-exchange

echo -e "${GREEN}Step 12: Optimizing PostgreSQL for small VPS...${NC}"
# Backup original config
cp /etc/postgresql/*/main/postgresql.conf /etc/postgresql/*/main/postgresql.conf.backup

# Apply basic optimizations for 2-4GB RAM server
sudo -u postgres psql -c "ALTER SYSTEM SET shared_buffers = '256MB';"
sudo -u postgres psql -c "ALTER SYSTEM SET effective_cache_size = '1GB';"
sudo -u postgres psql -c "ALTER SYSTEM SET maintenance_work_mem = '64MB';"
sudo -u postgres psql -c "ALTER SYSTEM SET checkpoint_completion_target = 0.9;"
sudo -u postgres psql -c "ALTER SYSTEM SET wal_buffers = '16MB';"
sudo -u postgres psql -c "ALTER SYSTEM SET default_statistics_target = 100;"
sudo -u postgres psql -c "ALTER SYSTEM SET random_page_cost = 1.1;"
sudo -u postgres psql -c "ALTER SYSTEM SET effective_io_concurrency = 200;"
sudo -u postgres psql -c "ALTER SYSTEM SET work_mem = '4MB';"

# Restart PostgreSQL to apply changes
systemctl restart postgresql

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${YELLOW}Important Information:${NC}"
echo ""
echo -e "1. PostgreSQL Database:"
echo -e "   Database Name: ${GREEN}contact_exchange${NC}"
echo -e "   Username: ${GREEN}contact_admin${NC}"
echo -e "   Password: ${RED}ChangeThisPassword123!${NC} (CHANGE THIS!)"
echo -e "   Connection String:"
echo -e "   ${GREEN}postgresql://contact_admin:ChangeThisPassword123!@localhost:5432/contact_exchange${NC}"
echo ""
echo -e "2. Application Directory:"
echo -e "   ${GREEN}/var/www/contact-exchange${NC}"
echo ""
echo -e "3. Next Steps:"
echo -e "   a) Change the PostgreSQL password:"
echo -e "      ${GREEN}sudo -u postgres psql${NC}"
echo -e "      ${GREEN}ALTER USER contact_admin WITH PASSWORD 'YourSecurePasswordHere';${NC}"
echo -e "   b) Clone your app to /var/www/contact-exchange"
echo -e "   c) Create .env file with database connection and secrets"
echo -e "   d) Run ${GREEN}npm install${NC} in the app directory"
echo -e "   e) Run database migrations"
echo -e "   f) Build the app with ${GREEN}npm run build${NC}"
echo -e "   g) Start with ${GREEN}systemctl start contact-exchange${NC}"
echo ""
echo -e "4. Nginx Proxy Manager Setup:"
echo -e "   - Point contacts.ideanetworks.com to this server's IP"
echo -e "   - Create proxy host: contacts.ideanetworks.com → http://localhost:3000"
echo -e "   - Enable SSL with Let's Encrypt"
echo ""
echo -e "5. Security Reminders:"
echo -e "   ${RED}⚠${NC}  Change the default PostgreSQL password immediately"
echo -e "   ${RED}⚠${NC}  Set strong NEXTAUTH_SECRET in .env"
echo -e "   ${RED}⚠${NC}  Close port 3000 in firewall if using Nginx Proxy Manager"
echo -e "   ${RED}⚠${NC}  Consider closing port 81 after NPM setup"
echo ""
echo -e "${GREEN}Server is ready for deployment!${NC}"
echo ""

