#!/bin/bash

echo "🚀 PMP Deal Tracker Dashboard - GitHub Pages Deployment"
echo "======================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
fi

# Build the project
echo "📦 Building the project..."
cd client && npm run build && cd ..

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Add all files
echo "📝 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy to GitHub Pages - $(date)"

echo ""
echo "🎉 Ready for GitHub Pages deployment!"
echo ""
echo "Next steps:"
echo ""
echo "1. Create a GitHub repository:"
echo "   - Go to https://github.com"
echo "   - Click '+' → 'New repository'"
echo "   - Name it: PMP-Tracker"
echo "   - Make it PUBLIC (required for free GitHub Pages)"
echo ""
echo "2. Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/PMP-Tracker.git"
echo "   git push -u origin main"
echo ""
echo "3. Enable GitHub Pages:"
echo "   - Go to your repository on GitHub"
echo "   - Click 'Settings' tab"
echo "   - Scroll to 'Pages' section"
echo "   - Source: 'Deploy from a branch'"
echo "   - Branch: 'gh-pages'"
echo "   - Click 'Save'"
echo ""
echo "4. Your app will be live at:"
echo "   https://YOUR_USERNAME.github.io/PMP-Tracker/"
echo ""
echo "📚 See GITHUB_PAGES_DEPLOYMENT.md for detailed instructions" 