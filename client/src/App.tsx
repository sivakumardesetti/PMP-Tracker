import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Dashboard } from './pages/Dashboard';
import { Deals } from './pages/Deals';
import { DealDetail } from './pages/DealDetail';
import { AppBar, Tabs, Tab, Box, Fade } from '@mui/material';

// Dark theme configuration for PMP Tracker
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
    background: { 
      default: '#0a0a0a', 
      paper: '#1a1a1a' 
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    divider: '#333333',
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          borderBottom: '1px solid #333333',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #333333',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #333333',
        },
      },
    },
  },
});

function MainTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  // Determine tab from path
  const tabFromPath = location.pathname.startsWith('/deals') ? 1 : 0;
  const [tab, setTab] = useState(tabFromPath);

  const handleTabChange = (_: any, newValue: number) => {
    setTab(newValue);
    navigate(newValue === 0 ? '/dashboard' : '/deals');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #333333', bgcolor: '#1a1a1a' }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': { 
              fontWeight: 700, 
              fontSize: 18, 
              letterSpacing: 0.5,
              color: '#b0b0b0',
              '&.Mui-selected': {
                color: '#90caf9',
              }
            },
            minHeight: 56,
            '& .MuiTabs-indicator': {
              backgroundColor: '#90caf9',
            }
          }}
        >
          <Tab label="Dashboard" />
          <Tab label="Deals" />
        </Tabs>
      </AppBar>
      <Box sx={{ p: 0, minHeight: 'calc(100vh - 56px)', width: '100%' }}>
        <Fade in={tab === 0} timeout={400} unmountOnExit mountOnEnter>
          <div hidden={tab !== 0}>
            <Dashboard />
          </div>
        </Fade>
        <Fade in={tab === 1} timeout={400} unmountOnExit mountOnEnter>
          <div hidden={tab !== 1}>
            <Deals />
          </div>
        </Fade>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/dashboard" element={<MainTabs />} />
          <Route path="/deals" element={<MainTabs />} />
          <Route path="/deals/:id" element={<DealDetail />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
