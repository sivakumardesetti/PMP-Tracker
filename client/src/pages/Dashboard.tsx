import { useState, useMemo } from 'react';
import { Box, Typography, Paper, Card, CardContent, Fade, List, ListItem, ListItemText, Zoom, TextField, MenuItem, InputAdornment, FormControl, Select, Grid } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
import { dealsMock } from '../mock/dealsMock';

const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  bg: '#fafbfc',
  surface: 'rgba(255, 255, 255, 0.9)',
  headerBg: 'rgba(255, 255, 255, 0.95)',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  border: 'rgba(15, 23, 42, 0.08)',
  hoverBg: 'rgba(99, 102, 241, 0.04)',
  shadowPrimary: 'rgba(99, 102, 241, 0.25)',
  shadowSecondary: 'rgba(0, 0, 0, 0.1)',
};

const mockNotes = [
  { date: '2024-07-01', text: 'Launched 2 new PMP deals.' },
  { date: '2024-07-03', text: 'Revenue trending above forecast.' },
  { date: '2024-07-05', text: 'One deal flagged as under-delivering.' },
  { date: '2024-07-07', text: 'All KPIs reviewed and approved.' },
];

const METRIC_OPTIONS = [
  { value: 'revenue', label: 'Revenue', color: COLORS.primary },
  { value: 'impressions', label: 'Impressions', color: COLORS.success },
  { value: 'requests', label: 'Requests', color: COLORS.info },
  { value: 'bids', label: 'Bids', color: COLORS.secondary },
  { value: 'cpm', label: 'CPM', color: COLORS.warning },
];

// Mock data for SSP revenue breakdown
const sspRevenueData = [
  { id: 0, value: 237000, label: 'Amagi', color: COLORS.primary },
  { id: 1, value: 110000, label: 'Xandr', color: COLORS.secondary },
  { id: 2, value: 185000, label: 'Magnite', color: COLORS.success },
  { id: 3, value: 95000, label: 'GAM', color: COLORS.info },
  { id: 4, value: 78000, label: 'PubMatic', color: COLORS.warning },
  { id: 5, value: 65000, label: 'Index Exchange', color: COLORS.error },
];

// Get unique SSPs for filter
const uniqueSSPs = Array.from(new Set(dealsMock.map(deal => deal.ssp)));

type ChartData = {
  dates: string[];
  revenue: number[];
  impressions: number[];
  requests: number[];
  bids: number[];
  cpm: number[];
};

const chartData: ChartData = {
  dates: ['2024-07-01', '2024-07-02', '2024-07-03', '2024-07-04', '2024-07-05', '2024-07-06', '2024-07-07'],
  revenue: [20000, 22000, 21000, 25000, 26000, 27000, 30000],
  impressions: [1200000, 1400000, 1350000, 1500000, 1600000, 1700000, 1800000],
  requests: [1500000, 1600000, 1550000, 1700000, 1750000, 1800000, 1900000],
  bids: [1000000, 1100000, 1050000, 1200000, 1250000, 1300000, 1400000],
  cpm: [16.7, 15.7, 15.6, 16.7, 16.3, 15.9, 16.7],
};

const PIE_DIMENSIONS = [
  { value: 'ssp', label: 'SSP' },
  { value: 'dealType', label: 'Deal Type' },
  { value: 'name', label: 'Deal Name' },
];

export const Dashboard = () => {
  // Filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [dealType, setDealType] = useState('All');
  const [health, setHealth] = useState('All');
  const [timePeriod, setTimePeriod] = useState('Last 7 days');
  const [selectedSSP, setSelectedSSP] = useState('All');

  // Chart controls state
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['revenue', 'impressions']);
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [dealSearch, setDealSearch] = useState('');
  const [pieDimension, setPieDimension] = useState('ssp');

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
    const matchesHealth =
      health === 'All' ||
      deal.supplyHealth === health ||
      deal.demandHealth === health ||
      deal.integrationHealth === health;
    const matchesSSP = selectedSSP === 'All' || deal.ssp === selectedSSP;
    const matchesDeals = selectedDeals.length === 0 || selectedDeals.includes(deal.name);
    // Time period filter is mock (no real date filtering on mock data)
    return matchesSearch && matchesStatus && matchesDealType && matchesHealth && matchesSSP && matchesDeals;
  });

  // KPI calculations
  const totalRequests = filteredDeals.reduce((sum, d) => sum + (d.requests || 0), 0);
  const totalBids = filteredDeals.reduce((sum, d) => sum + (d.bids || 0), 0);
  const totalImpressions = filteredDeals.reduce((sum, d) => sum + (d.impressions || 0), 0);
  const totalRevenue = filteredDeals.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const avgCPM = filteredDeals.length ? (filteredDeals.reduce((sum, d) => sum + (d.cpm || 0), 0) / filteredDeals.length) : 0;
  const activeDeals = filteredDeals.filter(d => d.status === 'Active').length;
  const pausedDeals = filteredDeals.filter(d => d.status === 'Paused').length;
  const bidRate = totalRequests ? (totalBids / totalRequests) * 100 : 0;
  const winRate = totalBids ? (totalImpressions / totalBids) * 100 : 0;
  const fillRate = totalRequests ? (totalImpressions / totalRequests) * 100 : 0;
  const renderRate = totalRequests ? (totalImpressions / totalRequests) * 100 : 0; // For demo, same as fill rate

  const kpis = [
    { label: 'Bid Rate', value: bidRate.toFixed(1) + '%', color: COLORS.primary, caption: 'Bids / Requests' },
    { label: 'Render Rate', value: renderRate.toFixed(1) + '%', color: COLORS.info, caption: 'Impressions / Requests' },
    { label: 'Win Rate', value: winRate.toFixed(1) + '%', color: COLORS.secondary, caption: 'Impressions / Bids' },
    { label: 'Fill Rate', value: fillRate.toFixed(1) + '%', color: COLORS.success, caption: 'Impressions / Requests' },
    { label: 'Revenue', value: '$' + totalRevenue.toLocaleString(), color: COLORS.success, caption: 'Total Revenue' },
    { label: 'Avg CPM', value: '$' + avgCPM.toFixed(2), color: COLORS.primary, caption: 'Average CPM' },
    { label: 'Active Deals', value: activeDeals, color: COLORS.primary, caption: 'Active' },
    { label: 'Paused Deals', value: pausedDeals, color: COLORS.warning, caption: 'Paused' },
  ];

  // Pie chart data generator
  const pieChartData = useMemo(() => {
    if (chartType !== 'pie') return [];
    const groupBy = pieDimension;
    const groupMap = new Map();
    filteredDeals.forEach(deal => {
      const key = deal[groupBy];
      if (!groupMap.has(key)) {
        groupMap.set(key, { value: 0, label: key });
      }
      groupMap.get(key).value += deal.revenue || 0;
    });
    // Assign colors for up to 10 slices
    const palette = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.info, COLORS.warning, COLORS.error, '#f472b6', '#facc15', '#38bdf8', '#a3e635'];
    return Array.from(groupMap.entries()).map(([key, obj], i) => ({
      id: i,
      value: obj.value,
      label: obj.label,
      color: palette[i % palette.length],
    })).filter(d => d.value > 0);
  }, [filteredDeals, pieDimension, chartType]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: COLORS.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        p: 0,
        m: 0,
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
          <Select value={health} onChange={e => setHealth(e.target.value)} displayEmpty>
            <MenuItem value="All">Health</MenuItem>
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
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select value={selectedSSP} onChange={e => setSelectedSSP(e.target.value)} displayEmpty>
            <MenuItem value="All">All SSPs</MenuItem>
            {uniqueSSPs.map(ssp => (
              <MenuItem key={ssp} value={ssp}>{ssp}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            multiple
            value={selectedDeals}
            onChange={e => {
              const value = e.target.value;
              setSelectedDeals(typeof value === 'string' ? value.split(',') : value);
            }}
            renderValue={selected => selected.length === 0 ? 'All Deals' : `${selected.length} Deal${selected.length > 1 ? 's' : ''}`}
            displayEmpty
            sx={{ fontWeight: 600 }}
            MenuProps={{
              PaperProps: {
                style: { maxHeight: 350, minWidth: 320 },
              },
            }}
          >
            <Box sx={{ px: 2, pt: 1, pb: 1 }}>
              <TextField
                size="small"
                placeholder="Search deals..."
                value={dealSearch}
                onChange={e => setDealSearch(e.target.value)}
                fullWidth
                autoFocus
                InputProps={{ sx: { fontSize: 14 } }}
              />
            </Box>
            <MenuItem value="">
              <em>All Deals</em>
            </MenuItem>
            {dealsMock.filter(deal => {
              const q = dealSearch.toLowerCase();
              return (
                q === '' ||
                deal.name.toLowerCase().includes(q) ||
                deal.ssp.toLowerCase().includes(q) ||
                deal.status.toLowerCase().includes(q)
              );
            }).map(deal => (
              <MenuItem key={deal.id} value={deal.name}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{deal.name}</Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                    {deal.ssp} • {deal.status}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        px: 4,
        pt: 3,
        pb: 1,
        bgcolor: COLORS.headerBg,
        borderBottom: `1.5px solid ${COLORS.border}`,
        zIndex: 2,
        position: 'sticky',
        top: 0,
        boxShadow: '0 2px 8px 0 rgba(60,60,120,0.04)',
      }}>
        <Zoom in style={{ transitionDelay: '100ms' }}>
          <TrendingUpIcon sx={{ fontSize: 38, mr: 2, color: COLORS.primary }} />
        </Zoom>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: COLORS.textPrimary,
            fontFamily: 'SF Pro Display, Roboto, Helvetica Neue, Arial, sans-serif',
            userSelect: 'none',
          }}
        >
          Dashboard
        </Typography>
      </Box>
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ p: 4, pb: 0, width: '100%', maxWidth: 1600, mx: 'auto' }}>
        {kpis.map((kpi, i) => (
          <Grid item key={kpi.label} xs={12} sm={6} md={3} lg={3} xl={3}>
            <Fade in timeout={600 + i * 120}>
              <Card elevation={0} sx={{
                borderRadius: 4,
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)',
                bgcolor: '#fff',
                p: 0,
                minHeight: 120,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                px: 2,
                py: 2,
                textAlign: 'center',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: `0 8px 32px 0 ${COLORS.shadowPrimary}`,
                  transform: 'translateY(-2px) scale(1.03)',
                  bgcolor: COLORS.surface,
                },
              }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>{kpi.label}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: kpi.color, mb: 0.5, fontSize: { xs: '1.5rem', sm: '2rem' }, lineHeight: 1.1, wordBreak: 'break-word' }}>{kpi.value}</Typography>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>{kpi.caption}</Typography>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
      {/* Chart and Timeline Section */}
      <Grid container spacing={3} sx={{ p: 4, pt: 2, width: '100%', maxWidth: 1600, mx: 'auto', flex: 1 }}>
        <Grid item xs={12} md={chartType === 'pie' ? 8 : 12}>
          <Paper elevation={0} sx={{ borderRadius: 4, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)', bgcolor: '#fff', p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary, mb: 2 }}>Performance Trends</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, mt: 1 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={chartType}
                  onChange={e => setChartType(e.target.value as 'line' | 'bar' | 'pie')}
                  displayEmpty
                  sx={{ fontWeight: 600 }}
                >
                  <MenuItem value="line">Line Chart</MenuItem>
                  <MenuItem value="bar">Bar Chart</MenuItem>
                  <MenuItem value="pie">Pie Chart</MenuItem>
                </Select>
              </FormControl>
              {chartType !== 'pie' && (
                <FormControl size="small" sx={{ minWidth: 220 }}>
                  <Select
                    multiple
                    value={selectedMetrics}
                    onChange={e => {
                      const value = e.target.value;
                      setSelectedMetrics(typeof value === 'string' ? value.split(',') : value);
                    }}
                    renderValue={selected =>
                      selected.map(val => METRIC_OPTIONS.find(opt => opt.value === val)?.label).join(', ')
                    }
                    sx={{ fontWeight: 600 }}
                  >
                    {METRIC_OPTIONS.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: opt.color, display: 'inline-block', mr: 1 }} />
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
            {chartType === 'line' && (
              <LineChart
                xAxis={[{ scaleType: 'point', data: chartData.dates }]}
                series={selectedMetrics
                  .filter(metric => metric !== 'dates')
                  .map(metric => ({
                    data: chartData[metric as keyof ChartData] as number[],
                    label: METRIC_OPTIONS.find(opt => opt.value === metric)?.label || metric,
                    color: METRIC_OPTIONS.find(opt => opt.value === metric)?.color,
                  }))}
                width={900}
                height={340}
                sx={{ mt: 1 }}
              />
            )}
            {chartType === 'bar' && (
              <BarChart
                xAxis={[{ scaleType: 'band', data: chartData.dates }]}
                series={selectedMetrics
                  .filter(metric => metric !== 'dates')
                  .map(metric => ({
                    data: chartData[metric as keyof ChartData] as number[],
                    label: METRIC_OPTIONS.find(opt => opt.value === metric)?.label || metric,
                    color: METRIC_OPTIONS.find(opt => opt.value === metric)?.color,
                  }))}
                width={900}
                height={340}
                sx={{ mt: 1 }}
              />
            )}
            {chartType === 'pie' && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <Select
                      value={pieDimension}
                      onChange={e => setPieDimension(e.target.value)}
                      displayEmpty
                      sx={{ fontWeight: 600 }}
                    >
                      {PIE_DIMENSIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{`Breakdown by ${opt.label}`}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <PieChart
                  series={[
                    {
                      data: pieChartData,
                      highlightScope: { fade: 'global', highlight: 'item' },
                    },
                  ]}
                  width={900}
                  height={340}
                  sx={{ mt: 1 }}
                />
              </>
            )}
          </Paper>
        </Grid>
        {/* No pie chart card below when not in pie mode */}
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ borderRadius: 4, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)', bgcolor: '#fff', p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary, mb: 2 }}>Timeline</Typography>
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
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 