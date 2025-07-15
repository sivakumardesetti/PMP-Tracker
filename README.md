# PMP Deal Tracker Dashboard

A premium, enterprise-grade dashboard for tracking and analyzing Programmatic Marketplace (PMP) deals. Built with React, Material-UI, and MUI X Charts.

## 🚀 Quick Deploy

### Option 1: Vercel (Recommended)
1. Fork this repository
2. Go to [vercel.com](https://vercel.com) and sign up
3. Click "New Project" → Import your forked repo
4. Deploy! Your app will be live at `https://your-project.vercel.app`

### Option 2: Netlify
1. Fork this repository
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git" → Connect your repo
4. Build command: `cd client && npm run build`
5. Publish directory: `client/dist`

## 🛠️ Local Development

```bash
# Install dependencies
npm install
cd client && npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 📋 Features

- **Dashboard**: Interactive charts and KPI cards
- **Deals Management**: Data table with sorting and filtering
- **Modern UI**: Enterprise-grade design with Material-UI
- **Responsive**: Optimized for desktop and tablet

## 🏗️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI**: Material-UI (MUI), MUI X Charts, MUI X DataGrid
- **State Management**: React Query
- **Routing**: React Router DOM

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Node.js backend (future)
├── vercel.json           # Vercel deployment config
└── package.json
```

## 🔧 Configuration

The app is currently using mocked data. To connect to real APIs:

1. Update API endpoints in `client/src/hooks/`
2. Add environment variables for API keys
3. Configure CORS on your backend

## 📄 Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Product Requirements Document](./PRD.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is proprietary software.

---

**Note**: This is a frontend-only implementation with mocked data. Backend API integration is planned for future releases. 