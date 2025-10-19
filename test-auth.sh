#!/bin/bash

# Test Login and Logout Functionality
# Run this on the server to test authentication

BASE_URL="https://saas.contacts.ideanetworks.com"

echo "=================================================="
echo "Testing Authentication"
echo "=================================================="
echo ""

# Test credentials (use a real user account)
read -p "Enter username (email or slug): " USERNAME
read -sp "Enter password: " PASSWORD
echo ""
echo ""

echo "1. Testing Login..."
echo "-------------------"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" \
    -c /tmp/cookies.txt)

echo "Response: $LOGIN_RESPONSE"
echo ""

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Login successful!"
    USER_NAME=$(echo "$LOGIN_RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    echo "   Logged in as: $USER_NAME"
    echo ""
    
    # Test session
    echo "2. Testing Session..."
    echo "---------------------"
    
    SESSION_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/session" \
        -b /tmp/cookies.txt)
    
    echo "Response: $SESSION_RESPONSE"
    echo ""
    
    if echo "$SESSION_RESPONSE" | grep -q '"success":true'; then
        echo "✅ Session valid!"
        echo ""
    else
        echo "❌ Session check failed!"
        echo ""
    fi
    
    # Test logout
    echo "3. Testing Logout..."
    echo "--------------------"
    
    LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/logout" \
        -b /tmp/cookies.txt)
    
    echo "Response: $LOGOUT_RESPONSE"
    echo ""
    
    if echo "$LOGOUT_RESPONSE" | grep -q '"success":true'; then
        echo "✅ Logout successful!"
        echo ""
    else
        echo "❌ Logout failed!"
        echo ""
    fi
    
    # Verify session is destroyed
    echo "4. Verifying Session Destroyed..."
    echo "---------------------------------"
    
    SESSION_CHECK=$(curl -s -X GET "$BASE_URL/api/auth/session" \
        -b /tmp/cookies.txt)
    
    echo "Response: $SESSION_CHECK"
    echo ""
    
    if echo "$SESSION_CHECK" | grep -q '"success":false'; then
        echo "✅ Session successfully destroyed!"
    else
        echo "⚠️  Session still active (unexpected)"
    fi
else
    echo "❌ Login failed!"
    ERROR_MSG=$(echo "$LOGIN_RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    echo "   Error: $ERROR_MSG"
fi

# Cleanup
rm -f /tmp/cookies.txt

echo ""
echo "=================================================="
echo "Authentication Test Complete"
echo "=================================================="

