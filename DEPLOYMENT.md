# Deployment Guide - PMP Deal Tracker Dashboard

## Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free at [vercel.com](https://vercel.com))

### Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign up/login
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a React app
   - Configure build settings:
     - **Framework Preset**: Vite
     - **Build Command**: `cd client && npm run build`
     - **Output Directory**: `client/dist`
     - **Install Command**: `cd client && npm install`
   - Click "Deploy"

3. **Your app will be live at**: `https://your-project-name.vercel.app`

### Custom Domain (Optional)
- In your Vercel dashboard, go to Settings → Domains
- Add your custom domain (e.g., `pmp-tracker.yourcompany.com`)

## Alternative: Deploy to Netlify

1. **Build your app locally**:
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `client/dist` folder to deploy
   - Or connect your GitHub repo for automatic deployments

## Environment Variables (if needed later)
If you add environment variables, you can set them in:
- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables

## Notes
- The current build only includes the frontend (React app)
- Backend API endpoints are not yet implemented
- All data is currently mocked/static
- The app is optimized for desktop/tablet viewing 