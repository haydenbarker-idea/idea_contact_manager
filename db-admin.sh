#!/bin/bash

# Database Administration Script
# Quick commands for managing the SaaS database

DB_NAME="contact_exchange_saas"

echo "=================================================="
echo "Database Administration - SaaS Instance"
echo "Database: $DB_NAME"
echo "=================================================="
echo ""

# Menu
echo "Select an option:"
echo "1. View database stats (user & contact counts)"
echo "2. Clean database (delete all users & contacts)"
echo "3. List all users"
echo "4. List all contacts"
echo "5. View recent activity (last 10 contacts)"
echo "6. Exit"
echo ""
read -p "Enter option (1-6): " OPTION

case $OPTION in
    1)
        echo ""
        echo "Database Statistics:"
        echo "-------------------"
        sudo -u postgres psql -d "$DB_NAME" << EOF
SELECT 
    'Users' as table_name, 
    COUNT(*) as count 
FROM users
UNION ALL
SELECT 
    'Contacts' as table_name, 
    COUNT(*) as count 
FROM contacts;
EOF
        ;;
    
    2)
        echo ""
        echo "⚠️  WARNING: This will DELETE ALL users and contacts!"
        echo "Database: $DB_NAME"
        read -p "Type 'DELETE' to confirm: " CONFIRM
        
        if [ "$CONFIRM" = "DELETE" ]; then
            echo "Cleaning database..."
            sudo -u postgres psql -d "$DB_NAME" << EOF
DELETE FROM contacts;
DELETE FROM users;
SELECT 'Deleted ' || COUNT(*) || ' users' FROM users;
SELECT 'Deleted ' || COUNT(*) || ' contacts' FROM contacts;
EOF
            echo ""
            echo "✅ Database cleaned successfully!"
        else
            echo "❌ Cancelled - database not modified"
        fi
        ;;
    
    3)
        echo ""
        echo "All Users:"
        echo "----------"
        sudo -u postgres psql -d "$DB_NAME" -c "SELECT id, name, email, slug, active, created_at FROM users ORDER BY created_at DESC;"
        ;;
    
    4)
        echo ""
        echo "All Contacts:"
        echo "-------------"
        sudo -u postgres psql -d "$DB_NAME" -c "SELECT id, name, email, phone, company, submitted_at FROM contacts ORDER BY submitted_at DESC;"
        ;;
    
    5)
        echo ""
        echo "Recent Activity (Last 10 Contacts):"
        echo "------------------------------------"
        sudo -u postgres psql -d "$DB_NAME" -c "SELECT c.name as contact_name, c.email, c.company, u.name as owner, c.submitted_at FROM contacts c LEFT JOIN users u ON c.user_id = u.id ORDER BY c.submitted_at DESC LIMIT 10;"
        ;;
    
    6)
        echo "Exiting..."
        exit 0
        ;;
    
    *)
        echo "Invalid option!"
        exit 1
        ;;
esac

echo ""
echo "=================================================="
echo "Done!"
echo "=================================================="

