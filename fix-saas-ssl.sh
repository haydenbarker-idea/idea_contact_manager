#!/bin/bash

# Fix SaaS SSL Configuration
# Ensures HTTPS is properly configured with HTTP->HTTPS redirect

set -e

echo "=================================================="
echo "Fixing SaaS SSL Configuration"
echo "=================================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo "Please run as root (use sudo)"
   exit 1
fi

DOMAIN="saas.contacts.ideanetworks.com"

echo "Creating proper Nginx configuration with SSL..."

cat > /etc/nginx/sites-available/contact-exchange-saas << 'NGINX_EOF'
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name saas.contacts.ideanetworks.com;

    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS - Main configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name saas.contacts.ideanetworks.com;

    # SSL Configuration (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/saas.contacts.ideanetworks.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saas.contacts.ideanetworks.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files
    location /_next/static/ {
        proxy_pass http://localhost:3001;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    # Public files
    location /public/ {
        proxy_pass http://localhost:3001;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    # Uploads
    location /uploads/ {
        proxy_pass http://localhost:3001;
        proxy_cache_valid 200 1h;
    }

    client_max_body_size 10M;
}
NGINX_EOF

echo "✓ Nginx configuration created"

# Enable the site (create symlink)
ln -sf /etc/nginx/sites-available/contact-exchange-saas /etc/nginx/sites-enabled/contact-exchange-saas

# Test Nginx configuration
echo ""
echo "Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✓ Nginx configuration is valid"
    
    # Reload Nginx
    echo ""
    echo "Reloading Nginx..."
    systemctl reload nginx
    echo "✓ Nginx reloaded"
    
    echo ""
    echo "=================================================="
    echo "✅ SSL Configuration Fixed!"
    echo "=================================================="
    echo ""
    echo "The site should now:"
    echo "  1. Automatically redirect HTTP to HTTPS"
    echo "  2. Show secure padlock in browser"
    echo "  3. Use HTTPS for all admin authentication"
    echo ""
    echo "Test it:"
    echo "  http://saas.contacts.ideanetworks.com  (redirects to HTTPS)"
    echo "  https://saas.contacts.ideanetworks.com (secure)"
    echo ""
    echo "Admin page: https://saas.contacts.ideanetworks.com/admin"
    echo "=================================================="
else
    echo "❌ Nginx configuration test failed!"
    echo "Please check the error messages above"
    exit 1
fi

