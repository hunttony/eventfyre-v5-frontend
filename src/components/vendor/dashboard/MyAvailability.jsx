import { useState } from 'react';
import { Box, Button, Container, Fab, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import AvailabilityList from './AvailabilityList';

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

const MyAvailability = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const handleAddClick = () => {
    navigate('/vendor/availability/add');
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Availability
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage your available time slots and schedule. Add one-time or recurring availability for clients to book your services.
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <AvailabilityList 
          refreshKey={refreshKey} 
          onRefresh={handleRefresh} 
        />
      </Paper>

      <StyledFab
        color="primary"
        aria-label="Add availability"
        onClick={handleAddClick}
      >
        <AddIcon />
      </StyledFab>
    </Container>
  );
};

export default MyAvailability;
