import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Grid, Paper, Chip } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { dealsMock } from '../mock/dealsMock';

export const DealDetail = () => {
  const { id } = useParams();
  const deal = dealsMock.find((d) => d.id === Number(id));

  if (!deal) return <Typography>Deal not found.</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>{deal.dealName}</Typography>
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle2">Advertiser</Typography>
            <Typography>{deal.advertiser}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle2">Platform</Typography>
            <Typography>{deal.platform}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle2">Status</Typography>
            <Chip label={deal.status} color={deal.status === 'Active' ? 'success' : 'warning'} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle2">Pacing</Typography>
            <Chip label={deal.pacing + '%'} color={deal.pacing < 80 ? 'warning' : deal.pacing > 120 ? 'error' : 'success'} />
          </Paper>
        </Grid>
      </Grid>
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" mb={2}>Performance</Typography>
        <BarChart
          xAxis={[{ scaleType: 'band', data: ['Impressions', 'Revenue', 'CPM'] }]}
          series={[{ data: [deal.impressions, deal.revenue, deal.cpm], label: 'Metrics' }]}
          width={600}
          height={300}
        />
      </Paper>
    </Box>
  );
}; 