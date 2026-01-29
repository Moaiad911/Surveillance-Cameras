# Git Workflow Guide

This guide covers Git workflows for both the project owner (main branch maintainer) and team members.

---

## 📤 Part 1: Initial Setup - Uploading to GitHub (Project Owner)

### Step 1: Create a GitHub Repository
1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Name your repository (e.g., "surveillance-cameras-system")
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (you already have files)
6. Click **"Create repository"**

### Step 2: Initialize Git in Your Project (If Not Already Done)
```bash
# Navigate to your project folder
cd "D:\FCI 2025-2026\Graduation Project\Surveillance Cameras Website"

# Initialize Git (if not already initialized)
git init

# Add all files
git add .

# Make your first commit
git commit -m "Initial commit: Surveillance Cameras Management System"
```

### Step 3: Connect to GitHub and Push
```bash
# Add your GitHub repository as remote (replace with your actual repository URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note**: You may need to authenticate. Use a Personal Access Token or GitHub CLI.

---

## 👥 Part 2: For Team Members - How to Contribute

### Step 1: Clone the Repository (First Time Only)
```bash
# Clone the repository to your local machine
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### Step 2: Create a Feature Branch
**Always work on a separate branch, never directly on `main`!**

```bash
# Make sure you're on main and it's up to date
git checkout main
git pull origin main

# Create a new branch for your feature
git checkout -b feature/your-feature-name

# Examples:
# git checkout -b feature/login-signup
# git checkout -b feature/camera-management
# git checkout -b bugfix/fix-authentication
```

### Step 3: Make Changes and Commit
```bash
# After making your changes, stage them
git add .

# Commit with a descriptive message
git commit -m "Implemented login and signup pages"

# Or be more specific:
git commit -m "Add user authentication with JWT tokens"
```

### Step 4: Push Your Branch to GitHub
```bash
# Push your branch to GitHub
git push origin feature/your-feature-name

# If it's the first time pushing this branch, use:
git push -u origin feature/your-feature-name
```

### Step 5: Create a Pull Request (PR)
1. Go to your repository on **GitHub.com**
2. You'll see a yellow banner: **"[your-branch-name] had recent pushes"**
3. Click **"Compare & pull request"**
4. Fill in the PR details:
   - **Title**: Clear description (e.g., "Add Authentication System")
   - **Description**: Explain what you did, what changed, and why
   - **Reviewers**: Tag the project owner
5. Click **"Create pull request"**
6. Wait for review and approval

### Step 6: Keep Your Branch Updated
If the main branch has new changes while you're working:

```bash
# Switch to main and get latest updates
git checkout main
git pull origin main

# Switch back to your feature branch
git checkout feature/your-feature-name

# Merge main into your branch to get updates
git merge main

# Resolve any conflicts if they occur, then:
git add .
git commit -m "Merge main into feature branch"
git push origin feature/your-feature-name
```

---

## 🔍 Part 3: For Project Owner - Reviewing Team Updates

### Step 1: View Pull Requests
1. Go to your repository on **GitHub.com**
2. Click the **"Pull requests"** tab
3. You'll see all open PRs from team members

### Step 2: Review the Changes
1. Click on a PR to open it
2. Review the **"Files changed"** tab to see what was modified
3. Check the code for:
   - Code quality and style
   - Functionality
   - Potential bugs
   - Missing tests or documentation

### Step 3: Add Comments (Optional)
- Click on any line to add a comment
- Use **"Review changes"** button to add general comments
- You can:
  - **Comment**: Just leave feedback
  - **Approve**: Approve the changes
  - **Request changes**: Ask for modifications

### Step 4: Merge the Pull Request
Once you're satisfied with the changes:

1. Click the green **"Merge pull request"** button
2. Choose merge type:
   - **Create a merge commit** (recommended) - preserves history
   - **Squash and merge** - combines all commits into one
   - **Rebase and merge** - linear history
3. Click **"Confirm merge"**
4. Optionally delete the feature branch after merging

### Step 5: Update Your Local Repository
After merging PRs, update your local main branch:

```bash
# Switch to main branch
git checkout main

# Pull the latest changes (including merged PRs)
git pull origin main
```

---

## 🔄 Part 4: Daily Workflow - Staying Updated

### For Project Owner:
```bash
# Before starting work, always update main
git checkout main
git pull origin main

# If you need to make changes, create a branch
git checkout -b feature/your-feature
# ... make changes ...
git add .
git commit -m "Your commit message"
git push origin feature/your-feature
```

### For Team Members:
```bash
# Always start from updated main
git checkout main
git pull origin main

# Create your feature branch
git checkout -b feature/your-work
# ... make changes ...
git add .
git commit -m "Your commit message"
git push origin feature/your-work
# Then create PR on GitHub
```

---

## ⚠️ Important Rules

1. **Never push directly to `main`** - Always use feature branches
2. **Always pull before starting work** - Keep your code up to date
3. **Write clear commit messages** - Describe what and why
4. **Create small, focused PRs** - Easier to review and merge
5. **Test before pushing** - Make sure your code works
6. **Communicate** - Let team know what you're working on

---

## 🆘 Troubleshooting

### "Your branch is behind 'origin/main'"
```bash
git checkout main
git pull origin main
git checkout your-branch
git merge main
```

### "Merge conflicts"
1. Git will mark conflicts in files
2. Open the files and look for `<<<<<<<`, `=======`, `>>>>>>>`
3. Resolve conflicts manually
4. Save files, then:
```bash
git add .
git commit -m "Resolve merge conflicts"
```

### "Permission denied" or "Authentication failed"
- Use Personal Access Token instead of password
- Or set up SSH keys for GitHub
- Or use GitHub CLI: `gh auth login`

---

## 📚 Quick Reference

| Action | Command |
|--------|---------|
| Create branch | `git checkout -b feature/name` |
| Switch branch | `git checkout branch-name` |
| See all branches | `git branch -a` |
| Stage changes | `git add .` |
| Commit | `git commit -m "message"` |
| Push branch | `git push origin branch-name` |
| Pull updates | `git pull origin main` |
| See status | `git status` |
| See history | `git log` |
