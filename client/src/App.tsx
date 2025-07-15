import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Dashboard } from './pages/Dashboard';
import { Deals } from './pages/Deals';
import { DealDetail } from './pages/DealDetail';
import { AppBar, Tabs, Tab, Box, Fade } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    background: { default: '#f5f5f5', paper: '#fff' },
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
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: '#fff' }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': { fontWeight: 700, fontSize: 18, letterSpacing: 0.5 },
            minHeight: 56,
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
