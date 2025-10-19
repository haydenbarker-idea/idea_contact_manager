#!/bin/bash

#################################################
# Contact Exchange - SaaS Instance Setup Script
#################################################
# This script sets up a separate SaaS development
# instance while keeping production stable.
#
# Usage: bash setup-saas-instance.sh
#################################################

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SAAS_DIR="/var/www/contact-exchange-saas"
PROD_DIR="/var/www/contact-exchange"
DB_NAME="contact_exchange_saas"
SERVICE_NAME="contact-exchange-saas"
PORT="3001"
BRANCH="feature/viral-saas"
REPO_URL="https://github.com/haydenbarker-idea/idea_contact_manager.git"

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo ""
    echo "=================================================="
    echo "  Contact Exchange - SaaS Instance Setup"
    echo "=================================================="
    echo ""
}

check_requirements() {
    log "Checking requirements..."
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then 
        error "Please run as root (sudo bash setup-saas-instance.sh)"
        exit 1
    fi
    
    # Check if production exists
    if [ ! -d "$PROD_DIR" ]; then
        error "Production instance not found at $PROD_DIR"
        error "Please deploy production first!"
        exit 1
    fi
    
    # Check if production .env exists
    if [ ! -f "$PROD_DIR/.env" ]; then
        error "Production .env not found!"
        error "Cannot copy configuration from production."
        exit 1
    fi
    
    success "All requirements met"
}

clone_repository() {
    log "=== STEP 1: Cloning repository ==="
    
    if [ -d "$SAAS_DIR" ]; then
        warning "SaaS directory already exists at $SAAS_DIR"
        read -p "Delete and recreate? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log "Removing existing directory..."
            rm -rf "$SAAS_DIR"
        else
            log "Using existing directory"
            cd "$SAAS_DIR"
            git fetch origin
            git checkout "$BRANCH"
            git pull origin "$BRANCH"
            success "Updated existing repository"
            return
        fi
    fi
    
    log "Cloning repository..."
    git clone "$REPO_URL" "$SAAS_DIR"
    cd "$SAAS_DIR"
    
    log "Checking out $BRANCH branch..."
    git checkout "$BRANCH"
    
    success "Repository cloned and branch checked out"
}

install_dependencies() {
    log "=== STEP 2: Installing dependencies ==="
    
    cd "$SAAS_DIR"
    
    log "Running npm install..."
    npm install
    
    success "Dependencies installed"
}

create_database() {
    log "=== STEP 3: Creating database ==="
    
    # Check if database already exists
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        warning "Database $DB_NAME already exists"
        read -p "Drop and recreate? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log "Dropping existing database..."
            sudo -u postgres psql -c "DROP DATABASE $DB_NAME;"
            sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
            success "Database recreated"
        else
            success "Using existing database"
        fi
    else
        log "Creating database $DB_NAME..."
        sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
        success "Database created"
    fi
    
    # Get database user from production .env
    DB_USER=$(grep "DATABASE_URL" "$PROD_DIR/.env" | cut -d'/' -f3 | cut -d':' -f1)
    
    if [ -n "$DB_USER" ]; then
        log "Granting privileges to user: $DB_USER"
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
        success "Privileges granted"
    else
        warning "Could not determine database user from production .env"
        warning "You may need to grant privileges manually"
    fi
}

configure_environment() {
    log "=== STEP 4: Configuring environment ==="
    
    cd "$SAAS_DIR"
    
    # Copy production .env
    log "Copying production .env as template..."
    cp "$PROD_DIR/.env" .env
    
    # Update DATABASE_URL
    log "Updating DATABASE_URL to use $DB_NAME..."
    sed -i "s|/contact_exchange\([?]\)|/$DB_NAME\1|g" .env
    sed -i "s|/contact_exchange$|/$DB_NAME|g" .env
    
    # Update NEXT_PUBLIC_APP_URL
    log "Updating NEXT_PUBLIC_APP_URL to saas subdomain..."
    sed -i 's|https://contacts.ideanetworks.com|https://saas.contacts.ideanetworks.com|g' .env
    
    success "Environment configured"
    
    # Show what was changed
    echo ""
    warning "Updated environment variables:"
    echo "  • DATABASE_URL → $DB_NAME"
    echo "  • NEXT_PUBLIC_APP_URL → https://saas.contacts.ideanetworks.com"
    echo ""
}

run_migrations() {
    log "=== STEP 5: Running database migrations ==="
    
    cd "$SAAS_DIR"
    
    log "Generating Prisma client..."
    npx prisma generate
    
    log "Running migrations..."
    npx prisma migrate deploy
    
    success "Migrations completed"
    
    # Verify tables
    log "Verifying database tables..."
    TABLES=$(sudo -u postgres psql -d "$DB_NAME" -t -c "SELECT tablename FROM pg_tables WHERE schemaname='public';")
    
    if echo "$TABLES" | grep -q "users"; then
        success "✓ users table created"
    else
        warning "⚠ users table not found!"
    fi
    
    if echo "$TABLES" | grep -q "contacts"; then
        success "✓ contacts table created"
    else
        warning "⚠ contacts table not found!"
    fi
}

create_systemd_service() {
    log "=== STEP 6: Creating systemd service ==="
    
    SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"
    
    if [ -f "$SERVICE_FILE" ]; then
        warning "Service file already exists"
        log "Overwriting..."
    fi
    
    log "Creating service file at $SERVICE_FILE..."
    
    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Contact Exchange SaaS (Development)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$SAAS_DIR
ExecStart=/usr/bin/node $SAAS_DIR/.next/standalone/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$SERVICE_NAME
Environment=NODE_ENV=production
Environment=PORT=$PORT

[Install]
WantedBy=multi-user.target
EOF
    
    success "Service file created"
}

build_application() {
    log "=== STEP 7: Building application ==="
    
    cd "$SAAS_DIR"
    
    log "Running npm run build (this takes ~90 seconds)..."
    npm run build
    
    success "Build completed"
}

setup_standalone_mode() {
    log "=== STEP 8: Setting up standalone mode ==="
    
    cd "$SAAS_DIR"
    
    # Create directories
    log "Creating required directories..."
    mkdir -p public/uploads
    mkdir -p public/documents
    mkdir -p public/images
    
    # Set permissions
    chmod 755 public/uploads
    chmod 755 public/documents
    chmod 755 public/images
    
    # Create symlinks
    log "Creating symlinks for static assets..."
    
    mkdir -p .next/standalone/public
    
    # Remove old symlinks if they exist
    rm -f .next/standalone/public/uploads
    rm -f .next/standalone/public/documents
    rm -f .next/standalone/public/images
    
    # Create new symlinks
    ln -s "$SAAS_DIR/public/uploads" .next/standalone/public/uploads
    ln -s "$SAAS_DIR/public/documents" .next/standalone/public/documents
    ln -s "$SAAS_DIR/public/images" .next/standalone/public/images
    
    # Copy documents from production if they exist
    if [ -d "$PROD_DIR/public/documents" ]; then
        log "Copying documents from production..."
        cp -r "$PROD_DIR/public/documents/"* public/documents/ 2>/dev/null || true
    fi
    
    # Copy images from production if they exist
    if [ -d "$PROD_DIR/public/images" ]; then
        log "Copying images from production..."
        cp -r "$PROD_DIR/public/images/"* public/images/ 2>/dev/null || true
    fi
    
    success "Standalone mode configured"
}

start_service() {
    log "=== STEP 9: Starting service ==="
    
    log "Reloading systemd daemon..."
    systemctl daemon-reload
    
    log "Enabling service to start on boot..."
    systemctl enable "$SERVICE_NAME"
    
    log "Starting service..."
    systemctl start "$SERVICE_NAME"
    
    # Wait a moment for service to start
    sleep 3
    
    # Check status
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        success "Service started successfully"
    else
        error "Service failed to start!"
        error "Check logs with: journalctl -u $SERVICE_NAME -n 50"
        exit 1
    fi
}

verify_deployment() {
    log "=== STEP 10: Verifying deployment ==="
    
    # Check if port is listening
    log "Checking if port $PORT is listening..."
    if netstat -tuln | grep -q ":$PORT "; then
        success "Port $PORT is listening"
    else
        warning "Port $PORT not listening yet (may take a moment)"
    fi
    
    # Test local connection
    log "Testing local connection..."
    sleep 2
    if curl -s http://localhost:$PORT > /dev/null 2>&1; then
        success "Local connection successful"
    else
        warning "Local connection failed (may take a moment to fully start)"
    fi
    
    # Check service status
    log "Service status:"
    systemctl status "$SERVICE_NAME" --no-pager -l
}

print_summary() {
    echo ""
    echo "=================================================="
    echo "  🎉 SaaS Instance Setup Complete!"
    echo "=================================================="
    echo ""
    echo "📍 Installation Directory: $SAAS_DIR"
    echo "🗄️  Database Name: $DB_NAME"
    echo "🔧 Service Name: $SERVICE_NAME"
    echo "🌐 Port: $PORT"
    echo "🔗 Branch: $BRANCH"
    echo ""
    echo "🌍 Your SaaS site should be available at:"
    echo "   https://saas.contacts.ideanetworks.com"
    echo ""
    echo "📊 Useful Commands:"
    echo "   Status:  sudo systemctl status $SERVICE_NAME"
    echo "   Logs:    journalctl -u $SERVICE_NAME -f"
    echo "   Restart: sudo systemctl restart $SERVICE_NAME"
    echo "   Stop:    sudo systemctl stop $SERVICE_NAME"
    echo ""
    echo "🔍 Check database:"
    echo "   psql -d $DB_NAME -c 'SELECT COUNT(*) FROM users;'"
    echo "   psql -d $DB_NAME -c 'SELECT COUNT(*) FROM contacts;'"
    echo ""
    echo "🚀 Test the viral loop:"
    echo "   1. Visit https://saas.contacts.ideanetworks.com"
    echo "   2. Submit a contact"
    echo "   3. Click 'I Want This!' button"
    echo "   4. Complete onboarding"
    echo "   5. Get your own page!"
    echo ""
    echo "✅ Production (contacts.ideanetworks.com) is untouched and safe!"
    echo ""
    echo "=================================================="
}

# Main execution
main() {
    print_header
    check_requirements
    clone_repository
    install_dependencies
    create_database
    configure_environment
    run_migrations
    create_systemd_service
    build_application
    setup_standalone_mode
    start_service
    verify_deployment
    print_summary
}

# Run main function
main

