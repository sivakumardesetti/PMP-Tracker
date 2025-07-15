import React, { useState } from 'react';
import { Box, Typography, Chip, Button, Stack, Paper, Fab, Zoom, Drawer, Card, CardContent, IconButton, Divider, Tabs, Tab, Fade, List, ListItem, ListItemText, TextField, MenuItem, InputAdornment, FormControl, Select } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { dealsMock } from '../mock/dealsMock';
import AddIcon from '@mui/icons-material/Add';
import TableChartIcon from '@mui/icons-material/TableChart';
import CloseIcon from '@mui/icons-material/Close';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import SearchIcon from '@mui/icons-material/Search';

// Premium AdTech Color Palette - Dark Theme
const COLORS = {
  primary: '#90caf9',      // Light blue
  secondary: '#f48fb1',    // Light pink
  success: '#4ade80',      // Light green
  warning: '#fbbf24',      // Light amber
  error: '#f87171',        // Light red
  info: '#60a5fa',         // Light blue
  
  // Backgrounds
  bg: '#0a0a0a',           // Dark background
  surface: 'rgba(26, 26, 26, 0.9)',
  headerBg: 'rgba(26, 26, 26, 0.95)',
  
  // Text
  textPrimary: '#ffffff',  // White text
  textSecondary: '#b0b0b0', // Light gray
  textMuted: '#808080',    // Medium gray
  
  // Borders & Effects
  border: 'rgba(255, 255, 255, 0.08)',
  hoverBg: 'rgba(144, 202, 249, 0.04)',
  shadowPrimary: 'rgba(144, 202, 249, 0.25)',
  shadowSecondary: 'rgba(0, 0, 0, 0.3)',
};

const getHealthColor = (health: string) => {
  switch (health) {
    case 'Excellent': return { color: COLORS.success, bg: `${COLORS.success}15` };
    case 'Good': return { color: COLORS.info, bg: `${COLORS.info}15` };
    case 'Warning': return { color: COLORS.warning, bg: `${COLORS.warning}15` };
    case 'Critical': return { color: COLORS.error, bg: `${COLORS.error}15` };
    default: return { color: COLORS.textMuted, bg: `${COLORS.textMuted}15` };
  }
};

const getTrendColor = (trend: string) => {
  if (trend.startsWith('+')) return { color: COLORS.success, bg: `${COLORS.success}15` };
  if (trend.startsWith('-')) return { color: COLORS.error, bg: `${COLORS.error}15` };
  return { color: COLORS.textMuted, bg: `${COLORS.textMuted}15` };
};

const columns: GridColDef[] = [
  { field: 'ssp', headerName: 'SSP', width: 120, minWidth: 100 },
  { field: 'dealId', headerName: 'Deal ID', width: 140, minWidth: 120 },
  { field: 'name', headerName: 'Name', flex: 1, minWidth: 200 },
  { field: 'start', headerName: 'Start', width: 120, minWidth: 100 },
  { field: 'dealOwner', headerName: 'Deal Owner', width: 140, minWidth: 120 },
  { field: 'status', headerName: 'Status', width: 120, renderCell: (params: GridRenderCellParams) => {
      const statusColor = params.value === 'Active' ? COLORS.success : params.value === 'Paused' ? COLORS.warning : COLORS.textMuted;
      const statusBg = params.value === 'Active' ? `${COLORS.success}15` : params.value === 'Paused' ? `${COLORS.warning}15` : `${COLORS.textMuted}15`;
      return (
        <Box sx={{ 
          backgroundColor: statusBg,
          color: statusColor,
          px: 2,
          py: 0.5,
          borderRadius: 2,
          fontWeight: 600,
          fontSize: 12,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          border: `1px solid ${statusColor}20`,
          minWidth: 70,
          justifyContent: 'center'
        }}>
          {params.value}
        </Box>
      );
    }
  },
  { field: 'dealType', headerName: 'Deal Type', width: 110, renderCell: (params: GridRenderCellParams) => {
      const typeColor = params.value === 'PMP' ? COLORS.primary : COLORS.secondary;
      const typeBg = params.value === 'PMP' ? `${COLORS.primary}15` : `${COLORS.secondary}15`;
      return (
        <Box sx={{ 
          backgroundColor: typeBg,
          color: typeColor,
          px: 2,
          py: 0.5,
          borderRadius: 2,
          fontWeight: 600,
          fontSize: 12,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          border: `1px solid ${typeColor}20`,
          minWidth: 60,
          justifyContent: 'center'
        }}>
          {params.value}
        </Box>
      );
    }
  },
  { field: 'supplyHealth', headerName: 'Supply Health', width: 140, renderCell: (params: GridRenderCellParams) => {
      const healthStyle = getHealthColor(params.value);
      return (
        <Box sx={{ 
          backgroundColor: healthStyle.bg,
          color: healthStyle.color,
          px: 2,
          py: 0.5,
          borderRadius: 2,
          fontWeight: 600,
          fontSize: 12,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          border: `1px solid ${healthStyle.color}20`,
          minWidth: 85,
          justifyContent: 'center'
        }}>
          {params.value}
        </Box>
      );
    }
  },
  { field: 'demandHealth', headerName: 'Demand Health', width: 140, renderCell: (params: GridRenderCellParams) => {
      const healthStyle = getHealthColor(params.value);
      return (
        <Box sx={{ 
          backgroundColor: healthStyle.bg,
          color: healthStyle.color,
          px: 2,
          py: 0.5,
          borderRadius: 2,
          fontWeight: 600,
          fontSize: 12,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          border: `1px solid ${healthStyle.color}20`,
          minWidth: 85,
          justifyContent: 'center'
        }}>
          {params.value}
        </Box>
      );
    }
  },
  { field: 'integrationHealth', headerName: 'Integration Health', width: 160, renderCell: (params: GridRenderCellParams) => {
      const healthStyle = getHealthColor(params.value);
      return (
        <Box sx={{ 
          backgroundColor: healthStyle.bg,
          color: healthStyle.color,
          px: 2,
          py: 0.5,
          borderRadius: 2,
          fontWeight: 600,
          fontSize: 12,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          border: `1px solid ${healthStyle.color}20`,
          minWidth: 85,
          justifyContent: 'center'
        }}>
          {params.value}
        </Box>
      );
    }
  },
  { field: 'wowBidTrend', headerName: 'WoW Bid Trend', width: 140, renderCell: (params: GridRenderCellParams) => {
      const trendStyle = getTrendColor(params.value);
      return (
        <Box sx={{ 
          backgroundColor: trendStyle.bg,
          color: trendStyle.color,
          px: 2,
          py: 0.5,
          borderRadius: 2,
          fontWeight: 600,
          fontSize: 12,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          border: `1px solid ${trendStyle.color}20`,
          minWidth: 70,
          justifyContent: 'center'
        }}>
          {params.value}
        </Box>
      );
    }
  },
  { field: 'wowBidRevenue', headerName: 'WoW Bid Revenue', width: 160, renderCell: (params: GridRenderCellParams) => {
      const trendStyle = getTrendColor(params.value);
      return (
        <Box sx={{ 
          backgroundColor: trendStyle.bg,
          color: trendStyle.color,
          px: 2,
          py: 0.5,
          borderRadius: 2,
          fontWeight: 600,
          fontSize: 12,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          border: `1px solid ${trendStyle.color}20`,
          minWidth: 80,
          justifyContent: 'center'
        }}>
          {params.value}
        </Box>
      );
    }
  },
  { field: 'requests', headerName: 'Requests', width: 140, renderCell: (params: GridRenderCellParams) => (
      <Typography sx={{ fontWeight: 500, color: COLORS.textPrimary, fontSize: 15, fontFamily: 'SF Mono, Monaco, monospace' }}>{params.value ? Number(params.value).toLocaleString() : '0'}</Typography>
    )
  },
  { field: 'bids', headerName: 'Bids', width: 140, renderCell: (params: GridRenderCellParams) => (
      <Typography sx={{ fontWeight: 500, color: COLORS.textPrimary, fontSize: 15, fontFamily: 'SF Mono, Monaco, monospace' }}>{params.value ? Number(params.value).toLocaleString() : '0'}</Typography>
    )
  },
  { field: 'impressions', headerName: 'Impressions', width: 140, renderCell: (params: GridRenderCellParams) => (
      <Typography sx={{ fontWeight: 500, color: COLORS.textPrimary, fontSize: 15, fontFamily: 'SF Mono, Monaco, monospace' }}>{params.value ? Number(params.value).toLocaleString() : '0'}</Typography>
    )
  },
  { field: 'revenue', headerName: 'Revenue', width: 140, renderCell: (params: GridRenderCellParams) => (
      <Typography sx={{ fontWeight: 600, color: COLORS.success, fontSize: 15 }}>{params.value ? `$${Number(params.value).toLocaleString()}` : '$0'}</Typography>
    )
  },
  { field: 'cpm', headerName: 'CPM', width: 120, renderCell: (params: GridRenderCellParams) => (
      <Typography sx={{ fontWeight: 600, color: COLORS.info, fontSize: 15, fontFamily: 'SF Mono, Monaco, monospace' }}>{params.value ? `$${Number(params.value).toFixed(2)}` : '$0.00'}</Typography>
    )
  },
];

// Enhanced mock performance data for the line chart
const mockPerformance = {
  dates: ['2024-07-01', '2024-07-02', '2024-07-03', '2024-07-04', '2024-07-05', '2024-07-06', '2024-07-07', '2024-07-08', '2024-07-09', '2024-07-10', '2024-07-11', '2024-07-12', '2024-07-13', '2024-07-14'],
  requests: [2500000, 2800000, 2650000, 3000000, 3200000, 3400000, 3600000, 3800000, 4000000, 3850000, 4200000, 4400000, 4600000, 4800000],
  bids: [1850000, 2100000, 1980000, 2250000, 2400000, 2550000, 2700000, 2850000, 3000000, 2880000, 3150000, 3300000, 3450000, 3600000],
  impressions: [1520000, 1700000, 1620000, 1800000, 1920000, 2040000, 2160000, 2280000, 2400000, 2310000, 2520000, 2640000, 2760000, 2880000],
  revenue: [23700, 26500, 25200, 28000, 29800, 31600, 33400, 35200, 37000, 35600, 38800, 40600, 42400, 44200],
  cpm: [15.6, 15.6, 15.6, 15.6, 15.5, 15.5, 15.5, 15.4, 15.4, 15.4, 15.4, 15.4, 15.4, 15.4],
};

const mockNotes = [
  { date: '2024-07-01', text: 'Deal launched successfully.' },
  { date: '2024-07-03', text: 'Performance review: pacing slightly below target.' },
  { date: '2024-07-05', text: 'Creative updated for CTV inventory.' },
  { date: '2024-07-07', text: 'Revenue exceeded forecast for the week.' },
];

export const Deals = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);
  const [tab, setTab] = useState(0);

  // Filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [dealType, setDealType] = useState('All');
  const [supplyHealth, setSupplyHealth] = useState('All');
  const [demandHealth, setDemandHealth] = useState('All');
  const [integrationHealth, setIntegrationHealth] = useState('All');
  const [timePeriod, setTimePeriod] = useState('Last 7 days');

  // Filtering logic (mock, in-memory)
  const filteredDeals = dealsMock.filter(deal => {
    const matchesSearch =
      search === '' ||
      deal.name.toLowerCase().includes(search.toLowerCase()) ||
      deal.ssp.toLowerCase().includes(search.toLowerCase()) ||
      deal.dealOwner.toLowerCase().includes(search.toLowerCase()) ||
      deal.dealId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'All' || deal.status === status;
    const matchesDealType = dealType === 'All' || deal.dealType === dealType;
    const matchesSupply = supplyHealth === 'All' || deal.supplyHealth === supplyHealth;
    const matchesDemand = demandHealth === 'All' || deal.demandHealth === demandHealth;
    const matchesIntegration = integrationHealth === 'All' || deal.integrationHealth === integrationHealth;
    // Time period filter is mock (no real date filtering on mock data)
    return matchesSearch && matchesStatus && matchesDealType && matchesSupply && matchesDemand && matchesIntegration;
  });

  const handleRowClick = (params: any) => {
    setSelectedDeal(params.row);
    setDrawerOpen(true);
    setTab(0);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedDeal(null), 300);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        width: '100vw',
        height: '100vh',
        bgcolor: COLORS.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        p: 0,
        m: 0,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Filter/Search Bar */}
      <Paper elevation={3} sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        px: 3,
        py: 2,
        mb: 1,
        bgcolor: '#fff',
        boxShadow: '0 2px 8px 0 rgba(60,60,120,0.06)',
        borderRadius: 0,
        borderBottom: '1px solid #e5e6ea',
      }}>
        <TextField
          placeholder="Search deals, SSP, owner, or ID"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 220, maxWidth: 260 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select value={status} onChange={e => setStatus(e.target.value)} displayEmpty>
            <MenuItem value="All">Status</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Paused">Paused</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select value={dealType} onChange={e => setDealType(e.target.value)} displayEmpty>
            <MenuItem value="All">Deal Type</MenuItem>
            <MenuItem value="PMP">PMP</MenuItem>
            <MenuItem value="PG">PG</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select value={supplyHealth} onChange={e => setSupplyHealth(e.target.value)} displayEmpty>
            <MenuItem value="All">Supply Health</MenuItem>
            <MenuItem value="Excellent">Excellent</MenuItem>
            <MenuItem value="Good">Good</MenuItem>
            <MenuItem value="Warning">Warning</MenuItem>
            <MenuItem value="Critical">Critical</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select value={demandHealth} onChange={e => setDemandHealth(e.target.value)} displayEmpty>
            <MenuItem value="All">Demand Health</MenuItem>
            <MenuItem value="Excellent">Excellent</MenuItem>
            <MenuItem value="Good">Good</MenuItem>
            <MenuItem value="Warning">Warning</MenuItem>
            <MenuItem value="Critical">Critical</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <Select value={integrationHealth} onChange={e => setIntegrationHealth(e.target.value)} displayEmpty>
            <MenuItem value="All">Integration Health</MenuItem>
            <MenuItem value="Excellent">Excellent</MenuItem>
            <MenuItem value="Good">Good</MenuItem>
            <MenuItem value="Warning">Warning</MenuItem>
            <MenuItem value="Critical">Critical</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select value={timePeriod} onChange={e => setTimePeriod(e.target.value)} displayEmpty>
            <MenuItem value="Last 7 days">Last 7 days</MenuItem>
            <MenuItem value="Last 30 days">Last 30 days</MenuItem>
            <MenuItem value="This Month">This Month</MenuItem>
            <MenuItem value="Custom">Custom</MenuItem>
          </Select>
        </FormControl>
      </Paper>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        px: 4,
        pt: 3,
        pb: 3,
        bgcolor: COLORS.headerBg,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${COLORS.border}`,
        zIndex: 2,
        position: 'sticky',
        top: 0,
        boxShadow: '0 1px 0 0 rgba(0,0,0,0.05)',
      }}>
        <Zoom in style={{ transitionDelay: '100ms' }}>
          <TableChartIcon sx={{ fontSize: 38, mr: 2, color: COLORS.primary }} />
        </Zoom>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: COLORS.textPrimary,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
            userSelect: 'none',
            fontSize: '28px',
          }}
        >
          PMP Deals
        </Typography>
      </Box>
      {/* DataGrid fills the rest of the screen */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          width: '100vw',
          height: '100%',
          borderRadius: 0,
          boxShadow: 'none',
          overflow: 'auto',
          p: 0,
          m: 0,
          bgcolor: 'transparent',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DataGrid
          rows={filteredDeals}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          onRowClick={handleRowClick}
          sx={{
            width: '100%',
            height: '100%',
            border: 'none',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
            fontSize: 15,
            background: 'transparent',
            color: '#1d1d1f',
            '& .MuiDataGrid-columnHeaders': {
              background: COLORS.headerBg,
              backdropFilter: 'blur(20px)',
              fontWeight: 600,
              fontSize: 14,
              color: COLORS.textPrimary,
              borderBottom: `1px solid ${COLORS.border}`,
              position: 'sticky',
              top: 0,
              zIndex: 1,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
              fontSize: 12,
              color: COLORS.textSecondary,
            },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${COLORS.border}`,
              whiteSpace: 'nowrap',
              padding: '16px 12px',
            },
            '& .MuiDataGrid-row': {
              transition: 'all 0.15s ease',
              '&:hover': {
                background: COLORS.hoverBg,
                cursor: 'pointer',
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px 0 ${COLORS.shadowSecondary}`,
              },
            },
            '& .MuiDataGrid-footerContainer': {
              background: COLORS.headerBg,
              backdropFilter: 'blur(20px)',
              borderTop: `1px solid ${COLORS.border}`,
            },
            '& .MuiDataGrid-virtualScroller': {
              background: 'transparent',
            },
            '& .MuiDataGrid-main': {
              minWidth: 2200,
            },
            '& .MuiDataGrid-selectedRowCount': {
              color: COLORS.primary,
            },
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          scrollbarSize={12}
        />
      </Paper>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 40,
          boxShadow: '0 8px 32px 0 rgba(0,122,255,0.25)',
          zIndex: 1201,
          transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          bgcolor: COLORS.primary,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          '&:hover': {
            bgcolor: '#4338ca',
            transform: 'scale(1.05) translateY(-2px)',
            boxShadow: `0 12px 40px 0 ${COLORS.shadowPrimary}`,
          },
        }}
        onClick={() => alert('Add Deal (coming soon!)')}
      >
        <AddIcon sx={{ fontSize: 28 }} />
      </Fab>
      {/* Deal Detail Drawer with Tabs */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 480, md: 600 },
            maxWidth: '100vw',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 25px 50px 0 rgba(0,0,0,0.15)',
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
            p: 0,
            overflowY: 'auto',
            border: '1px solid rgba(255,255,255,0.2)',
          },
        }}
        transitionDuration={350}
      >
        <Card elevation={0} sx={{ borderRadius: 0, boxShadow: 'none', p: 0, m: 0, minHeight: '100vh', bgcolor: '#fff' }}>
          <CardContent sx={{ p: 3, pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.primary, flex: 1 }}>{selectedDeal?.name}</Typography>
              <IconButton onClick={handleDrawerClose} size="large" sx={{ ml: 1 }}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              textColor="primary"
              indicatorColor="primary"
              sx={{ mb: 2, minHeight: 40 }}
            >
              <Tab label="Overview" sx={{ fontWeight: 600, minWidth: 120 }} />
              <Tab label="Performance" sx={{ fontWeight: 600, minWidth: 120 }} />
              <Tab label="Notes" sx={{ fontWeight: 600, minWidth: 120 }} />
            </Tabs>
            {/* Tab Panels */}
            <Fade in={tab === 0} unmountOnExit mountOnEnter>
              <Box hidden={tab !== 0}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" color="text.secondary">SSP</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>{selectedDeal?.ssp}</Typography>
                <Typography variant="subtitle2" color="text.secondary">Deal ID</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>{selectedDeal?.dealId}</Typography>
                <Typography variant="subtitle2" color="text.secondary">Deal Owner</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>{selectedDeal?.dealOwner}</Typography>
                <Typography variant="subtitle2" color="text.secondary">Start Date</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>{selectedDeal?.start}</Typography>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip label={selectedDeal?.status} color={selectedDeal?.status === 'Active' ? 'success' : selectedDeal?.status === 'Paused' ? 'warning' : 'default'} sx={{ fontWeight: 600, fontSize: 14, px: 1.5, borderRadius: 2, mb: 2 }} />
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Revenue</Typography>
                    <Typography variant="h6" color={COLORS.success}>${selectedDeal?.revenue ? selectedDeal.revenue.toLocaleString() : '0'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Impressions</Typography>
                    <Typography variant="h6" color={COLORS.primary}>{selectedDeal?.impressions ? selectedDeal.impressions.toLocaleString() : '0'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">CPM</Typography>
                    <Typography variant="h6" color={COLORS.primary}>${selectedDeal?.cpm ? selectedDeal.cpm.toFixed(2) : '0.00'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Requests</Typography>
                    <Typography variant="h6" color={COLORS.info}>{selectedDeal?.requests ? selectedDeal.requests.toLocaleString() : '0'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Bids</Typography>
                    <Typography variant="h6" color={COLORS.info}>{selectedDeal?.bids ? selectedDeal.bids.toLocaleString() : '0'}</Typography>
                  </Box>
                </Box>
                
                {/* Health Metrics Section */}
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.textPrimary, mb: 2 }}>Health Metrics</Typography>
                
                {/* Supply Health */}
                <Box sx={{ mb: 3, p: 2, bgcolor: `${getHealthColor(selectedDeal?.supplyHealth || 'Good').bg}`, borderRadius: 2, border: `1px solid ${getHealthColor(selectedDeal?.supplyHealth || 'Good').color}20` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: getHealthColor(selectedDeal?.supplyHealth || 'Good').color,
                      mr: 1.5 
                    }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: getHealthColor(selectedDeal?.supplyHealth || 'Good').color }}>
                      Supply Health: {selectedDeal?.supplyHealth || 'Good'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Inventory availability and quality metrics
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Fill Rate</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{(selectedDeal?.impressions / selectedDeal?.requests * 100 || 0).toFixed(1)}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Available Impressions</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{(selectedDeal?.requests - selectedDeal?.impressions || 0).toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Quality Score</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {selectedDeal?.supplyHealth === 'Excellent' ? '9.2' : 
                         selectedDeal?.supplyHealth === 'Good' ? '7.8' : 
                         selectedDeal?.supplyHealth === 'Warning' ? '5.4' : '2.1'}/10
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Demand Health */}
                <Box sx={{ mb: 3, p: 2, bgcolor: `${getHealthColor(selectedDeal?.demandHealth || 'Good').bg}`, borderRadius: 2, border: `1px solid ${getHealthColor(selectedDeal?.demandHealth || 'Good').color}20` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: getHealthColor(selectedDeal?.demandHealth || 'Good').color,
                      mr: 1.5 
                    }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: getHealthColor(selectedDeal?.demandHealth || 'Good').color }}>
                      Demand Health: {selectedDeal?.demandHealth || 'Good'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Bid response and advertiser demand metrics
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Bid Rate</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{(selectedDeal?.bids / selectedDeal?.requests * 100 || 0).toFixed(1)}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Win Rate</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{(selectedDeal?.impressions / selectedDeal?.bids * 100 || 0).toFixed(1)}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Avg Bid Price</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>${((selectedDeal?.revenue / selectedDeal?.impressions) * 1000 || 0).toFixed(2)}</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Integration Health */}
                <Box sx={{ mb: 3, p: 2, bgcolor: `${getHealthColor(selectedDeal?.integrationHealth || 'Good').bg}`, borderRadius: 2, border: `1px solid ${getHealthColor(selectedDeal?.integrationHealth || 'Good').color}20` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: getHealthColor(selectedDeal?.integrationHealth || 'Good').color,
                      mr: 1.5 
                    }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: getHealthColor(selectedDeal?.integrationHealth || 'Good').color }}>
                      Integration Health: {selectedDeal?.integrationHealth || 'Good'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Technical integration and performance metrics
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Response Time</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {selectedDeal?.integrationHealth === 'Excellent' ? '<50ms' : 
                         selectedDeal?.integrationHealth === 'Good' ? '50-100ms' : 
                         selectedDeal?.integrationHealth === 'Warning' ? '100-200ms' : '>200ms'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Error Rate</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {selectedDeal?.integrationHealth === 'Excellent' ? '<0.1%' : 
                         selectedDeal?.integrationHealth === 'Good' ? '0.1-0.5%' : 
                         selectedDeal?.integrationHealth === 'Warning' ? '0.5-2%' : '>2%'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Uptime</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {selectedDeal?.integrationHealth === 'Excellent' ? '99.9%' : 
                         selectedDeal?.integrationHealth === 'Good' ? '99.5%' : 
                         selectedDeal?.integrationHealth === 'Warning' ? '98.5%' : '<95%'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Timeline</Typography>
                <List dense>
                  {mockNotes.map((note, i) => (
                    <ListItem key={i} sx={{ pl: 0 }}>
                      <ListItemText
                        primary={note.text}
                        secondary={note.date}
                        primaryTypographyProps={{ fontSize: 15 }}
                        secondaryTypographyProps={{ fontSize: 13, color: 'text.secondary' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Fade>
            <Fade in={tab === 1} unmountOnExit mountOnEnter>
              <Box hidden={tab !== 1}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.textPrimary, mb: 2 }}>Performance Analytics</Typography>
                
                {/* Performance Summary Cards - Single Row */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'space-between' }}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: `${COLORS.primary}10`, 
                    borderRadius: 2, 
                    border: `1px solid ${COLORS.primary}20`,
                    flex: 1,
                    textAlign: 'center'
                  }}>
                    <Typography variant="caption" color="text.secondary">Total Requests</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.primary }}>
                      {mockPerformance.requests.reduce((a, b) => a + b, 0).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: `${COLORS.info}10`, 
                    borderRadius: 2, 
                    border: `1px solid ${COLORS.info}20`,
                    flex: 1,
                    textAlign: 'center'
                  }}>
                    <Typography variant="caption" color="text.secondary">Total Bids</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.info }}>
                      {mockPerformance.bids.reduce((a, b) => a + b, 0).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: `${COLORS.secondary}10`, 
                    borderRadius: 2, 
                    border: `1px solid ${COLORS.secondary}20`,
                    flex: 1,
                    textAlign: 'center'
                  }}>
                    <Typography variant="caption" color="text.secondary">Total Impressions</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.secondary }}>
                      {mockPerformance.impressions.reduce((a, b) => a + b, 0).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: `${COLORS.success}10`, 
                    borderRadius: 2, 
                    border: `1px solid ${COLORS.success}20`,
                    flex: 1,
                    textAlign: 'center'
                  }}>
                    <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.success }}>
                      ${mockPerformance.revenue.reduce((a, b) => a + b, 0).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                {/* Enhanced Performance Chart with Distinct Colors */}
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Performance Trends (Last 14 Days)</Typography>
                <LineChart
                  xAxis={[{ scaleType: 'point', data: mockPerformance.dates }]}
                  series={[
                    { data: mockPerformance.requests, label: 'Requests', color: '#3b82f6', curve: 'linear' },
                    { data: mockPerformance.bids, label: 'Bids', color: '#8b5cf6', curve: 'linear' },
                    { data: mockPerformance.impressions, label: 'Impressions', color: '#06b6d4', curve: 'linear' },
                    { data: mockPerformance.revenue, label: 'Revenue ($)', color: '#10b981', curve: 'linear' },
                  ]}
                  width={520}
                  height={280}
                  sx={{ mt: 1, mb: 3 }}
                />

                {/* Performance Table */}
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Daily Performance Breakdown</Typography>
                <Box sx={{ 
                  maxHeight: 300, 
                  overflow: 'auto', 
                  border: `1px solid ${COLORS.border}`, 
                  borderRadius: 2,
                  bgcolor: COLORS.surface
                }}>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: '0.8fr 1.2fr 1.2fr 1.2fr 1fr 0.8fr', 
                    p: 2, 
                    bgcolor: COLORS.headerBg,
                    borderBottom: `1px solid ${COLORS.border}`,
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    gap: 1
                  }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: COLORS.textSecondary, px: 1 }}>Date</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: COLORS.textSecondary, px: 1 }}>Requests</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: COLORS.textSecondary, px: 1 }}>Bids</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: COLORS.textSecondary, px: 1 }}>Impressions</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: COLORS.textSecondary, px: 1 }}>Revenue</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: COLORS.textSecondary, px: 1 }}>CPM</Typography>
                  </Box>
                  {mockPerformance.dates.map((date: string, index: number) => (
                    <Box key={date + index} sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: '0.8fr 1.2fr 1.2fr 1.2fr 1fr 0.8fr', 
                      p: 2, 
                      borderBottom: `1px solid ${COLORS.border}`,
                      '&:hover': { bgcolor: COLORS.hoverBg },
                      '&:last-child': { borderBottom: 'none' },
                      gap: 1
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: COLORS.textPrimary, px: 1 }}>
                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'SF Mono, Monaco, monospace', color: COLORS.textPrimary, px: 1, textAlign: 'right' }}>
                        {mockPerformance.requests[index].toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'SF Mono, Monaco, monospace', color: COLORS.textPrimary, px: 1, textAlign: 'right' }}>
                        {mockPerformance.bids[index].toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'SF Mono, Monaco, monospace', color: COLORS.textPrimary, px: 1, textAlign: 'right' }}>
                        {mockPerformance.impressions[index].toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'SF Mono, Monaco, monospace', color: COLORS.success, fontWeight: 500, px: 1, textAlign: 'right' }}>
                        ${mockPerformance.revenue[index].toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'SF Mono, Monaco, monospace', color: COLORS.info, fontWeight: 500, px: 1, textAlign: 'right' }}>
                        ${mockPerformance.cpm[index].toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Redesigned Key Performance Indicators */}
                <Box sx={{ mt: 3, mb: 2, position: 'relative', overflow: 'visible' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 2, textAlign: 'center' }}>
                    🎯 Key Performance Indicators
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
                      gap: 2,
                      p: 3,
                      background: `linear-gradient(135deg, ${COLORS.primary}15 0%, ${COLORS.secondary}15 100%)`,
                      borderRadius: 3,
                      border: `1px solid ${COLORS.primary}20`,
                      position: 'relative',
                      overflow: 'visible',
                      pr: { xs: 0, md: 8 }, // Add right padding for FAB on desktop
                      minWidth: 0,
                    }}
                  >
                    <Box sx={{
                      textAlign: 'center',
                      p: 2,
                      bgcolor: 'rgba(255,255,255,0.7)',
                      borderRadius: 2,
                      border: `1px solid ${COLORS.primary}20`,
                      transition: 'all 0.2s ease',
                      minWidth: 0,
                      wordBreak: 'break-word',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${COLORS.shadowPrimary}`,
                        bgcolor: 'rgba(255,255,255,0.9)',
                      },
                    }}>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary, display: 'block', mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Bid Rate
                      </Typography>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 800, 
                          color: COLORS.primary, 
                          mb: 0.5, 
                          fontSize: { xs: '1.5rem', sm: '2rem' },
                          lineHeight: 1.1,
                          wordBreak: 'break-word',
                        }}
                      >
                        {((mockPerformance.bids.reduce((a, b) => a + b, 0) / mockPerformance.requests.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                        Bids / Requests
                      </Typography>
                    </Box>
                    <Box sx={{
                      textAlign: 'center',
                      p: 2,
                      bgcolor: 'rgba(255,255,255,0.7)',
                      borderRadius: 2,
                      border: `1px solid ${COLORS.secondary}20`,
                      transition: 'all 0.2s ease',
                      minWidth: 0,
                      wordBreak: 'break-word',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${COLORS.shadowPrimary}`,
                        bgcolor: 'rgba(255,255,255,0.9)',
                      },
                    }}>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary, display: 'block', mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Win Rate
                      </Typography>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 800, 
                          color: COLORS.secondary, 
                          mb: 0.5, 
                          fontSize: { xs: '1.5rem', sm: '2rem' },
                          lineHeight: 1.1,
                          wordBreak: 'break-word',
                        }}
                      >
                        {((mockPerformance.impressions.reduce((a, b) => a + b, 0) / mockPerformance.bids.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                        Impressions / Bids
                      </Typography>
                    </Box>
                    <Box sx={{
                      textAlign: 'center',
                      p: 2,
                      bgcolor: 'rgba(255,255,255,0.7)',
                      borderRadius: 2,
                      border: `1px solid ${COLORS.info}20`,
                      transition: 'all 0.2s ease',
                      minWidth: 0,
                      wordBreak: 'break-word',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${COLORS.shadowPrimary}`,
                        bgcolor: 'rgba(255,255,255,0.9)',
                      },
                    }}>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary, display: 'block', mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Fill Rate
                      </Typography>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 800, 
                          color: COLORS.info, 
                          mb: 0.5, 
                          fontSize: { xs: '1.5rem', sm: '2rem' },
                          lineHeight: 1.1,
                          wordBreak: 'break-word',
                        }}
                      >
                        {((mockPerformance.impressions.reduce((a, b) => a + b, 0) / mockPerformance.requests.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                        Impressions / Requests
                      </Typography>
                    </Box>
                    <Box sx={{
                      textAlign: 'center',
                      p: 2,
                      bgcolor: 'rgba(255,255,255,0.7)',
                      borderRadius: 2,
                      border: `1px solid ${COLORS.success}20`,
                      transition: 'all 0.2s ease',
                      minWidth: 0,
                      wordBreak: 'break-word',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${COLORS.shadowPrimary}`,
                        bgcolor: 'rgba(255,255,255,0.9)',
                      },
                    }}>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary, display: 'block', mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Avg CPM
                      </Typography>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 800, 
                          color: COLORS.success, 
                          mb: 0.5, 
                          fontSize: { xs: '1.5rem', sm: '2rem' },
                          lineHeight: 1.1,
                          wordBreak: 'break-word',
                        }}
                      >
                        ${(mockPerformance.cpm.reduce((a, b) => a + b, 0) / mockPerformance.cpm.length).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                        Cost Per Mille
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                {/* Move FAB below KPI widget for visibility */}
                <Fab
                  color="primary"
                  aria-label="add"
                  sx={{
                    mt: 3,
                    mb: 2,
                    boxShadow: '0 8px 32px 0 rgba(0,122,255,0.25)',
                    transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    bgcolor: COLORS.primary,
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': {
                      bgcolor: '#4338ca',
                      transform: 'scale(1.05) translateY(-2px)',
                      boxShadow: `0 12px 40px 0 ${COLORS.shadowPrimary}`,
                    },
                  }}
                  onClick={() => alert('Add Deal (coming soon!)')}
                >
                  <AddIcon sx={{ fontSize: 28 }} />
                </Fab>
              </Box>
            </Fade>
            <Fade in={tab === 2} unmountOnExit mountOnEnter>
              <Box hidden={tab !== 2}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Notes</Typography>
                <List dense>
                  {mockNotes.map((note, i) => (
                    <ListItem key={i} sx={{ pl: 0 }}>
                      <ListItemText
                        primary={note.text}
                        secondary={note.date}
                        primaryTypographyProps={{ fontSize: 15 }}
                        secondaryTypographyProps={{ fontSize: 13, color: 'text.secondary' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Fade>
          </CardContent>
        </Card>
      </Drawer>
    </Box>
  );
}; 