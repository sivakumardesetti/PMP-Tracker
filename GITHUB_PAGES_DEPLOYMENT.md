# 🚀 GitHub Pages Deployment Guide

This guide will walk you through deploying your PMP Deal Tracker Dashboard to GitHub Pages for free!

## ✅ Prerequisites

- GitHub account
- Git installed on your computer
- Your project code ready

## 🚀 Step-by-Step Deployment

### 1. Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Name it: `PMP-Tracker` (or your preferred name)
4. Make it **Public** (required for free GitHub Pages)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### 2. Push Your Code to GitHub

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/PMP-Tracker.git

# Push your code
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (in the left sidebar)
4. Under **Source**, select **Deploy from a branch**
5. Under **Branch**, select **gh-pages** and **/(root)**
6. Click **Save**

### 4. Enable GitHub Actions

The GitHub Actions workflow is already configured in `.github/workflows/deploy.yml`. It will:

- Build your React app automatically
- Deploy to GitHub Pages on every push to main branch
- Use the `gh-pages` branch for deployment

### 5. First Deployment

1. Make a small change to trigger deployment:
```bash
# Add a comment to README.md
echo "# PMP Deal Tracker Dashboard - Deployed to GitHub Pages" >> README.md

# Commit and push
git add .
git commit -m "Trigger first GitHub Pages deployment"
git push
```

2. Go to **Actions** tab in your GitHub repository
3. You should see the workflow running
4. Wait for it to complete (usually 2-3 minutes)

### 6. Access Your Live App

Your app will be available at:
```
https://YOUR_USERNAME.github.io/PMP-Tracker/
```

## 🔧 Configuration Details

### GitHub Actions Workflow
The workflow (`.github/workflows/deploy.yml`) does the following:

1. **Triggers**: On push to main branch
2. **Environment**: Ubuntu latest
3. **Steps**:
   - Checkout code
   - Setup Node.js 18
   - Install dependencies
   - Build the React app
   - Deploy to GitHub Pages

### Vite Configuration
The `client/vite.config.ts` is configured for GitHub Pages:

```typescript
base: process.env.NODE_ENV === 'production' ? '/PMP-Tracker/' : '/'
```

This ensures assets are loaded correctly from the GitHub Pages subdirectory.

## 📁 Repository Structure After Deployment

```
PMP-Tracker/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── client/
│   ├── src/                   # Source code
│   ├── dist/                  # Built files (local)
│   └── vite.config.ts         # Vite config for GitHub Pages
├── gh-pages/                  # Deployed files (auto-generated)
└── ... (other files)
```

## 🔄 Automatic Deployments

Every time you push to the `main` branch:
1. GitHub Actions automatically builds your app
2. Deploys to the `gh-pages` branch
3. Your live site updates within minutes

## 🛠️ Troubleshooting

### Build Fails
1. Check the **Actions** tab for error details
2. Common issues:
   - Missing dependencies
   - TypeScript errors
   - Build script issues

### Site Not Loading
1. Wait 5-10 minutes after deployment
2. Check if the `gh-pages` branch was created
3. Verify GitHub Pages is enabled in Settings
4. Clear browser cache

### 404 Errors on Refresh
This is normal for single-page apps. The app handles routing client-side.

## 🎯 Custom Domain (Optional)

To use a custom domain:

1. Go to repository **Settings** → **Pages**
2. Under **Custom domain**, enter your domain
3. Add a `CNAME` file to your repository root:
   ```
   yourdomain.com
   ```
4. Configure DNS with your domain provider

## 📊 Monitoring

- **Deployments**: Check the **Actions** tab
- **Site Analytics**: Available in repository **Insights** → **Traffic**
- **Build Status**: Shows in repository main page

## 🚀 Quick Commands

```bash
# Deploy updates
git add .
git commit -m "Update dashboard"
git push

# Check deployment status
# Go to: https://github.com/YOUR_USERNAME/PMP-Tracker/actions

# View live site
# Go to: https://YOUR_USERNAME.github.io/PMP-Tracker/
```

## ✅ Success Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] GitHub Pages enabled
- [ ] GitHub Actions workflow running
- [ ] First deployment successful
- [ ] Live site accessible
- [ ] Team can access the URL

## 🎉 You're Live!

Once deployed, share this URL with your organization:
```
https://YOUR_USERNAME.github.io/PMP-Tracker/
```

Your PMP Deal Tracker Dashboard is now live and will automatically update whenever you push changes to GitHub!

---

**Need help?** Check the GitHub Actions logs or refer to the main [DEPLOYMENT.md](./DEPLOYMENT.md) guide. 