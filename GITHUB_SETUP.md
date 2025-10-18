# GitHub Setup & Deployment Guide

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository:
   - **Name**: `contact-exchange` (or your preferred name)
   - **Description**: "Professional contact exchange app for conferences"
   - **Visibility**: Private (recommended) or Public
   - **DON'T** initialize with README, .gitignore, or license (we have them)

3. Click "Create repository"

---

## Step 2: Push Your Code to GitHub

From your local machine (in this project folder):

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Contact Exchange MVP"

# Add your GitHub repository as remote
# Replace USERNAME and REPO with your GitHub username and repo name
git remote add origin https://github.com/USERNAME/REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Example:**
```bash
git init
git add .
git commit -m "Initial commit: Contact Exchange MVP"
git remote add origin https://github.com/hbarker/contact-exchange.git
git branch -M main
git push -u origin main
```

You'll be prompted for your GitHub credentials.

---

## Step 3: Deploy to Server

Once your code is on GitHub, deploy to your server:

### Option A: Automatic Deployment Script

1. **First, run the server setup** (if not already done):
```bash
ssh root@137.220.52.23
# Upload server-setup-quick.sh
sudo bash server-setup-quick.sh
```

2. **Then, deploy from GitHub**:
```bash
# Still on server, download deployment script
wget https://raw.githubusercontent.com/USERNAME/REPO/main/deploy-from-github.sh
# OR upload from your local machine:
# scp deploy-from-github.sh root@137.220.52.23:/root/

chmod +x deploy-from-github.sh
sudo bash deploy-from-github.sh https://github.com/USERNAME/REPO.git
```

The script will:
- Clone your repository
- Prompt for your contact information
- Create .env file automatically
- Install dependencies
- Setup database
- Build the app
- Start the service

### Option B: Manual Deployment

```bash
ssh root@137.220.52.23
cd /var/www/contact-exchange

# Clone repository
git clone https://github.com/USERNAME/REPO.git .

# Create .env file
nano .env
# (paste your configuration - see env.example.txt)

# Install and build
npm install
npx prisma generate
npx prisma db push
npm run build

# Start service
sudo systemctl start contact-exchange
sudo systemctl enable contact-exchange
```

---

## Step 4: Verify Deployment

1. Visit: https://contacts.ideanetworks.com
2. Test all features:
   - vCard download
   - SMS link
   - LinkedIn link
   - Form submission
   - Admin dashboard at `/admin`

---

## Updating Your App Later

When you make changes to your code:

### From Your Local Machine:
```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push
```

### On Your Server:
```bash
ssh root@137.220.52.23
cd /var/www/contact-exchange

# Pull latest changes
git pull

# Rebuild and restart
npm install
npm run build
sudo systemctl restart contact-exchange
```

Or use this one-liner from your local machine:
```bash
ssh root@137.220.52.23 'cd /var/www/contact-exchange && git pull && npm install && npm run build && sudo systemctl restart contact-exchange'
```

---

## Quick Update Script

Save this as `update-server.sh` on your local machine:

```bash
#!/bin/bash
ssh root@137.220.52.23 << 'EOF'
cd /var/www/contact-exchange
echo "Pulling latest changes..."
git pull
echo "Installing dependencies..."
npm install
echo "Building..."
npm run build
echo "Restarting service..."
systemctl restart contact-exchange
echo "Checking status..."
systemctl status contact-exchange --no-pager
echo "Done! Site updated at https://contacts.ideanetworks.com"
EOF
```

Make it executable and use it:
```bash
chmod +x update-server.sh
./update-server.sh
```

---

## Security Note

**Never commit your .env file to GitHub!**

The `.gitignore` file is already configured to exclude:
- `.env`
- `node_modules`
- `.next`
- Database files

Always keep sensitive information (passwords, API keys) in `.env` on the server only.

---

## Troubleshooting

### "Permission denied (publickey)" when pushing
- Set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- Or use HTTPS with username/password or personal access token

### Git not installed on server
```bash
sudo apt-get install git
```

### Can't push to GitHub
- Make sure you created the repository
- Check your GitHub credentials
- Use a personal access token instead of password if needed

### Deploy script fails
- Make sure `server-setup-quick.sh` ran successfully first
- Check that database credentials are in `/root/contact-exchange-credentials.txt`
- Run deployment steps manually (see Option B above)

---

## Complete Deployment Workflow

```mermaid
Local Machine          GitHub              Server (137.220.52.23)
     │                    │                           │
     ├─ git push ────────>│                           │
     │                    │                           │
     │                    │<──── git clone ───────────┤
     │                    │                           │
     │                    │                           ├─ npm install
     │                    │                           ├─ npm build
     │                    │                           ├─ systemctl start
     │                    │                           │
     │                    │                    ✅ Live at
     │                    │              contacts.ideanetworks.com
```

---

## Repository Structure (What Gets Pushed)

```
contact-exchange/
├── .gitignore              ✅ (excludes .env, node_modules, etc.)
├── README.md               ✅
├── package.json            ✅
├── tsconfig.json           ✅
├── next.config.js          ✅
├── tailwind.config.ts      ✅
├── prisma/schema.prisma    ✅
├── src/                    ✅ (all application code)
├── server-setup-quick.sh   ✅
├── deploy-from-github.sh   ✅
├── DEPLOYMENT.md           ✅
├── QUICKSTART.md           ✅
└── All documentation       ✅

NOT pushed:
├── .env                    ❌ (create on server)
├── node_modules/           ❌ (installed on server)
├── .next/                  ❌ (built on server)
```

---

## After First Deployment

1. **Bookmark these commands:**
   - View logs: `ssh root@137.220.52.23 'journalctl -u contact-exchange -f'`
   - Restart app: `ssh root@137.220.52.23 'systemctl restart contact-exchange'`
   - Pull updates: `ssh root@137.220.52.23 'cd /var/www/contact-exchange && git pull && npm run build && systemctl restart contact-exchange'`

2. **Set up GitHub webhook** (optional, advanced):
   - Auto-deploy when you push to main branch
   - See GitHub Actions documentation

3. **Create a development branch:**
   ```bash
   git checkout -b develop
   # Make changes and test
   git push -u origin develop
   # When ready, merge to main
   ```

---

## Quick Reference

```bash
# Push code to GitHub
git add .
git commit -m "Update message"
git push

# Deploy to server (first time)
ssh root@137.220.52.23
sudo bash server-setup-quick.sh
sudo bash deploy-from-github.sh https://github.com/USERNAME/REPO.git

# Update server (after changes)
ssh root@137.220.52.23
cd /var/www/contact-exchange && git pull && npm run build && systemctl restart contact-exchange
```

---

**Your repository URL will be:** `https://github.com/YOUR_USERNAME/contact-exchange.git`

Replace `YOUR_USERNAME` with your actual GitHub username in all commands above!

