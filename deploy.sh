#!/bin/bash

echo "🚀 PMP Deal Tracker Dashboard - Deployment Script"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build the project
echo "📦 Building the project..."
cd client && npm run build && cd ..

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
fi

# Add all files
echo "📝 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy PMP Deal Tracker Dashboard - $(date)"

echo ""
echo "🎉 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Push to GitHub:"
echo "   git remote add origin <your-github-repo-url>"
echo "   git push -u origin main"
echo ""
echo "2. Deploy to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repository"
echo "   - Deploy!"
echo ""
echo "3. Or deploy to Netlify:"
echo "   - Go to https://netlify.com"
echo "   - Drag and drop the 'client/dist' folder"
echo ""
echo "Your app will be live at: https://your-project-name.vercel.app"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions" 