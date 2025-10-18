#!/bin/bash

# Script to push Contact Exchange app to GitHub
# Run this from your local machine in the project directory

echo "================================================"
echo "Push Contact Exchange to GitHub"
echo "================================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
fi

# Get GitHub repository URL
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter repository name (press Enter for 'contact-exchange'): " REPO_NAME
REPO_NAME=${REPO_NAME:-contact-exchange}

REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo ""
echo "Repository URL: $REPO_URL"
echo ""
echo "⚠️  Make sure you've created this repository on GitHub first!"
echo "   Go to: https://github.com/new"
echo ""
read -p "Have you created the repository on GitHub? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo ""
    echo "Please create the repository first:"
    echo "1. Go to https://github.com/new"
    echo "2. Name: $REPO_NAME"
    echo "3. Visibility: Private (recommended)"
    echo "4. Don't initialize with README"
    echo "5. Click 'Create repository'"
    echo ""
    echo "Then run this script again!"
    exit 0
fi

echo ""
echo "Adding files to git..."
git add .

echo "Creating commit..."
git commit -m "Initial commit: Contact Exchange MVP - Conference ready app"

# Check if remote already exists
if git remote | grep -q '^origin$'; then
    echo "Updating remote URL..."
    git remote set-url origin $REPO_URL
else
    echo "Adding remote..."
    git remote add origin $REPO_URL
fi

echo "Setting main branch..."
git branch -M main

echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "✅ Successfully pushed to GitHub!"
    echo "================================================"
    echo ""
    echo "Repository: $REPO_URL"
    echo ""
    echo "Next Steps:"
    echo "1. SSH to your server: ssh root@137.220.52.23"
    echo "2. Run server setup (if not done): sudo bash server-setup-quick.sh"
    echo "3. Deploy from GitHub: sudo bash deploy-from-github.sh $REPO_URL"
    echo ""
    echo "Or upload and run the deployment script:"
    echo "scp deploy-from-github.sh root@137.220.52.23:/root/"
    echo "ssh root@137.220.52.23"
    echo "sudo bash deploy-from-github.sh $REPO_URL"
    echo ""
else
    echo ""
    echo "❌ Push failed!"
    echo ""
    echo "Common issues:"
    echo "1. Repository doesn't exist on GitHub - create it first"
    echo "2. Authentication failed - check your GitHub credentials"
    echo "3. No permission - make sure you own the repository"
    echo ""
    echo "Try:"
    echo "- Use a personal access token instead of password"
    echo "- Set up SSH keys: https://docs.github.com/en/authentication"
    echo ""
fi

