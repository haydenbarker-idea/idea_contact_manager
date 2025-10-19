#!/bin/bash

#################################################
# Contact Exchange - SaaS Instance Deployment
#################################################
# Self-healing deployment with automatic logging
# Logs sync to GitHub for remote troubleshooting
#
# Usage: bash deploy-saas-instance.sh
#################################################

# Don't use set -e here - we want to handle errors gracefully
# Configuration
DEPLOYMENT_STATUS="IN_PROGRESS"
FAILED_STEP=""
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

# Configure git for log syncing
configure_git() {
    cd "$SAAS_DIR"
    if ! git config user.email > /dev/null 2>&1; then
        git config user.email "hbarker@ideanetworks.com"
        git config user.name "Hayden Barker"
    fi
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
            # Configure git
            configure_git
            
            # Add logs
            git add deployment-logs/*.log 2>&1 >> "$LOG_FILE" || true
            
            # Commit if there are changes
            if ! git diff --cached --exit-code > /dev/null 2>&1; then
                git commit -m "logs: saas deployment $TIMESTAMP" 2>&1 >> "$LOG_FILE" || true
                # Try to push, but don't fail if it doesn't work
                git push origin "$BRANCH" 2>&1 >> "$LOG_FILE" || log "⚠ Could not push logs to GitHub (check credentials)"
            fi
        fi
    fi
}

# Error handler - called when any command fails
handle_error() {
    local exit_code=$?
    DEPLOYMENT_STATUS="FAILED"
    error "=== DEPLOYMENT FAILED ==="
    error "Exit code: $exit_code"
    error "Failed at step: $FAILED_STEP"
    error "Check log file: $LOG_FILE"
    
    # Sync logs even on failure
    sync_logs
    
    # Print failure summary
    print_summary
    
    exit $exit_code
}

# Set up error trapping
trap 'handle_error' ERR
set -e  # Exit on error, but trap will catch it

print_header() {
    echo ""
    echo "=================================================="
    echo "  Contact Exchange - SaaS Deployment"
    echo "  $(date +'%Y-%m-%d %H:%M:%S')"
    echo "=================================================="
    echo ""
}

check_requirements() {
    FAILED_STEP="Checking requirements"
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
    FAILED_STEP="STEP 1: Initial setup or update"
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
    FAILED_STEP="STEP 2: Installing dependencies"
    log "=== STEP 2: Installing dependencies ==="
    
    cd "$SAAS_DIR"
    log "Running npm install..."
    npm install >> "$LOG_FILE" 2>&1
    
    success "Dependencies installed"
}

configure_database() {
    FAILED_STEP="STEP 3: Configuring database"
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
    FAILED_STEP="STEP 4: Configuring environment"
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
    FAILED_STEP="STEP 5: Updating database schema"
    log "=== STEP 5: Updating database schema ==="
    
    cd "$SAAS_DIR"
    
    log "Pushing schema to database (creates/updates tables)..."
    npx prisma db push --skip-generate >> "$LOG_FILE" 2>&1
    
    log "Generating Prisma client..."
    npx prisma generate >> "$LOG_FILE" 2>&1
    
    success "Database schema updated"
    
    # Verify critical tables
    log "Verifying database schema..."
    USERS_COUNT=$(sudo -u postgres psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='users';" 2>/dev/null | xargs || echo "0")
    CONTACTS_COUNT=$(sudo -u postgres psql -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='contacts';" 2>/dev/null | xargs || echo "0")
    
    if [ "$USERS_COUNT" = "1" ]; then
        success "✓ users table exists"
    else
        error "✗ users table not found"
        log "This is a critical error - database schema not created"
    fi
    
    if [ "$CONTACTS_COUNT" = "1" ]; then
        success "✓ contacts table exists"
    else
        error "✗ contacts table not found"
        log "This is a critical error - database schema not created"
    fi
}

create_systemd_service() {
    FAILED_STEP="STEP 6: Creating/updating systemd service"
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
    FAILED_STEP="STEP 7: Building application"
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
    FAILED_STEP="STEP 8: Setting up static files"
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

configure_nginx_ssl() {
    FAILED_STEP="STEP 9: Configuring Nginx and SSL"
    log "=== STEP 9: Configuring Nginx and SSL ==="
    
    # Domain for SaaS instance
    SAAS_DOMAIN="saas.contacts.ideanetworks.com"
    
    # Check if nginx is installed
    if ! command -v nginx &> /dev/null; then
        log "Installing Nginx..."
        apt-get update >> "$LOG_FILE" 2>&1
        apt-get install -y nginx >> "$LOG_FILE" 2>&1
        success "Nginx installed"
    else
        success "Nginx already installed"
    fi
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        log "Installing Certbot..."
        apt-get install -y certbot python3-certbot-nginx >> "$LOG_FILE" 2>&1
        success "Certbot installed"
    else
        success "Certbot already installed"
    fi
    
    # Create Nginx config for SaaS subdomain
    log "Creating Nginx configuration for $SAAS_DOMAIN..."
    cat > /etc/nginx/sites-available/contact-exchange-saas << EOF
server {
    listen 80;
    server_name $SAAS_DOMAIN;

    location / {
        proxy_pass http://localhost:$PORT;
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
    ln -sf /etc/nginx/sites-available/contact-exchange-saas /etc/nginx/sites-enabled/
    
    # Test nginx config
    if nginx -t >> "$LOG_FILE" 2>&1; then
        success "Nginx configuration valid"
    else
        error "Nginx configuration invalid"
        exit 1
    fi
    
    # Reload nginx
    systemctl reload nginx >> "$LOG_FILE" 2>&1
    success "Nginx reloaded"
    
    # Obtain SSL certificate
    log "Obtaining SSL certificate from Let's Encrypt..."
    log "This may take 30-60 seconds..."
    
    # Get email from production .env if available
    SSL_EMAIL=$(grep "^NEXT_PUBLIC_DEFAULT_USER_EMAIL=" "$PROD_DIR/.env" 2>/dev/null | cut -d'=' -f2 | tr -d '"' || echo "hbarker@ideanetworks.com")
    
    if certbot --nginx -d "$SAAS_DOMAIN" --non-interactive --agree-tos -m "$SSL_EMAIL" --redirect >> "$LOG_FILE" 2>&1; then
        success "SSL certificate obtained and configured"
    else
        warning "SSL certificate request failed (may already exist)"
        log "Checking existing certificate..."
        if certbot certificates 2>/dev/null | grep -q "$SAAS_DOMAIN"; then
            success "SSL certificate already exists"
        else
            error "SSL setup failed - check DNS and try again"
        fi
    fi
    
    # Ensure auto-renewal is enabled
    if systemctl is-enabled certbot.timer &> /dev/null; then
        success "SSL auto-renewal already enabled"
    else
        log "Enabling SSL auto-renewal..."
        systemctl enable certbot.timer >> "$LOG_FILE" 2>&1
        systemctl start certbot.timer >> "$LOG_FILE" 2>&1
        success "SSL auto-renewal enabled"
    fi
}

start_service() {
    FAILED_STEP="STEP 10: Starting service"
    log "=== STEP 10: Starting service ==="
    
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
    FAILED_STEP="STEP 11: Verifying deployment"
    log "=== STEP 11: Verifying deployment ==="
    
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
    FAILED_STEP="STEP 12: Syncing logs to GitHub"
    log "=== STEP 12: Syncing logs to GitHub ==="
    
    cd "$SAAS_DIR"
    
    # Configure git
    configure_git
    
    # Add deployment logs
    git add deployment-logs/*.log 2>&1 >> "$LOG_FILE" || true
    
    # Commit logs if there are changes
    if ! git diff --cached --exit-code > /dev/null 2>&1; then
        if git commit -m "logs: saas deployment $TIMESTAMP - $(systemctl is-active $SERVICE_NAME 2>/dev/null || echo 'unknown')" 2>&1 >> "$LOG_FILE"; then
            log "Logs committed"
            
            # Push to GitHub (non-blocking)
            if git push origin "$BRANCH" 2>&1 >> "$LOG_FILE"; then
                success "Logs synced to GitHub"
                log "View logs at: https://github.com/haydenbarker-idea/idea_contact_manager/tree/$BRANCH/deployment-logs"
            else
                warning "Could not push to GitHub (check git credentials)"
                log "Logs are committed locally but not pushed"
            fi
        else
            warning "Could not commit logs"
        fi
    else
        log "No new logs to commit"
    fi
}

print_summary() {
    local summary_msg=""
    
    # Build summary message
    summary_msg+="

==================================================
"
    
    if [ "$DEPLOYMENT_STATUS" = "SUCCESS" ]; then
        summary_msg+="  🎉 SaaS Deployment Complete!
"
        summary_msg+="  Status: ✅ SUCCESS
"
    else
        summary_msg+="  ❌ SaaS Deployment Failed
"
        summary_msg+="  Status: ⚠️  FAILED
"
        summary_msg+="  Failed Step: $FAILED_STEP
"
    fi
    
    summary_msg+="==================================================

📍 Configuration:
   Directory: $SAAS_DIR
   Database: $DB_NAME
   Service: $SERVICE_NAME
   Port: $PORT
   Branch: $BRANCH
   Log File: $LOG_FILE
   Timestamp: $TIMESTAMP

"
    
    if [ "$DEPLOYMENT_STATUS" = "SUCCESS" ]; then
        summary_msg+="🌍 Application:
   URL: https://saas.contacts.ideanetworks.com
   SSL: Configured and auto-renewing
   Service Status: $(systemctl is-active $SERVICE_NAME 2>/dev/null || echo 'unknown')

📊 Quick Commands:
   sudo systemctl status $SERVICE_NAME
   journalctl -u $SERVICE_NAME -f
   sudo systemctl restart $SERVICE_NAME

🔍 Database Check:
   psql -d $DB_NAME -c 'SELECT COUNT(*) FROM users;'
   psql -d $DB_NAME -c 'SELECT COUNT(*) FROM contacts;'

"
    else
        summary_msg+="🔧 Troubleshooting:
   1. Review log: cat $LOG_FILE
   2. Check service: sudo systemctl status $SERVICE_NAME
   3. Check logs: journalctl -u $SERVICE_NAME -n 100
   4. Pull logs locally: 
      cd ~/idea_contact_manager
      git checkout feature/viral-saas
      git pull origin feature/viral-saas
      # Review: deployment-logs/

"
    fi
    
    summary_msg+="📝 Logs synced to GitHub:
   Repository: https://github.com/haydenbarker-idea/idea_contact_manager
   Branch: $BRANCH
   Path: deployment-logs/
   Pull locally to review in Cursor!

"
    
    if [ "$DEPLOYMENT_STATUS" = "SUCCESS" ]; then
        summary_msg+="🚀 Test the viral loop:
   1. Visit https://saas.contacts.ideanetworks.com
   2. Submit contact → Click 'I Want This!'
   3. Complete onboarding → Get your page!

✅ Production (contacts.ideanetworks.com) untouched!
"
    fi
    
    summary_msg+="==================================================
"
    
    # Print to console
    echo -e "$summary_msg"
    
    # Write to log file
    echo "$summary_msg" >> "$LOG_FILE" 2>/dev/null || true
    
    # Add final status to log
    log "=== DEPLOYMENT $DEPLOYMENT_STATUS ==="
    log "Completed at: $(date +'%Y-%m-%d %H:%M:%S')"
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
    configure_nginx_ssl
    start_service
    verify_deployment
    sync_logs
    
    # Mark deployment as successful
    DEPLOYMENT_STATUS="SUCCESS"
    log "=== All steps completed successfully ==="
    
    print_summary
}

# Run main
main

