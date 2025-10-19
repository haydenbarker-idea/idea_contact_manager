#!/bin/bash

#################################################
# Contact Exchange - SaaS Instance Deployment
#################################################
# Self-healing deployment with automatic logging
# Logs sync to GitHub for remote troubleshooting
#
# Usage: bash deploy-saas-instance.sh
#################################################

set -e  # Exit on any error

# Configuration
SAAS_DIR="/var/www/contact-exchange-saas"
PROD_DIR="/var/www/contact-exchange"
DB_NAME="contact_exchange_saas"
SERVICE_NAME="contact-exchange-saas"
PORT="3001"
BRANCH="feature/viral-saas"
REPO_URL="https://github.com/haydenbarker-idea/idea_contact_manager.git"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="$SAAS_DIR/deployment-logs"
LOG_FILE="$LOG_DIR/saas-deploy-${TIMESTAMP}.log"
APP_DIR="$SAAS_DIR"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Logging function
log() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${BLUE}${message}${NC}"
    echo "$message" >> "$LOG_FILE" 2>/dev/null || true
}

success() {
    local message="✓ $1"
    echo -e "${GREEN}${message}${NC}"
    echo "$message" >> "$LOG_FILE" 2>/dev/null || true
}

warning() {
    local message="⚠ $1"
    echo -e "${YELLOW}${message}${NC}"
    echo "$message" >> "$LOG_FILE" 2>/dev/null || true
}

error() {
    local message="✗ $1"
    echo -e "${RED}${message}${NC}"
    echo "$message" >> "$LOG_FILE" 2>/dev/null || true
}

# Initialize logging
init_logging() {
    if [ -d "$SAAS_DIR" ]; then
        mkdir -p "$LOG_DIR"
        touch "$LOG_FILE"
        log "=== SaaS Deployment Started ==="
        log "Timestamp: $TIMESTAMP"
        log "Branch: $BRANCH"
    fi
}

sync_logs_to_github() {
    if [ -d "$SAAS_DIR" ]; then
        cd "$SAAS_DIR"
        if [ -d "$LOG_DIR" ]; then
            git add deployment-logs/*.log 2>/dev/null || true
            git commit -m "logs: saas deployment $TIMESTAMP" 2>/dev/null || true
            git push origin "$BRANCH" 2>/dev/null || true
        fi
    fi
}

trap 'sync_logs_to_github' EXIT

print_header() {
    echo ""
    echo "=================================================="
    echo "  Contact Exchange - SaaS Deployment"
    echo "  $(date +'%Y-%m-%d %H:%M:%S')"
    echo "=================================================="
    echo ""
}

check_requirements() {
    log "=== Checking requirements ==="
    
    if [ "$EUID" -ne 0 ]; then 
        error "Please run as root (sudo bash deploy-saas-instance.sh)"
        exit 1
    fi
    
    if [ ! -d "$PROD_DIR" ]; then
        error "Production instance not found at $PROD_DIR"
        exit 1
    fi
    
    if [ ! -f "$PROD_DIR/.env" ]; then
        error "Production .env not found!"
        exit 1
    fi
    
    success "Requirements met"
}

initial_setup() {
    log "=== STEP 1: Initial setup or update ==="
    
    if [ -d "$SAAS_DIR" ]; then
        log "SaaS instance exists - updating..."
        cd "$SAAS_DIR"
        
        # Stop service if running
        if systemctl is-active --quiet "$SERVICE_NAME"; then
            log "Stopping service..."
            systemctl stop "$SERVICE_NAME"
            success "Service stopped"
        fi
        
        # Stash any local changes
        git stash 2>/dev/null || true
        
        # Fetch and update
        log "Fetching latest code..."
        git fetch origin
        git checkout "$BRANCH"
        git reset --hard origin/"$BRANCH"
        
        success "Code updated"
    else
        log "First time setup - cloning repository..."
        git clone "$REPO_URL" "$SAAS_DIR"
        cd "$SAAS_DIR"
        git checkout "$BRANCH"
        
        # Initialize log directory
        mkdir -p "$LOG_DIR"
        
        success "Repository cloned"
    fi
    
    # Initialize logging now that directory exists
    init_logging
}

install_dependencies() {
    log "=== STEP 2: Installing dependencies ==="
    
    cd "$SAAS_DIR"
    log "Running npm install..."
    npm install >> "$LOG_FILE" 2>&1
    
    success "Dependencies installed"
}

configure_database() {
    log "=== STEP 3: Configuring database ==="
    
    # Check if database exists
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        success "Database $DB_NAME exists"
    else
        log "Creating database $DB_NAME..."
        sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" >> "$LOG_FILE" 2>&1
        
        # Get DB user from production
        DB_USER=$(grep "DATABASE_URL" "$PROD_DIR/.env" | cut -d'/' -f3 | cut -d':' -f1)
        if [ -n "$DB_USER" ]; then
            sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" >> "$LOG_FILE" 2>&1
        fi
        
        success "Database created"
    fi
}

configure_environment() {
    log "=== STEP 4: Configuring environment ==="
    
    cd "$SAAS_DIR"
    
    if [ -f .env ]; then
        # Backup existing .env
        cp .env .env.backup-${TIMESTAMP}
        log "Backed up existing .env"
    else
        # Copy from production
        log "Copying .env from production..."
        cp "$PROD_DIR/.env" .env
    fi
    
    # Update DATABASE_URL for SaaS database
    log "Updating DATABASE_URL..."
    sed -i "s|/contact_exchange\([?]\)|/$DB_NAME\1|g" .env
    sed -i "s|/contact_exchange$|/$DB_NAME|g" .env
    
    # Update APP_URL for saas subdomain
    log "Updating NEXT_PUBLIC_APP_URL..."
    sed -i 's|https://contacts.ideanetworks.com|https://saas.contacts.ideanetworks.com|g' .env
    
    success "Environment configured"
}

run_migrations() {
    log "=== STEP 5: Running database migrations ==="
    
    cd "$SAAS_DIR"
    
    log "Generating Prisma client..."
    npx prisma generate >> "$LOG_FILE" 2>&1
    
    log "Running migrations..."
    npx prisma migrate deploy >> "$LOG_FILE" 2>&1
    
    success "Migrations completed"
    
    # Verify critical tables
    log "Verifying database schema..."
    USERS_COUNT=$(sudo -u postgres psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='users';" 2>/dev/null | xargs)
    CONTACTS_COUNT=$(sudo -u postgres psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='contacts';" 2>/dev/null | xargs)
    
    if [ "$USERS_COUNT" = "1" ]; then
        success "✓ users table exists"
    else
        warning "⚠ users table not found"
    fi
    
    if [ "$CONTACTS_COUNT" = "1" ]; then
        success "✓ contacts table exists"
    else
        warning "⚠ contacts table not found"
    fi
}

create_systemd_service() {
    log "=== STEP 6: Creating/updating systemd service ==="
    
    SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"
    
    log "Creating service file..."
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
    log "Build output logged to: $LOG_FILE"
    
    npm run build >> "$LOG_FILE" 2>&1
    
    if [ -f ".next/standalone/server.js" ]; then
        success "Build completed successfully"
    else
        error "Build failed - server.js not found"
        error "Check logs: $LOG_FILE"
        exit 1
    fi
}

setup_static_files() {
    log "=== STEP 8: Setting up static files ==="
    
    cd "$SAAS_DIR"
    
    # Create directories
    mkdir -p public/uploads
    mkdir -p public/documents  
    mkdir -p public/images
    mkdir -p .next/standalone/public
    
    chmod 755 public/uploads
    chmod 755 public/documents
    chmod 755 public/images
    
    # Remove old symlinks
    rm -f .next/standalone/public/uploads
    rm -f .next/standalone/public/documents
    rm -f .next/standalone/public/images
    
    # Create symlinks
    ln -s "$SAAS_DIR/public/uploads" .next/standalone/public/uploads
    ln -s "$SAAS_DIR/public/documents" .next/standalone/public/documents
    ln -s "$SAAS_DIR/public/images" .next/standalone/public/images
    
    # Copy static assets from production
    if [ -d "$PROD_DIR/public/documents" ]; then
        log "Copying documents from production..."
        cp -r "$PROD_DIR/public/documents/"* public/documents/ 2>/dev/null || true
    fi
    
    if [ -d "$PROD_DIR/public/images" ]; then
        log "Copying images from production..."
        cp -r "$PROD_DIR/public/images/"* public/images/ 2>/dev/null || true
    fi
    
    success "Static files configured"
}

start_service() {
    log "=== STEP 9: Starting service ==="
    
    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME" >> "$LOG_FILE" 2>&1
    systemctl start "$SERVICE_NAME"
    
    # Wait for service to start
    sleep 3
    
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        success "Service started successfully"
    else
        error "Service failed to start"
        log "Checking service status..."
        systemctl status "$SERVICE_NAME" --no-pager -l >> "$LOG_FILE" 2>&1
        error "Check logs: journalctl -u $SERVICE_NAME -n 50"
        exit 1
    fi
}

verify_deployment() {
    log "=== STEP 10: Verifying deployment ==="
    
    # Check port
    if netstat -tuln | grep -q ":$PORT "; then
        success "Port $PORT is listening"
    else
        warning "Port $PORT not listening"
    fi
    
    # Test local connection
    sleep 2
    log "Testing local connection..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
        success "Local connection successful (HTTP $HTTP_CODE)"
    else
        warning "Local connection returned HTTP $HTTP_CODE"
    fi
    
    # Get database stats
    log "Checking database..."
    USER_COUNT=$(sudo -u postgres psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | xargs || echo "0")
    CONTACT_COUNT=$(sudo -u postgres psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM contacts;" 2>/dev/null | xargs || echo "0")
    
    log "Database stats:"
    log "  • Users: $USER_COUNT"
    log "  • Contacts: $CONTACT_COUNT"
    
    success "Verification complete"
}

sync_logs() {
    log "=== STEP 11: Syncing logs to GitHub ==="
    
    cd "$SAAS_DIR"
    
    # Add deployment logs
    git add deployment-logs/*.log 2>/dev/null || true
    
    # Commit logs
    if git commit -m "logs: saas deployment $TIMESTAMP - $(systemctl is-active $SERVICE_NAME)" 2>/dev/null; then
        log "Logs committed"
    fi
    
    # Push to GitHub
    if git push origin "$BRANCH" 2>/dev/null; then
        success "Logs synced to GitHub"
        log "View logs at: https://github.com/haydenbarker-idea/idea_contact_manager/tree/$BRANCH/deployment-logs"
    else
        warning "Failed to push logs to GitHub (non-critical)"
    fi
}

print_summary() {
    echo ""
    echo "=================================================="
    echo "  🎉 SaaS Deployment Complete!"
    echo "=================================================="
    echo ""
    echo "📍 Directory: $SAAS_DIR"
    echo "🗄️  Database: $DB_NAME"
    echo "🔧 Service: $SERVICE_NAME"
    echo "🌐 Port: $PORT"
    echo "📋 Branch: $BRANCH"
    echo "📝 Log: $LOG_FILE"
    echo ""
    echo "🌍 Live at: https://saas.contacts.ideanetworks.com"
    echo ""
    echo "📊 Quick Commands:"
    echo "   sudo systemctl status $SERVICE_NAME"
    echo "   journalctl -u $SERVICE_NAME -f"
    echo "   sudo systemctl restart $SERVICE_NAME"
    echo ""
    echo "🔍 Database Check:"
    echo "   psql -d $DB_NAME -c 'SELECT COUNT(*) FROM users;'"
    echo "   psql -d $DB_NAME -c 'SELECT COUNT(*) FROM contacts;'"
    echo ""
    echo "📝 Logs synced to GitHub:"
    echo "   https://github.com/haydenbarker-idea/idea_contact_manager"
    echo "   Branch: $BRANCH"
    echo "   Path: deployment-logs/"
    echo ""
    echo "🚀 Test the viral loop:"
    echo "   1. Visit https://saas.contacts.ideanetworks.com"
    echo "   2. Submit contact → Click 'I Want This!'"
    echo "   3. Complete onboarding → Get your page!"
    echo ""
    echo "✅ Production (contacts.ideanetworks.com) untouched!"
    echo "=================================================="
}

# Main execution
main() {
    print_header
    check_requirements
    initial_setup
    install_dependencies
    configure_database
    configure_environment
    run_migrations
    create_systemd_service
    build_application
    setup_static_files
    start_service
    verify_deployment
    sync_logs
    print_summary
}

# Run main
main

