#!/bin/bash

# Database Cleanup Script for SaaS Instance
# Removes all test users and contacts from the database

set -e

echo "=================================================="
echo "Database Cleanup - SaaS Instance"
echo "=================================================="
echo ""

# Change to the SaaS directory
cd /var/www/contact-exchange-saas

# Load environment variables safely (handles values with spaces and special chars)
if [ -f .env ]; then
    while IFS='=' read -r key value; do
        # Skip empty lines and comments
        [[ -z "$key" || "$key" =~ ^#.*$ ]] && continue
        # Remove quotes if present and export
        value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
        export "$key=$value"
    done < <(grep -v '^#' .env | grep -v '^$')
fi

echo "⚠️  WARNING: This will delete ALL users and contacts!"
echo "Press Ctrl+C within 5 seconds to cancel..."
echo ""
sleep 5

echo "🧹 Running cleanup script..."
echo ""

# Run the Node.js cleanup script
node scripts/cleanup-database.js

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "You can now test the full user experience with your email."
echo ""

