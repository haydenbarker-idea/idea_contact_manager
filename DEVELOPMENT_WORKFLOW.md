# 🔧 Development Workflow

This document explains how to develop new features safely while keeping the v1.0.0 production version stable.

---

## 📚 Branch Strategy

### Main Branch (`main`)
- **Purpose:** Production-ready code only
- **Status:** Deployed to https://contacts.ideanetworks.com
- **Rule:** Always stable, always working

### Feature Branches
- **Format:** `feature/feature-name`
- **Purpose:** Develop new features
- **Merge:** Only when fully tested and ready

### Hotfix Branches
- **Format:** `hotfix/fix-name`
- **Purpose:** Critical bug fixes
- **Merge:** Fast-track to main

---

## 🚀 Workflow for New Features

### 1. Create a Feature Branch

```bash
# Make sure you're on main and up to date
git checkout main
git pull origin main

# Create and switch to a new feature branch
git checkout -b feature/new-feature-name
```

### 2. Develop the Feature

```bash
# Make your changes
# ... code, code, code ...

# Commit as you go
git add .
git commit -m "feat: add awesome new feature"
```

### 3. Test Locally

```bash
# Run the app locally
npm run dev

# Test thoroughly
# Make sure nothing breaks
```

### 4. Push Feature Branch

```bash
# Push feature branch to GitHub
git push origin feature/new-feature-name
```

### 5. Merge to Main (when ready)

```bash
# Switch back to main
git checkout main

# Pull latest changes
git pull origin main

# Merge your feature
git merge feature/new-feature-name

# Push to main
git push origin main
```

### 6. Deploy to Production

```bash
# On the server
cd /var/www/contact-exchange
git fetch origin
git reset --hard origin/main
bash deploy-selfie-experience.sh
```

### 7. Clean Up

```bash
# Delete the feature branch (optional)
git branch -d feature/new-feature-name
git push origin --delete feature/new-feature-name
```

---

## 🏷️ Version Tagging

### When to Create a New Version

- **Major version** (2.0.0): Breaking changes, major new features
- **Minor version** (1.1.0): New features, backwards compatible
- **Patch version** (1.0.1): Bug fixes only

### How to Tag a New Version

```bash
# After merging all features for the release
git tag -a v1.1.0 -m "Release v1.1.0: Add XYZ features"

# Push the tag
git push origin v1.1.0

# Update CHANGELOG.md with the new version
```

---

## 🔄 Rollback Strategy

### If Something Breaks in Production

#### Option 1: Rollback to v1.0.0 (Safe Version)

```bash
# On the server
cd /var/www/contact-exchange
git fetch --tags
git checkout v1.0.0
bash deploy-selfie-experience.sh
```

#### Option 2: Rollback to Previous Commit

```bash
# Find the last good commit
git log --oneline

# Rollback to it
git reset --hard <commit-hash>
bash deploy-selfie-experience.sh
```

#### Option 3: Hotfix on Main

```bash
# On your local machine
git checkout main
git checkout -b hotfix/critical-fix

# Make the fix
# ... fix the bug ...

git add .
git commit -m "fix: critical bug in production"
git push origin hotfix/critical-fix

# Merge to main immediately
git checkout main
git merge hotfix/critical-fix
git push origin main

# Deploy
# (on server: git pull and deploy)
```

---

## 🧪 Testing Before Merge

### Checklist Before Merging to Main

- [ ] Feature works locally
- [ ] No TypeScript errors
- [ ] No linter warnings
- [ ] Existing features still work
- [ ] Environment variables documented
- [ ] Deployment script updated (if needed)
- [ ] CHANGELOG.md updated
- [ ] README.md updated (if needed)

### Test on Server (Optional)

You can test feature branches on the server without affecting main:

```bash
# On the server
cd /var/www/contact-exchange
git fetch origin
git checkout feature/new-feature-name
bash deploy-selfie-experience.sh

# Test at: https://contacts.ideanetworks.com

# When done, switch back to main
git checkout main
bash deploy-selfie-experience.sh
```

---

## 📋 Example: Adding a New Feature

Let's say you want to add "QR Code Generator" feature:

```bash
# 1. Create feature branch
git checkout main
git pull origin main
git checkout -b feature/qr-code-generator

# 2. Develop the feature
# ... create components, API routes, etc ...
git add .
git commit -m "feat: add QR code generator for contact page"

# 3. Test locally
npm run dev
# ... test everything ...

# 4. Push feature branch
git push origin feature/qr-code-generator

# 5. When ready, merge to main
git checkout main
git pull origin main
git merge feature/qr-code-generator
git push origin main

# 6. Update changelog and version
# Edit CHANGELOG.md
git add CHANGELOG.md
git commit -m "docs: update changelog for v1.1.0"
git tag -a v1.1.0 -m "Release v1.1.0: Add QR code generator"
git push origin v1.1.0
git push origin main

# 7. Deploy
# (on server: git pull and deploy)
```

---

## 🎯 Best Practices

### DO ✅
- Always create feature branches for new work
- Test thoroughly before merging to main
- Keep commits small and focused
- Write descriptive commit messages
- Update CHANGELOG.md for each version
- Tag stable versions
- Keep v1.0.0 tag as your "safe rollback point"

### DON'T ❌
- Don't commit directly to main for new features
- Don't merge untested code
- Don't delete version tags
- Don't force push to main (unless emergency rollback)
- Don't skip the deployment script
- Don't forget to update .env on server if needed

---

## 🔐 Your Safety Net

**v1.0.0 is your safe, stable, production-ready baseline.**

No matter what happens with new features, you can always:

```bash
git checkout v1.0.0
bash deploy-selfie-experience.sh
```

And be back to a working app in minutes! 🎉

---

## 📞 Need Help?

If something goes wrong:
1. Check deployment logs: `/var/www/contact-exchange/deployment-logs/`
2. Check service logs: `journalctl -u contact-exchange -n 100`
3. Rollback to v1.0.0 if needed
4. Ask AI for help with specific error messages

---

## 🎓 Git Cheat Sheet

```bash
# See all branches
git branch -a

# See all tags
git tag -l

# See what changed
git log --oneline

# See difference between versions
git diff v1.0.0 main

# Switch to a branch
git checkout branch-name

# Switch to a version
git checkout v1.0.0

# Go back to latest
git checkout main
git pull origin main
```

---

**Happy coding! Your v1.0.0 is safe and sound.** 🚀

